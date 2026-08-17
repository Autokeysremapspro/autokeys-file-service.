import p0 from '@/lib/ak-intro-v11/part0'
import p1 from '@/lib/ak-intro-v11/part1'
import p2 from '@/lib/ak-intro-v11/part2'
import p3 from '@/lib/ak-intro-v11/part3'
import p4 from '@/lib/ak-intro-v11/part4'
import p5 from '@/lib/ak-intro-v11/part5'
import p6 from '@/lib/ak-intro-v11/part6'
import p7 from '@/lib/ak-intro-v11/part7'
import p8 from '@/lib/ak-intro-v11/part8'

export const dynamic = 'force-static'

const EXPECTED_BYTES = 48192

export async function GET() {
  const base64 = p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8
  const image = Buffer.from(base64, 'base64')

  if (image.length !== EXPECTED_BYTES) {
    return new Response(`AKCloud intro asset integrity error: ${image.length}/${EXPECTED_BYTES}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }

  return new Response(image, {
    status: 200,
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': String(image.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-AKCloud-Intro-Bytes': String(image.length),
    },
  })
}
