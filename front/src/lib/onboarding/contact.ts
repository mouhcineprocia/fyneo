import type { Contact } from './types';
import { makeApi } from './api';

export const contactApi = makeApi<Contact>('contacts');
