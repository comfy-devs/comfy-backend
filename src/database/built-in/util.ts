import { DatabaseItemValue } from "database/types";

export function serializeDatabaseItemValue(e: DatabaseItemValue) {
    if(e === null) { return e; }
    switch(typeof(e)) {
        case "boolean":
            return e ? "1" : "0";

        default:
            return e.toString();
    }
}