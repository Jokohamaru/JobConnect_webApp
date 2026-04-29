import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    getUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    getUserById: jest.fn(),
    getAllUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyProfile', () => {
    it('should return authenticated user profile', async () => {
      const mockUser = {
        userId: 'user-1',
        email: 'test@test.com',
        role: 'CANDIDATE',
      };
      const mockProfile = {
        id: 'user-1',
        email: 'test@test.com',
        full_name: 'Test User',
        role: 'CANDIDATE',
        candidates: {
          id: 'candidate-1',
          user_id: 'user-1',
          candidate_skills: [],
          cvs: [],
          applications: [],
        },
      };

      mockUserService.getUserProfile.mockResolvedValue(mockProfile);

      const result = await controller.getMyProfile(mockUser);

      expect(result).toEqual(mockProfile);
      expect(userService.getUserProfile).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updateMyProfile', () => {
    it('should update authenticated user profile', async () => {
      const mockUser = {
        userId: 'user-1',
        email: 'test@test.com',
        role: 'CANDIDATE',
      };
      const updateDto: UpdateUserDto = {
        full_name: 'Updated Name',
      };
      const mockUpdatedProfile = {
        id: 'user-1',
        email: 'test@test.com',
        full_name: 'Updated Name',
        role: 'CANDIDATE',
      };

      mockUserService.updateUserProfile.mockResolvedValue(mockUpdatedProfile);

      const result = await controller.updateMyProfile(mockUser, updateDto);

      expect(result).toEqual(mockUpdatedProfile);
      expect(userService.updateUserProfile).toHaveBeenCalledWith(
        'user-1',
        updateDto,
      );
    });

    it('should update email', async () => {
      const mockUser = {
        userId: 'user-1',
        email: 'old@test.com',
        role: 'CANDIDATE',
      };
      const updateDto: UpdateUserDto = {
        email: 'new@test.com',
      };
      const mockUpdatedProfile = {
        id: 'user-1',
        email: 'new@test.com',
        full_name: 'Test User',
        role: 'CANDIDATE',
      };

      mockUserService.updateUserProfile.mockResolvedValue(mockUpdatedProfile);

      const result = await controller.updateMyProfile(mockUser, updateDto);

      expect(result.email).toBe('new@test.com');
      expect(userService.updateUserProfile).toHaveBeenCalledWith(
        'user-1',
        updateDto,
      );
    });

    it('should update password', async () => {
      const mockUser = {
        userId: 'user-1',
        email: 'test@test.com',
        role: 'CANDIDATE',
      };
      const updateDto: UpdateUserDto = {
        password: 'newpassword123',
      };
      const mockUpdatedProfile = {
        id: 'user-1',
        email: 'test@test.com',
        full_name: 'Test User',
        role: 'CANDIDATE',
      };

      mockUserService.updateUserProfile.mockResolvedValue(mockUpdatedProfile);

      const result = await controller.updateMyProfile(mockUser, updateDto);

      expect(result).toEqual(mockUpdatedProfile);
      expect(userService.updateUserProfile).toHaveBeenCalledWith(
        'user-1',
        updateDto,
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by ID (admin only)', async () => {
      const mockUser = {
        id: 'user-2',
        email: 'user2@test.com',
        full_name: 'User 2',
        role: 'RECRUITER',
        recruiters: {
          id: 'recruiter-1',
          user_id: 'user-2',
        },
      };

      mockUserService.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getUserById('user-2');

      expect(result).toEqual(mockUser);
      expect(userService.getUserById).toHaveBeenCalledWith('user-2');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users (admin only)', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@test.com',
          full_name: 'User 1',
          role: 'CANDIDATE',
        },
        {
          id: 'user-2',
          email: 'user2@test.com',
          full_name: 'User 2',
          role: 'RECRUITER',
        },
      ];

      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
      expect(userService.getAllUsers).toHaveBeenCalled();
    });

    it('should return empty array when no users exist', async () => {
      mockUserService.getAllUsers.mockResolvedValue([]);

      const result = await controller.getAllUsers();

      expect(result).toEqual([]);
      expect(userService.getAllUsers).toHaveBeenCalled();
    });
  });
});
