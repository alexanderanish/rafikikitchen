'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  { id: 1, src: '/landing_page/1.jpeg', title:'Homemade Ingredients', alt: 'Baguette slides and ready for fillings' },
  { id: 2, src: '/landing_page/2.jpeg', title:'Built From Scratch', alt: 'Baguette slides and ready for fillings' },
  { id: 3, src: '/landing_page/5.jpeg',title:'Designed and Tested With Care', alt: 'Weighed out Baguette Dough' },
  { id: 4, src: '/landing_page/6.jpeg',title:'Unique Flavour Profiles', alt: 'Weighed out Baguette Dough' },
  { id: 5, src: '/landing_page/7.jpeg',title:'Freshly Made', alt: 'Shaping the dough into Baguettes' },
  { id: 6, src: '/landing_page/9.png', title:'Freshly Made',alt: 'Cross section view of the Jazz Sandwich' },
]

const extra = [

  { id: 7, src: '/landing_page/3.jpeg', alt: 'Our kitchen in action' },
  { id: 8, src: '/landing_page/15.jpeg', alt: 'Our kitchen in action' },
  { id: 9, src: '/landing_page/4.jpeg', alt: 'Happy customers enjoying our food' },
  { id: 10, src: '/landing_page/8.jpeg', alt: 'Happy customers enjoying our food' },
  { id: 11, src: '/landing_page/10.jpeg', alt: 'Freshly baked bread' },
  { id: 12, src: '/landing_page/11.jpeg', alt: 'Our kitchen in action' },
  { id: 13, src: '/landing_page/12.jpeg', alt: 'Happy customers enjoying our food' },
  { id: 14, src: '/landing_page/13.jpeg', alt: 'Delicious sandwich 4' },
  { id: 15, src: '/landing_page/14.jpeg', alt: 'Freshly baked bread' },
  
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length)
  }

  const goToNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow relative overflow-hidden">
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white text-center">
              <h2 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h2>
              {/* <p className="text-xl md:text-2xl mb-8">{slide.description}</p> */}
            </div>
            </div>
          ))}
         
        </div>

        <button
          onClick={goToPrevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 text-black hover:bg-opacity-75 transition-all duration-300"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={goToNextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 text-black hover:bg-opacity-75 transition-all duration-300"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <Link href="/menu" passHref>
          <Button size="lg" className="bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            Order Now
          </Button>
        </Link>
      </div>
    </div>
  )
}