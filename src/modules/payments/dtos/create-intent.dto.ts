import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateIntentDto {
  @ApiProperty({ example: 'c1' })
  @IsString()
  courseId: string;

  @ApiPropertyOptional({ example: 'sim', enum: ['sim', 'stripe', 'iyzico', 'paytr'] })
  @IsOptional()
  @IsIn(['sim', 'stripe', 'iyzico', 'paytr'])
  provider?: 'sim' | 'stripe' | 'iyzico' | 'paytr';
}
