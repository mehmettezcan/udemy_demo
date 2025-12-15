import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { db } from '../../core/mock/db';

@Injectable()
export class LiveLessonsService {
  private readonly logger = new Logger(LiveLessonsService.name);

  createRequest(userId: string, topic: string) {
    const instructor = db.users.find((u) => u.role === 'instructor');
    if (!instructor) {
      throw new NotFoundException('Uygun eğitmen bulunamadı');
    }

    const request = {
      id: randomUUID(),
      userId,
      topic,
      createdAt: new Date().toISOString(),
      assignedInstructorId: instructor.id,
      status: 'assigned' as const,
    };

    db.liveLessonRequests.push(request);

    this.logger.log(
      `Instructor notified: instructorId=${instructor.id}, topic="${topic}"`,
    );

    return {
      message: 'Canlı ders talebi oluşturuldu ve eğitmen atandı',
      request,
      instructor: {
        id: instructor.id,
        fullName: instructor.fullName,
      },
    };
  }

  getMyRequests(userId: string) {
    return db.liveLessonRequests.filter((r) => r.userId === userId);
  }

  getInstructorRequests(instructorId: string) {
    return db.liveLessonRequests.filter(
      (r) => r.assignedInstructorId === instructorId,
    );
  }
}
