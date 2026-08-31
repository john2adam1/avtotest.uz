import { NextRequest, NextResponse } from "next/server"
import { fetchPtestImage, parseAllowedPtestUrl } from "@/lib/ptest-image"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BYTES = 15 * 1024 * 1024
const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/bmp",
  "image/x-icon",
])

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url")
  if (!rawUrl) {
    return jsonError("Missing url query parameter", 400)
  }

  const target = parseAllowedPtestUrl(rawUrl)
  if (!target) {
    return jsonError("URL is not an allowed ptest.uz image", 400)
  }

  let upstream: Response
  try {
    upstream = await fetchPtestImage(target)
  } catch (error) {
    console.error("proxy-image fetch failed:", error)
    return jsonError("Failed to fetch image", 502)
  }

  if (!upstream.ok) {
    return jsonError(`Upstream responded with ${upstream.status}`, upstream.status === 404 ? 404 : 502)
  }

  const contentType = (upstream.headers.get("content-type") || "").split(";")[0].trim().toLowerCase()
  if (contentType && !ALLOWED_CONTENT_TYPES.has(contentType) && !contentType.startsWith("image/")) {
    return jsonError("Upstream did not return an image", 502)
  }

  const contentLength = Number(upstream.headers.get("content-length") || "0")
  if (contentLength > MAX_BYTES) {
    return jsonError("Image exceeds size limit", 413)
  }

  if (!upstream.body) {
    return jsonError("Empty image response", 502)
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
