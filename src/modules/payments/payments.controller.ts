import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { AtGuard } from 'src/core/guards/at.guard';
import { PayDto } from './dtos/pay.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

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
