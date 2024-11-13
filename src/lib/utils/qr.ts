import { siteConfig } from "@/config/site"

export function generateRedirectUrl(shortCode: string): string {
  return `${siteConfig.url}/r/${shortCode}`
}
