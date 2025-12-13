import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async findAll(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      include: {
        tasks: {
          select: {
            status: true,
            actualMinutes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return goals.map((goal) => {
      const totalTasks = goal.tasks.length;
      const completedTasks = goal.tasks.filter(
        (task) => task.status === 'DONE',
      ).length;

      const totalMinutes = goal.tasks.reduce(
        (sum, task) => sum + task.actualMinutes,
        0,
      );

      const { tasks, ...goalFields } = goal;

      return {
        ...goalFields,
        totalTasks,
        completedTasks,
        totalMinutes,
      };
    });
  }

  async findOne(id: string, userId: string) {
    return this.verifyOwnership(id, userId);
  }

  async update(id: string, userId: string, dto: UpdateGoalDto) {
    await this.verifyOwnership(id, userId);

    return this.prisma.goal.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    await this.verifyOwnership(id, userId);

    return this.prisma.goal.delete({
      where: { id },
    });
  }

  private async verifyOwnership(id: string, userId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found.');
    }

    return goal;
  }
}
