import { IsString, IsInt, Min } from "class-validator";

export class CreateSessionDto {
    @IsString()
    taskId: string;

    @IsInt()
    @Min(1)
    plannedDurationMinutes: number;
}
