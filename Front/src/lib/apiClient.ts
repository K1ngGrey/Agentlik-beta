import { AxiosError, type AxiosRequestConfig } from "axios"

import http from "@/lib/axios"
import type { ApiResult } from "@/types/api"

// Tarmoq xatosini ham ApiResult ko'rinishiga keltiramiz, shunda chaqiruvchi tomon
// har doim bir xil shakl bilan ishlaydi (try/catch shart emas).
function normalizeError<T>(error: unknown): ApiResult<T> {
  if (error instanceof AxiosError) {
    const data = error.response?.data
    // Backend xatoda ham ApiResult qaytargan bo'lsa — o'shani ishlatamiz.
    if (data && typeof data === "object" && "succeeded" in data) {
      return data as ApiResult<T>
    }
    return {
      succeeded: false,
      statusCode: error.response?.status ?? 0,
      result: null,
      errors: [error.message || "Tarmoq xatosi yuz berdi"],
    }
  }

  return {
    succeeded: false,
    statusCode: 0,
    result: null,
    errors: ["Noma'lum xato yuz berdi"],
  }
}

async function get<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResult<T>> {
  try {
    const { data } = await http.get<ApiResult<T>>(url, config)
    return data
  } catch (error) {
    return normalizeError<T>(error)
  }
}

async function post<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResult<T>> {
  try {
    const { data } = await http.post<ApiResult<T>>(url, body, config)
    return data
  } catch (error) {
    return normalizeError<T>(error)
  }
}

async function put<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResult<T>> {
  try {
    const { data } = await http.put<ApiResult<T>>(url, body, config)
    return data
  } catch (error) {
    return normalizeError<T>(error)
  }
}

async function patch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResult<T>> {
  try {
    const { data } = await http.patch<ApiResult<T>>(url, body, config)
    return data
  } catch (error) {
    return normalizeError<T>(error)
  }
}

async function del<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResult<T>> {
  try {
    const { data } = await http.delete<ApiResult<T>>(url, config)
    return data
  } catch (error) {
    return normalizeError<T>(error)
  }
}

export const apiClient = { get, post, put, patch, del }
