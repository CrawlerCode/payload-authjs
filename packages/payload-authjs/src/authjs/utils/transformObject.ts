// https://github.com/honeinc/is-iso-date/blob/8831e79b5b5ee615920dcb350a355ffc5cbf7aed/index.js#L5
const isoDateRE =
  // eslint-disable-next-line regexp/no-unused-capturing-group
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isDate = (val: any): val is ConstructorParameters<typeof Date>[0] =>
  !!(val && isoDateRE.test(val) && !isNaN(Date.parse(val)));

/**
 * Transform an object to an object that can be used by the adapter
 *
 * @param object Object to transform
 * @param exclude List of keys to remove from the object
 * @returns The transformed object
 *
 * @see https://authjs.dev/guides/creating-a-database-adapter#official-adapter-guidelines
 */
export const transformObject = <T extends Record<string, unknown>, AdapterObject extends object>(
  object: T,
  exclude?: (keyof T)[],
): AdapterObject => {
  const adapterObject: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(object)) {
    if (exclude?.includes(key)) {
      continue;
    }
    if (isDate(value)) {
      adapterObject[key] = new Date(value);
    } else {
      adapterObject[key] = value;
    }
  }
  return adapterObject as AdapterObject;
};
