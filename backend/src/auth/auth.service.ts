import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { RateLimitMiddleware } from '../common/middleware/rate-limit.middleware';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(forwardRef(() => RateLimitMiddleware))
    private rateLimitMiddleware: RateLimitMiddleware,
  ) {}

  /**
   * Register a new user with role-specific profile creation
   * Requirements: 1.1-1.8, 2.1
   */
  async register(dto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Validate password length (minimum 8 characters)
    if (dto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user with hashed password
    const user = await this.prisma.users.create({
      data: {
        id: this.generateId(),
        email: dto.email,
        full_name: dto.full_name,
        password_hash: hashedPassword,
        role: dto.role,
        updated_at: new Date(),
      },
    });

    // Create role-specific profile
    if (dto.role === UserRole.CANDIDATE) {
      await this.prisma.candidates.create({
        data: {
          id: this.generateId(),
          user_id: user.id,
          updated_at: new Date(),
        },
      });
    } else if (dto.role === UserRole.RECRUITER) {
      await this.prisma.recruiters.create({
        data: {
          id: this.generateId(),
          user_id: user.id,
          updated_at: new Date(),
        },
      });
    } else if (dto.role === UserRole.ADMIN) {
      await this.prisma.admins.create({
        data: {
          id: this.generateId(),
          user_id: user.id,
          updated_at: new Date(),
        },
      });
    }

    // Return user without password
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };
  }

  /**
   * Login user and generate JWT tokens
   * Requirements: 2.1-2.7, 30.1-30.4
   */
  async login(dto: LoginDto) {
    // Check if account is locked due to rate limiting
    if (this.rateLimitMiddleware.isLocked(dto.email)) {
      throw new HttpException(
        'Account temporarily locked. Try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Verify email exists
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Record failed attempt for rate limiting
      this.rateLimitMiddleware.recordFailedAttempt(dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare password with hash
    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);

    if (!isPasswordValid) {
      // Record failed attempt for rate limiting
      this.rateLimitMiddleware.recordFailedAttempt(dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    this.rateLimitMiddleware.resetFailedAttempts(dto.email);

    // Generate tokens
    const accessToken = await this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);

    // Update last_login timestamp
    await this.prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   * Requirements: 3.1-3.4
   */
  async refresh(dto: RefreshTokenDto) {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(dto.refresh_token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Get user to verify still exists
      const user = await this.prisma.users.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new access token
      const accessToken = await this.generateAccessToken(user.id, user.email, user.role);

      return {
        access_token: accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Generate access token with 15-minute expiration
   */
  private async generateAccessToken(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<string> {
    const payload = {
      sub: userId,
      email,
      role,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Generate refresh token with 7-day expiration
   */
  private async generateRefreshToken(userId: string): Promise<string> {
    const payload = {
      sub: userId,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Generate a unique ID (using simple UUID-like generation)
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
