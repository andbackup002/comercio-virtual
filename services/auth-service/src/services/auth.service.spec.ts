import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('deve criar um novo usuário quando o email não estiver registrado', async () => {
      const registerDto = {
        email: 'novo@exemplo.com',
        senha: 'senha123',
        nome: 'Novo Usuário',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        ...registerDto,
        id: 1,
        senha: expect.any(String),
      });
      mockUserRepository.save.mockImplementation((user) => Promise.resolve(user));

      const result = await service.register(registerDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.email).toBe(registerDto.email);
      expect(result.nome).toBe(registerDto.nome);
      expect(result.senha).not.toBe(registerDto.senha); // senha deve estar hasheada
    });

    it('deve lançar UnauthorizedException quando o email já estiver registrado', async () => {
      const registerDto = {
        email: 'existente@exemplo.com',
        senha: 'senha123',
        nome: 'Usuário Existente',
      };

      mockUserRepository.findOne.mockResolvedValue({ id: 1, ...registerDto });

      await expect(service.register(registerDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.register(registerDto)).rejects.toThrow('Email já cadastrado');
    });
  });

  describe('login', () => {
    it('deve retornar um token de acesso quando as credenciais forem válidas', async () => {
      const loginDto = {
        email: 'usuario@exemplo.com',
        senha: 'senha123',
      };

      const hashedPassword = await bcrypt.hash(loginDto.senha, 10);
      const user = {
        id: 1,
        email: loginDto.email,
        senha: hashedPassword,
      };

      const token = 'jwt-token-mock';
      mockUserRepository.findOne.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(loginDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: loginDto.email } });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: user.id, email: user.email });
      expect(result).toEqual({ access_token: token });
    });

    it('deve lançar UnauthorizedException quando a senha for inválida', async () => {
      const loginDto = {
        email: 'usuario@exemplo.com',
        senha: 'senha_incorreta',
      };

      const hashedPassword = await bcrypt.hash('senha_correta', 10);
      const user = {
        id: 1,
        email: loginDto.email,
        senha: hashedPassword,
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Credenciais inválidas');
    });

    it('deve lançar UnauthorizedException quando o usuário não for encontrado', async () => {
      const loginDto = {
        email: 'naoexiste@exemplo.com',
        senha: 'senha123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Credenciais inválidas');
    });
  });

  describe('validateUser', () => {
    it('deve retornar o usuário quando ele existir', async () => {
      const userId = '1';
      const user = {
        id: userId,
        email: 'usuario@exemplo.com',
        nome: 'Usuário',
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.validateUser(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result).toEqual(user);
    });

    it('deve lançar UnauthorizedException quando o usuário não existir', async () => {
      const userId = '999';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser(userId)).rejects.toThrow(UnauthorizedException);
      await expect(service.validateUser(userId)).rejects.toThrow('Usuário não encontrado');
    });
  });
});