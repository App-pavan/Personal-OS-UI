/* RBAC admin API types — mirrors Personal-OS-backend Phase 2 contracts. */

export type PermissionDefinition = {
  key: string;
  module: string;
  feature: string;
  action: string;
  description: string;
};

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  roles: string[];
};

export type AdminRole = {
  id: string;
  key: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions?: string[];
};

export type ModuleCapability = {
  visible: boolean;
  permissions: string[];
};

export type CapabilitiesResponse = {
  user: {
    id: string;
    roleSummary: string[];
  };
  permissions: string[];
  modules: Record<string, ModuleCapability>;
};

export type CreateRoleInput = {
  key: string;
  name: string;
  description?: string;
  permissions?: string[];
};

export type UpdateRoleInput = {
  name?: string;
  description?: string;
};

export type UpdateUserInput = {
  displayName?: string;
  isActive?: boolean;
};

/** Permissions required for Access Control UI visibility. */
export const PERM_USERS_VIEW = "settings.users.view";
export const PERM_USERS_MANAGE = "settings.users.manage";
export const PERM_ROLES_VIEW = "settings.roles.view";
export const PERM_ROLES_MANAGE = "settings.roles.manage";
