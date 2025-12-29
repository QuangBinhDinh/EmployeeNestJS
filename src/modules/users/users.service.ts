import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@modules/users/users.repository';
import { CreateUserRequest, UpdateUserRequest } from '@modules/users/dto';
import { DEFAULT_PAGE_SIZE } from '@common/constants/pagination.constants';
import { User } from '@modules/users/users.schema';
import { NotFoundError, handleServiceError } from '@common/exceptions';
import { PaginationMetadata } from '@common/services/pagination-metadata.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  public constructor(
    private readonly usersRepository: UsersRepository,
    private readonly paginationMetadata: PaginationMetadata,
  ) {}

  public async findAll(pageId?: number, pageSize?: number): Promise<User[]> {
    // If pagination params are provided
    if (pageId !== undefined && pageSize !== undefined) {
      const offset = (pageId - 1) * pageSize;
      const [users, totalCount] = await Promise.all([
        this.usersRepository.findAll(pageSize, offset),
        this.usersRepository.count(),
      ]);

      // Set metadata for interceptor to use
      this.paginationMetadata.setTotalCount(totalCount);

      return users;
    }

    // Default behavior without pagination
    return this.usersRepository.findAll(DEFAULT_PAGE_SIZE, 0);
  }

  public async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundError(`User with ID ${id}`);
    }
    return user;
  }

  public async create(request: CreateUserRequest): Promise<User> {
    try {
      // Hash password before storing
      const passwordHash = await bcrypt.hash(request.password, 10);

      const userData = {
        username: request.username,
        passwordHash,
        email: request.email,
        phone: request.phone,
        fullName: request.fullName,
      };

      const result = await this.usersRepository.create(userData);
      // Get the inserted ID from result
      const userId = Number(result[0].insertId);
      return this.findOne(userId);
    } catch (e) {
      handleServiceError(e, 'Failed to create user');
    }
  }

  public async update(id: number, request: UpdateUserRequest): Promise<User> {
    try {
      // Check if user exists
      await this.findOne(id);

      const updateData: any = {};

      if (request.username !== undefined) updateData.username = request.username;
      if (request.email !== undefined) updateData.email = request.email;
      if (request.phone !== undefined) updateData.phone = request.phone;
      if (request.fullName !== undefined) updateData.fullName = request.fullName;

      // Hash password if provided
      if (request.password !== undefined) {
        updateData.passwordHash = await bcrypt.hash(request.password, 10);
      }

      if (Object.keys(updateData).length > 0) {
        await this.usersRepository.update(id, updateData);
      }

      return this.findOne(id);
    } catch (e) {
      handleServiceError(e, 'Failed to update user');
    }
  }

  public async remove(id: number): Promise<void> {
    try {
      // Check if user exists
      await this.findOne(id);

      await this.usersRepository.remove(id);
    } catch (e) {
      handleServiceError(e, 'Failed to delete user');
    }
  }
}
