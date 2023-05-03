import { Request } from 'express';
import { ActivityData } from './activities.types';

export type ActivityRequest = Request & { activity: ActivityData };