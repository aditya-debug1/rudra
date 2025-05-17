export const defaultRootPermissions = [
  {
    page: "Dashboard",
    actions: ["view-dashboard", "view-dashboard-unfiltered"],
  },
  {
    page: "Users",
    actions: [
      "view-users",
      "reset-password",
      "create-user",
      "lock-user",
      "view-details",
      "update-user",
      "delete-user",
    ],
  },
  {
    page: "Clients",
    actions: [
      "view-clients",
      "delete-client",
      "update-client",
      "view-client-details",
      "create-visits",
      "update-visits",
      "delete-visits",
      "create-remarks",
      "delete-remarks",
      "view-all-clients",
      "view-contact-info",
    ],
  },
  {
    page: "ClientPartner",
    actions: [
      "view-client-partner",
      "create-client-partner",
      "update-client-partner",
      "delete-client-partner",
      "view-cp-details",
      "create-cp-employee",
      "update-cp-employee",
      "delete-cp-employee",
    ],
  },
  {
    page: "Task",
    actions: ["view-task", "create-task", "delete-task", "update-task"],
  },
  {
    page: "Inventory",
    actions: [
      "view-inventory",
      "create-inventory",
      "view-inventory-details",
      "delete-inventory",
      "update-inventory",
      "update-unit-status",
    ],
  },
  {
    page: "Form",
    actions: [
      "client-form",
      "client-partner-form",
      "booking-form",
      "cancellation-form",
    ],
  },
  {
    page: "Reports",
    actions: [
      "user-report",
      "client-report",
      "inventory-report",
      "inventory-summary-report",
      "booking-report",
    ],
  },
  {
    page: "Settings",
    actions: [
      "create-role",
      "update-role",
      "view-role",
      "delete-role",
      "change-precedence",
      "view-audit",
    ],
  },
];
