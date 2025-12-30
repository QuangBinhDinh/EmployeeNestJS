import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { jwtConstants } from '@/constants';
import { AuthGuard } from './guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { PaginationMetadata } from '@/common/services/pagination-metadata.service';
import { RolesGuard } from '@/common/roles/role.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    PaginationMetadata,
  ],
  exports: [AuthService],
})
export class AuthModule {}
