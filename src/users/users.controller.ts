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
import { ZodValidationPipe } from '../common/decorators/zod-validation.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createUserDto.createUserSchema))
  async create(
    @Body() createUserDto: createUserDto.CreateUserDto,
  ): Promise<string> {
    const { success, message } =
      await this.usersService.createUser(createUserDto);

    if (success) return '계정 생성에 성공했습니다.';
    else throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }
}
