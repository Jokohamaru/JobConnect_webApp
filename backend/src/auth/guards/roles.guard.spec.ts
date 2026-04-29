import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockContext: ExecutionContext;

    beforeEach(() => {
      mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn(),
        }),
        getHandler: jest.fn(),
      } as any;
    });

    it('should return true when no roles are required', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(undefined);
      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should return true when user has required role', () => {
      const requiredRoles = ['CANDIDATE'];
      jest.spyOn(reflector, 'get').mockReturnValue(requiredRoles);

      const mockRequest = {
        user: { userId: '123', email: 'test@example.com', role: 'CANDIDATE' },
      };
      (mockContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(
        mockRequest,
      );

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user does not have required role', () => {
      const requiredRoles = ['RECRUITER'];
      jest.spyOn(reflector, 'get').mockReturnValue(requiredRoles);

      const mockRequest = {
        user: { userId: '123', email: 'test@example.com', role: 'CANDIDATE' },
      };
      (mockContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(
        mockRequest,
      );

      expect(() => guard.canActivate(mockContext)).toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when user is not present', () => {
      const requiredRoles = ['CANDIDATE'];
      jest.spyOn(reflector, 'get').mockReturnValue(requiredRoles);

      const mockRequest = {};
      (mockContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(
        mockRequest,
      );

      expect(() => guard.canActivate(mockContext)).toThrow(
        ForbiddenException,
      );
    });

    it('should allow multiple roles', () => {
      const requiredRoles = ['CANDIDATE', 'RECRUITER'];
      jest.spyOn(reflector, 'get').mockReturnValue(requiredRoles);

      const mockRequest = {
        user: { userId: '123', email: 'test@example.com', role: 'RECRUITER' },
      };
      (mockContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(
        mockRequest,
      );

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException with correct message', () => {
      const requiredRoles = ['ADMIN'];
      jest.spyOn(reflector, 'get').mockReturnValue(requiredRoles);

      const mockRequest = {
        user: { userId: '123', email: 'test@example.com', role: 'CANDIDATE' },
      };
      (mockContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(
        mockRequest,
      );

      expect(() => guard.canActivate(mockContext)).toThrow(
        'Insufficient permissions',
      );
    });
  });
});
