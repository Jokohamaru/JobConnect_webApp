import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    users: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserProfile', () => {
    it('should return user profile with role-specific data for Candidate', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'candidate@test.com',
        full_name: 'Test Candidate',
        password_hash: 'hashed',
        role: 'CANDIDATE',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date(),
        candidates: {
          id: 'candidate-1',
          user_id: 'user-1',
          phone_number: '123-456-7890',
          bio: 'Test bio',
          location: 'Test City',
          created_at: new Date(),
          updated_at: new Date(),
          candidate_skills: [
            {
              id: 'cs-1',
              candidate_id: 'candidate-1',
              skill_id: 'skill-1',
              skills: { id: 'skill-1', name: 'JavaScript', created_at: new Date() },
            },
          ],
          cvs: [
            {
              id: 'cv-1',
              candidate_id: 'candidate-1',
              file_name: 'resume.pdf',
              file_path: '/uploads/resume.pdf',
              is_default: true,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          applications: [],
        },
        recruiters: null,
        admins: null,
      };

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserProfile('user-1');

      expect(result).toBeDefined();
      expect(result.password_hash).toBeUndefined();
      expect(result.email).toBe('candidate@test.com');
      expect(result.candidates).toBeDefined();
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: {
          candidates: {
            include: {
              candidate_skills: {
                include: {
                  skills: true,
                },
              },
              cvs: true,
              applications: {
                include: {
                  jobs: true,
                },
              },
            },
          },
          recruiters: {
            include: {
              companies: {
                include: {
                  jobs: true,
                },
              },
            },
          },
          admins: true,
        },
      });
    });

    it('should return user profile with role-specific data for Recruiter', async () => {
      const mockUser = {
        id: 'user-2',
        email: 'recruiter@test.com',
        full_name: 'Test Recruiter',
        password_hash: 'hashed',
        role: 'RECRUITER',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date(),
        candidates: null,
        recruiters: {
          id: 'recruiter-1',
          user_id: 'user-2',
          created_at: new Date(),
          updated_at: new Date(),
          companies: {
            id: 'company-1',
            name: 'Test Company',
            description: 'Test Description',
            website: 'https://test.com',
            industry: 'Tech',
            company_type: 'STARTUP',
            location: 'Test City',
            recruiter_id: 'recruiter-1',
            created_at: new Date(),
            updated_at: new Date(),
            jobs: [],
          },
        },
        admins: null,
      };

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserProfile('user-2');

      expect(result).toBeDefined();
      expect(result.password_hash).toBeUndefined();
      expect(result.recruiters).toBeDefined();
      expect(result.recruiters.companies).toBeDefined();
    });

    it('should return user profile with role-specific data for Admin', async () => {
      const mockUser = {
        id: 'user-3',
        email: 'admin@test.com',
        full_name: 'Test Admin',
        password_hash: 'hashed',
        role: 'ADMIN',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date(),
        candidates: null,
        recruiters: null,
        admins: {
          id: 'admin-1',
          user_id: 'user-3',
          created_at: new Date(),
          updated_at: new Date(),
        },
      };

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserProfile('user-3');

      expect(result).toBeDefined();
      expect(result.password_hash).toBeUndefined();
      expect(result.admins).toBeDefined();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(service.getUserProfile('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getUserProfile('non-existent')).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('updateUserProfile', () => {
    it('should update user email successfully', async () => {
      const updateDto = { email: 'newemail@test.com' };
      const mockUpdatedUser = {
        id: 'user-1',
        email: 'newemail@test.com',
        full_name: 'Test User',
        password_hash: 'hashed',
        role: 'CANDIDATE',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date(),
      };

      mockPrismaService.users.findUnique.mockResolvedValue(null);
      mockPrismaService.users.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.updateUserProfile('user-1', updateDto);

      expect(result).toBeDefined();
      expect(result.password_hash).toBeUndefined();
      expect(result.email).toBe('newemail@test.com');
      expect(prismaService.users.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          email: 'newemail@test.com',
          updated_at: expect.any(Date),
        }),
      });
    });

    it('should update user full_name successfully', async () => {
      const updateDto = { full_name: 'New Name' };
      const mockUpdatedUser = {
        id: 'user-1',
        email: 'test@test.com',
        full_name: 'New Name',
        password_hash: 'hashed',
        role: 'CANDIDATE',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date(),
      };

      mockPrismaService.users.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.updateUserProfile('user-1', updateDto);

      expect(result.full_name).toBe('New Name');
      expect(result.password_hash).toBeUndefined();
    });

    it('should update user password with hashing', async () => {
      const updateDto = { password: 'newpassword123' };
      const hashedPassword = 'hashed-new-password';
      const mockUpdatedUser = {
        id: 'user-1',
        email: 'test@test.com',
        full_name: 'Test User',
        password_hash: hashedPassword,
        role: 'CANDIDATE',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.users.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.updateUserProfile('user-1', updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(result.password_hash).toBeUndefined();
      expect(prismaService.users.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          password_hash: hashedPassword,
          updated_at: expect.any(Date),
        }),
      });
    });

    it('should throw ConflictException when email is already taken', async () => {
      const updateDto = { email: 'existing@test.com' };
      const existingUser = {
        id: 'other-user',
        email: 'existing@test.com',
        full_name: 'Other User',
        password_hash: 'hashed',
        role: 'CANDIDATE',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date(),
      };

      mockPrismaService.users.findUnique.mockResolvedValue(existingUser);

      await expect(
        service.updateUserProfile('user-1', updateDto),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.updateUserProfile('user-1', updateDto),
      ).rejects.toThrow('Email already registered');
    });

    it('should allow updating to same email (no conflict)', async () => {
      const updateDto = { email: 'same@test.com' };
      const sameUser = {
        id: 'user-1',
        email: 'same@test.com',
        full_name: 'Test User',
        password_hash: 'hashed',
        role: 'CANDIDATE',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date(),
      };

      mockPrismaService.users.findUnique.mockResolvedValue(sameUser);
      mockPrismaService.users.update.mockResolvedValue(sameUser);

      const result = await service.updateUserProfile('user-1', updateDto);

      expect(result).toBeDefined();
      expect(result.email).toBe('same@test.com');
    });

    it('should update multiple fields at once', async () => {
      const updateDto = {
        email: 'newemail@test.com',
        full_name: 'New Name',
        password: 'newpassword123',
      };
      const hashedPassword = 'hashed-new-password';
      const mockUpdatedUser = {
        id: 'user-1',
        email: 'newemail@test.com',
        full_name: 'New Name',
        password_hash: hashedPassword,
        role: 'CANDIDATE',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.users.findUnique.mockResolvedValue(null);
      mockPrismaService.users.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.updateUserProfile('user-1', updateDto);

      expect(result.email).toBe('newemail@test.com');
      expect(result.full_name).toBe('New Name');
      expect(result.password_hash).toBeUndefined();
    });
  });

  describe('getUserById', () => {
    it('should return user by ID with role-specific data', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        full_name: 'Test User',
        password_hash: 'hashed',
        role: 'CANDIDATE',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date(),
        candidates: {
          id: 'candidate-1',
          user_id: 'user-1',
          phone_number: null,
          bio: null,
          location: null,
          created_at: new Date(),
          updated_at: new Date(),
          candidate_skills: [],
          cvs: [],
        },
        recruiters: null,
        admins: null,
      };

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserById('user-1');

      expect(result).toBeDefined();
      expect(result.password_hash).toBeUndefined();
      expect(result.email).toBe('test@test.com');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(service.getUserById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users without passwords', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@test.com',
          full_name: 'User 1',
          password_hash: 'hashed1',
          role: 'CANDIDATE',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          last_login: new Date(),
          candidates: {},
          recruiters: null,
          admins: null,
        },
        {
          id: 'user-2',
          email: 'user2@test.com',
          full_name: 'User 2',
          password_hash: 'hashed2',
          role: 'RECRUITER',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          last_login: new Date(),
          candidates: null,
          recruiters: {},
          admins: null,
        },
      ];

      mockPrismaService.users.findMany.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers();

      expect(result).toHaveLength(2);
      expect(result[0].password_hash).toBeUndefined();
      expect(result[1].password_hash).toBeUndefined();
      expect(result[0].email).toBe('user1@test.com');
      expect(result[1].email).toBe('user2@test.com');
    });

    it('should return empty array when no users exist', async () => {
      mockPrismaService.users.findMany.mockResolvedValue([]);

      const result = await service.getAllUsers();

      expect(result).toEqual([]);
    });
  });
});
