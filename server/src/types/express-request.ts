import { Request } from 'express';

import { UserDocument } from './user';

export type ExpressRequest = Request & {
  currentUser?: UserDocument;
};
