import { TaskPriority } from "@prisma/client";
import { IsEnum, IsOptional, IsString, IsDateString, IsInt, Min } from "class-validator";

export class CreateTaskDto {
    @IsString()
    title: string;

    @IsString()
    goalId: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    allocatedMinutes?: number;

    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @IsOptional()
    @IsDateString()
    dueDate?: string;
}