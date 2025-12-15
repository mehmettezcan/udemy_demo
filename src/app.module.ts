import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { LiveLessonsModule } from './modules/live-lessons/live-lessons.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, UsersModule, CoursesModule, PaymentsModule, LiveLessonsModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
