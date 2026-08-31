/**
 * Migrate ptest.uz image URLs in the database to Supabase Storage.
 *
 * Prerequisites:
 * 1. `test-images` bucket exists and is public
 *    (created by scripts/2026_PRODUCTION_CONSOLIDATED_SCHEMA.sql).
 *    Dashboard: Storage → New bucket → name `test-images` → Public.
 * 2. `.env.local` contains:
 *      NEXT_PUBLIC_SUPABASE_URL=
 *      SUPABASE_SERVICE_ROLE_KEY=
 *      PTEST_COOKIE=          (optional, if ptest.uz needs a session)
 *      PTEST_USER_AGENT=      (optional)
 *
 * Usage:
 *   npx tsx scripts/migrate-ptest-images.ts
 *   npx tsx scripts/migrate-ptest-images.ts --dry-run
 *   npx tsx scripts/migrate-ptest-images.ts --concurrency=3 --delay-ms=300
 */

import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { fetchPtestImage, parseAllowedPtestUrl } from "../lib/ptest-image"

const BUCKET = "test-images"
const PAGE_SIZE = 1000
const DEFAULT_CONCURRENCY = 4
const DEFAULT_DELAY_MS = 200
const MAX_BYTES = 15 * 1024 * 1024

type ImageRow = {
  table: "tests" | "carousel_images"
  id: string
  image_url: string
}

function loadEnvFile(filename: string) {
  const path = resolve(process.cwd(), filename)
  if (!existsSync(path)) return

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadEnvFile(".env.local")
loadEnvFile(".env")

function parseArgs(argv: string[]) {
  let dryRun = false
  let concurrency = DEFAULT_CONCURRENCY
  let delayMs = DEFAULT_DELAY_MS

  for (const arg of argv) {
    if (arg === "--dry-run") dryRun = true
    else if (arg.startsWith("--concurrency=")) {
      concurrency = Math.max(1, Number(arg.split("=")[1]) || DEFAULT_CONCURRENCY)
    } else if (arg.startsWith("--delay-ms=")) {
      delayMs = Math.max(0, Number(arg.split("=")[1]) || DEFAULT_DELAY_MS)
    }
  }

  return { dryRun, concurrency, delayMs }
}

function sleep(ms: number) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms))
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++
      results[index] = await fn(items[index], index)
    }
  }

  const workerCount = Math.min(concurrency, items.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return results
}

async function fetchAllPtestRows(supabase: SupabaseClient): Promise<ImageRow[]> {
  const rows: ImageRow[] = []

  for (const table of ["tests", "carousel_images"] as const) {
    let from = 0
    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select("id, image_url")
        .ilike("image_url", "%ptest.uz%")
        .range(from, from + PAGE_SIZE - 1)

      if (error) {
        throw new Error(`Failed to query ${table}: ${error.message}`)
      }

      const page = data ?? []
      for (const row of page) {
        rows.push({ table, id: row.id, image_url: row.image_url })
      }

      if (page.length < PAGE_SIZE) break
      from += PAGE_SIZE
    }
  }

  return rows
}

function extensionFromContentType(contentType: string, fallbackPath: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/svg+xml": ".svg",
    "image/bmp": ".bmp",
  }

  if (map[contentType]) return map[contentType]

  const fromPath = fallbackPath.match(/\.(jpe?g|png|gif|webp|avif|svg|bmp)(?:$|\?)/i)
  if (fromPath) return `.${fromPath[1].toLowerCase().replace("jpeg", "jpg")}`

  return ".jpg"
}

function storagePathFor(url: URL, contentType: string): string {
  const hash = createHash("sha256").update(url.href).digest("hex").slice(0, 16)
  const ext = extensionFromContentType(contentType, url.pathname)
  return `ptest/${hash}${ext}`
}

async function downloadImage(url: URL): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetchPtestImage(url)

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`)
  }

  const contentType = (response.headers.get("content-type") || "image/jpeg")
    .split(";")[0]
    .trim()
    .toLowerCase()

  if (contentType && !contentType.startsWith("image/")) {
    throw new Error(`Not an image (content-type: ${contentType})`)
  }

  const length = Number(response.headers.get("content-length") || "0")
  if (length > MAX_BYTES) {
    throw new Error(`Image too large (${length} bytes)`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error(`Image too large (${buffer.byteLength} bytes)`)
  }

  return { buffer, contentType: contentType || "image/jpeg" }
}

async function main() {
  const { dryRun, concurrency, delayMs } = parseArgs(process.argv.slice(2))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log(`Mode: ${dryRun ? "dry-run" : "live"} | concurrency=${concurrency} | delay-ms=${delayMs}`)

  const rows = await fetchAllPtestRows(supabase)
  console.log(`Found ${rows.length} row(s) with ptest.uz image URLs`)

  const uploadedBySource = new Map<string, string>()
  let updated = 0
  let skipped = 0
  let failed = 0

  await mapPool(rows, concurrency, async (row, index) => {
    const prefix = `[${index + 1}/${rows.length}] ${row.table} ${row.id}`
    const target = parseAllowedPtestUrl(row.image_url)

    if (!target) {
      console.warn(`${prefix} skip: URL is not a valid ptest.uz image`)
      skipped += 1
      return
    }

    try {
      let publicUrl = uploadedBySource.get(target.href)

      if (!publicUrl) {
        console.log(`${prefix} downloading ${target.href}`)
        const { buffer, contentType } = await downloadImage(target)
        const path = storagePathFor(target, contentType)

        if (dryRun) {
          publicUrl = `(dry-run) ${BUCKET}/${path}`
        } else {
          const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, {
            contentType,
            upsert: true,
          })
          if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`)
          }

          const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
          publicUrl = data.publicUrl
        }

        uploadedBySource.set(target.href, publicUrl)
        if (delayMs > 0) await sleep(delayMs)
      }

      if (dryRun) {
        console.log(`${prefix} would update -> ${publicUrl}`)
        updated += 1
        return
      }

      const { error: updateError } = await supabase
        .from(row.table)
        .update({ image_url: publicUrl })
        .eq("id", row.id)

      if (updateError) {
        throw new Error(`DB update failed: ${updateError.message}`)
      }

      console.log(`${prefix} updated -> ${publicUrl}`)
      updated += 1
    } catch (error) {
      failed += 1
      const message = error instanceof Error ? error.message : String(error)
      console.error(`${prefix} FAILED: ${message}`)
    }
  })

  console.log(
    `Done. updated=${updated} skipped=${skipped} failed=${failed} unique-downloads=${uploadedBySource.size}`,
  )

  if (failed > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
