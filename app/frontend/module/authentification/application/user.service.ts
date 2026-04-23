import { UserRole } from '@/app/frontend/utils/types/manager.type';
import {
  IResetPassWordDto,
  RegisterDto,
  UpdateUserDto,
  User,
} from '../domain/entities/user.entity';
import {
  ForgotPasswordDto,
  IOtp,
  IUserRepository,
} from '../domain/interfaces/user.entity';
export interface FiltreUserDto {
  email?: string;
  name?: string;
  phone?: string;
}

export class UserService {
  constructor(private readonly userRepo: IUserRepository) {}
  async createUser(dto: RegisterDto) {
    return await this.userRepo.create(dto);
  }
  async findAllUsers() {
    return await this.userRepo.findAll();
  }
  async updateRoleUser(id: string): Promise<{ mess: string }> {
    await this.userRepo.updateRole(id);
    return { mess: "Le rôle de l\'utilisateur est modifier avec succès!" };
  }
  async execute(id: string, dto: UpdateUserDto): Promise<User> {
    return await this.userRepo.update(id, dto);
  }
  async resetPassword(dto: IResetPassWordDto): Promise<void> {
    return await this.userRepo.resetPassword(dto);
  }
  async forgotpassword(email: ForgotPasswordDto): Promise<IOtp> {
    return await this.userRepo.forgotpassword(email);
  } 
}
