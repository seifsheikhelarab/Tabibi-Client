import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div className='pb-28 animate-fade-in-up'>

      {/* Header Section */}
      <div className='text-center pt-20 pb-16'>
        <h1 className='text-3xl md:text-5xl font-bold text-gray-900 tracking-tight'>
          Get in <span className='bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600'>Touch</span> with Us
        </h1>
        <p className='mt-4 text-gray-500 max-w-2xl mx-auto font-medium'>
          Have questions or need assistance? Our team is here to help you every step of the way. Reach out to us anytime.
        </p>
      </div>

      <div className='flex flex-col md:flex-row items-center justify-center gap-16 py-12'>

        {/* Image Section */}
        <div className='relative group'>
          <div className='absolute -inset-4 bg-gradient-to-r from-primary/10 to-blue-400/10 rounded-[2.5rem] blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <img
            className='w-full md:max-w-[380px] rounded-[2rem] shadow-2xl relative z-10 transform group-hover:scale-[1.02] transition-transform duration-500'
            src={assets.contact_image}
            alt="Contact Tabibi"
          />
        </div>

        {/* Info Section */}
        <div className='flex flex-col gap-10 md:w-1/2 max-w-lg'>

          {/* Office Card */}
          <div className='bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-2 h-full bg-primary group-hover:w-full transition-all duration-500 opacity-5 group-hover:opacity-10'></div>
            <h3 className='text-xl font-bold text-gray-900 tracking-tight mb-4 flex items-center gap-2'>
              <span className='w-8 h-1 bg-primary rounded-full'></span>
              OUR OFFICE
            </h3>
            <div className='space-y-3 text-gray-600 font-medium'>
              <p className='text-lg'>54709 Willms Station</p>
              <p>Suite 350, Washington, USA</p>
              <div className='pt-2 space-y-2 text-primary'>
                <p className='flex items-center gap-2'>
                  <span className='font-bold text-gray-900'>Tel:</span> (415) 555-0132
                </p>
                <p className='flex items-center gap-2'>
                  <span className='font-bold text-gray-900'>Email:</span> greatstackdev@gmail.com
                </p>
              </div>
            </div>
          </div>

          {/* Careers Card */}
          <div className='bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700'></div>
            <h3 className='text-xl font-bold tracking-tight mb-4'>CAREERS AT TABIBI</h3>
            <p className='text-gray-300 mb-8 font-medium italic'>Learn more about our teams and job openings.</p>
            <button className='w-full sm:w-auto px-10 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-primary hover:text-white transition-all transform active:scale-95 shadow-lg'>
              Explore Jobs
            </button>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Contact
