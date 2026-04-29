import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';
import { CompanyService } from './company.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

/**
 * Property-Based Tests for Company Management
 * 
 * **Validates: Requirements 7.2, 7.3, 7.6**
 * 
 * These tests verify company management properties using fast-check with minimum 100 iterations.
 */
describe('CompanyService - Property-Based Tests', () => {
  let companyService: CompanyService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: PrismaService,
          useValue: {
            recruiters: {
              findUnique: jest.fn(),
            },
            companies: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    companyService = module.get<CompanyService>(CompanyService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 15: Company Creation Links to Recruiter
   * 
   * For any Company created by a Recruiter, the Company record SHALL be linked
   * to that Recruiter's profile.
   * 
   * **Validates: Requirements 7.2**
   */
  describe('Property 15: Company creation links to recruiter', () => {
    it('should link created company to the recruiter profile (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 2, maxLength: 100 }),
          fc.option(fc.string({ minLength: 10, maxLength: 500 }), { nil: undefined }),
          fc.option(fc.webUrl(), { nil: undefined }),
          fc.string({ minLength: 2, maxLength: 50 }),
          fc.constantFrom('STARTUP', 'SMALL_BUSINESS', 'MEDIUM_ENTERPRISE', 'LARGE_ENTERPRISE'),
          fc.string({ minLength: 2, maxLength: 100 }),
          async (userId, name, description, website, industry, companyType, location) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const recruiterId = 'recruiter-' + Math.random();
            const companyId = 'company-' + Math.random();

            // Mock recruiter without existing company
            const mockRecruiter = {
              id: recruiterId,
              user_id: userId,
              company_id: null,
              created_at: new Date(),
              updated_at: new Date(),
              companies: null,
            };

            // Mock created company
            const mockCreatedCompany = {
              id: companyId,
              name,
              description,
              website,
              industry,
              company_type: companyType,
              location,
              recruiter_id: recruiterId,
              created_at: new Date(),
              updated_at: new Date(),
              recruiters: {
                id: recruiterId,
                user_id: userId,
                company_id: null,
                created_at: new Date(),
                updated_at: new Date(),
                users: {
                  id: userId,
                  email: 'test@example.com',
                  full_name: 'Test Recruiter',
                  role: 'RECRUITER',
                },
              },
            };

            jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(mockRecruiter);
            jest.spyOn(prismaService.companies, 'create').mockResolvedValue(mockCreatedCompany);

            // Create company
            const createDto = {
              name,
              description,
              website,
              industry,
              company_type: companyType,
              location,
            };

            const result = await companyService.createCompany(userId, createDto);

            // Verify the company is linked to the recruiter
            expect(result).toBeDefined();
            expect(result.recruiter_id).toBe(recruiterId);
            expect(result.recruiters).toBeDefined();
            expect(result.recruiters.id).toBe(recruiterId);
            expect(result.recruiters.user_id).toBe(userId);

            // Verify recruiter lookup was performed
            expect(prismaService.recruiters.findUnique).toHaveBeenCalledWith({
              where: { user_id: userId },
              include: { companies: true },
            });

            // Verify company was created with recruiter_id
            expect(prismaService.companies.create).toHaveBeenCalledWith({
              data: expect.objectContaining({
                recruiter_id: recruiterId,
                name,
                description,
                website,
                industry,
                company_type: companyType,
                location,
              }),
              include: expect.any(Object),
            });
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should fail when recruiter profile does not exist (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 2, maxLength: 100 }),
          fc.string({ minLength: 2, maxLength: 50 }),
          fc.constantFrom('STARTUP', 'SMALL_BUSINESS', 'MEDIUM_ENTERPRISE', 'LARGE_ENTERPRISE'),
          fc.string({ minLength: 2, maxLength: 100 }),
          async (userId, name, industry, companyType, location) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock no recruiter found
            jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(null);

            // Create company should fail
            const createDto = {
              name,
              industry,
              company_type: companyType,
              location,
            };

            await expect(
              companyService.createCompany(userId, createDto),
            ).rejects.toThrow(NotFoundException);

            await expect(
              companyService.createCompany(userId, createDto),
            ).rejects.toThrow('Recruiter profile not found');

            // Verify recruiter lookup was performed
            expect(prismaService.recruiters.findUnique).toHaveBeenCalledWith({
              where: { user_id: userId },
              include: { companies: true },
            });

            // Verify company was NOT created
            expect(prismaService.companies.create).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 16: Company Update Authorization
   * 
   * For any Company update request, if the authenticated Recruiter owns the Company,
   * the update SHALL succeed; otherwise, it SHALL fail with 403 Forbidden.
   * 
   * **Validates: Requirements 7.3, 7.6**
   */
  describe('Property 16: Company update authorization', () => {
    it('should allow updates when authenticated recruiter owns the company (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.option(fc.string({ minLength: 2, maxLength: 100 }), { nil: undefined }),
          fc.option(fc.string({ minLength: 10, maxLength: 500 }), { nil: undefined }),
          fc.option(fc.webUrl(), { nil: undefined }),
          fc.option(fc.string({ minLength: 2, maxLength: 50 }), { nil: undefined }),
          fc.option(fc.constantFrom('STARTUP', 'SMALL_BUSINESS', 'MEDIUM_ENTERPRISE', 'LARGE_ENTERPRISE'), { nil: undefined }),
          fc.option(fc.string({ minLength: 2, maxLength: 100 }), { nil: undefined }),
          async (userId, name, description, website, industry, companyType, location) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const recruiterId = 'recruiter-' + Math.random();
            const companyId = 'company-' + Math.random();

            // Mock company that belongs to the authenticated user's recruiter profile
            const mockCompany = {
              id: companyId,
              name: 'Original Name',
              description: 'Original Description',
              website: 'https://original.com',
              industry: 'Original Industry',
              company_type: 'STARTUP',
              location: 'Original Location',
              recruiter_id: recruiterId,
              created_at: new Date(),
              updated_at: new Date(),
              recruiters: {
                id: recruiterId,
                user_id: userId,
                company_id: companyId,
                created_at: new Date(),
                updated_at: new Date(),
              },
            };

            // Mock updated company
            const mockUpdatedCompany = {
              ...mockCompany,
              name: name || mockCompany.name,
              description: description !== undefined ? description : mockCompany.description,
              website: website !== undefined ? website : mockCompany.website,
              industry: industry || mockCompany.industry,
              company_type: companyType || mockCompany.company_type,
              location: location || mockCompany.location,
              updated_at: new Date(),
              recruiters: {
                ...mockCompany.recruiters,
                users: {
                  id: userId,
                  email: 'test@example.com',
                  full_name: 'Test Recruiter',
                  role: 'RECRUITER',
                },
              },
              jobs: [],
            };

            jest.spyOn(prismaService.companies, 'findUnique').mockResolvedValue(mockCompany);
            jest.spyOn(prismaService.companies, 'update').mockResolvedValue(mockUpdatedCompany);

            // Update should succeed
            const updateDto: any = {};
            if (name !== undefined) updateDto.name = name;
            if (description !== undefined) updateDto.description = description;
            if (website !== undefined) updateDto.website = website;
            if (industry !== undefined) updateDto.industry = industry;
            if (companyType !== undefined) updateDto.company_type = companyType;
            if (location !== undefined) updateDto.location = location;

            const result = await companyService.updateCompany(userId, companyId, updateDto);

            // Verify the update succeeded
            expect(result).toBeDefined();
            expect(result.id).toBe(companyId);
            expect(result.recruiter_id).toBe(recruiterId);

            // Verify ownership check was performed
            expect(prismaService.companies.findUnique).toHaveBeenCalledWith({
              where: { id: companyId },
              include: { recruiters: true },
            });

            // Verify update was called
            expect(prismaService.companies.update).toHaveBeenCalledWith({
              where: { id: companyId },
              data: expect.objectContaining({
                ...updateDto,
                updated_at: expect.any(Date),
              }),
              include: expect.any(Object),
            });
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject updates when authenticated recruiter does not own the company (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.option(fc.string({ minLength: 2, maxLength: 100 }), { nil: undefined }),
          async (authenticatedUserId, companyOwnerUserId, name) => {
            // Ensure the user IDs are different
            fc.pre(authenticatedUserId !== companyOwnerUserId);

            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const recruiterId = 'recruiter-' + Math.random();
            const companyId = 'company-' + Math.random();

            // Mock company that belongs to a different user
            const mockCompany = {
              id: companyId,
              name: 'Original Name',
              description: 'Original Description',
              website: 'https://original.com',
              industry: 'Original Industry',
              company_type: 'STARTUP',
              location: 'Original Location',
              recruiter_id: recruiterId,
              created_at: new Date(),
              updated_at: new Date(),
              recruiters: {
                id: recruiterId,
                user_id: companyOwnerUserId,
                company_id: companyId,
                created_at: new Date(),
                updated_at: new Date(),
              },
            };

            jest.spyOn(prismaService.companies, 'findUnique').mockResolvedValue(mockCompany);

            // Update should fail with 403 Forbidden
            const updateDto: any = {};
            if (name !== undefined) updateDto.name = name;

            await expect(
              companyService.updateCompany(authenticatedUserId, companyId, updateDto),
            ).rejects.toThrow(ForbiddenException);

            await expect(
              companyService.updateCompany(authenticatedUserId, companyId, updateDto),
            ).rejects.toThrow('You do not have permission to update this company');

            // Verify ownership check was performed
            expect(prismaService.companies.findUnique).toHaveBeenCalledWith({
              where: { id: companyId },
              include: { recruiters: true },
            });

            // Verify update was NOT called
            expect(prismaService.companies.update).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should fail when company does not exist (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.option(fc.string({ minLength: 2, maxLength: 100 }), { nil: undefined }),
          async (userId, companyId, name) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock no company found
            jest.spyOn(prismaService.companies, 'findUnique').mockResolvedValue(null);

            // Update should fail
            const updateDto: any = {};
            if (name !== undefined) updateDto.name = name;

            await expect(
              companyService.updateCompany(userId, companyId, updateDto),
            ).rejects.toThrow(NotFoundException);

            await expect(
              companyService.updateCompany(userId, companyId, updateDto),
            ).rejects.toThrow('Company not found');

            // Verify company lookup was performed
            expect(prismaService.companies.findUnique).toHaveBeenCalledWith({
              where: { id: companyId },
              include: { recruiters: true },
            });

            // Verify update was NOT called
            expect(prismaService.companies.update).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
