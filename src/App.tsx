import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Home from '@/pages/Home'
import SignIn from '@/pages/SignIn'
import SignUp from '@/pages/SignUp'
import Layout from '@/components/Layout'
import PublicLayout from '@/components/PublicLayout'
import Dashboard from '@/pages/Dashboard'
import EventsList from '@/pages/EventsList'
import EventForm from '@/pages/EventForm'
import EventDetail from '@/pages/EventDetail'
import Tickets from '@/pages/Tickets'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (!user && !loading) {
    return <Navigate to="/signin" replace />
  }

  return <Layout>{children}</Layout>
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (user && !loading) {
    return <Navigate to="/dashboard" replace />
  }

  return <PublicLayout>{children}</PublicLayout>
}

function PublicOrProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (user) {
    return <Layout>{children}</Layout>
  }

  return <PublicLayout>{children}</PublicLayout>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicOrProtectedRoute><Home /></PublicOrProtectedRoute>} />
      <Route path="/signin" element={<PublicOnlyRoute><SignIn /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
      <Route path="/events" element={<PublicOrProtectedRoute><EventsList /></PublicOrProtectedRoute>} />
      <Route path="/events/:eventId" element={<PublicOrProtectedRoute><EventDetail /></PublicOrProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/events/new" element={<ProtectedRoute><EventForm /></ProtectedRoute>} />
      <Route path="/events/:eventId/edit" element={<ProtectedRoute><EventForm /></ProtectedRoute>} />
      <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
    </Routes>
  )
}
