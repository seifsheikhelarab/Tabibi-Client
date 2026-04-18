import { createAuthClient } from 'better-auth/react'
import { organizationClient, customSessionClient } from 'better-auth/client/plugins'

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export const authClient = createAuthClient({
    baseURL: backendUrl,
    plugins: [organizationClient(), customSessionClient()],
    pluginOptions: {
        cookieCache: {
            maxAge: 60 * 60 * 24 * 7 // 1 week
        }
    }
})

export const { useSession, useSignIn, useSignUp, useSignOut } = authClient
