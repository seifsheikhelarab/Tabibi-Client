import React from 'react'
import { useTranslation } from 'react-i18next'
import { assets } from '../assets/assets'

const Contact = () => {
  const { t } = useTranslation()
  return (
    <div className='pb-28 animate-fade-in-up'>

      <div className='text-center pt-20 pb-16'>
        <h1 className='text-3xl md:text-5xl font-display font-extrabold text-text tracking-tight'>
          {t('contact.getInTouch')} <span className='text-primary'>{t('contact.touch')}</span> {t('contact.withUs')}
        </h1>
        <p className='mt-3 text-text-secondary max-w-2xl mx-auto font-medium'>
          {t('contact.haveQuestions')}
        </p>
      </div>

      <div className='flex flex-col md:flex-row items-center justify-center gap-16 py-12'>

        <div className='relative group'>
          <div className='absolute -inset-4 bg-gradient-to-r from-primary/10 to-blue-400/10 rounded-[2rem] blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <img
            className='w-full md:max-w-[380px] rounded-[1.8rem] shadow-lg relative z-10 transform group-hover:scale-[1.02] transition-transform duration-500'
            src={assets.contact_image}
            alt="Contact Tabibi"
          />
        </div>

        <div className='flex flex-col gap-8 md:w-1/2 max-w-lg'>

          <div className='bg-white p-7 rounded-2xl border border-border-light shadow-sm hover:shadow-md transition-all'>
            <h3 className='text-lg font-display font-bold text-text tracking-tight mb-3 flex items-center gap-3'>
              <span className='w-6 h-0.5 bg-primary rounded-full'></span>
              {t('contact.ourOffice')}
            </h3>
            <div className='space-y-2 text-text-secondary font-medium'>
              <p className='text-base'>54709 Willms Station</p>
              <p>Suite 350, Washington, USA</p>
              <div className='pt-2 space-y-1.5 text-primary'>
                <p className='flex items-center gap-2'>
                  <span className='font-semibold text-text'>{t('contact.tel')}</span> (415) 555-0132
                </p>
                <p className='flex items-center gap-2'>
                  <span className='font-semibold text-text'>{t('contact.email')}</span> greatstackdev@gmail.com
                </p>
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-gray-900 to-gray-800 p-7 rounded-2xl text-white shadow-lg relative overflow-hidden group'>
            <div className='absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -mr-14 -mt-14 group-hover:scale-150 transition-transform duration-700'></div>
            <h3 className='text-lg font-display font-bold tracking-tight mb-3'>{t('contact.careersAtTabibi')}</h3>
            <p className='text-gray-300 mb-6 font-medium italic'>{t('contact.learnMore')}</p>
            <button className='w-full sm:w-auto px-9 py-3.5 bg-white text-text font-bold rounded-xl hover:bg-primary hover:text-white transition-all active:scale-[0.97] shadow-md'>
              {t('contact.exploreJobs')}
            </button>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Contact