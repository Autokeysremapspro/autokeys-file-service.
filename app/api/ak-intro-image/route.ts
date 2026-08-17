import part00 from '@/components/ak/intro-image-data/part00'
import part01 from '@/components/ak/intro-image-data/part01'
import part02 from '@/components/ak/intro-image-data/part02'
import part03 from '@/components/ak/intro-image-data/part03'

export const dynamic = 'force-static'

export async function GET() {
  const base64 = `${part00}${part01}${part02}${part03}`
  const bytes = Buffer.from(base64, 'base64')

  return new Response(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'image/webp',
      'Content-Length': String(bytes.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
