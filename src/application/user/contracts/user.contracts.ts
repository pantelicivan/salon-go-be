export type UserFindOptions = {
  id?: string;
  accountId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
};
