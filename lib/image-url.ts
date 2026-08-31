import { isPtestImageUrl } from "@/lib/ptest-image"

/**
 * Normalize stored image URLs for display.
 * - Rewrites postimg.cc viewer links to direct CDN URLs
 * - Routes ptest.uz assets through the server proxy to avoid hotlink blocks
 */
export function getDisplayImageUrl(url: string): string {
  if (!url) return url

  let nextUrl = url.trim()

  if (nextUrl.includes("postimg.cc") && !nextUrl.includes("i.postimg.cc")) {
    nextUrl = nextUrl.replace("postimg.cc/", "i.postimg.cc/") + "/image.png"
  }

  if (nextUrl.startsWith("/api/proxy-image")) {
    return nextUrl
  }

  if (isPtestImageUrl(nextUrl)) {
    return `/api/proxy-image?url=${encodeURIComponent(nextUrl)}`
  }

  return nextUrl
}
