import { Employee } from '@modules/employees/employees.schema';
import { Department } from '@modules/departments/departments.schema';
import { GetEmployeeResponse } from '@modules/employees/dto/response/get-employee.response';
import { GetDepartmentResponse } from '@modules/departments/dto/response/get-department.response';

export class EntityMapper {
  /**
   * Generic mapper function that maps entity to response DTO
   * Automatically converts all Date properties to timestamp in milliseconds
   * @param entity - Source entity object
   */
  public static toResponse<TEntity, TResponse>(entity: TEntity): TResponse {
    const result = { ...entity } as any;

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
}
