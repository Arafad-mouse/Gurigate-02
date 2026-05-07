import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface CheckoutRequest {
  booking_id?: string
  amount?: number
  currency?: string
  return_url?: string
  cancel_url?: string
}

interface BookingAmount {
  total_price: number
  currency?: string
}

interface DodoCheckoutResponse {
  session_id: string
  checkout_url: string | null
}

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name)

  if (!value) {
    throw new Error(`${name} is not configured.`)
  }

  return value
}

function toMinorUnits(amount: number) {
  return Math.round(amount * 100)
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = getRequiredEnv("SUPABASE_URL")
    const supabaseAnonKey = getRequiredEnv("SUPABASE_ANON_KEY")
    const supabaseServiceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")
    const dodoApiKey = getRequiredEnv("DODO_PAYMENTS_API_KEY")
    const dodoProductId = getRequiredEnv("DODO_PRODUCT_ID")
    const dodoApiBaseUrl = Deno.env.get("DODO_PAYMENTS_API_BASE_URL") ?? "https://test.dodopayments.com"

    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return Response.json({ error: "Authentication is required." }, { status: 401, headers: corsHeaders })
    }

    const payload = (await request.json()) as CheckoutRequest

    if (!payload.booking_id) {
      return Response.json({ error: "booking_id is required." }, { status: 400, headers: corsHeaders })
    }

    const supabaseForUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await supabaseForUser.auth.getUser()

    if (userError || !user) {
      return Response.json({ error: "Authentication is required." }, { status: 401, headers: corsHeaders })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    let booking: BookingAmount | null = null

    const { data: propertyBooking, error: propertyBookingError } = await supabaseAdmin
      .from("property_bookings")
      .select("total_price,currency")
      .eq("id", payload.booking_id)
      .eq("guest_id", user.id)
      .maybeSingle()

    if (propertyBookingError) {
      throw propertyBookingError
    }

    booking = propertyBooking as BookingAmount | null

    if (!booking) {
      const { data: fallbackBooking, error: fallbackBookingError } = await supabaseAdmin
        .from("bookings")
        .select("total_price")
        .eq("id", payload.booking_id)
        .eq("guest_id", user.id)
        .maybeSingle()

      if (fallbackBookingError) {
        throw fallbackBookingError
      }

      if (fallbackBooking) {
        booking = {
          total_price: Number(fallbackBooking.total_price),
          currency: "USD",
        }
      }
    }

    if (!booking) {
      return Response.json({ error: "Booking was not found for this user." }, { status: 404, headers: corsHeaders })
    }

    const amount = Number(booking.total_price)
    const currency = booking.currency ?? "USD"

    if (payload.amount !== undefined && Math.abs(Number(payload.amount) - amount) > 0.01) {
      return Response.json({ error: "Payment amount does not match the booking." }, { status: 400, headers: corsHeaders })
    }

    if (payload.currency && payload.currency !== currency) {
      return Response.json({ error: "Payment currency does not match the booking." }, { status: 400, headers: corsHeaders })
    }

    const dodoResponse = await fetch(`${dodoApiBaseUrl}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${dodoApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [
          {
            product_id: dodoProductId,
            quantity: 1,
            amount: toMinorUnits(amount),
          },
        ],
        allowed_payment_method_types: ["credit", "debit"],
        billing_currency: currency,
        return_url: payload.return_url,
        cancel_url: payload.cancel_url,
        metadata: {
          booking_id: payload.booking_id,
          user_id: user.id,
          source: "gurigate_payment_page",
        },
      }),
    })

    if (!dodoResponse.ok) {
      const errorBody = await dodoResponse.text()
      console.error("Dodo checkout error:", errorBody)
      return Response.json({ error: "Unable to create Dodo checkout session." }, { status: 502, headers: corsHeaders })
    }

    const dodoCheckout = (await dodoResponse.json()) as DodoCheckoutResponse

    if (!dodoCheckout.session_id || !dodoCheckout.checkout_url) {
      return Response.json({ error: "Dodo checkout response was incomplete." }, { status: 502, headers: corsHeaders })
    }

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        booking_id: payload.booking_id,
        payment_provider: "dodo",
        payment_method: "card",
        provider_reference: dodoCheckout.session_id,
        status: "pending",
        amount,
        currency,
        metadata: {
          dodo_session_id: dodoCheckout.session_id,
          checkout_url: dodoCheckout.checkout_url,
        },
      })
      .select("id")
      .single()

    if (paymentError) {
      throw paymentError
    }

    return Response.json(
      {
        payment_id: payment.id,
        session_id: dodoCheckout.session_id,
        checkout_url: dodoCheckout.checkout_url,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("create-dodo-checkout error:", error)
    return Response.json({ error: "Unable to start card checkout." }, { status: 500, headers: corsHeaders })
  }
})
