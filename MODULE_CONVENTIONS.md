# NestJS Module Creation Convention

## 📋 Standard Module Structure

Follow this structure when creating any new module in the project. This convention is based on the **Employees Module** as the reference implementation.

## 🗂️ Folder Structure

```
src/modules/
└── your-module/
    ├── your-module.controller.ts
    ├── your-module.service.ts
    ├── your-module.repository.ts
    ├── your-module.schema.ts
    ├── your-module.module.ts
    └── dto/
        ├── index.ts
        ├── request/
        │   ├── create-your-module.request.ts
        │   └── update-your-module.request.ts
        └── response/
            └── get-your-module.response.ts
```

## 📝 File Naming Conventions

### Module Files
- **Controller**: `{module-name}.controller.ts`
- **Service**: `{module-name}.service.ts`
- **Repository**: `{module-name}.repository.ts` (extends BaseRepository)
- **Schema**: `{module-name}.schema.ts` (Drizzle ORM schema)
- **Module**: `{module-name}.module.ts`

### DTO Files
- **Request DTOs**: `dto/request/{action}-{module-name}.request.ts`
  - Example: `create-employee.request.ts`, `update-employee.request.ts`
- **Response DTOs**: `dto/response/get-{module-name}.response.ts`
  - Example: `get-employee.response.ts`
- **Index file**: `dto/index.ts` (exports all DTOs)

### Class Naming
- **Request DTO**: `{Action}{ModuleName}Request`
  - Example: `CreateEmployeeRequest`, `UpdateEmployeeRequest`
- **Response DTO**: `Get{ModuleName}Response`
  - Example: `GetEmployeeResponse`
- **Controller**: `{ModuleName}Controller`
- **Service**: `{ModuleName}Service`
- **Repository**: `{ModuleName}Repository`

## 🔧 Implementation Checklist

### 1. Schema Definition (`your-module.schema.ts`)
```typescript
import { mysqlTable, bigint, varchar, timestamp } from 'drizzle-orm/mysql-core';

export const yourModule = mysqlTable('your_module', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type YourModule = typeof yourModule.$inferSelect;
export type NewYourModule = typeof yourModule.$inferInsert;
```

### 2. Repository (`your-module.repository.ts`)
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { DATABASE_CONNECTION } from '@/database';
import { yourModule } from './your-module.schema';
import { BaseRepository } from '@common/repositories/base.repository';

@Injectable()
export class YourModuleRepository extends BaseRepository<typeof yourModule> {
  public constructor(
    @Inject(DATABASE_CONNECTION)
    db: MySql2Database,
  ) {
    super(db, yourModule);
  }

  protected getPrimaryKey() {
    return yourModule.id;
  }
}
```

### 3. Request DTOs (`dto/request/`)

**create-your-module.request.ts**:
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateYourModuleRequest {
  @ApiProperty({ example: 'Example Name' })
  @IsString()
  @IsNotEmpty()
  public name: string;
}
```

**update-your-module.request.ts**:
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateYourModuleRequest {
  @ApiProperty({ example: 'Updated Name', required: false })
  @IsString()
  @IsOptional()
  public name?: string;
}
```

### 4. Response DTO (`dto/response/get-your-module.response.ts`)
```typescript
import { ApiProperty } from '@nestjs/swagger';

export class GetYourModuleResponse {
  @ApiProperty()
  public id: number;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public createdAt: Date;

  @ApiProperty()
  public updatedAt: Date;
}
```

### 5. DTO Index (`dto/index.ts`)
```typescript
export * from './request/create-your-module.request';
export * from './request/update-your-module.request';
export * from './response/get-your-module.response';
```

### 6. Service (`your-module.service.ts`)
```typescript
import { Injectable } from '@nestjs/common';
import { YourModuleRepository } from './your-module.repository';
import { CreateYourModuleRequest, UpdateYourModuleRequest } from './dto';
import { YourModule } from './your-module.schema';
import { NotFoundError, handleServiceError } from '@common/exceptions';
import { PaginationMetadata } from '@common/services/pagination-metadata.service';
import { DEFAULT_PAGE_SIZE } from '@common/constants/pagination.constants';

@Injectable()
export class YourModuleService {
  public constructor(
    private readonly repository: YourModuleRepository,
    private readonly paginationMetadata: PaginationMetadata,
  ) {}

  public async findAll(pageId?: number, pageSize?: number): Promise<YourModule[]> {
    if (pageId !== undefined && pageSize !== undefined) {
      const offset = (pageId - 1) * pageSize;
      const [items, totalCount] = await Promise.all([
        this.repository.findAll(pageSize, offset),
        this.repository.count(),
      ]);
      this.paginationMetadata.setTotalCount(totalCount);
      return items;
    }
    return this.repository.findAll(DEFAULT_PAGE_SIZE, 0);
  }

  public async findOne(id: number): Promise<YourModule> {
    const item = await this.repository.findOne(id);
    if (!item) {
      throw new NotFoundError(`YourModule with ID ${id}`);
    }
    return item;
  }

  public async create(request: CreateYourModuleRequest): Promise<YourModule> {
    try {
      const result = await this.repository.create(request);
      const id = Number(result[0].insertId);
      return this.findOne(id);
    } catch (e) {
      handleServiceError(e, 'Failed to create your module');
    }
  }

  public async update(id: number, request: UpdateYourModuleRequest): Promise<YourModule> {
    try {
      await this.findOne(id);
      await this.repository.update(id, request);
      return this.findOne(id);
    } catch (e) {
      handleServiceError(e, 'Failed to update your module');
    }
  }

  public async remove(id: number): Promise<void> {
    try {
      await this.findOne(id);
      await this.repository.remove(id);
    } catch (e) {
      handleServiceError(e, 'Failed to remove your module');
    }
  }
}
```

### 7. Controller (`your-module.controller.ts`)
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { YourModuleService } from './your-module.service';
import { CreateYourModuleRequest, UpdateYourModuleRequest, GetYourModuleResponse } from './dto';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { ApiResponseDto } from '@common/dto/paginated-response.dto';
import { EntityMapper } from '@common/mappers/entity.mapper';
import { Public } from '@modules/auth/decorators/public.decorator';

@ApiTags('YourModule')
@Controller('your-module')
@UseInterceptors(ResponseInterceptor)
@Public()  // All endpoints are public by default
export class YourModuleController {
  public constructor(private readonly service: YourModuleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all items' })
  @ApiResponse({ status: 200, description: 'List of items', type: ApiResponseDto })
  public async findAll(@Query() query: PaginationQueryDto) {
    const items = await this.service.findAll(query.pageId, query.pageSize);
    return items.map(EntityMapper.toYourModuleResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiResponse({ status: 200, description: 'Item details' })
  public async findOne(@Param('id', ParseIntPipe) id: number): Promise<GetYourModuleResponse> {
    const item = await this.service.findOne(id);
    return EntityMapper.toYourModuleResponse(item);
  }

  @Post()
  @ApiOperation({ summary: 'Create new item' })
  @ApiResponse({ status: 201, description: 'Item created successfully' })
  public async create(@Body() request: CreateYourModuleRequest): Promise<GetYourModuleResponse> {
    const item = await this.service.create(request);
    return EntityMapper.toYourModuleResponse(item);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update item' })
  @ApiResponse({ status: 200, description: 'Item updated successfully' })
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UpdateYourModuleRequest,
  ): Promise<GetYourModuleResponse> {
    const item = await this.service.update(id, request);
    return EntityMapper.toYourModuleResponse(item);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete item' })
  @ApiResponse({ status: 204, description: 'Item deleted successfully' })
  public async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.remove(id);
  }
}
```

### 8. Module (`your-module.module.ts`)
```typescript
import { Module } from '@nestjs/common';
import { YourModuleController } from './your-module.controller';
import { YourModuleService } from './your-module.service';
import { YourModuleRepository } from './your-module.repository';
import { PaginationMetadata } from '@common/services/pagination-metadata.service';

@Module({
  controllers: [YourModuleController],
  providers: [YourModuleService, YourModuleRepository, PaginationMetadata],
  exports: [YourModuleService, YourModuleRepository],
})
export class YourModuleModule {}
```

### 9. Add EntityMapper Method (`src/common/mappers/entity.mapper.ts`)
```typescript
public static toYourModuleResponse(item: YourModule): GetYourModuleResponse {
  return {
    id: item.id,
    name: item.name,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
```

### 10. Register Module in App (`src/modules/app.module.ts`)
```typescript
import { YourModuleModule } from '@modules/your-module/your-module.module';

@Module({
  imports: [
    // ... other modules
    YourModuleModule,
  ],
})
export class AppModule {}
```

## ✅ Key Principles

1. **DTO Organization**: Always separate request and response DTOs into subfolders
2. **Naming**: Use clear, descriptive names following the convention
3. **Access Modifiers**: All methods are `public` by default
4. **Public Endpoints**: Use `@Public()` decorator at controller level
5. **Validation**: Use class-validator decorators on request DTOs
6. **Swagger**: Use `@ApiProperty()` on all DTO properties
7. **Error Handling**: Use common error utilities (`NotFoundError`, `handleServiceError`)
8. **Pagination**: Support pagination with `PaginationQueryDto`
9. **Interceptors**: Use `ResponseInterceptor` for consistent response format
10. **Mapper**: Use `EntityMapper` to convert entities to response DTOs

## 📚 Reference Module

Always refer to the **Employees Module** as the gold standard for implementation:
- `/src/modules/employees/`

---

**Last Updated:** December 29, 2025  
**Convention Based On:** Employees Module Structure
