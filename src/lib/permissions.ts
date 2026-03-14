/**
 * Role types for the classroom app
 * These must match the roles defined in backend/src/lib/access-control.ts
 */
export type RoleName = "admin" | "teacher" | "student";

/**
 * Permission types for all resources
 */
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

/**
 * Role to permissions mapping
 * This should match the backend access-control.ts configuration
 */
export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  admin: [
    // Class permissions
    "class:create", "class:read", "class:update", "class:delete", "class:join",
    // Subject permissions
    "subject:create", "subject:read", "subject:update", "subject:delete",
    // Department permissions
    "department:create", "department:read", "department:update", "department:delete",
    // Profile permissions
    "profile:create", "profile:read", "profile:update", "profile:delete",
    // Student permissions
    "student:read",
    // Teacher permissions
    "teacher:read",
    // Invitation permissions
    "invitation:create", "invitation:cancel", "invitation:read",
    // Organization permissions
    "organization:read", "organization:update", "organization:delete",
    // Member permissions
    "member:read", "member:update", "member:delete",
  ],
  teacher: [
    // Class permissions
    "class:create", "class:read", "class:update", "class:delete", "class:join",
    // Subject permissions (read only)
    "subject:read",
    // Department permissions (read only)
    "department:read",
    // Profile permissions
    "profile:create", "profile:read", "profile:update", "profile:delete",
    // Student permissions
    "student:read",
    // Invitation permissions
    "invitation:create", "invitation:read",
  ],
  student: [
    // Class permissions
    "class:read", "class:join",
    // Subject permissions (read only)
    "subject:read",
    // Department permissions (read only)
    "department:read",
    // Profile permissions
    "profile:create", "profile:read", "profile:update", "profile:delete",
    // Teacher permissions
    "teacher:read",
  ],
};

/**
 * Helper to check if a role has a specific permission
 */
export function hasPermission(role: RoleName, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Helper to check if a role has any of the given permissions
 */
export function hasAnyPermission(role: RoleName, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Helper to check if a role has all of the given permissions
 */
export function hasAllPermissions(role: RoleName, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: RoleName): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
