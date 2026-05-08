export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  RECRUITER = 'RECRUITER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
}

export interface User {
  id: string;
  email: string;
  avaUrl: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Candidate {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  careerRole: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Recruiter {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  companyId: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface UserWithProfile extends User {
  candidate?: Candidate;
  recruiter?: Recruiter;
}
