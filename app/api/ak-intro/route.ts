import part00 from '@/components/ak/intro-data/part00'
import part01 from '@/components/ak/intro-data/part01'
import part02 from '@/components/ak/intro-data/part02'
import part03 from '@/components/ak/intro-data/part03'
import part04 from '@/components/ak/intro-data/part04'
import part05 from '@/components/ak/intro-data/part05'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VIDEO = Buffer.from(`${part00}${part01}${part02}${part03}${part04}${part05}`, 'base64')

function baseHeaders() {
  return {
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Type': 'video/mp4',
  }
}

export async function GET(request: Request) {
  const range = request.headers.get('range')
  const size = VIDEO.length

  if (!range) {
    return new Response(new Uint8Array(VIDEO), {
      status: 200,
      headers: {
        ...baseHeaders(),
        'Content-Length': String(size),
      },
    })
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range)
  if (!match) {
    return new Response(null, {
      status: 416,
      headers: {
        ...baseHeaders(),
        'Content-Range': `bytes */${size}`,
      },
    })
  }

  const requestedStart = match[1] ? Number(match[1]) : 0
  const requestedEnd = match[2] ? Number(match[2]) : size - 1
  const start = Math.max(0, requestedStart)
  const end = Math.min(size - 1, requestedEnd)

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) {
    return new Response(null, {
      status: 416,
      headers: {
        ...baseHeaders(),
        'Content-Range': `bytes */${size}`,
      },
    })
  }

  const chunk = VIDEO.subarray(start, end + 1)
  return new Response(new Uint8Array(chunk), {
    status: 206,
    headers: {
      ...baseHeaders(),
      'Content-Length': String(chunk.length),
      'Content-Range': `bytes ${start}-${end}/${size}`,
    },
  })
}
