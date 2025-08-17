import {
  Controller,
  Post,
  Body,
  UsePipes,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import * as createUserDto from './dto/create-user.dto';
import { ZodValidationPipe } from 'src/common/decorators/zod-validation.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createUserDto.createUserSchema))
  async create(
    @Body() createUserDto: createUserDto.CreateUserDto,
  ): Promise<string> {
    const existUser = await this.usersService.findUserByUserID(
      createUserDto.userID,
    );
    if (existUser) {
      throw new HttpException(
        '같은 아이디를 사용하고 있는 계정이 있습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { success, message } =
      await this.usersService.createUser(createUserDto);

    if (success) return '계정 생성에 성공했습니다.';
    else throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }
}
