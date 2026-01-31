// Calendar helper functions

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function formatDateKey(dateValue: Date): string {
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const day = String(dateValue.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toOption(value: number | string): { label: string; value: string | number } {
  const label = typeof value === "number" ? String(value).padStart(2, "0") : value;
  return { label, value };
}

export function to24Hour(hour: number, meridiem: string): number {
  const normalized = hour % 12;
  return meridiem === "PM" ? normalized + 12 : normalized;
}
