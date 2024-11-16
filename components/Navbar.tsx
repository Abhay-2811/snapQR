'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function Navbar() {
  const { address } = useAccount()
  const [hasOrg, setHasOrg] = useState(false)

  // Check if user has an organization
  useEffect(() => {
    if (address) {
      // TODO: Replace with actual API call
      checkOrganization(address)
    }
  }, [address])

  const checkOrganization = async (address: string) => {
    try {
      const response = await fetch(`/api/org/check?address=${address}`)
      const data = await response.json()
      setHasOrg(data.hasOrg)
    } catch (error) {
      console.error('Error checking organization:', error)
    }
  }

  return (
    <motion.nav 
      className="bg-white shadow-sm border-b"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              QR Event Manager
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            {address && (
              <>
                {hasOrg ? (
                  <Link 
                    href="/generate" 
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Create QR Code
                  </Link>
                ) : (
                  <Link 
                    href="/org/create" 
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Register Organization
                  </Link>
                )}
              </>
            )}
            <ConnectButton showBalance={false} accountStatus={"avatar"} chainStatus={"none"} />
          </div>
        </div>
      </div>
    </motion.nav>
  )
} 