import React from 'react'
import { assets } from '../assets/assets'

const Header = () => {
    return (
        <div className='relative flex flex-col md:flex-row items-center bg-primary rounded-[2.5rem] px-8 md:px-16 lg:px-20 py-12 md:py-16 overflow-hidden shadow-xl animate-fade-in-up'>

            {/* Background Decorations */}
            <div className='absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px]'></div>
            <div className='absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px]'></div>

            {/* --------- Header Left --------- */}
            <div className='md:w-1/2 flex flex-col items-start justify-center gap-6 py-8 relative z-10'>
                <h1 className='text-4xl md:text-5xl lg:text-6xl text-white font-semibold leading-tight tracking-tight'>
                    Book Appointment <br />
                    <span className='text-blue-100'>
                        With Trusted Doctors
                    </span>
                </h1>
                <div className='flex flex-col md:flex-row items-start md:items-center gap-4 text-white/90 text-base'>
                    <img className='w-28 drop-shadow-lg' src={assets.group_profiles} alt="Trusted Doctors" />
                    <p className='leading-relaxed'>
                        Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.
                    </p>
                </div>
                <a
                    href='#speciality'
                    className='flex items-center gap-3 bg-white px-8 py-4 rounded-full text-gray-800 font-semibold text-base hover:bg-blue-50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 shadow-lg group'
                >
                    Book appointment
                    <img className='w-3 group-hover:translate-x-1 transition-transform' src={assets.arrow_icon} alt="Arrow" />
                </a>
            </div>

            {/* --------- Header Right --------- */}
            <div className='md:w-1/2 flex items-center justify-center relative z-10 mt-8 md:mt-0'>
                <img
                    className='w-full max-w-md object-contain drop-shadow-2xl'
                    src={assets.header_img}
                    alt="Medical Professional"
                />
            </div>
        </div>
    )
}

export default Header