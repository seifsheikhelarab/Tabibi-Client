import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authClient } from '../api/auth'

const publicRoutes = ['/', '/doctors', '/login', '/about', '/contact', '/collaborations', '/verify']

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { data: session, isPending } = authClient.useSession()

    useEffect(() => {
        if (isPending) return

        const isPublicRoute = publicRoutes.some(route => {
            if (route.includes(':')) {
                const routePattern = route.split('/').slice(0, -1).join('/')
                return location.pathname.startsWith(routePattern)
            }
            return location.pathname === route
        })

        if (!session?.user && !isPublicRoute) {
            navigate('/login', { replace: true })
        }
    }, [session, isPending, navigate, location])

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return children
}

export default ProtectedRoute
