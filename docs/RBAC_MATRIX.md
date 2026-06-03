# RBAC_MATRIX

Roles: guest, customer, owner, manager, admin, super_admin

## Permissions Matrix

| Page/Module | View | Create | Edit | Delete | Approve | Roles |
| ----------- | ---- | ------ | ---- | ------ | ------- | ----- |
| Public landing/property | ✅ | ❌ | ❌ | ❌ | ❌ | guest+ |
| Profile | ✅ | ✅ | ✅ | ✅ | ❌ | customer+ |
| Wishlists | ✅ | ✅ | ✅ | ✅ | ❌ | customer+ |
| Notifications | ✅ | ✅ | ✅ | ✅ | ❌ | customer+ |
| Messaging (self) | ✅ | ✅ | ✅ | ✅ | ❌ | customer+ |
| Properties (own org) | ✅ | ✅ | ✅ | ✅ | ✅ | owner+ |
| Availability (own org) | ✅ | ✅ | ✅ | ✅ | ✅ | owner+ |
| Reviews moderation (own org) | ✅ | ✅ | ✅ | ✅ | ✅ | owner+ |
| Bookings (own org) | ✅ | ✅ | ✅ | ✅ | ✅ | owner+ |
| Maintenance (own org) | ✅ | ✅ | ✅ | ✅ | ✅ | owner+ |
| Staff management (org users) | ✅ | ✅ | ✅ | ✅ | ✅ | manager+ |
| Organizations (global) | ✅ | ✅ | ✅ | ✅ | ✅ | admin+ |
| Subscription Plans | ✅ | ✅ | ✅ | ✅ | ✅ | admin+ |
| Subscriptions | ✅ | ✅ | ✅ | ✅ | ✅ | admin+ |
| Commissions | ✅ | ✅ | ✅ | ✅ | ✅ | admin+ |
| RMS (buildings/units/tenants/contracts) | ✅ | ✅ | ✅ | ✅ | ✅ | owner+ (within org), admin+ (global) |
| Payments | ✅ | ✅ | ✅ | ✅ | ✅ | owner+ (org scope), admin+ |
| Analytics (owner) | ✅ | ❌ | ❌ | ❌ | ❌ | owner+ |
| Analytics (admin) | ✅ | ❌ | ❌ | ❌ | ❌ | admin+ |
| System settings | ✅ | ✅ | ✅ | ✅ | ✅ | super_admin |

Legend: ✅ allowed, ❌ not allowed. "owner+" means owner/manager/admin/super_admin. "customer+" means authenticated customers and above. Apply route guards consistent with RLS policies.
