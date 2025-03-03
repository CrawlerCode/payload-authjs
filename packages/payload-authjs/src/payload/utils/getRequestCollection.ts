import { APIError, type Collection, type PayloadRequest } from "payload";

/**
 * Get the collection from the request
 *
 * @see https://github.com/payloadcms/payload/blob/main/packages/payload/src/utilities/getRequestEntity.ts#L8
 */
export const getRequestCollection = (req: PayloadRequest): Collection => {
  const collectionSlug = req.routeParams?.collection;

  if (typeof collectionSlug !== "string") {
    throw new APIError(`No collection was specified`, 400);
  }

  const collection = req.payload.collections[collectionSlug];

  if (!collection) {
    throw new APIError(`Collection with the slug ${collectionSlug} was not found`, 404);
  }

  return collection;
};
