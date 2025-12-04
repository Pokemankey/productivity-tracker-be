import { Body, Controller, Get, Param, Post, UseGuards, Patch, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TaskService } from './task.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('task')
@UseGuards(AuthGuard('jwt'))
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Post()
    Create(@CurrentUser() user, @Body() dto: CreateTaskDto) {
        return this.taskService.create(user.userId, dto)
    }

    @Get()
    findAll(@CurrentUser() user) {
        return this.taskService.findAll(user.userId)
    }

    @Get(':id')
    findOne(@CurrentUser() user, @Param('id') id: string) {
        return this.taskService.findOne(id, user.userId)
    }

    @Patch(':id')
    update(@CurrentUser() user, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
        return this.taskService.update(id, user.userId, dto);
    }

    @Delete(':id')
    remove(@CurrentUser() user, @Param('id') id: string) {
        return this.taskService.remove(id, user.userId);
    }
}
