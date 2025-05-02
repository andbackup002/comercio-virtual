import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha: string;
}

export class RegisterDto extends LoginDto {
  @IsString()
  @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres' })
  nome: string;
}