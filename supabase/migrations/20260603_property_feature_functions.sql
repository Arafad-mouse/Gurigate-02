-- Property Feature/Unfeature Functions Migration
-- Adds RPC functions for featuring and unfeaturing properties with audit logging
-- Date: 2026-06-03

-- Function to feature a property
CREATE OR REPLACE FUNCTION feature_property(p_property_id UUID, p_admin_id UUID, p_note TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE properties 
  SET 
    is_featured = TRUE,
    updated_by_admin = p_admin_id
  WHERE id = p_property_id;
  
  -- Log the action
  PERFORM log_admin_activity(
    p_admin_id,
    'feature_property',
    'property',
    p_property_id,
    jsonb_build_object('note', p_note)
  );
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unfeature a property
CREATE OR REPLACE FUNCTION unfeature_property(p_property_id UUID, p_admin_id UUID, p_note TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE properties 
  SET 
    is_featured = FALSE,
    updated_by_admin = p_admin_id
  WHERE id = p_property_id;
  
  -- Log the action
  PERFORM log_admin_activity(
    p_admin_id,
    'unfeature_property',
    'property',
    p_property_id,
    jsonb_build_object('note', p_note)
  );
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION feature_property TO authenticated;
GRANT EXECUTE ON FUNCTION unfeature_property TO authenticated;

COMMIT;
