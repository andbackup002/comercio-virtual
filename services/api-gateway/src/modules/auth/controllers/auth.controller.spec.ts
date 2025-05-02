import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    validateToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        ConfigService,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with correct parameters', async () => {
      const loginDto = { email: 'test@test.com', password: 'password123' };
      await controller.login(loginDto);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('register', () => {
    it('should call authService.register with correct parameters', async () => {
      const registerDto = {
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
      };
      await controller.register(registerDto);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('validateToken', () => {
    it('should call authService.validateToken with correct token', async () => {
      const token = 'valid-token';
      const authHeader = `Bearer ${token}`;
      await controller.validateToken(authHeader);
      expect(authService.validateToken).toHaveBeenCalledWith(token);
    });
  });
});