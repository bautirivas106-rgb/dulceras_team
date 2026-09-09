import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  children: React.ReactNode
  requiredRole?: string
  excludeRole?: string
}

export default function ProtectedRoute({ children, requiredRole, excludeRole }: Props) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/admin/login" replace />
  }

  if (excludeRole && user?.role === excludeRole) {
    return <Navigate to="/superadmin/metrics" replace />
  }

  return <>{children}</>
}
