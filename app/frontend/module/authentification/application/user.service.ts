import {
  RegisterDto,
  UpdateUserDto,
  User,
} from "../domain/entities/user.entity";
import { IUserRepository } from "../domain/interfaces/user.entity";

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
}
