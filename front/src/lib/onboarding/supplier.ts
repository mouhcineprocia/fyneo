import type { Supplier } from './types';
import { makeApi } from './api';

export const supplierApi = makeApi<Supplier>('suppliers');
