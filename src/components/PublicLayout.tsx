import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <Link to="/" className="text-3xl font-bold text-primary">Nextix</Link>
          <div className="flex gap-4">
            <Link to="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
