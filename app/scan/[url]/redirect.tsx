'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion } from 'framer-motion'
import Cookies from 'js-cookie'

export function RedirectComponent({ url }: { url: string }) {
  const { address, isConnected } = useAccount()
  const [hasConnectedBefore, setHasConnectedBefore] = useState(false)
  
  useEffect(() => {
    const walletCookie = Cookies.get('wallet_connected')
    if (walletCookie) {
      setHasConnectedBefore(true)
    }
  }, [])

  useEffect(() => {
    const handleScan = async () => {
      if (isConnected && address) {
        // Set cookie for future scans
        Cookies.set('wallet_connected', 'true', { expires: 30 }) // 30 days
        
        // Silently record the scan
        try {
          await fetch('/api/scans/record', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address,
              url,
            }),
          })
        } catch (error) {
          console.error('Error recording scan:', error)
        }

        // Redirect to the target URL
        window.location.href = url
      }
    }

    if (isConnected || hasConnectedBefore) {
      handleScan()
    }
  }, [isConnected, address, url, hasConnectedBefore])

  if (!isConnected && !hasConnectedBefore) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Connect Once, Scan Always
          </h1>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Connect your wallet to save this and future QR codes to your collection
          </p>
          <ConnectButton />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
} 