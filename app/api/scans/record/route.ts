import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { address, url } = await request.json()

    if (!address || !url) {
      return NextResponse.json(
        { error: 'Address and URL are required' },
        { status: 400 }
      )
    }

    // Get or create user
    const user = await prisma.user.upsert({
      where: { address },
      update: {},
      create: {
        id: address,
        address,
      },
    })

    // Find QR code by URL
    const qrCode = await prisma.qRCode.findFirst({
      where: { url },
    })

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      )
    }

    // Record the scan
    await prisma.scannedCode.create({
      data: {
        userId: user.id,
        qrCodeId: qrCode.id,
      },
    })

    return NextResponse.json({ 
      success: true,
    })

  } catch (error) {
    console.error('Error recording scan:', error)
    return NextResponse.json(
      { error: 'Failed to record scan' },
      { status: 500 }
    )
  }
} 