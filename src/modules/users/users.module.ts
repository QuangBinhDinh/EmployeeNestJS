import { Module } from '@nestjs/common';
import { UsersController } from '@modules/users/users.controller';
import { UsersService } from '@modules/users/users.service';
import { UsersRepository } from '@modules/users/users.repository';
import { PaginationMetadata } from '@common/services/pagination-metadata.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, PaginationMetadata],
  exports: [UsersRepository],
})
export class UsersModule {}
