import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios"

import type { ApiResult } from "@/types/api"
import type { LoginResponse } from "@/types/auth"
import { tokenStorage } from "@/lib/tokenStorage"

// Asosiy axios instansi. Barcha API chaqiruvlari shu orqali o'tadi.
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// --- Request interceptor: har bir so'rovga accessToken'ni qo'shamiz ---
http.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- 401 refresh mantig'i ---
// Parallel kelgan 401 larни bitta refresh bilan hal qilish uchun navbat.
type QueueItem = {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let pendingQueue: QueueItem[] = []

function flushQueue(error: unknown, token: string | null): void {
  pendingQueue.forEach((item) => {
    if (token) {
      item.resolve(token)
    } else {
      item.reject(error)
    }
  })
  pendingQueue = []
}

function redirectToLogin(): void {
  tokenStorage.clear()
  if (window.location.pathname !== "/login") {
    window.location.href = "/login"
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

// Refresh chaqiruvi alohida (interceptorsiz) instans bilan amalga oshiriladi,
// aks holda u ham 401 oqibatida cheksiz halqaga tushib qolishi mumkin.
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
})

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined
    const status = error.response?.status

    // 401 bo'lmasa yoki config yo'q bo'lsa — xatoni shundayligicha uzatamiz.
    if (!originalRequest || status !== 401) {
      return Promise.reject(error)
    }

    // Login/refresh so'rovlarining 401'ini refresh qilishga urinmaymiz.
    const url = originalRequest.url ?? ""
    if (url.includes("/api/auth/login") || url.includes("/api/auth/refresh")) {
      return Promise.reject(error)
    }

    // Bitta so'rovni faqat bir marta qayta yuboramiz.
    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) {
      redirectToLogin()
      return Promise.reject(error)
    }

    // Refresh allaqachon ketayotgan bo'lsa — navbatga qo'yamiz.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(http(originalRequest))
          },
          reject,
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await refreshClient.post<ApiResult<LoginResponse>>(
        "/api/auth/refresh",
        { refreshToken }
      )

      if (!data.succeeded || !data.result) {
        throw new Error("Refresh muvaffaqiyatsiz tugadi")
      }

      const session = data.result
      tokenStorage.setSession(
        session.accessToken,
        session.refreshToken,
        session.user
      )

      // Navbatdagi so'rovlarni yangi token bilan ozod qilamiz.
      flushQueue(null, session.accessToken)

      originalRequest.headers.Authorization = `Bearer ${session.accessToken}`
      return http(originalRequest)
    } catch (refreshError) {
      flushQueue(refreshError, null)
      redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default http
