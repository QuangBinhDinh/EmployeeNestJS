# API Testing Guide

The NestJS application is now running on `http://localhost:3000`

## Testing the Endpoints

### Employees API

#### Get all employees (with pagination)
```bash
curl 'http://localhost:3000/employees?limit=5&offset=0'
```

#### Get a specific employee
```bash
curl http://localhost:3000/employees/10001
```

#### Create a new employee
```bash
curl -X POST http://localhost:3000/employees \
  -H "Content-Type: application/json" \
  -d '{
    "empNo": 999999,
    "birthDate": "1990-01-01",
    "firstName": "John",
    "lastName": "Doe",
    "gender": "M",
    "hireDate": "2024-01-01"
  }'
```

#### Update an employee
```bash
curl -X PUT http://localhost:3000/employees/999999 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

#### Delete an employee
```bash
curl -X DELETE http://localhost:3000/employees/999999
```

### Departments API

#### Get all departments (with pagination)
```bash
curl 'http://localhost:3000/departments?limit=5&offset=0'
```

#### Get a specific department
```bash
curl http://localhost:3000/departments/d001
```

#### Create a new department
```bash
curl -X POST http://localhost:3000/departments \
  -H "Content-Type: application/json" \
  -d '{
    "deptNo": "d010",
    "deptName": "Engineering"
  }'
```

#### Update a department
```bash
curl -X PUT http://localhost:3000/departments/d010 \
  -H "Content-Type: application/json" \
  -d '{
    "deptName": "Research & Development"
  }'
```

#### Delete a department
```bash
curl -X DELETE http://localhost:3000/departments/d010
```

## Sample Responses

### GET /employees?limit=3
```json
[
  {
    "empNo": 10001,
    "birthDate": "1953-09-02T00:00:00.000Z",
    "firstName": "Georgi",
    "lastName": "Facello",
    "gender": "M",
    "hireDate": "1986-06-26T00:00:00.000Z"
  },
  {
    "empNo": 10002,
    "birthDate": "1964-06-02T00:00:00.000Z",
    "firstName": "Bezalel",
    "lastName": "Simmel",
    "gender": "F",
    "hireDate": "1985-11-21T00:00:00.000Z"
  },
  {
    "empNo": 10003,
    "birthDate": "1959-12-03T00:00:00.000Z",
    "firstName": "Parto",
    "lastName": "Bamford",
    "gender": "M",
    "hireDate": "1986-08-28T00:00:00.000Z"
  }
]
```

### GET /departments?limit=3
```json
[
  {
    "deptNo": "d009",
    "deptName": "Customer Service"
  },
  {
    "deptNo": "d005",
    "deptName": "Development"
  },
  {
    "deptNo": "d002",
    "deptName": "Finance"
  }
]
```

