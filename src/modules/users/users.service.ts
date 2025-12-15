import { Injectable, NotFoundException } from '@nestjs/common';
import { db, UserEntity } from 'src/core/mock/db';

@Injectable()
export class UsersService {
  findByEmail(email: string): UserEntity | undefined {
    return db.users.find((u) => u.email === email);
  }

  findById(id: string): any {
    const user = db.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User not found');

    const { password, ...safe } = user;

    return safe;
  }

  sanitize(user: UserEntity) {
    const { password, ...safe } = user;
    return safe;
  }
}
