import { type Field } from "payload";
import { fieldAffectsData, fieldIsVirtual } from "payload/shared";

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
