import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { EndSessionDto } from './dto/end-session.dto';

@Controller('session')
@UseGuards(AuthGuard('jwt'))
export class SessionController {
    constructor(private readonly sessionService: SessionService) {}

    @Post()
    create(@CurrentUser() user, @Body() dto: CreateSessionDto) {
        return this.sessionService.create(user.userId, dto);
    }

    @Patch(':id/start')
    start(@CurrentUser() user, @Param('id') id: string) {
        return this.sessionService.start(id, user.userId);
    }

    @Patch(':id/end')
    end(@CurrentUser() user, @Param('id') id: string, @Body() dto: EndSessionDto) {
        return this.sessionService.end(id, user.userId, dto);
    }

    @Get()
    findAll(@CurrentUser() user) {
        return this.sessionService.findAll(user.userId);
    }

    @Get(':id')
    findOne(@CurrentUser() user, @Param('id') id: string) {
        return this.sessionService.findOne(id, user.userId);
    }
}
