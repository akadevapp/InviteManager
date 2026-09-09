import { HashRouter, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { ToastProvider } from '@/components/ui/Toast'
import { useCrossTabSync } from '@/hooks/useCrossTabSync'
import { useNotificationAnnouncer } from '@/hooks/useNotificationAnnouncer'
import { useThemeSync } from '@/hooks/useThemeSync'
import ContactsPage from '@/pages/ContactsPage'
import DashboardPage from '@/pages/DashboardPage'
import EventDetailPage from '@/pages/EventDetailPage'
import EventsPage from '@/pages/EventsPage'
import NotFoundPage from '@/pages/NotFoundPage'
import RsvpPage from '@/pages/RsvpPage'
import SettingsPage from '@/pages/SettingsPage'

function AppEffects() {
  useCrossTabSync()
  useThemeSync()
  useNotificationAnnouncer()
  return null
}

export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <AppEffects />
        <Routes>
          <Route path="/rsvp/:token" element={<RsvpPage />} />
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:eventId" element={<EventDetailPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </HashRouter>
    </ToastProvider>
  )
}
