import { sql } from '../config/database';
import { hashPassword, verifyPassword } from '../utils/password';
import { createUser, getUserByEmail, getUserById } from '../gen/db/queries_sql';
import type { CreateUserRequest, LoginUserRequest, UserResponse } from '../types/api';

export class AuthService {
  async registerUser(userData: CreateUserRequest): Promise<UserResponse> {
    const hashedPassword = await hashPassword(userData.password);
    
    const user = await createUser(sql, {
      email: userData.email,
      password: hashedPassword,
    });

    if (!user) {
      throw new Error('Failed to create user');
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  async loginUser(credentials: LoginUserRequest): Promise<UserResponse> {
    const user = await getUserByEmail(sql, {
      email: credentials.email,
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await verifyPassword(credentials.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  async getUserById(userId: string): Promise<UserResponse | null> {
    const user = await getUserById(sql, { id: userId });
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
    };
  }
}