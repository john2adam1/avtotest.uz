const PTEST_HOSTS = new Set(["ptest.uz", "www.ptest.uz"])

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

export function parseAllowedPtestUrl(raw: string): URL | null {
  try {
    const url = new URL(raw)
    if (url.protocol !== "https:" && url.protocol !== "http:") return null
    if (!PTEST_HOSTS.has(url.hostname.toLowerCase())) return null
    return url
  } catch {
    return null
  }
}

export function isPtestImageUrl(url: string): boolean {
  return parseAllowedPtestUrl(url) !== null
}

export function buildPtestFetchHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "User-Agent": process.env.PTEST_USER_AGENT || DEFAULT_USER_AGENT,
  }

  const cookie = process.env.PTEST_COOKIE?.trim()
  if (cookie) {
    headers.Cookie = cookie
  }

  return headers
}

export function fetchPtestImage(url: URL, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    method: "GET",
    redirect: "follow",
    referrerPolicy: "no-referrer",
    cache: "no-store",
    headers: {
      ...buildPtestFetchHeaders(),
      ...init?.headers,
    },
    signal: init?.signal,
  })
}
