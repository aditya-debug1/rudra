import { Permission } from "../role";

export const AdminPermissions: Permission[] = [
  {
    page: "Dashboard",
    actions: ["view"],
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
      "create-client",
      "delete-client",
      "update-client",
      "view-details",
      "create-visits",
      "update-visits",
      "delete-visits",
      "create-remarks",
      "delete-remarks",
    ],
  },
  {
    page: "Task",
    actions: ["view", "create", "delete", "update"],
  },
  {
    page: "Form",
    actions: ["client-form", "client-partner-form"],
  },
  {
    page: "Reports",
    actions: ["users-report"],
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

export const DefaultPermissions: Permission[] = [
  {
    page: "Dashboard",
    actions: ["view"],
  },
  {
    page: "Task",
    actions: ["view", "create", "delete", "update"],
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
    actions: [{ value: "view", label: "View Dashboard" }],
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
      { value: "view", label: "View Task" },
      { value: "create", label: "Create Task" },
      { value: "delete", label: "Delete Task" },
      { value: "update", label: "Update Task" },
    ],
  },
  {
    page: "Clients",
    pageLabel: "Client Sections",
    actions: [
      { value: "view-clients", label: "View Clients" },
      { value: "create-client", label: "Create Client" },
      { value: "delete-client", label: "Delete Client" },
      { value: "update-client", label: "Update Client Details" },
      { value: "view-details", label: "View Client Details" },
      { value: "create-visits", label: "Create Client Visit" },
      { value: "update-visits", label: "Update Client Visit" },
      { value: "delete-visits", label: "Delete Client Visit" },
      { value: "create-remarks", label: "Create Visit Remarks" },
      { value: "delete-remarks", label: "Delete Visit Remarks" },
    ],
  },
  {
    page: "Form",
    pageLabel: "Form Sections",
    actions: [
      { value: "client-form", label: "View Client Form" },
      { value: "client-partner-form", label: "View Client Partner Form" },
    ],
  },
  {
    page: "Reports",
    pageLabel: "Report Sections",
    actions: [{ value: "users-report", label: "View User Reports" }],
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
    ],
  },
];
