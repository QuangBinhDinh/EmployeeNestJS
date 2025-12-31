import { Employee } from '@modules/employees';
import { Department } from '@modules/departments/departments.schema';
import { User } from '@modules/users/users.schema';
import { GetEmployeeResponse } from '@modules/employees/dto/response/get-employee.response';
import { GetDepartmentResponse } from '@modules/departments/dto/response/get-department.response';
import { GetUserResponse } from '@modules/users/dto/response/get-user.response';

export class EntityMapper {
  /**
   * Generic mapper function that maps entity to response DTO
   * Automatically converts all Date properties to timestamp in milliseconds
   * Excludes sensitive fields like passwordHash
   * @param entity - Source entity object
   */
  public static toResponse<TEntity, TResponse>(
    entity: TEntity,
    excludeFields: string[] = [],
  ): TResponse {
    const result = { ...entity } as any;

    // Remove excluded fields
    for (const field of excludeFields) {
      delete result[field];
    }

    // Automatically convert all Date fields to timestamps
    for (const key in result) {
      const value = result[key];

      if (value instanceof Date) {
        result[key] = value.toISOString();
      }
    }

    return result as TResponse;
  }

  // Convenience methods using the generic function
  public static toEmployeeResponse(employee: Employee): GetEmployeeResponse {
    return EntityMapper.toResponse<Employee, GetEmployeeResponse>(employee);
  }

  public static toDepartmentResponse(department: Department): GetDepartmentResponse {
    return EntityMapper.toResponse<Department, GetDepartmentResponse>(department);
  }

  public static toUserResponse(user: User): GetUserResponse {
    return EntityMapper.toResponse<User, GetUserResponse>(user, ['passwordHash']);
  }
}
