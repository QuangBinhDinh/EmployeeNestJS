import { Employee } from '@modules/employees';
import { Department } from '@modules/departments/departments.schema';
import { User } from '@modules/users/users.schema';
import { GetEmployeeResponse } from '@modules/employees/dto/response/get-employee.response';
import { GetDepartmentResponse } from '@modules/departments/dto/response/get-department.response';
import { GetUserResponse } from '@modules/users/dto/response/get-user.response';
import { DeviceLogWithDetails } from '@/modules/device-log';
import { GetDeviceLogResponse } from '@/modules/device-log/dto';

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
  public static toEmployeeResponse(data: Employee): GetEmployeeResponse {
    return EntityMapper.toResponse<Employee, GetEmployeeResponse>(data);
  }

  public static toDepartmentResponse(data: Department): GetDepartmentResponse {
    return EntityMapper.toResponse<Department, GetDepartmentResponse>(data);
  }

  public static toUserResponse(data: User): GetUserResponse {
    return EntityMapper.toResponse<User, GetUserResponse>(data, ['passwordHash']);
  }

  public static toDeviceLogResponse(data: DeviceLogWithDetails): GetDeviceLogResponse {
    return EntityMapper.toResponse<DeviceLogWithDetails, GetDeviceLogResponse>(data);
  }
}
