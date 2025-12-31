export function getEnumValues<T extends string | number>(enumObj: any): T[] {
  return Object.values(enumObj) as T[];
}
