import { Routes, Route } from "react-router-dom"

import LoginPage from "@/pages/LoginPage"
import DashboardPage from "@/pages/DashboardPage"
import UsersPage from "@/pages/users/UsersPage"
import ProjectsPage from "@/pages/projects/ProjectsPage"
import ProjectDetailPage from "@/pages/projects/ProjectDetailPage"
import GlobalChatPage from "@/pages/GlobalChatPage"
import ProtectedRoute from "@/components/ProtectedRoute"
import RoleGuard from "@/components/RoleGuard"
import AppLayout from "@/layouts/AppLayout"

function App() {
  return (
    <Routes>
      {/* Ochiq route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Himoyalangan route'lar — barchasi AppLayout ichida */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          {/* Loyihalar — barcha rollar ko'ra oladi, CRUD faqat SuperAdmin'da */}
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          {/* Umumiy chat — barcha rollar uchun */}
          <Route path="/chat" element={<GlobalChatPage />} />
          {/* Foydalanuvchilar boshqaruvi — faqat SuperAdmin */}
          <Route
            path="/users"
            element={
              <RoleGuard roles={["SuperAdmin"]}>
                <UsersPage />
              </RoleGuard>
            }
          />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
