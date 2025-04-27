type NavLinkType = {
  pageName: string;
  icon: string;
  label: string;
  to: string;
};
// navLinks.js
export const NavLinks: NavLinkType[] = [
  {
    pageName: "Dashboard",
    icon: "LayoutDashboard",
    label: "Dashboard",
    to: "/dashboard",
  },
  {
    pageName: "Users",
    icon: "UserRound",
    label: "Users",
    to: "/users",
  },
  {
    pageName: "Clients",
    icon: "Scroll",
    label: "Client List",
    to: "/clients/1",
  },
  {
    pageName: "ClientPartner",
    icon: "Handshake",
    label: "Client Partners",
    to: "/client-partners/1",
  },
  /* {
    pageName: "Task",
    icon: "ClipboardList",
    label: "Task",
    to: "/task",
  }, */
  { pageName: "Form", icon: "ReceiptText", label: "Form", to: "/form" },
  /*   {
    pageName: "Reports",
    icon: "TriangleAlert",
    label: "Reports",
    to: "/reports",
  }, */
  {
    pageName: "Settings",
    icon: "Bolt",
    label: "Settings",
    to: "/settings",
  },
];

// Example list that has notification
// {
//   pageName: "WebsitePages",
//   icon: "Globe",
//   label: "Pages",
//   to: "/pages",
//   notifications: "5",
// }
