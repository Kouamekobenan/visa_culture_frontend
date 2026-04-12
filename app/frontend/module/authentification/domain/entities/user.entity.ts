import { UserRole } from "@/app/frontend/utils/types/manager.type";

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public password: string,
    public phone: string | null,
    public role: UserRole,
    public refreshToken: string | null,
    public cityId: string | null,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}

// USE INTERFACE 
export interface LoginDto {
  email: string;
  password: string;
}
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone: string | null;
  role: UserRole;
}
export interface RegisterResponse {
  message: string;
  token: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}
