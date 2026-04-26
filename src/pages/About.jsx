import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div className="pb-20 animate-fade-in-up">

      {/* Header Section */}
      <div className='text-center pt-20 pb-16 px-4'>
        <h1 className='text-3xl md:text-5xl font-semibold text-gray-800'>
          Transforming Healthcare Access
        </h1>
        <p className='mt-4 text-gray-500 max-w-2xl mx-auto'>
          Discover the story behind Tabibi and our commitment to making high-quality medical care accessible to everyone, everywhere.
        </p>
      </div>

      {/* Main Content Section */}
      <div className='flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-12 px-6 max-w-7xl mx-auto'>
        <div className='relative'>
          <img
            className='w-full lg:max-w-md rounded-3xl shadow-xl'
            src={assets.about_image}
            alt="About Tabibi"
          />
        </div>

        <div className='flex flex-col gap-8 flex-1'>
          <div className='space-y-6 text-gray-600 leading-relaxed'>
            <p>
              Welcome to <span className='text-primary font-medium'>Tabibi</span>, your trusted partner in managing your healthcare needs conveniently and efficiently. At Tabibi, we understand the challenges individuals face when it comes to scheduling doctor appointments and managing their health records.
            </p>
            <p>
              Tabibi is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service.
            </p>
          </div>

          <div className='bg-white p-8 rounded-2xl shadow-sm relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16'></div>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>
              Our Vision
            </h3>
            <p className='text-gray-500 relative z-10 italic'>
              "Our vision at Tabibi is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it."
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className='mt-24 px-6 max-w-7xl mx-auto'>
        <div className='mb-10'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-2'>Why Choose Us</h2>
          <div className='h-px w-16 bg-primary'></div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {[
            {
              title: "Efficiency",
              desc: "Streamlined appointment scheduling that fits into your busy lifestyle.",
              tag: "Time-saving"
            },
            {
              title: "Convenience",
              desc: "Access to a network of trusted healthcare professionals in your area.",
              tag: "Easy Access"
            },
            {
              title: "Personalization",
              desc: "Tailored recommendations and reminders to help you stay on top of your health.",
              tag: "Core Focus"
            }
          ].map((item, index) => (
            <div
              key={index}
              className='bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group'
            >
              <span className='text-xs font-medium text-primary mb-3 block'>{item.tag}</span>
              <h4 className='text-lg font-semibold text-gray-800 mb-3 group-hover:text-primary transition-colors'>{item.title}</h4>
              <p className='text-gray-500 leading-relaxed'>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default About
