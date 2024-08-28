import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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
