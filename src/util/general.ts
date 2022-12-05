export function pad(n: number) {
    return n < 10 ? `0${n}` : n.toString();
}

export function stringToArray(s: string) {
    return s.split(",").map((e: string) => e.trim()).filter((e: string) => e !== "");
}