import { format } from "date-fns";

export function formatDate(value: string | Date, pattern = "MMM d, yyyy") {
  return format(value instanceof Date ? value : new Date(value), pattern);
}

export function formatDateTime(value: string | Date) {
  return format(value instanceof Date ? value : new Date(value), "MMM d, yyyy HH:mm");
}
