// Foydalanuvchi rollari (backend JSON'da satr sifatida keladi).
export type Role = "SuperAdmin" | "Rahbar" | "Member"

export interface UserDto {
  id: string
  fullName: string
  login: string
  role: Role
  isActive: boolean
}

// Yangi foydalanuvchi yaratish so'rovi (parol faqat yaratishda).
export interface CreateUserRequest {
  fullName: string
  login: string
  password: string
  role: Role
}

// Mavjud foydalanuvchini tahrirlash so'rovi (login va parol o'zgartirilmaydi).
export interface UpdateUserRequest {
  fullName: string
  role: Role
  isActive: boolean
}

export interface LoginRequest {
  login: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  user: UserDto
}
