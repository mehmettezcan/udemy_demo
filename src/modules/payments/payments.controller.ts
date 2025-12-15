import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateIntentDto } from './dtos/create-intent.dto';
import { WebhookDto } from './dtos/webhook.dto';
import { PayDto } from './dtos/pay.dto';
import { AtGuard } from 'src/core/guards/at.guard';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiBearerAuth()
  @UseGuards(AtGuard)
  @Post('intent')
  createIntent(@Req() req: any, @Body() dto: CreateIntentDto) {
    return this.paymentsService.createIntent(
      req.user.id,
      dto.courseId,
      dto.provider ?? 'sim',
    );
  }

  @Post('webhook')
  webhook(@Body() dto: WebhookDto) {
    return this.paymentsService.handleWebhook(dto.paymentId, dto.event);
  }

  @ApiBearerAuth()
  @UseGuards(AtGuard)
  @Post('pay')
  pay(@Req() req: any, @Body() dto: PayDto) {
    return this.paymentsService.pay(
      req.user.id,
      dto.courseId,
      dto.simulateSuccess ?? true,
      dto.paymentRef,
    );
  }
}
