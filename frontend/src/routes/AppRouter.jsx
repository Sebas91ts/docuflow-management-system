import { Navigate, Route, Routes } from 'react-router-dom'

import AdminRoute from './AdminRoute'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import LoginPage from '../pages/LoginPage'
import DashboardLayout from '../layouts/DashboardLayout'
import DashboardHomePage from '../pages/dashboard/DashboardHomePage'
import DocumentsCreatePage from '../pages/dashboard/DocumentsCreatePage'
import DocumentsListPage from '../pages/dashboard/DocumentsListPage'
import PendingPage from '../pages/dashboard/PendingPage'
import UsersPage from '../pages/dashboard/UsersPage'
import AuditPage from '../pages/dashboard/AuditPage'

function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHomePage />} />
          <Route path="documents">
            <Route index element={<DocumentsListPage />} />
            <Route path="new" element={<DocumentsCreatePage />} />
          </Route>
          <Route path="pending" element={<PendingPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route element={<AdminRoute />}>
            <Route path="users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate replace to="/dashboard" />} />
      <Route path="*" element={<Navigate replace to="/dashboard" />} />
    </Routes>
  )
}

export default AppRouter
