'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const { isConnected, address } = useAccount()
  const [scannedCodes, setScannedCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (address) {
      fetchScannedCodes()
    }
  }, [address])

  const fetchScannedCodes = async () => {
    try {
      const response = await fetch(`/api/scans?address=${address}`)
      const data = await response.json()
      setScannedCodes(data.scannedCodes)
    } catch (error) {
      console.error('Error fetching scanned codes:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-gray-800">
      {!isConnected ? (
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Scan & Collect
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Connect your wallet to start collecting QR codes from your favorite protocols
          </p>
          <div className="pt-4">
            <ConnectButton />
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="w-full max-w-4xl space-y-8 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your scanned codes...</p>
            </div>
          ) : scannedCodes.length > 0 ? (
            <>
              <h2 className="text-3xl font-bold text-gray-800 text-center">
                Your Collection
              </h2>
              {/* Scanned codes will be displayed here */}
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  No QR Codes Yet!
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Start scanning QR codes at events to build your collection. Each scan adds to your personal archive of protocol resources.
                </p>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
