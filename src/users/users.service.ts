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

  async createUser({
    userID,
    password,
  }: {
    userID: string;
    password: string;
  }): Promise<ServiceOutput> {
    try {
      const saltRounds = this.configService.get<string>('PASSWORD_SALT', '10');
      const hashedPassword = await bcrypt.hash(password, Number(saltRounds));

      const user = new User();
      user.userID = userID;
      user.password = hashedPassword;

      await this.usersRepository.save(user);
      return { success: true, message: '' };
    } catch (error: unknown) {
      this.logger.error(error);

      let errorMessage = '계정 생성 과정에서 오류가 발생했습니다.';
      if (
        error instanceof Error &&
        (('code' in error && error.code === 'SQLITE_CONSTRAINT_UNIQUE') ||
          error.message.includes('UNIQUE constraint failed'))
      ) {
        errorMessage = '같은 아이디를 사용하고 있는 계정이 있습니다.';
      }
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}
