import { z } from 'zod';

export const urlSchema = z.string().url({ message: 'Invalid url' });
