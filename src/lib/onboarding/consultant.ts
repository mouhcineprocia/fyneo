import type { Consultant } from './types';
import { makeApi } from './api';

export const consultantApi = makeApi<Consultant>('consultants');
