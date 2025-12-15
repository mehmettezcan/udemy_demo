import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PayDto {
  @ApiProperty({ example: 'c1', description: 'Course ID to purchase' })
  @IsString()
  courseId: string;

  @ApiPropertyOptional({
    description: 'Simulate payment result. If omitted => true',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  simulateSuccess?: boolean;

  @ApiPropertyOptional({
    description: 'Optional external reference (Stripe/iyzico/paytr sim)',
    example: 'pi_test_123',
  })
  @IsOptional()
  @IsString()
  paymentRef?: string;
}
