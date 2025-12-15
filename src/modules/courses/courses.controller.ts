import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CoursesService } from './courses.service';
import { ListCoursesQueryDto } from './dtos/list-courses.query.dto';
import { AtGuard } from 'src/core/guards/at.guard';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  @Get()
  list(@Query() query: ListCoursesQueryDto) {
    return this.coursesService.list(query);
  }

  @ApiBearerAuth()
  @UseGuards(AtGuard)
  @Get('my')
  my(@Req() req: any) {
    return this.coursesService.myCourses(req.user.id);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.coursesService.getById(id);
  }
}
