import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Banner = () => {

    const navigate = useNavigate()

    return (
        <div className='relative flex bg-gradient-to-br from-primary via-primary to-blue-600 rounded-[3rem] px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-10 overflow-hidden shadow-2xl shadow-primary/20'>

            {/* Background Decorations */}
            <div className='absolute top-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -ml-40 -mt-40'></div>
            <div className='absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mb-32'></div>

            {/* ------- Left Side ------- */}
            <div className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5 relative z-10'>
                <div className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight'>
                    <p>Book Appointment</p>
                    <p className='mt-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100'>
                        With 100+ Trusted Doctors
                    </p>
                </div>
                <button
                    onClick={() => { navigate('/login'); scrollTo(0, 0) }}
                    className='bg-white text-sm sm:text-base text-gray-900 font-bold px-10 py-4 rounded-full mt-8 hover:bg-gray-50 hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl'
                >
                    Create account
                </button>
            </div>

            {/* ------- Right Side ------- */}
            <div className='hidden md:block md:w-1/2 lg:w-[370px] relative z-10'>
                <img
                    className='w-full absolute bottom-0 right-0 max-w-md transform hover:scale-105 transition-transform duration-700'
                    src={assets.appointment_img}
                    alt="Book Appointment"
                />
            </div>
        </div>
    )
}

export default Banner