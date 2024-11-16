'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'

export default function CreateOrgPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Please connect your wallet first
          </h1>
          <p className="text-gray-600">
            You need to connect your wallet to create an organization
          </p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/org/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          owner: address,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create organization')
      }

      router.push('/generate')
    } catch (error) {
      console.error('Error creating organization:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-8"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          Create Your Organization
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 text-black border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter organization name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border text-black rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none h-32"
              placeholder="Describe your organization"
            />
          </div>

          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Creating...' : 'Create Organization'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
} 