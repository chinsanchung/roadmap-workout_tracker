import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { DatabaseError } from '../common/interfaces/common.interface';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let configService: ConfigService;
  const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const mockUserData = {
      userID: 'testuser',
      password: 'testpassword',
    };

    describe('성공 케이스', () => {
      it('유효한 데이터로 유저를 성공적으로 생성해야 함', async () => {
        const saltRounds = 10;
        const hashedPassword = 'hashedPassword123';

        const configSpy = jest
          .spyOn(configService, 'get')
          .mockReturnValue('10');
        mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
        const saveSpy = jest
          .spyOn(userRepository, 'save')
          .mockResolvedValue({} as User);

        const result = await service.createUser(mockUserData);

        expect(configSpy).toHaveBeenCalledWith('PASSWORD_SALT', '10');
        expect(mockedBcrypt.hash).toHaveBeenCalledWith(
          mockUserData.password,
          saltRounds,
        );
        expect(saveSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            userID: mockUserData.userID,
            password: hashedPassword,
          }),
        );
        expect(result).toEqual({ success: true, message: '' });
      });

      it('ConfigService에서 기본 saltRounds(10)를 사용해야 함', async () => {
        const hashedPassword = 'hashedPassword123';

        const configSpy = jest
          .spyOn(configService, 'get')
          .mockReturnValue(undefined);
        mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
        jest.spyOn(userRepository, 'save').mockResolvedValue({} as User);

        await service.createUser(mockUserData);

        expect(configSpy).toHaveBeenCalledWith('PASSWORD_SALT', '10');
      });
    });

    describe('실패 케이스', () => {
      it('repository save 실패 시 에러를 반환해야 함', async () => {
        const error = new Error('Database error');
        const loggerErrorSpy = jest
          .spyOn(service['logger'], 'error')
          .mockImplementation();

        jest.spyOn(configService, 'get').mockReturnValue('10');
        mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
        jest.spyOn(userRepository, 'save').mockRejectedValue(error);

        const result = await service.createUser(mockUserData);

        expect(loggerErrorSpy).toHaveBeenCalledWith(error);
        expect(result).toEqual({
          success: false,
          message: '계정 생성 과정에서 오류가 발생했습니다.',
        });

        loggerErrorSpy.mockRestore();
      });

      it('bcrypt hash 실패 시 에러를 반환해야 함', async () => {
        const error = new Error('Bcrypt error');
        const loggerErrorSpy = jest
          .spyOn(service['logger'], 'error')
          .mockImplementation();

        jest.spyOn(configService, 'get').mockReturnValue('10');
        mockedBcrypt.hash.mockRejectedValue(error as never);

        const result = await service.createUser(mockUserData);

        expect(loggerErrorSpy).toHaveBeenCalledWith(error);
        expect(result).toEqual({
          success: false,
          message: '계정 생성 과정에서 오류가 발생했습니다.',
        });

        loggerErrorSpy.mockRestore();
      });

      it('ConfigService 오류 시 에러를 반환해야 함', async () => {
        const error = new Error('Config error');
        const loggerErrorSpy = jest
          .spyOn(service['logger'], 'error')
          .mockImplementation();

        jest.spyOn(configService, 'get').mockImplementation(() => {
          throw error;
        });

        const result = await service.createUser(mockUserData);

        expect(loggerErrorSpy).toHaveBeenCalledWith(error);
        expect(result).toEqual({
          success: false,
          message: '계정 생성 과정에서 오류가 발생했습니다.',
        });

        loggerErrorSpy.mockRestore();
      });

      it('UNIQUE 제약 위반 시 중복 계정 메시지를 반환해야 함', async () => {
        const uniqueError: DatabaseError = new Error(
          'UNIQUE constraint failed: user.userID',
        );
        uniqueError.code = 'SQLITE_CONSTRAINT_UNIQUE';
        const loggerErrorSpy = jest
          .spyOn(service['logger'], 'error')
          .mockImplementation();

        jest.spyOn(configService, 'get').mockReturnValue('10');
        mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
        jest.spyOn(userRepository, 'save').mockRejectedValue(uniqueError);

        const result = await service.createUser(mockUserData);

        expect(loggerErrorSpy).toHaveBeenCalledWith(uniqueError);
        expect(result).toEqual({
          success: false,
          message: '같은 아이디를 사용하고 있는 계정이 있습니다.',
        });

        loggerErrorSpy.mockRestore();
      });

      it('UNIQUE constraint failed 메시지 포함 에러 시 중복 계정 메시지를 반환해야 함', async () => {
        const uniqueError = new Error('UNIQUE constraint failed: user.userID');
        const loggerErrorSpy = jest
          .spyOn(service['logger'], 'error')
          .mockImplementation();

        jest.spyOn(configService, 'get').mockReturnValue('10');
        mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
        jest.spyOn(userRepository, 'save').mockRejectedValue(uniqueError);

        const result = await service.createUser(mockUserData);

        expect(loggerErrorSpy).toHaveBeenCalledWith(uniqueError);
        expect(result).toEqual({
          success: false,
          message: '같은 아이디를 사용하고 있는 계정이 있습니다.',
        });

        loggerErrorSpy.mockRestore();
      });
    });
  });
});
