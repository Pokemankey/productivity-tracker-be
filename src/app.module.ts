import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TaskModule } from './task/task.module';
import { GoalModule } from './goal/goal.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule, 
    ConfigModule.forRoot({
      isGlobal: true,
    }), TaskModule, GoalModule, SessionModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
