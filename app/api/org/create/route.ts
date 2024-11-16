import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { name, description, owner } = await request.json()

    if (!name || !owner) {
      return NextResponse.json(
        { error: 'Name and owner address are required' },
        { status: 400 }
      )
    }

    // Check if organization already exists for this owner
    const existingOrg = await prisma.organization.findFirst({
      where: {
        owner,
      },
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: 'You already have an organization' },
        { status: 400 }
      )
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name,
        description,
        owner,
      },
    })

    // Create user record if it doesn't exist
    await prisma.user.upsert({
      where: { address: owner },
      update: {
        orgId: organization.id,
      },
      create: {
        id: owner,
        address: owner,
        orgId: organization.id,
      },
    })

    return NextResponse.json({ 
      success: true, 
      data: organization
    })

  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    )
  }
} 