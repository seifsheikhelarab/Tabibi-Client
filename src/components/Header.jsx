import React, { useState, useEffect, useCallback } from 'react'
import { assets } from '../assets/assets'
import { useTranslation } from 'react-i18next'

const heroSlides = [
  {
    img: '/img/hero1.jpeg',
    badge: 'header.bookWithConfidence',
    title: 'header.bookAppointment',
    highlight: 'header.withTrustedDoctors',
    desc: 'header.exploreNetwork',
    cta: 'header.bookNow',
  },
  {
    img: '/img/hero2.jpeg',
    badge: 'header.slide2Badge',
    title: 'header.slide2Title',
    highlight: 'header.slide2Highlight',
    desc: 'header.slide2Desc',
    cta: 'header.bookNow',
  },
  {
    img: '/img/hero3.jpeg',
    badge: 'header.slide3Badge',
    title: 'header.slide3Title',
    highlight: 'header.slide3Highlight',
    desc: 'header.slide3Desc',
    cta: 'header.bookNow',
  },
]

const Header = () => {
  const { t } = useTranslation()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const slide = heroSlides[currentSlide]

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % heroSlides.length)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isPaused, nextSlide])

  return (
    <div
      className='relative flex flex-col md:flex-row items-center bg-primary rounded-[2rem] px-8 md:px-16 lg:px-20 py-14 md:py-18 overflow-hidden shadow-lg animate-fade-in-up mt-6 mb-8'
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel background images */}
      {heroSlides.map((s, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={index !== currentSlide}
        >
          <img
            src={s.img}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
        </div>
      ))}

      {/* Decorative glows */}
      <div className='absolute top-0 right-0 w-[400px] h-[400px] bg-white/8 rounded-full blur-[100px] pointer-events-none z-[1]'></div>
      <div className='absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px] pointer-events-none z-[1]'></div>

      {/* Text Content */}
      <div className='md:w-7/12 flex flex-col items-start justify-center gap-6 py-4 relative z-10'>
        <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse-ring"></span>
          <span className="text-white/80 text-[10px] uppercase tracking-widest font-semibold">{t(slide.badge)}</span>
        </div>

        <h1 className='text-4xl md:text-5xl lg:text-[3.5rem] text-white font-display font-extrabold leading-[1.1] tracking-tight'>
          {t(slide.title)} <br />
          <span className='text-blue-100 relative'>
            {t(slide.highlight)}
            <svg className="absolute left-0 bottom-[-8px] w-full h-2.5 text-white/25" viewBox="0 0 300 12" fill="none">
              <path d="M3 9C60 3.5 180 3.5 297 7.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 text-white/80 max-w-lg mt-1'>
          <img className='w-24 drop-shadow-lg hover:scale-105 transition-transform duration-300' src={assets.group_profiles} alt="" />
          <p className='leading-relaxed text-sm font-medium text-white/85'>
            {t(slide.desc)}
          </p>
        </div>

        <a
          href='#speciality'
          className='flex items-center gap-3 bg-white px-8 py-4 rounded-xl text-primary font-bold text-sm hover:bg-white/95 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-lg group'
        >
          {t(slide.cta)}
          <img className='w-3 rtl:scale-x-flip group-hover:translate-x-1 group-hover:-translate-x-1 transition-transform' src={assets.arrow_icon} alt="" />
        </a>
      </div>

      {/* Right Decorative Rings */}
      <div className='md:w-5/12 flex items-center justify-center relative z-10 mt-10 md:mt-0'>
        <div className="absolute w-[20rem] h-[20rem] bg-white/5 rounded-full border border-white/10 blur-sm animate-float" />
        <div className="absolute w-[16rem] h-[16rem] bg-blue-300/8 rounded-full border border-white/10 scale-95 animate-float [animation-delay:2s]"></div>
      </div>

      {/* Navigation Dots */}
      <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20'>
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`rounded-full transition-all duration-300 cursor-pointer ${
              index === currentSlide
                ? 'bg-white w-8 h-2.5'
                : 'bg-white/40 hover:bg-white/60 w-2.5 h-2.5'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default Header
