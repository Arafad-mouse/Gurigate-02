# SYSTEM_DEPENDENCY_MAP

## Page → Service Dependencies

- HomePage: propertyService (list/featured), availabilityService (search filters)
- PropertyPage: propertyService, propertyImagesService, availabilityService, reviewService, wishlistService
- AllPropertiesPage: propertyService (list/search), availabilityService
- ManageProperty Dashboard: propertyService, bookingService, customerService, notificationService
- InboxPage: messagingService (conversations/messages/attachments), notificationService
- NotificationsPage: notificationService
- ProfilePage: customerService (profile), notificationService
- PaymentPage: bookingService (booking details), paymentService
- Admin pages (users/properties/bookings/payments/customers): adminService, propertyService, bookingService, paymentService, customerService
- Upcoming modules: organizations pages → organizationService; subscription pages → subscriptionService; commissions pages → commissionService; RMS pages → buildingService, unitService, tenantService, contractService, maintenanceService; analytics pages → analyticsService

## Service → Table Dependencies

- organizationService → organizations, organization_users
- subscriptionService → subscription_plans, subscriptions
- commissionService → commissions
- customerService → customers (profile_id), property_bookings, payments, contracts, properties
- propertyService → properties, property_images, availability, reviews, wishlists
- bookingService → property_bookings/bookings, booking_guests, properties, payments, commissions, notifications
- paymentService → payments, commissions, subscriptions
- notificationService → notifications, notification_queue
- messagingService → conversations, conversation_participants, messages, message_attachments
- maintenanceService → maintenance_requests, properties, units, tenants, contracts
- analyticsService → views: active_subscriptions_view, pending_commissions_view, customer_metrics_view, maintenance_requests_view, booking_guests_view

## Service → Service Dependencies

- bookingService depends on propertyService (availability validation), paymentService (charges), commissionService (commission creation), notificationService (booking events), messagingService (conversation thread creation)
- paymentService depends on subscriptionService (billing), commissionService (revenue allocation), notificationService (payment status)
- maintenanceService depends on propertyService (property/unit linkage), notificationService (assignment/completion), messagingService (thread for request)
- customerService depends on bookingService (history), paymentService (history), contractService (active contracts)
- analyticsService depends on all domain services for aggregated metrics

## Dashboard → Data Source Dependencies

- Manage Property dashboard: propertyService, bookingService, notificationService
- Admin dashboard: organizationService, subscriptionService, commissionService, analyticsService
- Owner dashboard: propertyService, bookingService, paymentService, analyticsService
- Customer dashboard (future): customerService, bookingService, paymentService, notificationService

## RBAC → Route Dependencies

- guest: public pages only (Home, Property view, search)
- customer: profile, bookings, wishlists, notifications, messaging
- owner/host: properties they own, availability, reviews, bookings, maintenance, notifications, messaging
- manager: owner scope + staff management within org
- admin: org-wide admin dashboards (orgs, plans, subscriptions, commissions, analytics) across orgs
- super_admin: full system access including settings
- Routes must use guards + service filters aligned with RLS scopes.
