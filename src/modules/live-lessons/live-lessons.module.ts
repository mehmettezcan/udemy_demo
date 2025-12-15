import { Module } from '@nestjs/common';
import { LiveLessonsController } from './live-lessons.controller';
import { LiveLessonsService } from './live-lessons.service';

@Module({
  controllers: [LiveLessonsController],
  providers: [LiveLessonsService],
})
export class LiveLessonsModule {}
