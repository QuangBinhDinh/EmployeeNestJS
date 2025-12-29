import { Controller, Post, Body, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterRequest, LoginRequest, AuthResponse } from './dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(ResponseInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({ status: 201, type: AuthResponse, description: 'User registered successfully' })
  @Public()
  public async register(@Body() registerDto: RegisterRequest): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiResponse({ status: 200, type: AuthResponse, description: 'User logged in successfully' })
  @Public()
  public async login(@Body() loginDto: LoginRequest): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Get current user profile' })
  public async getProfile(@CurrentUser() user: any) {
    return user;
  }
}
