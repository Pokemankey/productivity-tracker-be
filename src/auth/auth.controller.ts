import { Controller, Post, Body, Req, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { Request } from 'express';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    signup(@Body() dto: SignupDto, @Req() req: Request) {
        const deviceInfo = req.headers['user-agent'] || 'unknown';
        return this.authService.signup(dto, deviceInfo);
    }

    @Post('login')
    login(@Body() dto: LoginDto, @Req() req: Request) {
        const deviceInfo = req.headers['user-agent'] || 'unknown';
        return this.authService.login(dto, deviceInfo);
    }

    @Post('refresh')
    refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refresh(dto);
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    me(@CurrentUser() user: any){
        return user;
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    logout(@CurrentUser() user: any) {
        return this.authService.logout(user);
    }

    @Post('logout-all')
    @UseGuards(AuthGuard('jwt'))
    logoutAll(@CurrentUser() user: any) {
        return this.authService.logoutAll(user);
    }

    @Post('logout-all-except-current')
    @UseGuards(AuthGuard('jwt'))
    logoutAllExceptCurrent(@CurrentUser() user: any) {
        return this.authService.logoutAllExceptCurrent(user);
    }
}
