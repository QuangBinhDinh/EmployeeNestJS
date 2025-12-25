export class CreateEmployeeDto {
  empNo: number;
  birthDate: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  hireDate: string;
}
