import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GoalService } from './goal.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Controller('goal')
@UseGuards(AuthGuard('jwt'))
export class GoalController {
    constructor(private readonly goalService: GoalService) {}

    @Post()
    create(@CurrentUser() user, @Body() dto: CreateGoalDto) {
        return this.goalService.create(user.userId, dto);
    }

    @Get()
    findAll(@CurrentUser() user) {
        return this.goalService.findAll(user.userId);
    }

    @Get(':id')
    findOne(@CurrentUser() user, @Param('id') id: string) {
        return this.goalService.findOne(id, user.userId);
    }

    @Patch(':id')
    update(@CurrentUser() user, @Param('id') id: string, @Body() dto: UpdateGoalDto) {
        return this.goalService.update(id, user.userId, dto);
    }

    @Delete(':id')
    remove(@CurrentUser() user, @Param('id') id: string) {
        return this.goalService.remove(id, user.userId);
    }
}
