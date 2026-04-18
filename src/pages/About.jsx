import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div className="pb-20 animate-fade-in-up">

      {/* Header Section */}
      <div className='text-center pt-20 pb-16'>
        <h1 className='text-3xl md:text-5xl font-bold text-gray-900 tracking-tight'>
          Transforming <span className='bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600'>Healthcare</span> Access
        </h1>
        <p className='mt-4 text-gray-500 max-w-2xl mx-auto font-medium'>
          Discover the story behind Tabibi and our commitment to making high-quality medical care accessible to everyone, everywhere.
        </p>
      </div>

      {/* Main Content Section */}
      <div className='flex flex-col md:flex-row items-center gap-16 py-12 px-2'>
        <div className='relative group'>
          <div className='absolute -inset-4 bg-gradient-to-r from-primary/10 to-blue-400/10 rounded-[2.5rem] blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <img
            className='w-full md:max-w-[420px] rounded-[2rem] shadow-2xl relative z-10 transform group-hover:scale-[1.02] transition-transform duration-500'
            src={assets.about_image}
            alt="About Tabibi"
          />
        </div>

        <div className='flex flex-col gap-8 md:w-1/2'>
          <div className='space-y-6 text-gray-600 leading-relaxed text-lg'>
            <p>
              Welcome to <span className='text-primary font-bold'>Tabibi</span>, your trusted partner in managing your healthcare needs conveniently and efficiently. At Tabibi, we understand the challenges individuals face when it comes to scheduling doctor appointments and managing their health records.
            </p>
            <p>
              Tabibi is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service.
            </p>
          </div>

          <div className='bg-white p-8 rounded-[2rem] border border-blue-50 shadow-[0_10px_40px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-xl transition-all'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700'></div>
            <h3 className='text-xl font-bold text-gray-900 flex items-center gap-2 mb-4'>
              <span className='w-8 h-1 bg-primary rounded-full'></span>
              Our Vision
            </h3>
            <p className='text-gray-600 relative z-10 italic'>
              "Our vision at Tabibi is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it."
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className='mt-24'>
        <div className='flex items-center gap-3 mb-10'>
          <h2 className='text-2xl font-bold text-gray-900 uppercase tracking-widest'>Why Choose <span className='text-primary'>Us</span></h2>
          <div className='h-[2px] flex-1 bg-gradient-to-r from-primary/20 to-transparent'></div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {[
            {
              title: "EFFICIENCY",
              desc: "Streamlined appointment scheduling that fits into your busy lifestyle.",
              tag: "Time-saving"
            },
            {
              title: "CONVENIENCE",
              desc: "Access to a network of trusted healthcare professionals in your area.",
              tag: "Easy Access"
            },
            {
              title: "PERSONALIZATION",
              desc: "Tailored recommendations and reminders to help you stay on top of your health.",
              tag: "Core Focus"
            }
          ].map((item, index) => (
            <div
              key={index}
              className='group bg-white border border-gray-100 p-10 rounded-[2.5rem] hover:bg-primary transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-primary/30 relative overflow-hidden'
            >
              <div className='absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 group-hover:bg-white/10 rounded-full transition-colors'></div>
              <span className='text-[10px] font-bold tracking-[0.2em] text-primary group-hover:text-white/80 uppercase mb-4 block'>{item.tag}</span>
              <h4 className='text-xl font-black group-hover:text-white mb-4 transition-colors tracking-tight'>{item.title}</h4>
              <p className='text-gray-500 group-hover:text-white/90 leading-relaxed transition-colors'>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default About
