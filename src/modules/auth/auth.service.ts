import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) { }

  async login(dto: LoginDto) {
    const user = this.usersService.findByEmail(dto.email);
    const secretAt = this.config.get('JWT_SECRET');

    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre.');
    }

    const payload = { sub: user.id, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      algorithm: 'HS256',
      secret: secretAt,
    });

    this.logger.debug(`User ${user.id} logged in successfully.`);

    return {
      accessToken
    };
  }
}
