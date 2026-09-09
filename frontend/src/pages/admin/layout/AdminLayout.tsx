import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import NotificationBell from './NotificationBell'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

function IconDashboard() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function IconOrders() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )
}

function IconCustomers() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function IconCatalog() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function IconReports() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function IconBilling() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )
}

function IconCoupon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard',     icon: <IconDashboard /> },
  { to: '/admin/orders',    label: 'Pedidos',        icon: <IconOrders /> },
  { to: '/admin/calendar',  label: 'Calendario',     icon: <IconCalendar /> },
  { to: '/admin/customers', label: 'Clientes',       icon: <IconCustomers /> },
  { to: '/admin/catalog',   label: 'Catálogo',       icon: <IconCatalog /> },
  { to: '/admin/reports',   label: 'Reportes',       icon: <IconReports /> },
  { to: '/admin/settings',  label: 'Configuración',  icon: <IconSettings /> },
  { to: '/admin/billing',   label: 'Facturación',    icon: <IconBilling /> },
  { to: '/admin/coupons',   label: 'Cupones',        icon: <IconCoupon /> },
]

function SidebarLink({ to, label, icon }: NavItem) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive
          ? 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border-l-2 border-[#E285AF] transition-colors'
          : 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border-l-2 border-transparent transition-colors hover:bg-[rgba(255,255,255,0.07)] hover:text-white'
      }
      style={({ isActive }) =>
        isActive
          ? { background: 'rgba(240,160,196,0.15)', color: '#F4BDE0', paddingLeft: '10px' }
          : { color: 'rgba(255,255,255,0.55)' }
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen overflow-hidden font-poppins" style={{ background: '#FDF6EC' }}>
      {/* Sidebar */}
      <aside
        className="w-60 flex-shrink-0 flex flex-col"
        style={{ background: 'linear-gradient(180deg, #2E1B10 0%, #1A0D06 100%)' }}
      >
        {/* Brand */}
        <div className="px-4 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <img src="/brand/logo-icon.png" alt="" style={{ height: 32, width: 'auto', flexShrink: 0 }} />
            <div>
              <img src="/brand/logo-wordmark.png" alt="Dulceras Team" style={{ height: 28, width: 'auto' }} />
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.68rem', marginTop: 1 }}>Panel admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-full text-white text-xs font-bold"
              style={{
                width: 28, height: 28,
                background: 'linear-gradient(135deg, #F0A0C4, #E285AF)',
              }}
            >
              {user?.username?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <span className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.72)' }}>
              {user?.username}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs py-1.5 transition-colors hover:text-white"
            style={{ color: 'rgba(255,255,255,0.38)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <IconLogout />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="h-14 flex items-center justify-end px-6 flex-shrink-0"
          style={{
            background: 'rgba(253,246,236,0.95)',
            borderBottom: '1px solid rgba(58,36,23,0.08)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <NotificationBell />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto" style={{ background: '#FDF6EC' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
