import type { Customer } from './types';
import { makeApi } from './api';

export const customerApi = makeApi<Customer>('customers');
