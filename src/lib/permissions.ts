export type RoleName = "admin" | "teacher" | "student";

export type Permission =
  | "class:create" | "class:read" | "class:update" | "class:delete" | "class:join"
  | "subject:create" | "subject:read" | "subject:update" | "subject:delete"
  | "department:create" | "department:read" | "department:update" | "department:delete"
  | "profile:create" | "profile:read" | "profile:update" | "profile:delete"
  | "student:read"
  | "teacher:read"
  | "invitation:create" | "invitation:cancel" | "invitation:read"
  | "organization:read" | "organization:update" | "organization:delete"
  | "member:read" | "member:update" | "member:delete";

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  admin: [
    "class:create", "class:read", "class:update", "class:delete", "class:join",
    "subject:create", "subject:read", "subject:update", "subject:delete",
    "department:create", "department:read", "department:update", "department:delete",
    "profile:create", "profile:read", "profile:update", "profile:delete",
    "student:read",
    "teacher:read",
    "invitation:create", "invitation:cancel", "invitation:read",
    "organization:read", "organization:update", "organization:delete",
    "member:read", "member:update", "member:delete",
  ],
  teacher: [
    "class:create", "class:read", "class:update", "class:delete", "class:join",
    "subject:read",
    "department:read",
    "profile:create", "profile:read", "profile:update", "profile:delete",
    "student:read",
    "invitation:create", "invitation:read",
  ],
  student: [
    "class:read", "class:join",
    "subject:read",
    "department:read",
    "profile:create", "profile:read", "profile:update", "profile:delete",
    "teacher:read",
  ],
};

export function hasPermission(role: RoleName, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: RoleName, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(role: RoleName, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

export function getPermissions(role: RoleName): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
