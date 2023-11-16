import { createContext } from 'react';
import { Cookies } from './types';

export const Ctx = createContext<Cookies | null>(null);
