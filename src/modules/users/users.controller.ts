import { Controller, Get, UseGuards, Req, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AtGuard } from 'src/core/guards/at.guard';
import { Roles } from 'src/core/decorators/login.decorator';
import { RolesGuard } from 'src/core/guards/role.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(AtGuard)
  @Get('me')
  me(@Req() req: any) {
    this.logger.log(`Fetching profile for user ID: ${req.user.id}`);
    return this.usersService.findById(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AtGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-only')
  adminOnly() {
    return { ok: true, message: 'Only admin can see this' };
  }
}
