import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { qrId } = body

    // Fire and forget tracking
    trackScanAsync(qrId).catch(console.error)

    // Respond immediately
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Scan tracking error:', error)
    // Still return success to not impact UX
    return NextResponse.json({ success: true })
  }
}

async function trackScanAsync(qrId: string) {
    console.log("Tracking scan for QR ID:", qrId)
  // Here you would:
  // 1. Update scan count in database
  // 2. Log scan details
  // 3. Handle any analytics
  // This runs independently of the response
} 