import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @Post('user/login')
  @ApiOperation({ summary: 'User login' })
  async userLogin(@Body() payload: LoginDto) {
    return this.authService.userLogin(payload);
  }

  @Post('admin/login')
  @ApiOperation({ summary: 'Admin login' })
  async adminLogin(@Body() payload: LoginDto) {
    return this.authService.adminLogin(payload);
  }

  @Post('superadmin/login')
  @ApiOperation({ summary: 'Super Admin login' })
  async superAdminLogin(@Body() payload: LoginDto) {
    return this.authService.superAdminLogin(payload);
  }
}
