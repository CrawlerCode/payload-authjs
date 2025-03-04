import { deepCopyObjectSimple, deepMerge, type Field, type NamedTab, type Tab } from "payload";
import { fieldAffectsData, tabHasName } from "payload/shared";

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
  const toHandleFields = deepCopyObjectSimple(patchFields);

  for (let i = 0; i < toHandleFields.length; i++) {
    const field = toHandleFields[i];
    if (fieldAffectsData(field)) {
      const existingField = findFieldByName(fields, field.name);
      if (existingField) {
        // Check if field type matches
        if (field.type !== existingField.type) {
          throw new Error(
            `Field type mismatch for '${path}.${field.name}': Got '${field.type}', expected '${existingField.type}'`,
          );
        }

        // Merge subfields if both have subfields
        if ("fields" in field && "fields" in existingField) {
          // Merge the field and subfields (existing field has always priority)
          const result = mergeFields({
            path: `${path}.${field.name}`,
            baseFields: existingField.fields,
            patchFields: field.fields,
          });
          existingField.fields = [...result.mergedFields, ...result.restFields];
          const { fields: _, ...restField } = field;
          Object.assign(existingField, deepMerge<Field>(restField, existingField));
        } else {
          // Merge the field (existing field has always priority)
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
    } else if (field.type === "tabs") {
      // Merge tabs if tabs field exists
      const tabsField = fields.find(f => f.type === "tabs");
      if (tabsField) {
        for (let t = 0; t < field.tabs.length; t++) {
          const tab = field.tabs[t];
          const tabType = tabHasName(tab) ? "named" : "unnamed";
          const existingTab = findTabField(
            tabsField.tabs,
            tabType,
            // If tab is named, use the name
            tabType === "named"
              ? (tab as NamedTab).name
              : // If tab has custom originalTabLabel, search by that
                tab.custom?.originalTabLabel
                ? tab.custom.originalTabLabel
                : // Otherwise, search by label (if it's a string)
                  typeof tab.label === "string"
                  ? tab.label
                  : "",
          );
          if (existingTab) {
            // Merge the tab (existing tab has always priority)
            const result = mergeFields({
              path: tabType ? `${path}.${(tab as NamedTab).name}` : path,
              baseFields: existingTab.fields,
              patchFields: tab.fields,
            });
            existingTab.fields = [...result.mergedFields, ...result.restFields];
            const { fields: _, ...restTab } = tab;
            if (tab.custom?.originalTabLabel && tab.label) {
              delete existingTab.label;
            }
            Object.assign(existingTab, deepMerge<Tab>(restTab, existingTab));

            // Remove tab
            field.tabs.splice(t, 1);
            t--;
          }
        }

        // Add the rest tabs
        tabsField.tabs.push(...field.tabs);

        // Remove from toHandleFields / mark as done
        toHandleFields.splice(i, 1);
        i--;
      }
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
const findFieldByName = (fields: Field[], name: string): Field | undefined => {
  for (const field of fields) {
    if ("fields" in field && !fieldAffectsData(field)) {
      // Find in subfields if field not affecting data (e.g. row)
      const found = findFieldByName(field.fields, name);
      if (found) {
        return found;
      }
    } else if (field.type === "tabs") {
      // For each tab, find the field
      for (const tab of field.tabs) {
        const found = findFieldByName(tab.fields, name);
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
 * Find a tab field by name or label in a list of tabs
 *
 * @param tabs The tabs list
 * @param type The tab type (named or unnamed)
 * @param nameOrLabel The tab name or label
 */
const findTabField = (
  tabs: Tab[],
  type: "unnamed" | "named",
  nameOrLabel: string,
): Tab | undefined => {
  for (const tab of tabs) {
    if (
      (type === "unnamed" && !tabHasName(tab) && tab.label === nameOrLabel) ||
      (type === "named" && tabHasName(tab) && tab.name === nameOrLabel)
    ) {
      return tab;
    }
  }
};
