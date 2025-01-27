import { deepCopyObjectSimple, deepMerge, type Field } from "payload";
import { fieldAffectsData, fieldIsVirtual } from "payload/shared";

/**
 * Merge fields deeply
 * - overriding fields with the same name
 * - returning merged field and the rest of the fields that were not merged
 *
 * @param path - The path of the field (starting from the collection slug)
 * @param baseFields - The base fields
 * @param patchFields - The fields that should merge with the base fields (but base fields have priority)
 */
export const mergeFields = ({
  path,
  baseFields,
  patchFields,
}: {
  path: string;
  baseFields: Field[];
  patchFields: Field[];
}) => {
  let fields = deepCopyObjectSimple(baseFields);
  const toHandleFields = patchFields;

  for (let i = 0; i < toHandleFields.length; i++) {
    const field = toHandleFields[i];
    if (fieldAffectsData(field)) {
      const existingField = findField(fields, field.name);
      if (existingField) {
        // Check if field type matches
        if (field.type !== existingField.type) {
          throw new Error(
            `Field type mismatch for '${path}.${field.name}': Got '${field.type}', expected '${existingField.type}'`,
          );
        }

        // Merge subfields if both have subfields
        if ("fields" in field && "fields" in existingField) {
          // Merge subfields
          const result = mergeFields({
            path: `${path}.${field.name}`,
            baseFields: existingField.fields,
            patchFields: field.fields,
          });
          existingField.fields = [...result.mergedFields, ...result.restFields];
        } else {
          // Merge the field
          // Existing field has always priority
          Object.assign(existingField, deepMerge<Field>(field, existingField));
        }

        // Remove from toHandleFields / mark as done
        toHandleFields.splice(i, 1);
        i--;
      }
    } else if ("fields" in field) {
      // Merge subfields that do not affect data (e.g. row)
      const result = mergeFields({
        path,
        baseFields: fields,
        patchFields: field.fields,
      });
      fields = result.mergedFields;

      // If no inner fields left, remove the field / mark as done
      if (result.restFields.length === 0) {
        toHandleFields.splice(i, 1);
        i--;
      }
    } else {
      // Field type not allowed (e.g. tabs)
      throw new Error(`Field type '${field.type}' is not allowed inside '${path}'`);
    }
  }

  return { mergedFields: fields, restFields: toHandleFields };
};

/**
 * Find a field by name in a list of fields (including subfields and tabs)
 *
 * @param fields The fields list
 * @param name The field name
 */
const findField = (fields: Field[], name: string): Field | undefined => {
  for (const field of fields) {
    if ("fields" in field && !fieldAffectsData(field)) {
      // Find in subfields if field not affecting data (e.g. row)
      return findField(field.fields, name);
    } else if (field.type === "tabs") {
      // For each tab, find the field
      for (const tab of field.tabs) {
        const found = findField(tab.fields, name);
        if (found) {
          return found;
        }
      }
    } else if (field.name === name) {
      return field; // Found
    }
  }
  return undefined;
};

/**
 * Get all virtual fields from a list of fields (including subfields and tabs)
 *
 * @param fields The fields list
 * @returns The virtual fields
 */
export const getAllVirtualFields = (fields: Field[]): Field[] => {
  return fields.reduce((acc, field) => {
    if ("fields" in field && !fieldAffectsData(field)) {
      // Get virtual fields from subfields if field not affecting data (e.g. row)
      acc.push(...getAllVirtualFields(field.fields));
    } else if (field.type === "tabs") {
      // For each tab, get the virtual fields
      for (const tab of field.tabs) {
        acc.push(...getAllVirtualFields(tab.fields));
      }
    } else if (fieldIsVirtual(field)) {
      // Add virtual field
      acc.push(field);
    }
    return acc;
  }, [] as Field[]);
};
