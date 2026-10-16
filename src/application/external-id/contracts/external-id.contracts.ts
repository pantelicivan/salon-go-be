export type ExternalIDFindOptions = {
  id?: string;
  modelType?: string;
  modelId?: string;
  externalId?: string;
  origin?: string;
};

export type ExternalIDCreationData = {
  externalId: string;
  origin: string;
  modelType: string;
  modelId: string;
};
