import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { db } from '../../core/mock/db';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    pay(userId: string, courseId: string, simulateSuccess = true, paymentRef?: string) {
        const course = db.courses.find((c) => c.id === courseId);
        if (!course) throw new NotFoundException('Kurs bulunamadı');

        const already = db.purchases.some(
            (p) => p.userId === userId && p.courseId === courseId,
        );
        if (already) throw new BadRequestException('Kurs zaten satın alınmış');

        if (!simulateSuccess) {
            this.logger.warn(`Payment failed (simulated). userId=${userId}, courseId=${courseId}`);
            return {
                status: 'failed',
                message: 'Ödeme işlemi başarısız oldu (simüle edilmiş).',
            };
        }

        const purchase = {
            id: randomUUID(),
            userId,
            courseId,
            paidAt: new Date().toISOString(),
            paymentRef: paymentRef || `sim_${randomUUID()}`,
        };
        this.logger.log(`Purchases before push: ${db.purchases.length}`);

        db.purchases.push(purchase);

        this.logger.log(`Purchases after push: ${db.purchases.length}`);
        this.logger.log(`Last purchase userId=${purchase.userId} courseId=${purchase.courseId}`);

        return {
            status: 'success',
            purchase,
        };
    }
}
