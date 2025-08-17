import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import * as createUserDto from './dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findUserByUserID: jest.fn(),
            createUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const mockCreateUserDto: createUserDto.CreateUserDto = {
      userID: 'testuser',
      password: 'testpassword',
    };

    describe('성공 케이스', () => {
      it('새로운 유저를 성공적으로 생성해야 함', async () => {
        const findUserSpy = jest
          .spyOn(usersService, 'findUserByUserID')
          .mockResolvedValue(null);
        const createUserSpy = jest
          .spyOn(usersService, 'createUser')
          .mockResolvedValue({ success: true, message: '' });

        const result = await controller.create(mockCreateUserDto);

        expect(findUserSpy).toHaveBeenCalledWith(mockCreateUserDto.userID);
        expect(createUserSpy).toHaveBeenCalledWith(mockCreateUserDto);
        expect(result).toBe('계정 생성에 성공했습니다.');
      });
    });

    describe('실패 케이스', () => {
      it('중복 유저가 존재할 때 HttpException을 던져야 함', async () => {
        const existingUser = {
          id: 1,
          userID: mockCreateUserDto.userID,
          password: 'hashedPassword',
          registeredDate: new Date(),
        } as User;

        const findUserSpy = jest
          .spyOn(usersService, 'findUserByUserID')
          .mockResolvedValue(existingUser);
        const createUserSpy = jest.spyOn(usersService, 'createUser');

        await expect(controller.create(mockCreateUserDto)).rejects.toThrow(
          new HttpException(
            '같은 아이디를 사용하고 있는 계정이 있습니다.',
            HttpStatus.BAD_REQUEST,
          ),
        );

        expect(findUserSpy).toHaveBeenCalledWith(mockCreateUserDto.userID);
        expect(createUserSpy).not.toHaveBeenCalled();
      });

      it('서비스에서 유저 생성 실패 시 HttpException을 던져야 함', async () => {
        const errorMessage = '계정 생성 과정에서 오류가 발생했습니다.';

        const findUserSpy = jest
          .spyOn(usersService, 'findUserByUserID')
          .mockResolvedValue(null);
        const createUserSpy = jest
          .spyOn(usersService, 'createUser')
          .mockResolvedValue({ success: false, message: errorMessage });

        await expect(controller.create(mockCreateUserDto)).rejects.toThrow(
          new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
        );

        expect(findUserSpy).toHaveBeenCalledWith(mockCreateUserDto.userID);
        expect(createUserSpy).toHaveBeenCalledWith(mockCreateUserDto);
      });
    });
  });
});
