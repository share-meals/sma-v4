export const getEnumValueOrNull = <T extends Record<string, string>>(
  enumObj: T,
  value: string | null
): T[keyof T] | null => {
  return Object.values(enumObj).includes(value as T[keyof T])
    ? (value as T[keyof T])
    : null;
};
