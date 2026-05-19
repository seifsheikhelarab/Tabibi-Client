import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Banner = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <div className='relative flex bg-primary rounded-[2rem] px-6 sm:px-10 md:px-14 my-20 overflow-hidden shadow-lg'>
            <div className='absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-[80px] -ml-36 -mt-36'></div>
            <div className='absolute bottom-0 right-0 w-56 h-56 bg-white/5 rounded-full blur-[60px] -mr-28 -mb-28'></div>

            <div className='flex-1 py-10 sm:py-14 md:py-20 lg:pl-5 relative z-10'>
                <div className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white leading-tight'>
                    <p>{t('banner.bookAppointment')}</p>
                    <p className='mt-3 text-blue-100'>
                        {t('banner.with100Doctors')}
                    </p>
                </div>
                <button
                    onClick={() => { navigate('/login'); scrollTo(0, 0) }}
                    className='bg-white text-sm sm:text-base text-text font-semibold px-9 py-3.5 rounded-xl mt-6 hover:bg-white/95 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 shadow-lg active:scale-[0.98]'
                >
                    {t('banner.createAccount')}
                </button>
            </div>

            <div className='hidden md:block md:w-1/2 lg:w-[370px] relative z-10'>
                <img
                    className='w-full absolute bottom-0 right-0 max-w-md hover:scale-105 transition-transform duration-700'
                    src={assets.appointment_img}
                    alt="Book Appointment"
                />
            </div>
        </div>
    )
}

export default Banner