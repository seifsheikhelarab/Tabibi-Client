import React from 'react'
import { useTranslation } from 'react-i18next'
import { specialityData } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'

const SpecialityMenu = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const specialityKeys = {
        'Cardiology': 'cardiology',
        'Neurology': 'neurology',
        'General Surgery': 'generalSurgery',
        'Urology': 'urology',
        'Orthopedics': 'orthopedics',
        'Dentistry': 'dentistry',
        'Ear, Nose and Throat': 'ent',
        'Dermatology': 'dermatology',
        'Ophthalmology': 'ophthalmology',
        'Gastroenterology': 'gastroenterology'
    }

    const tSpeciality = (name) => {
        const key = specialityKeys[name]
        return key ? t(`specialities.${key}`) : name
    }

    return (
        <div id='speciality' className='flex flex-col items-center gap-6 py-20 text-text'>
            <div className='text-center max-w-xl mx-auto'>
                <h2 className='text-3xl sm:text-4xl font-display font-extrabold text-text tracking-tight'>{t('specialityMenu.findBySpeciality')}</h2>
                <p className='text-sm text-text-secondary mt-2 font-medium leading-relaxed'>
                    {t('specialityMenu.browseList')}
                </p>
            </div>

            <div className='flex sm:justify-center gap-6 pt-6 w-full overflow-x-auto pb-4 px-4 sm:overflow-x-hidden'>
                {specialityData.map((item, index) => (
                    <Link to={`/doctors/${item.speciality}`} onClick={() => scrollTo(0, 0)} className='flex flex-col items-center text-xs cursor-pointer flex-shrink-0 group' key={index}>
                        <div className='w-16 sm:w-24 h-16 sm:h-24 rounded-2xl bg-primary/5 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-all duration-500'>
                            <img className='w-10 sm:w-14 transition-transform duration-500 group-hover:scale-110' src={item.image} alt="" />
                        </div>
                        <p className='text-text-secondary group-hover:text-primary transition-colors duration-300 font-semibold'>{item.speciality}</p>
                    </Link>
                ))}
            </div>

            <div className='w-full max-w-4xl mx-auto mt-6 px-4'>
                <div className='bg-primary/[0.03] border border-primary/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6'>
                    <div className='max-w-lg text-center md:text-left'>
                        <span className='text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider'>{t('specialityMenu.guidedMatching')}</span>
                        <h3 className='text-lg font-display font-extrabold text-text mt-2'>{t('specialityMenu.notSureWhichDoctor')}</h3>
                        <p className='text-text-secondary text-xs mt-1 font-medium leading-normal'>
                            {t('specialityMenu.useGuidedFinder')}
                        </p>
                    </div>
                    <button 
                        onClick={() => {
                            navigate('/find-specialist')
                            scrollTo(0, 0)
                        }}
                        className='bg-primary text-white font-bold text-xs px-6 py-3.5 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all whitespace-nowrap active:scale-[0.97]'
                    >
                        {t('specialityMenu.trySpecialistFinder')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SpecialityMenu