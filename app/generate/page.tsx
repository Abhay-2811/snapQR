'use client'

import { useState, useRef } from 'react'
import { QRCodeCanvas as QRCode } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'

const CUTE_IMAGES = [
  '/illustrations/cute1.svg', // You'll need to add these illustrations
  '/illustrations/cute2.svg', // You can use from sites like undraw.co
  '/illustrations/cute3.svg', // or other free illustration sites
]

const ensureMinFileSize = async (blob: Blob): Promise<Blob> => {
  if (blob.size >= 127) return blob;
  
  // If smaller than 127 bytes, pad the image data
  const padding = new Uint8Array(127 - blob.size);
  return new Blob([await blob.arrayBuffer(), padding], { type: blob.type });
}

export default function GeneratePage() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [qrGenerated, setQrGenerated] = useState(false)
  const [randomImage] = useState(() => 
    CUTE_IMAGES[Math.floor(Math.random() * CUTE_IMAGES.length)]
  )
  const qrRef = useRef<HTMLCanvasElement>(null)

  const downloadQRCode = (format: 'png' | 'svg') => {
    if (!qrRef.current) return

    if (format === 'png') {
      const canvas = qrRef.current
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream')
      downloadImage(pngUrl, 'png')
    } else {
      // SVG download logic
      const svgData = qrRef.current.outerHTML
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)
      downloadImage(svgUrl, 'svg')
    }
  }

  const downloadImage = (url: string, format: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `qrcode-${title || 'download'}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setQrGenerated(true)
    
    try {
      const canvas = qrRef.current
      if (!canvas) return
      
      // Get higher quality PNG
      const pngDataUrl = canvas.toDataURL('image/png', 1.0)
      const response = await fetch(pngDataUrl)
      let blob = await response.blob()
      
      // Ensure minimum file size for Akave
      blob = await ensureMinFileSize(blob)
      
      const formData = new FormData()
      formData.append('title', title)
      formData.append('url', url)
      formData.append('category', category)
      formData.append('qrImage', blob, `qr-${Date.now()}.png`)
      
      const apiResponse = await fetch('/api/qr', {
        method: 'POST',
        body: formData,
      })
      
      if (!apiResponse.ok) {
        throw new Error('Failed to save QR code')
      }
      
      // Show success message or handle response
      const data = await apiResponse.json()
      console.log('QR Code saved:', data)
      
    } catch (error) {
      console.error('Error saving QR code:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Your QR Code
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-black p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter title"
                required
              />
              <label className="absolute -top-2.5 left-2 bg-gray-50 px-2 text-sm text-gray-600">
                Title
              </label>
            </div>
            
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full text-black p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter URL"
                required
              />
              <label className="absolute -top-2.5 left-2 bg-gray-50 px-2 text-sm text-gray-600">
                URL
              </label>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-black p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter category"
              />
              <label className="absolute -top-2.5 left-2 bg-gray-50 px-2 text-sm text-gray-600">
                Category
              </label>
            </div>
            
            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Generate QR Code
            </motion.button>
          </form>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {!qrGenerated ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="aspect-square rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center"
              >
                <div className="text-center p-8">
                  <img 
                    src={randomImage} 
                    alt="Cute illustration" 
                    className="w-48 h-48 mx-auto mb-4"
                  />
                  <p className="text-gray-600">
                    Fill out the form to generate your QR code
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="qrcode"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white p-8 rounded-lg shadow-lg"
              >
                <div className="relative">
                  <QRCode
                    ref={qrRef}
                    value={`${window.location.origin}/scan/${encodeURIComponent(url)}`}
                    size={256}
                    level="H"
                    imageSettings={{
                      src: randomImage,
                      x: undefined,
                      y: undefined,
                      height: 50,
                      width: 50,
                      excavate: true,
                    }}
                    className="mx-auto"
                  />
                </div>
                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    onClick={() => downloadQRCode('png')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Download PNG
                  </button>
                  <button
                    onClick={() => downloadQRCode('svg')}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    Download SVG
                  </button>
                </div>
                <p className="mt-4 text-center text-gray-600">
                  Scan this code to access the URL
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
} 