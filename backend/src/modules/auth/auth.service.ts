import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db';
import { BadRequestError, UnauthorizedError } from '../../utils/apiResponse';

export class AuthService {
  private static readonly jwtSecret = process.env.JWT_SECRET || 'supersecretkeychangeinproduction';
  private static readonly jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';

  static async register(body: any) {
    const { name, email, password, role } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestError('A user with this email address already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: name || 'User',
        email,
        password: hashedPassword,
        role: role || 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = this.generateToken(newUser.id, newUser.email, newUser.role as 'USER' | 'ADMIN');

    return { user: newUser, token };
  }

  static async login(body: any) {
    const { email, password } = body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role as 'USER' | 'ADMIN');

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'USER' | 'ADMIN',
        createdAt: user.createdAt,
      },
      token,
    };
  }

  private static generateToken(id: string, email: string, role: 'USER' | 'ADMIN'): string {
    return jwt.sign(
      { id, email, role },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );
  }
}
