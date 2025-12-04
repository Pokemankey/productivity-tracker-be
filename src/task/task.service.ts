import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
    constructor(private prisma: PrismaService) {}

    async create(userId: string, dto: CreateTaskDto) {
        await this.verifyGoalOwnership(dto.goalId, userId);

        const task = await this.prisma.task.create({
            data: {
                userId,
                ...dto,
            }
        })

        return task
    }

    async findAll(userId: string) {
        return await this.prisma.task.findMany({
            where: {
                userId
            }
        })
    }

    async findOne(id: string, userId: string) {
        return await this.verifyOwnership(id, userId)
    }

    async update(id: string, userId: string, dto: UpdateTaskDto) {
        await this.verifyOwnership(id, userId)

        if (dto.goalId) {
            await this.verifyGoalOwnership(dto.goalId, userId);
        }

        return await this.prisma.task.update({
            where: {
                id
            },
            data: dto,
        })
    }

    async remove(id: string, userId: string) {
        await this.verifyOwnership(id, userId);

        return this.prisma.task.delete({
            where: { id },
        });
    }

    private async verifyOwnership(id: string, userId: string) {
        const task = await this.prisma.task.findFirst({
            where: { id, userId },
        });

        if (!task) throw new NotFoundException('Task not found');

        return task;
    }

    private async verifyGoalOwnership(goalId: string, userId: string) {
        const goal = await this.prisma.goal.findFirst({
            where: { id: goalId, userId },
        });

        if (!goal) {
            throw new NotFoundException('Goal not found or does not belong to the user');
        }

        return goal;
    }
}