import { 
  Controller, 
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { UserService } from './modules/user/user.service';

@Controller()
export class AppController {
  constructor(private readonly userService: UserService) {}  
}
