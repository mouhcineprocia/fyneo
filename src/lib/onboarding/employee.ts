import type { Employee } from './types';
import { makeApi } from './api';

export const employeeApi = makeApi<Employee>('employees');
