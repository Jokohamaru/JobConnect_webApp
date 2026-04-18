import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum'; // Đảm bảo đường dẫn này đúng với file bước 2

export const ROLES_KEY = 'roles';
// Thêm từ khóa "const" vào đây
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);