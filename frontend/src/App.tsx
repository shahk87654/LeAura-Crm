import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthGuard } from './guards/AuthGuard'
import { RoleGuard } from './guards/RoleGuard'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LeadsPage from './pages/LeadsPage'
import LeadDetailPage from './pages/LeadDetailPage'
import FollowUpsPage from './pages/FollowUpsPage'
import CalendarPage from './pages/CalendarPage'
import BookingsPage from './pages/BookingsPage'
import BookingDetailPage from './pages/BookingDetailPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <div className="min-h-screen bg-surface text-slate-900">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <Routes>
                <Route index element={<DashboardPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="leads/:id" element={<LeadDetailPage />} />
                <Route path="followups" element={<FollowUpsPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="bookings/:id" element={<BookingDetailPage />} />
                <Route path="reports" element={
                  <RoleGuard role="admin">
                    <ReportsPage />
                  </RoleGuard>
                } />
                <Route path="settings" element={
                  <RoleGuard role="admin">
                    <SettingsPage />
                  </RoleGuard>
                } />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AuthGuard>
          }
        />
      </Routes>
      <Toaster position="top-right" />
    </div>
  )
}

export default App
