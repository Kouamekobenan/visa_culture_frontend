import { api } from '@/app/backend/database/api';
import {
  IResetPassWordDto,
  IUserController,
  RegisterDto,
  RegisterResponse,
  UpdateUserDto,
  User,
} from '../domain/entities/user.entity';
import {
  ForgotPasswordDto,
  IOtp,
  IUserRepository,
} from '../domain/interfaces/user.entity';
import {
  UserRole,
  PaginatedResponseRepository,
} from '@/app/frontend/utils/types/manager.type';
import { FiltreUserDto } from '../application/user.service';
export class UserRepository implements IUserRepository {
  async create(dto: RegisterDto): Promise<RegisterResponse> {
    const users = await api.post(`/auth/register`, dto);
    return {
      message: users.data.message,
      token: {
        accessToken: users.data.accessToken,
        refreshToken: users.data.refreshToken,
      },
    };
  }
  async updateRole(id: string): Promise<void> {
    const url = `users/role/${id}`;
    await api.patch(url);
  }
  async findAll(): Promise<User[]> {
    const url = '/users';
    const users = await api.get(url);
    return users.data;
  }
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const url = `/auth/update/${id}`;
    const user = await api.patch(url, dto);
    return user.data;
  }
  async resetPassword(dto: IResetPassWordDto): Promise<void> {
    await api.post('/auth/reset-password', dto);
  }
  async forgotpassword(email: ForgotPasswordDto): Promise<IOtp> {
    const opt = await api.post('/otp/forgot-password', { email });
    return opt.data;
  }
  async paginateSearch(
    page: number,
    limit: number,
    search?: FiltreUserDto,
    role?: UserRole | 'ALL',
  ): Promise<PaginatedResponseRepository<User>> {
    const params = new URLSearchParams();

    params.append('page', String(page));
    params.append('limit', String(limit));

    if (role && role !== 'ALL') {
      params.append('role', role);
    }

    if (search) {
      Object.entries(search).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const url = `/users/paginate?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  }
  async stats(
    page: number,
    limit: number,
  ): Promise<PaginatedResponseRepository<IUserController>> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    const stats = await api.get(`/users/controller/stats?${params.toString()}`);
    return stats.data;
  }
}
