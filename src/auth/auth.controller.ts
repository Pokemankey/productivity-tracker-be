import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  UseGuards,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { Request, Response } from 'express';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const deviceInfo = req.headers['user-agent'] || 'unknown';
    const { accessToken, refreshToken } = await this.authService.signup(
      dto,
      deviceInfo,
    );

    this.setAuthCookies(res, accessToken, refreshToken);

    return { message: 'Signup successful' };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const deviceInfo = req.headers['user-agent'] || 'unknown';
    const { accessToken, refreshToken } = await this.authService.login(
      dto,
      deviceInfo,
    );

    this.setAuthCookies(res, accessToken, refreshToken);
    return { message: 'Login successful' };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    const { accessToken, refreshToken: newRefresh } =
      await this.authService.refresh({ refreshToken });

    this.setAuthCookies(res, accessToken, newRefresh);
    return { message: 'Tokens refreshed' };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@CurrentUser() user: any) {
    return await this.authService.me(user.userId);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  logout(@CurrentUser() user: any, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return this.authService.logout(user);
  }

  @Post('logout-all')
  @UseGuards(AuthGuard('jwt'))
  logoutAll(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return this.authService.logoutAll(user);
  }

  @Post('logout-all-except-current')
  @UseGuards(AuthGuard('jwt'))
  logoutAllExceptCurrent(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return this.authService.logoutAllExceptCurrent(user);
  }

  private setAuthCookies(res: Response, access: string, refresh: string) {
    res.cookie('access_token', access, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refresh, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
