import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { ServiceOutput } from 'src/common/interfaces/common.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}
  private readonly logger = new Logger('UsersService', { timestamp: true });

  async findUserByUserID(userID: string) {
    return await this.usersRepository.findOneBy({ userID });
  }

  async createUser({
    userID,
    password,
  }: {
    userID: string;
    password: string;
  }): Promise<ServiceOutput> {
    try {
      const saltRounds = this.configService.get<number>('PASSWORD_SALT', 10);
      const hashedPassword = await bcrypt.hash(password, Number(saltRounds));

      const user = new User();
      user.userID = userID;
      user.password = hashedPassword;

      await this.usersRepository.save(user);
      return { success: true, message: '' };
    } catch (error) {
      this.logger.error(error);
      return {
        success: false,
        message: '계정 생성 과정에서 오류가 발생했습니다.',
      };
    }
  }
}
