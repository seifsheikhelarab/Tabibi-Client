import React from 'react'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation()

  return (
    <div className='mt-24 border-t border-border-light'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-10'>
          <div className='md:col-span-1'>
            <img className='mb-4 w-28' src={assets.logo} alt="Tabibi" />
            <p className='text-text-secondary leading-relaxed text-sm'>
              {t('footer.yourTrustedPlatform')}
            </p>
          </div>

          <div>
            <h4 className='text-sm font-semibold text-text mb-4'>{t('footer.company')}</h4>
            <ul className='flex flex-col gap-3 text-text-secondary text-sm'>
              <li><NavLink to='/' className='hover:text-primary transition-colors'>{t('footer.home')}</NavLink></li>
              <li><NavLink to='/about' className='hover:text-primary transition-colors'>{t('footer.aboutUs')}</NavLink></li>
              <li><NavLink to='/contact' className='hover:text-primary transition-colors'>{t('footer.contact')}</NavLink></li>
            </ul>
          </div>

          <div>
            <h4 className='text-sm font-semibold text-text mb-4'>{t('footer.services')}</h4>
            <ul className='flex flex-col gap-3 text-text-secondary text-sm'>
              <li><NavLink to='/doctors' className='hover:text-primary transition-colors'>{t('footer.findDoctors')}</NavLink></li>
              <li><NavLink to='/collaborations' className='hover:text-primary transition-colors'>{t('footer.pharmacies')}</NavLink></li>
              <li><NavLink to='/collaborations' className='hover:text-primary transition-colors'>{t('footer.labTests')}</NavLink></li>
            </ul>
          </div>

          <div>
            <h4 className='text-sm font-semibold text-text mb-4'>{t('footer.getInTouch')}</h4>
            <ul className='flex flex-col gap-3 text-text-secondary text-sm'>
              <li>support@tabibi.com</li>
              <li>+20 123 456 7890</li>
            </ul>
          </div>
        </div>

        <div className='border-t border-border-light mt-10 pt-6'>
          <p className='text-center text-sm text-text-muted'>{t('footer.allRightsReserved')}</p>
        </div>
      </div>
    </div>
  )
}

export default Footer