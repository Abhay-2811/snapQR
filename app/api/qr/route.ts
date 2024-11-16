import { NextResponse } from 'next/server'
import axios from 'axios'
import { prisma } from '@/lib/prisma'

const AKAVE_API = 'http://localhost:8000'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const title = formData.get('title') as string
    const url = formData.get('url') as string
    const eventId = formData.get('eventId') as string
    const qrImage = formData.get('qrImage') as Blob
    
    if (!qrImage) {
      return NextResponse.json(
        { error: 'Missing QR image' },
        { status: 400 }
      )
    }

    // First create a bucket if it doesn't exist
    try {
      await axios.post(`${AKAVE_API}/buckets`, {
        bucketName: 'qr-codes'
      })
    } catch (error) {
      // Bucket might already exist, continue
    }

    // Upload file to Akave
    const fileFormData = new FormData()
    fileFormData.append('file', qrImage)
    
    const uploadResponse = await axios.post(
      `${AKAVE_API}/buckets/qr-codes/files`,
      fileFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    if (!uploadResponse.data.success) {
      throw new Error('Failed to upload to Akave')
    }

    // Get the file URL
    const fileUrl = `${AKAVE_API}/buckets/qr-codes/files/${uploadResponse.data.fileName}/download`

    // Save to database
    const qrCode = await prisma.qRCode.create({
      data: {
        title,
        url,
        imageUrl: fileUrl,
        eventId: eventId || 'default', // Temporary until we implement events
      },
    })

    return NextResponse.json({ 
      success: true, 
      data: qrCode
    })

  } catch (error) {
    console.error('Error handling QR code:', error)
    return NextResponse.json(
      { error: 'Failed to save QR code' },
      { status: 500 }
    )
  }
} 