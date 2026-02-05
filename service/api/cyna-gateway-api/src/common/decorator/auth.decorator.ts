import { SetMetadata } from '@nestjs/common';

export const AUTH_KEY = 'auth';
export const Auth = () => SetMetadata(AUTH_KEY, true);
