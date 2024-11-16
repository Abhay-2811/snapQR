import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json(
      { error: 'Address is required' },
      { status: 400 }
    )
  }

  try {
    const org = await prisma.organization.findFirst({
      where: {
        owner: address
      }
    })

    return NextResponse.json({ 
      hasOrg: !!org,
      org: org
    })

  } catch (error) {
    console.error('Error checking organization:', error)
    return NextResponse.json(
      { error: 'Failed to check organization' },
      { status: 500 }
    )
  }
} 