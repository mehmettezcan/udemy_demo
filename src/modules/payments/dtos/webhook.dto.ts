import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class WebhookDto {
  @ApiProperty({ example: 'paymentId-from-intent' })
  @IsString()
  paymentId: string;

  @ApiProperty({ example: 'payment.success', enum: ['payment.success', 'payment.failed'] })
  @IsString()
  @IsIn(['payment.success', 'payment.failed'])
  event: 'payment.success' | 'payment.failed';
}
