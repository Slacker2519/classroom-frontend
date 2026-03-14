import { AuthProvider } from "@refinedev/core";
import { authClient } from "@/lib/auth-client";
import type { RoleName } from "@/lib/permissions";

export const authProvider: AuthProvider = {
    login: async ({ email, password }) => {
        try {
            const { data, error } = await authClient.signIn.email({
                email,
                password,
            });

            if (error) {
                return {
                    success: false,
                    error: {
                        message: error.message || "Login failed",
                        name: "Login Error",
                    },
                };
            }

            if (data) {
                return {
                    success: true,
                    redirectTo: "/",
                };
            }

            return {
                success: false,
                error: {
                    message: "Unknown error",
                    name: "Login Error",
                },
            };
        } catch (error: any) {
            return {
                success: false,
                error: {
                    message: error.message || "Login failed",
                    name: "Login Error",
                },
            };
        }
    },
    logout: async () => {
        try {
            await authClient.signOut();
            return {
                success: true,
                redirectTo: "/login",
            };
        } catch (error: any) {
            return {
                success: false,
                error: {
                    message: error.message || "Logout failed",
                    name: "Logout Error",
                },
            };
        }
    },
    check: async () => {
        try {
            const { data: session } = await authClient.getSession();
            if (session) {
                return {
                    authenticated: true,
                };
            }
        } catch (error) {
            console.error("Session check error:", error);
        }

        return {
            authenticated: false,
            redirectTo: "/login",
            error: {
                message: "Session expired",
                name: "Session Error",
            },
        };
    },
    getPermissions: async () => {
        try {
            const { data: session } = await authClient.getSession();
            if (session) {
                // Get active organization from session
                const sessionWithOrg = session as any;
                const activeOrg = sessionWithOrg.activeOrganization;
                
                if (activeOrg) {
                    // Get the member to find their role using the organization client
                    const orgClient = authClient.organization as any;
                    if (orgClient?.getMember) {
                        try {
                            const { data: member } = await orgClient.getMember({
                                organizationId: activeOrg.id,
                                memberId: session.user.id,
                            });
                            if (member) {
                                return member.role as RoleName;
                            }
                        } catch (e) {
                            // Member might not exist or API error
                            console.error("Error getting member:", e);
                        }
                    }
                }
                // Fallback to user.role (stored on user record)
                return (session.user as any).role as RoleName;
            }
        } catch (e) {
            console.error("Error getting permissions:", e);
        }

        return null;
    },
    getIdentity: async () => {
        try {
            const { data: session } = await authClient.getSession();
            if (session) {
                const user = session.user;
                
                // Get active organization info
                const sessionWithOrg = session as any;
                const activeOrg = sessionWithOrg.activeOrganization;
                let role: RoleName | undefined;
                let organizationId: string | undefined;
                
                if (activeOrg) {
                    organizationId = activeOrg.id;
                    // Get member to find role
                    try {
                        const orgClient = authClient.organization as any;
                        if (orgClient?.getMember) {
                            const { data: member } = await orgClient.getMember({
                                organizationId: activeOrg.id,
                                memberId: session.user.id,
                            });
                            if (member) {
                                role = member.role as RoleName;
                            }
                        }
                    } catch (e) {
                        // Member might not exist yet
                        console.error("Error getting member:", e);
                    }
                }

                return {
                    ...user,
                    avatar: user.image,
                    role: role || (user as any).role,
                    organizationId,
                };
            }
        } catch (e) {
            console.error("Error getting identity:", e);
        }

        return null;
    },
    onError: async (error) => {
        if (error.status === 401 || error.status === 403) {
            return {
                logout: true,
                redirectTo: "/login",
            };
        }
        return { error };
    },
};
