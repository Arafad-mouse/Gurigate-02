import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function applyImageFallback(event: React.SyntheticEvent<HTMLImageElement>) {
  const target = event.target as HTMLImageElement;
  target.src = '/E-dahab.png';
  target.onerror = null;
}
