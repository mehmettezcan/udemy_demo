import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { db } from '../../core/mock/db';

type Provider = 'sim' | 'stripe' | 'iyzico' | 'paytr';
type WebhookEvent = 'payment.success' | 'payment.failed';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    createIntent(userId: string, courseId: string, provider: Provider = 'sim') {
        const course = db.courses.find((c) => c.id === courseId);
        if (!course) throw new NotFoundException('Kurs bulunamadı');

        const alreadyPurchased = db.purchases.some(
            (p) => p.userId === userId && p.courseId === courseId,
        );
        if (alreadyPurchased) throw new BadRequestException('Kurs zaten satın alınmış');

        const existingPending = db.payments.find(
            (p) =>
                p.userId === userId &&
                p.courseId === courseId &&
                p.status === 'pending',
        );
        if (existingPending) {
            return {
                status: 'pending',
                message: 'Mevcut bekleyen ödeme intent bulundu',
                payment: existingPending,
            };
        }

        const now = new Date().toISOString();
        const paymentId = randomUUID();

        const payment = {
            id: paymentId,
            userId,
            courseId,
            status: 'pending' as const,
            provider,
            paymentRef: `${provider}_pi_${randomUUID()}`,
            createdAt: now,
            updatedAt: now,
        };

        db.payments.push(payment);

        this.logger.log(`[INTENT] created paymentId=${payment.id} userId=${userId} courseId=${courseId}`);

        return {
            status: 'pending',
            message: 'Ödeme intent oluşturuldu. Sonuç webhook ile kesinleşecektir.',
            payment,
            redirectUrl: `https://example-pay/${payment.paymentRef}`,
        };
    }
    
    handleWebhook(paymentId: string, event: WebhookEvent) {
        const payment = db.payments.find((p) => p.id === paymentId);
        if (!payment) throw new NotFoundException('Ödeme kaydı bulunamadı');

        if (payment.status !== 'pending') {
            this.logger.warn(`[WEBHOOK] ignored (already processed). paymentId=${payment.id} status=${payment.status}`);
            return {
                status: payment.status,
                message: 'Webhook daha önce işlenmiş. İşlem tekrarlanmadı.',
                payment,
            };
        }

        const now = new Date().toISOString();

        if (event === 'payment.failed') {
            payment.status = 'failed';
            payment.updatedAt = now;

            this.logger.warn(`[WEBHOOK] failed. paymentId=${payment.id} userId=${payment.userId} courseId=${payment.courseId}`);

            return {
                status: 'failed',
                message: 'Ödeme başarısız (webhook). Eğitim atanmadı.',
                payment,
            };
        }

        payment.status = 'succeeded';
        payment.updatedAt = now;

        const alreadyPurchased = db.purchases.some(
            (p) => p.userId === payment.userId && p.courseId === payment.courseId,
        );

        if (!alreadyPurchased) {
            const purchase = {
                id: randomUUID(),
                userId: payment.userId,
                courseId: payment.courseId,
                paidAt: now,
                paymentRef: payment.paymentRef,
            };
            db.purchases.push(purchase);

            this.logger.log(`[ASSIGN] purchase created. purchases=${db.purchases.length} userId=${purchase.userId} courseId=${purchase.courseId}`);

            return {
                status: 'success',
                message: 'Ödeme başarılı (webhook). Eğitim kullanıcıya atandı.',
                payment,
                purchase,
            };
        }

        this.logger.warn(`[ASSIGN] skipped (already purchased). paymentId=${payment.id}`);

        return {
            status: 'success',
            message: 'Ödeme başarılı (webhook). Eğitim zaten kullanıcıya atanmış.',
            payment,
        };
    }

    pay(userId: string, courseId: string, simulateSuccess = true, paymentRef?: string) {
        const intent = this.createIntent(userId, courseId, 'sim');

        const paymentId = intent.payment.id;
        if (!simulateSuccess) {
            return this.handleWebhook(paymentId, 'payment.failed');
        }
        const res = this.handleWebhook(paymentId, 'payment.success');

        if (paymentRef) {
            const p = db.payments.find(x => x.id === paymentId);
            if (p) p.paymentRef = paymentRef;
        }

        return res;
    }
}
