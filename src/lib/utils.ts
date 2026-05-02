import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageFallback(label: string) {
  const safeLabel = label.replace(/[<>&]/g, "").slice(0, 36) || "GuriGate property"
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f7d7dc" />
          <stop offset="100%" stop-color="#f0f2f5" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bg)" />
      <circle cx="400" cy="220" r="92" fill="#E8344E" fill-opacity="0.12" />
      <path d="M320 310h160v110H320z" fill="#ffffff" fill-opacity="0.92" rx="18" />
      <path d="M350 270l50-44 50 44v40H350z" fill="#E8344E" fill-opacity="0.16" />
      <text x="400" y="460" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#1f2937">${safeLabel}</text>
      <text x="400" y="500" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#6b7280">Image unavailable</text>
    </svg>
  `
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function applyImageFallback(image: HTMLImageElement, label: string) {
  if (image.dataset.fallbackApplied === "true") {
    return
  }

  image.dataset.fallbackApplied = "true"
  image.src = getImageFallback(label)
}
