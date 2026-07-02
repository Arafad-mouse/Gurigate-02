-- Seed existing mock tenant data
-- This script inserts the 12 existing tenants from the Rental Management module
-- Note: Replace 'YOUR_USER_ID' with the actual owner user ID

INSERT INTO public.tenants (
  owner_id,
  full_name,
  phone,
  building_id,
  unit_id,
  monthly_rent,
  payment_status,
  lease_status,
  next_due_date,
  move_in_date,
  created_at
) VALUES
  ('YOUR_USER_ID', 'Axmed Cabdalle', '+252 63 4112233', 'Burjiomar A', 'A-101', 150, 'Paid', 'active', '2025-04-05', '2024-01-05', NOW()),
  ('YOUR_USER_ID', 'Faadumo Xasan', '+252 63 5221144', 'Burjiomar A', 'A-203', 280, 'Paid', 'active', '2025-04-10', '2024-02-10', NOW()),
  ('YOUR_USER_ID', 'Cabdi Warsame', '+252 63 6330055', 'Burjiomar B', 'B-301', 420, 'Overdue', 'active', '2025-04-01', '2023-11-01', NOW()),
  ('YOUR_USER_ID', 'Sahra Maxamed', '+252 63 7441166', 'Burjiomar B', 'B-105', 150, 'Paid', 'active', '2025-04-15', '2024-03-15', NOW()),
  ('YOUR_USER_ID', 'Mustafe Nuur', '+252 63 8552277', 'Kulmiye Tower', 'K-214', 300, 'Pending', 'active', '2025-04-20', '2024-01-20', NOW()),
  ('YOUR_USER_ID', 'Hodan Jaamac', '+252 63 9663388', 'Kulmiye Tower', 'K-108', 160, 'Paid', 'active', '2025-05-01', '2024-04-01', NOW()),
  ('YOUR_USER_ID', 'Xuseen Geelle', '+252 63 1774499', 'Sha''ab Complex', 'S-302', 450, 'Overdue', 'active', '2025-04-12', '2023-09-12', NOW()),
  ('YOUR_USER_ID', 'Nimco Cabdiraxman', '+252 63 2885500', 'Sha''ab Complex', 'S-207', 290, 'Paid', 'active', '2025-04-28', '2024-02-28', NOW()),
  ('YOUR_USER_ID', 'Daud Xirsi', '+252 63 3996611', 'Burjiomar A', 'A-112', 155, 'Pending', 'active', '2025-05-05', '2024-05-05', NOW()),
  ('YOUR_USER_ID', 'Leyla Rashid', '+252 63 4007722', 'Burjiomar B', 'B-210', 275, 'Paid', 'active', '2025-04-01', '2024-03-01', NOW()),
  ('YOUR_USER_ID', 'Warsan Guure', '+252 63 5118833', 'Kulmiye Tower', 'K-315', 430, 'Overdue', 'active', '2025-04-20', '2023-12-20', NOW()),
  ('YOUR_USER_ID', 'Bashir Ciise', '+252 63 6229944', 'Sha''ab Complex', 'S-103', 145, 'Paid', 'active', '2025-06-10', '2024-06-10', NOW());
