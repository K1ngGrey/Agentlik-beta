import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuthStore } from "@/store/authStore"

// Autentifikatsiyadan o'tmagan foydalanuvchini /login ga yo'naltiradi.
// Kirgan bo'lsa, ichki route'larni (Outlet) ko'rsatadi.
export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    // Foydalanuvchi bormoqchi bo'lgan manzilni saqlaymiz, kirgach qaytaramiz.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
