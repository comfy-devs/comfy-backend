import { BuiltinDatabaseType } from "./built-in";

/* Base */
export type DatabaseOptions = {
    id: string;
    name: string;
    type: BuiltinDatabaseType;
};

export type DatabaseSelectorValue = string | number | DatabaseFetchSelector;
export type DatabaseItemValue = string | number | boolean | null;
export type DatabaseUnserializedItemValue = DatabaseItemValue | string[];

export type DatabaseFetchOptions = {
    source: string;
    selectors: Record<string, string | number | DatabaseFetchSelector>;
    ignoreSensitive?: boolean;
    sort?: DatabaseSort;
};

export type DatabaseFetchSelector = {
    value: string | number;
    comparison: ">" | ">=" | "<" | "<>" | "!=" | "<=" | "<=>" | "=";
};

export type DatabaseFetchMultipleOptions = DatabaseFetchOptions & {
    offset?: number;
    limit?: number;
};

export type DatabaseSort = {
    order?: "ASC" | "DESC";
    field: string;
};

export type DatabaseAddOptions = {
    destination: string;
    item: Record<string, DatabaseUnserializedItemValue>;
};

export type DatabaseEditOptions = {
    destination: string;
    selectors: Record<string, DatabaseSelectorValue>;
    item: Record<string, DatabaseUnserializedItemValue>;
};

export type DatabaseDeleteOptions = {
    source: string;
    selectors: Record<string, DatabaseSelectorValue>;
};