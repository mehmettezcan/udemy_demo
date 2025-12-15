import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Mini Demo API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'udemy_secret_key';
    process.env.JWT_EXPIRES_IN = '1d';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const login = async (email: string, password: string) => {
    return request(app.getHttpServer())
      .post(`/auth/login`)
      .send({ email, password });
  };

  const authGet = (url: string, token: string) => {
    return request(app.getHttpServer())
      .get(`${url}`)
      .set('Authorization', `Bearer ${token}`);
  };

  const authPost = (url: string, token: string, body: any) => {
    return request(app.getHttpServer())
      .post(`${url}`)
      .set('Authorization', `Bearer ${token}`)
      .send(body);
  };

  describe('Auth & Users', () => {
    it('POST /auth/login -> 201 and returns accessToken + user', async () => {
      const res = await login('user@test.com', '123456');

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');
    });

    it('POST /auth/login -> 401 for wrong password', async () => {
      const res = await login('user@test.com', 'wrong');
      expect(res.status).toBe(401);
    });

    it('GET /users/me -> 401 without token', async () => {
      const res = await request(app.getHttpServer()).get(`/users/me`);
      expect(res.status).toBe(401);
    });

    it('GET /users/me -> 200 with token and returns sanitized user', async () => {
      const loginRes = await login('user@test.com', '123456');
      const token = loginRes.body.accessToken as string;

      const res = await authGet('/users/me', token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', 'user@test.com');
      expect(res.body).toHaveProperty('role', 'user');
      expect(res.body).not.toHaveProperty('password');
    });

    it('GET /users/admin-only -> 403 for non-admin user', async () => {
      const loginRes = await login('user@test.com', '123456');
      const token = loginRes.body.accessToken as string;

      const res = await authGet('/users/admin-only', token);
      expect(res.status).toBe(403);
    });

    it('GET /users/admin-only -> 200 for admin user', async () => {
      const loginRes = await login('admin@test.com', '123456');
      const token = loginRes.body.accessToken as string;

      const res = await authGet('/users/admin-only', token);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ok: true,
        message: 'Only admin can see this',
      });
    });
  });

  describe('Courses + Payments + Live Lessons (End-to-End)', () => {
    let userToken: string;
    let instructorToken: string;
    let courseId: string;

    beforeAll(async () => {
      const userLogin = await login('user@test.com', '123456');
      userToken = userLogin.body.accessToken;

      const insLogin = await login('ins1@test.com', '123456');
      instructorToken = insLogin.body.accessToken;

      const coursesRes = await request(app.getHttpServer()).get(`/courses`);
      expect(coursesRes.status).toBe(200);

      const data = coursesRes.body.data ?? coursesRes.body;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      courseId = data[0].id;
      expect(typeof courseId).toBe('string');
    });

    it('GET /courses -> 200 and returns course list', async () => {
      const res = await request(app.getHttpServer()).get(`/courses`);
      expect(res.status).toBe(200);

      const data = res.body.data ?? res.body;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    // it('GET /courses/my -> 200 and initially returns empty list', async () => {
    //   const res = await authGet('/courses/my', userToken);
    //   expect(res.status).toBe(200);

    //   expect(Array.isArray(res.body)).toBe(true);
    // });

    it('POST /payments/pay (success) -> assigns course to user', async () => {
      const res = await authPost('/payments/pay', userToken, {
        courseId,
        simulateSuccess: true,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('purchase');
      expect(res.body.purchase).toHaveProperty('courseId', courseId);
    });

    it('GET /courses/my -> 200 and includes purchased course', async () => {
      const res = await authGet('/courses/my', userToken);
      expect(res.status).toBe(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((c: any) => c.id === courseId)).toBe(true);
    });

    it('POST /payments/pay (duplicate) -> 400', async () => {
      const res = await authPost('/payments/pay', userToken, {
        courseId,
        simulateSuccess: true,
      });

      expect(res.status).toBe(400);
    });

    it('POST /payments/pay (simulate failure) -> returns failed and does not assign', async () => {
      const coursesRes = await request(app.getHttpServer()).get(`/courses`);
      const data = coursesRes.body.data ?? coursesRes.body;

      const another = data.find((c: any) => c.id !== courseId);
      if (!another) return;

      const res = await authPost('/payments/pay', userToken, {
        courseId: another.id,
        simulateSuccess: false,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status', 'failed');

      const myRes = await authGet('/courses/my', userToken);
      expect(myRes.status).toBe(200);
      expect(myRes.body.some((c: any) => c.id === another.id)).toBe(false);
    });

    it('POST /live-lessons/request -> assigns an instructor', async () => {
      const res = await authPost('/live-lessons/request', userToken, {
        topic: 'NestJS JWT ve Guard yapısı',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('request');
      expect(res.body.request).toHaveProperty('status', 'assigned');
      expect(res.body.request).toHaveProperty('assignedInstructorId');
    });

    it('GET /live-lessons/my -> user sees their requests', async () => {
      const res = await authGet('/live-lessons/my', userToken);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /live-lessons/assigned -> instructor sees assigned requests', async () => {
      const res = await authGet('/live-lessons/assigned', instructorToken);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});
