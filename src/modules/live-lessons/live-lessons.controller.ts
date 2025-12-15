import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LiveLessonsService } from './live-lessons.service';
import { CreateLiveLessonDto } from './dtos/create-live-lesson.dto';
import { AtGuard } from 'src/core/guards/at.guard';

@ApiTags('live-lessons')
@Controller('live-lessons')
export class LiveLessonsController {
  constructor(private readonly liveLessonsService: LiveLessonsService) {}

  @ApiBearerAuth()
  @UseGuards(AtGuard)
  @Post('request')
  create(@Req() req: any, @Body() dto: CreateLiveLessonDto) {
    return this.liveLessonsService.createRequest(req.user.id, dto.topic);
  }

  @ApiBearerAuth()
  @UseGuards(AtGuard)
  @Get('my')
  myRequests(@Req() req: any) {
    return this.liveLessonsService.getMyRequests(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AtGuard)
  @Get('assigned')
  assignedToMe(@Req() req: any) {
    return this.liveLessonsService.getInstructorRequests(req.user.id);
  }
}
