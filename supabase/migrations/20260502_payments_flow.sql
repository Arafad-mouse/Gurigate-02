CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  payment_provider TEXT NOT NULL CHECK (
    payment_provider IN ('dodo', 'zaad', 'edahab', 'premier_wallet', 'wadaag_pay')
  ),
  payment_method TEXT NOT NULL CHECK (
    payment_method IN ('card', 'zaad', 'edahab', 'premier_wallet', 'wadaag_pay')
  ),
  provider_reference TEXT,
  wallet_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'submitted', 'verified', 'completed', 'failed', 'cancelled')
  ),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider_reference ON payments(provider_reference);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view payments for their bookings" ON payments;
CREATE POLICY "Users can view payments for their bookings" ON payments
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM property_bookings
    WHERE property_bookings.id = payments.booking_id
      AND (
        property_bookings.guest_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM properties
          WHERE properties.id = property_bookings.property_id
            AND properties.owner_id = auth.uid()
        )
      )
  )
  OR EXISTS (
    SELECT 1
    FROM bookings
    WHERE bookings.id = payments.booking_id
      AND bookings.guest_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Booking owners can update payment verification" ON payments;
CREATE POLICY "Booking owners can update payment verification" ON payments
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM property_bookings
    JOIN properties ON properties.id = property_bookings.property_id
    WHERE property_bookings.id = payments.booking_id
      AND properties.owner_id = auth.uid()
  )
)
WITH CHECK (
  status IN ('verified', 'completed', 'failed', 'cancelled')
);

CREATE OR REPLACE FUNCTION create_local_wallet_payment(
  p_booking_id UUID,
  p_payment_provider TEXT,
  p_payment_method TEXT,
  p_wallet_phone TEXT
)
RETURNS SETOF payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_amount NUMERIC(12, 2);
  v_currency TEXT;
  v_user_id UUID;
  v_payment payments;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required.';
  END IF;

  IF p_payment_provider NOT IN ('zaad', 'edahab', 'premier_wallet', 'wadaag_pay') THEN
    RAISE EXCEPTION 'Unsupported wallet payment provider.';
  END IF;

  IF p_payment_method NOT IN ('zaad', 'edahab', 'premier_wallet', 'wadaag_pay') THEN
    RAISE EXCEPTION 'Unsupported wallet payment method.';
  END IF;

  IF p_wallet_phone IS NULL OR p_wallet_phone !~ '^\+[1-9][0-9]{7,14}$' THEN
    RAISE EXCEPTION 'Wallet phone must use international format.';
  END IF;

  SELECT total_price, currency::TEXT
  INTO v_amount, v_currency
  FROM property_bookings
  WHERE id = p_booking_id
    AND guest_id = v_user_id;

  IF v_amount IS NULL THEN
    SELECT total_price, 'USD'
    INTO v_amount, v_currency
    FROM bookings
    WHERE id = p_booking_id
      AND guest_id = v_user_id;
  END IF;

  IF v_amount IS NULL THEN
    RAISE EXCEPTION 'Booking was not found for this user.';
  END IF;

  INSERT INTO payments (
    booking_id,
    payment_provider,
    payment_method,
    provider_reference,
    wallet_phone,
    status,
    amount,
    currency,
    metadata
  )
  VALUES (
    p_booking_id,
    p_payment_provider,
    p_payment_method,
    'manual_' || replace(gen_random_uuid()::TEXT, '-', ''),
    p_wallet_phone,
    'submitted',
    v_amount,
    COALESCE(v_currency, 'USD'),
    jsonb_build_object(
      'status_flow', jsonb_build_array('pending', 'submitted', 'verified', 'completed'),
      'submitted_at', NOW()
    )
  )
  RETURNING * INTO v_payment;

  RETURN NEXT v_payment;
END;
$$;

GRANT EXECUTE ON FUNCTION create_local_wallet_payment(UUID, TEXT, TEXT, TEXT) TO authenticated;
