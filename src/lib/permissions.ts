/**
 * Platform permission keys — must match Personal-OS-backend rbac registry.
 * UI metadata (labels, routes) lives in modules.ts; keys live here.
 */

export const PERM = {
  // Tasks
  TASKS_VIEW: "tasks.view",
  TASKS_CREATE: "tasks.create",
  TASKS_UPDATE: "tasks.update",
  TASKS_DELETE: "tasks.delete",
  TASKS_ASSIGN: "tasks.assign",
  TASKS_BULK: "tasks.bulk",

  // Checklists
  CHECKLISTS_VIEW: "checklists.view",
  CHECKLISTS_CREATE: "checklists.create",
  CHECKLISTS_UPDATE: "checklists.update",
  CHECKLISTS_DELETE: "checklists.delete",

  // Expenses
  EXPENSES_TRANSACTIONS_VIEW: "expenses.transactions.view",
  EXPENSES_TRANSACTIONS_CREATE: "expenses.transactions.create",
  EXPENSES_TRANSACTIONS_UPDATE: "expenses.transactions.update",
  EXPENSES_TRANSACTIONS_DELETE: "expenses.transactions.delete",
  EXPENSES_CATEGORIES_MANAGE: "expenses.categories.manage",
  EXPENSES_MEMBERS_MANAGE: "expenses.members.manage",
  EXPENSES_BUDGETS_VIEW: "expenses.budgets.view",
  EXPENSES_BUDGETS_MANAGE: "expenses.budgets.manage",
  EXPENSES_SMS_MANAGE: "expenses.sms.manage",

  // Wealth
  WEALTH_PORTFOLIO_VIEW: "wealth.portfolio.view",
  WEALTH_CONNECTIONS_VIEW: "wealth.connections.view",
  WEALTH_CONNECTIONS_MANAGE: "wealth.connections.manage",
  WEALTH_CONFIGURE: "wealth.configure",

  // System / runtime
  SYSTEM_RUNTIME_VIEW: "system.runtime.view",

  // Settings / admin
  SETTINGS_USERS_VIEW: "settings.users.view",
  SETTINGS_USERS_MANAGE: "settings.users.manage",
  SETTINGS_ROLES_VIEW: "settings.roles.view",
  SETTINGS_ROLES_MANAGE: "settings.roles.manage",

  // Communication
  COMMUNICATION_REALTIME_VIEW: "communication.realtime.view",

  // Future device awareness (registry-ready)
  DEVICE_AWARENESS_DEVICES_VIEW: "device_awareness.devices.view",
  DEVICE_AWARENESS_DEVICES_MANAGE: "device_awareness.devices.manage",
  DEVICE_AWARENESS_CALL_STATUS_VIEW: "device_awareness.call_status.view",
} as const;

export type PermissionKey = (typeof PERM)[keyof typeof PERM];

/** Access Control nav requires either users or roles view. */
export const ACCESS_CONTROL_PERMISSIONS = [
  PERM.SETTINGS_USERS_VIEW,
  PERM.SETTINGS_ROLES_VIEW,
] as const;
