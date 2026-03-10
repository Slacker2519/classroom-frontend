import { AuthProvider } from "@refinedev/core";
import { authClient } from "@/lib/auth-client";

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
            // Ignore session check errors
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
        const { data: session } = await authClient.getSession();
        if (session) {
            return (session.user as any).role;
        }
        return null;
    },
    getIdentity: async () => {
        const { data: session } = await authClient.getSession();
        if (session) {
            return {
                ...session.user,
                avatar: session.user.image,
            };
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
