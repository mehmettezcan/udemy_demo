import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateLiveLessonDto {
  @ApiProperty({ example: 'NestJS Guards ve Auth' })
  @IsString()
  @MinLength(3)
  topic: string;
}
