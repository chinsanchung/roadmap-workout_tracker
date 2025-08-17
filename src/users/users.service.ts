import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { ServiceOutput } from 'src/common/interfaces/common.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

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
      await this.usersRepository.save({
        userID,
        password,
      });
      return { success: true, message: '' };
    } catch (error) {
      // TODO: 에러 로그 처리
      console.error(error);
      return {
        success: false,
        message: '계정 생성 과정에서 오류가 발생했습니다.',
      };
    }
  }
}
