import React from 'react'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom'

const Footer = () => {
  return (
    <div className='border-t border-gray-100 mt-20'>
      <div className='max-w-7xl mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-10'>
          <div className='md:col-span-1'>
            <img className='mb-5 w-28' src={assets.logo} alt="Tabibi" />
            <p className='text-gray-500 leading-relaxed text-sm'>
              Your trusted platform for booking appointments with healthcare professionals. Making quality healthcare accessible to everyone.
            </p>
          </div>

          <div>
            <h4 className='text-sm font-semibold text-gray-800 mb-4'>Company</h4>
            <ul className='flex flex-col gap-3 text-gray-500 text-sm'>
              <li><NavLink to='/' className='hover:text-primary transition-colors'>Home</NavLink></li>
              <li><NavLink to='/about' className='hover:text-primary transition-colors'>About Us</NavLink></li>
              <li><NavLink to='/contact' className='hover:text-primary transition-colors'>Contact</NavLink></li>
            </ul>
          </div>

          <div>
            <h4 className='text-sm font-semibold text-gray-800 mb-4'>Services</h4>
            <ul className='flex flex-col gap-3 text-gray-500 text-sm'>
              <li><NavLink to='/doctors' className='hover:text-primary transition-colors'>Find Doctors</NavLink></li>
              <li><NavLink to='/collaborations' className='hover:text-primary transition-colors'>Pharmacies</NavLink></li>
              <li><NavLink to='/collaborations' className='hover:text-primary transition-colors'>Lab Tests</NavLink></li>
            </ul>
          </div>

          <div>
            <h4 className='text-sm font-semibold text-gray-800 mb-4'>Get in Touch</h4>
            <ul className='flex flex-col gap-3 text-gray-500 text-sm'>
              <li>support@tabibi.com</li>
              <li>+20 123 456 7890</li>
            </ul>
          </div>
        </div>

        <div className='border-t border-gray-100 mt-10 pt-6'>
          <p className='text-center text-sm text-gray-400'>© 2024 Tabibi. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Footer
