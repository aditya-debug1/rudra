import { Permission } from "../role";

export const AdminPermissions: Permission[] = [
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
    page: "Booking",
    actions: [
      "view-booking",
      "update-booking",
      "update-booking-status",
      "delete-booking",
    ],
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
      "cp-report",
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
      "view-auth",
    ],
  },
];

export const DefaultPermissions: Permission[] = [
  {
    page: "Dashboard",
    actions: ["view-dashboard"],
  },
  {
    page: "Task",
    actions: ["view-task", "create-task", "delete-task", "update-task"],
  },
];

interface PermissionAction {
  value: string;
  label: string;
}

interface AvailablePermissionPage {
  page: string;
  pageLabel: string;
  actions: PermissionAction[];
}

export const availablePermissionPages: AvailablePermissionPage[] = [
  {
    page: "Dashboard",
    pageLabel: "Dashboard Sections",
    actions: [
      { value: "view-dashboard", label: "View Dashboard" },
      {
        value: "view-dashboard-unfiltered",
        label: "View Dashboard Unfiltered",
      },
    ],
  },
  {
    page: "Users",
    pageLabel: "Users Sections",
    actions: [
      { value: "view-users", label: "View Users" },
      { value: "create-user", label: "Create new users" },
      { value: "view-details", label: "View user details" },
      { value: "update-user", label: "Update user details" },
      { value: "delete-user", label: "Delete user" },
      { value: "reset-password", label: "Reset user password" },
      { value: "lock-user", label: "Lock users" },
    ],
  },
  {
    page: "Task",
    pageLabel: "Task Sections",
    actions: [
      { value: "view-task", label: "View Task" },
      { value: "create-task", label: "Create Task" },
      { value: "delete-task", label: "Delete Task" },
      { value: "update-task", label: "Update Task" },
    ],
  },
  {
    page: "Clients",
    pageLabel: "Client Sections",
    actions: [
      { value: "view-clients", label: "View Clients" },
      { value: "delete-client", label: "Delete Client" },
      { value: "update-client", label: "Update Client Details" },
      { value: "view-client-details", label: "View Client Details" },
      { value: "create-visits", label: "Create Client Visit" },
      { value: "update-visits", label: "Update Client Visit" },
      { value: "delete-visits", label: "Delete Client Visit" },
      { value: "create-remarks", label: "Create Visit Remarks" },
      { value: "delete-remarks", label: "Delete Visit Remarks" },
      { value: "view-all-clients", label: "View All Clients" },
      { value: "view-contact-info", label: "View Client Contact Info" },
    ],
  },
  {
    page: "ClientPartner",
    pageLabel: "Client Partner Sections",
    actions: [
      { value: "view-client-partner", label: "View Client Partner" },
      { value: "create-client-partner", label: "Create Client Partner" },
      { value: "update-client-partner", label: "Update Client Partner" },
      { value: "delete-client-partner", label: "Delete Client Partner" },
      { value: "view-cp-details", label: "View Client Partner Details" },
      {
        value: "create-cp-employee",
        label: "Create Client Partner Employee",
      },
      {
        value: "update-cp-employee",
        label: "Update Client Partner Employee",
      },
      {
        value: "delete-cp-employee",
        label: "Delete Client Partner Employee",
      },
    ],
  },
  {
    page: "Booking",
    pageLabel: "Booking Sections",
    actions: [
      { value: "view-booking", label: "View Booking" },
      { value: "update-booking", label: "Update Booking" },
      { value: "update-booking-status", label: "Update Booking Status" },
      { value: "delete-booking", label: "Delete Booking" },
    ],
  },
  {
    page: "Inventory",
    pageLabel: "Inventory Sections",
    actions: [
      { value: "view-inventory", label: "View Inventory" },
      { value: "create-inventory", label: "Create Inventory" },
      { value: "view-inventory-details", label: "View Inventory Details" },
      { value: "delete-inventory", label: "Delete Inventory" },
      { value: "update-inventory", label: "Update Inventory" },
      { value: "update-unit-status", label: "Update Unit Status" },
    ],
  },
  {
    page: "Form",
    pageLabel: "Form Sections",
    actions: [
      { value: "client-form", label: "View Client Form" },
      { value: "client-partner-form", label: "View Client Partner Form" },
      { value: "booking-form", label: "View Booking Form" },
      { value: "cancellation-form", label: "View Cancellation Form" },
    ],
  },
  {
    page: "Reports",
    pageLabel: "Report Sections",
    actions: [
      { value: "user-report", label: "View User Reports" },
      { value: "client-report", label: "View Client Reports" },
      { value: "cp-report", label: "View Client Partner Reports" },
      { value: "inventory-report", label: "View Inventory Reports" },
      {
        value: "inventory-summary-report",
        label: "View Inventory Summary Reports",
      },
      { value: "booking-report", label: "View Booking Reports" },
    ],
  },
  {
    page: "Settings",
    pageLabel: "Settings Sections",
    actions: [
      { value: "create-role", label: "Create Roles" },
      { value: "update-role", label: "View & Update Roles" },
      { value: "view-role", label: "View Roles" },
      { value: "view-audit", label: "View Audit Logs" },
      { value: "delete-role", label: "Delete Roles" },
      { value: "change-precedence", label: "Change Role Precedence" },
      { value: "view-auth", label: "View Auth Logs" },
    ],
  },
];
