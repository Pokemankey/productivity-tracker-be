import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import bcrypt from 'bcrypt';
import ms from 'ms';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto, deviceInfo: string) {
    const { username, email, password } = dto;

    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (exists)
      throw new BadRequestException('Email or username is already in use.');

    const hash = await this.hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hash,
      },
    });

    return this.generateTokens(user.id, user.email, deviceInfo);
  }

  async login(dto: LoginDto, deviceInfo: string) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) throw new BadRequestException('Email or password is incorrect');

    const isMatch = await this.comparePassword(password, user.passwordHash);
    if (!isMatch)
      throw new BadRequestException('Email or password is incorrect');

    return this.generateTokens(user.id, user.email, deviceInfo);
  }

  async logout(user: { userId: string; jti: string }) {
    await this.prisma.refreshToken.delete({
      where: {
        id: user.jti,
      },
    });

    return { message: 'Logged out from this device.' };
  }

  async logoutAll(user: { userId: string; jti: string }) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId: user.userId,
      },
    });

    return { message: 'Logged out from all devices.' };
  }

  async logoutAllExceptCurrent(user: { userId: string; jti: string }) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId: user.userId,
        id: { not: user.jti },
      },
    });

    return { message: 'Logged out from all other devices.' };
  }

  async refresh(dto: RefreshTokenDto) {
    const { refreshToken } = dto;

    const decoded = await this.jwt.verifyAsync(refreshToken, {
      secret: 'supersecret',
    });

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: {
        id: decoded.jti,
      },
    });
    if (!storedToken) throw new UnauthorizedException('Invalid refresh token');
    if (storedToken.revokedAt)
      throw new UnauthorizedException('Invalid refresh token');

    const isValid = await bcrypt.compare(refreshToken, storedToken.tokenHash);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    await this.prisma.refreshToken.delete({
      where: {
        id: decoded.jti,
      },
    });

    return this.generateTokens(
      decoded.sub,
      decoded.email,
      storedToken.deviceInfo,
    );
  }

  private async generateTokens(
    userId: string,
    email: string,
    deviceInfo: string | null,
  ) {
    const jti = uuid();
    const payload = { sub: userId, email: email, jti: jti };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: 'supersecret',
      expiresIn: '15m',
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: 'supersecret',
      expiresIn: '7d',
    });
    const saltRounds = 10;
    const hash = await bcrypt.hash(refreshToken, saltRounds);

    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        deviceInfo: deviceInfo || 'unknown',
      },
    });

    await this.prisma.refreshToken.create({
      data: {
        id: jti,
        userId,
        tokenHash: hash,
        deviceInfo,
        expiresAt: new Date(Date.now() + ms('7d')),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async hashPassword(password: string) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  private async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}
