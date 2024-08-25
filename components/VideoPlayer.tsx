'use client'

import { useState, useRef, useEffect } from 'react'
import { PlayIcon, PauseIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

interface VideoPlayerProps {
  src: string
  isYouTube?: boolean
}

const useVideoPlayer = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return { isPlaying, togglePlay }
}

export default function VerticalVideoPlayer({ src, isYouTube = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { isPlaying, togglePlay } = useVideoPlayer(videoRef)
  const [aspectRatio, setAspectRatio] = useState('aspect-[9/16]')
  const router = useRouter()

  useEffect(() => {
    const handleResize = () => {
      const windowAspectRatio = window.innerHeight / window.innerWidth
      setAspectRatio(windowAspectRatio > 16/9 ? 'aspect-[9/16]' : 'aspect-video')
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="relative w-full h-[60%] flex items-center justify-center bg-black">
      <div className={`relative w-full h-full ${aspectRatio}`}>
        {isYouTube ? (
          <iframe
            src={`https://www.youtube.com/embed/${src}?autoplay=0&controls=0&rel=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          />
        ) : (
          <video
            ref={videoRef}
            src={src}
            className="absolute top-0 left-0 w-full h-full object-cover"
            playsInline
            loop
          />
        )}
        {!isYouTube && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-300"
          >
            {isPlaying ? (
              <PauseIcon className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            ) : (
              <PlayIcon className="w-16 h-16 text-white" />
            )}
          </button>
        )}
      </div>
      <div className="fixed bottom-4 lg:bottom-16 z-50">
          <Button onClick={() => router.push('/menu')} size="lg" className="shadow-lg bg-red-600">
            Order Now
          </Button>
        </div>
    </div>
  )
}