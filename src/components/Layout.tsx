import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Calendar, Home, Ticket, LogOut, User, Plus } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const isOrganizer = profile?.role === 'organizer'

  const navItems = isOrganizer
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/events', label: 'Events', icon: Calendar },
        { path: '/events/new', label: 'New Event', icon: Plus },
      ]
    : [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/events', label: 'Events', icon: Calendar },
        { path: '/tickets', label: 'My Tickets', icon: Ticket },
      ]

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/30 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Nextix</h1>
          <p className="text-sm text-muted-foreground">Ticketing Platform</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-8">
          <div className="flex items-center gap-3 rounded-lg border bg-background p-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
