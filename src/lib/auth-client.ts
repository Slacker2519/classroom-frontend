import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { BACKEND_BASE_URL } from "@/constants";

export const authClient = createAuthClient({
    baseURL: BACKEND_BASE_URL.replace(/\/$/, ""),
    fetchOptions: {
        credentials: "include",
    },
    plugins: [
        organizationClient(),
    ],
});

export const { 
    signIn, 
    signUp, 
    signOut, 
    useSession,
    organization 
} = authClient;
