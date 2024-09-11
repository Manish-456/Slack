import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { isToday, isYesterday, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateCode = () => {
    const code = Array.from({
        length: 6
    }, () => "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)])
    .join("")

    return code;
}

export const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";

  if (isYesterday(date)) return "Yesterday";

  return format(date, "EEEE, MMMM d");
};
