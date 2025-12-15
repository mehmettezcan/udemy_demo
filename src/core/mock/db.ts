import { Role } from "../common/types/roles";


export type UserEntity = {
  id: string;
  email: string;
  password: string;
  role: Role;
  fullName: string;
};

export type CourseEntity = {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  price: number;
};

export type PurchaseEntity = {
  id: string;
  userId: string;
  courseId: string;
  paidAt: string;
  paymentRef: string;
};

export type LiveLessonRequestEntity = {
  id: string;
  userId: string;
  topic: string;
  createdAt: string;
  assignedInstructorId?: string;
  status: 'requested' | 'assigned' | 'completed' | 'cancelled';
};

export type PaymentEntity = {
  id: string;
  userId: string;
  courseId: string;
  status: 'pending' | 'succeeded' | 'failed';
  provider: 'sim' | 'stripe' | 'iyzico' | 'paytr';
  paymentRef: string;
  createdAt: string;
  updatedAt: string;
};

export const db = {
  users: <UserEntity[]>[
    { id: 'u1', email: 'user@test.com', password: '123456', role: 'user', fullName: 'Test User' },
    { id: 'i1', email: 'ins1@test.com', password: '123456', role: 'instructor', fullName: 'Instructor One' },
    { id: 'i2', email: 'ins2@test.com', password: '123456', role: 'instructor', fullName: 'Instructor Two' },
    { id: 'a1', email: 'admin@test.com', password: '123456', role: 'admin', fullName: 'Admin' },
  ],
  courses: <CourseEntity[]>[
    {
      id: 'c1',
      title: 'NestJS Fundamentals',
      description: 'Controllers, Providers, Modules, Guards',
      instructorId: 'i1',
      price: 299,
    },
    {
      id: 'c2',
      title: 'TypeScript for Backend',
      description: 'Types, Generics, DTO patterns',
      instructorId: 'i2',
      price: 199,
    },
  ],
  purchases: <PurchaseEntity[]>[],
  payments: <PaymentEntity[]>[],
  liveLessonRequests: <LiveLessonRequestEntity[]>[],
};
