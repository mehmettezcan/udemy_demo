import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { db } from '../../core/mock/db';
import { UsersService } from '../users/users.service';
import { ListCoursesQueryDto } from './dtos/list-courses.query.dto';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);
  constructor(private readonly usersService: UsersService) { }

  list(query: ListCoursesQueryDto) {
    const q = query.q?.toLowerCase().trim();
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    let items = db.courses;

    if (q) {
      items = items.filter((c) => c.title.toLowerCase().includes(q));
    }

    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    if (paged.length === 0) {
      throw new NotFoundException('Kurs bulunamadı.');
    }

    const data = paged.map((c) => {
      const instructor = this.usersService.findById(c.instructorId);
      return {
        ...c,
        instructor: this.usersService.sanitize(instructor),
      };
    });

    return {
      data,
      meta: { total, page, limit },
    };
  }

  getById(id: string) {
    const course = db.courses.find((c) => c.id === id);
    if (!course) throw new NotFoundException('Kurs bulunamadı.');

    const instructor = this.usersService.findById(course.instructorId);

    return {
      ...course,
      instructor: this.usersService.sanitize(instructor),
    };
  }

  myCourses(userId: string) {
    const myCourseIds = db.purchases
      .filter((p) => p.userId === userId)
      .map((p) => p.courseId);
    this.logger.log(` ${db.purchases.join(', ')}`);
    this.logger.log(`Kullanıcı ID: ${userId} için satın alınan kurs ID'leri: ${myCourseIds.join(', ')}`);
    
    const courses = db.courses.filter((c) => myCourseIds.includes(c.id));

    if (courses.length === 0) {
      throw new NotFoundException('Geçmiş satın alınan kurs bulunamadı.');
    }

    return courses.map((c) => {
      const instructor = this.usersService.findById(c.instructorId);
      return {
        ...c,
        instructor: this.usersService.sanitize(instructor),
      };
    });
  }
}
