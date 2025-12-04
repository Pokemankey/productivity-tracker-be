import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { EndSessionDto } from './dto/end-session.dto';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class SessionService {
    constructor(private prisma: PrismaService) {}

    async create(userId: string, dto: CreateSessionDto) {
        await this.verifyTaskOwnership(dto.taskId, userId);

        return this.prisma.session.create({
            data: {
                userId,
                taskId: dto.taskId,
                plannedDurationMinutes: dto.plannedDurationMinutes,
                status: SessionStatus.PLANNED,
            },
        });
    }

    async start(id: string, userId: string) {
        const session = await this.verifySessionOwnership(id, userId);
        if (session.status !== SessionStatus.PLANNED)
        throw new BadRequestException('Session cannot be started');

        return this.prisma.session.update({
            where: { id },
            data: {
                startedAt: new Date(),
                status: SessionStatus.IN_PROGRESS,
            },
        });
    }

    async end(id: string, userId: string, dto: EndSessionDto) {
        const session = await this.verifySessionOwnership(id, userId);

        if (session.status !== SessionStatus.IN_PROGRESS) {
            throw new BadRequestException('Session is not active');
        }

        if (!session.startedAt) {
            throw new BadRequestException('Session has no start time');
        }

        const endedAt = new Date();
        const startedAt = session.startedAt;

        const minutes = Math.floor(
            (endedAt.getTime() - startedAt.getTime()) / 60000,
        );

        const newActualMinutes = session.actualProductiveMinutes + minutes;

        const updatedSession = await this.prisma.session.update({
            where: { id },
            data: {
                endedAt,
                actualProductiveMinutes: newActualMinutes,
                status: SessionStatus.COMPLETED,
                notes: dto.notes ?? session.notes,
            },
        });

        await this.prisma.task.update({
            where: { id: session.taskId },
            data: {
                actualMinutes: { increment: minutes },
            },
        });

        return updatedSession;
    }

    async findAll(userId: string) {
        return this.prisma.session.findMany({
            where: { userId },
        });
    }

    async findOne(id: string, userId: string) {
        return this.verifySessionOwnership(id, userId);
    }

    private async verifySessionOwnership(id: string, userId: string) {
        const session = await this.prisma.session.findFirst({
            where: { id, userId },
        });
        if (!session) throw new NotFoundException('Session not found');

        return session;
    }

    private async verifyTaskOwnership(id: string, userId: string) {
        const task = await this.prisma.task.findFirst({
            where: { id, userId },
        });
        if (!task) throw new NotFoundException('Task not found for this user');

        return task;
    }
}
