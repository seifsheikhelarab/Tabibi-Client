import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'

const TopDoctors = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { doctors } = useContext(AppContext)
    const doctorList = Array.isArray(doctors) ? doctors : []

    const getDoctorName = (doc) => {
        if (doc.name) return doc.name;
        return `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || 'Doctor';
    };

    const getDoctorId = (doc) => doc.id || doc._id;

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-text animate-fade-in-up'>
            <h2 className='text-3xl font-display font-extrabold text-text tracking-tight'>{t('topDoctors.topDoctors')}</h2>
            <p className='sm:w-1/3 text-center text-sm text-text-secondary font-medium'>{t('topDoctors.browseList')}</p>
            <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pt-5'>
                {doctorList.slice(0, 8).map((item, index) => {
                    const docId = getDoctorId(item);
                    const docName = getDoctorName(item);
                    const avgRating = item.numRatings > 0 ? item.rating / item.numRatings : 0;

                    return (
                        <div 
                            onClick={() => { navigate(`/appointment/${docId}`); scrollTo(0, 0) }} 
                            style={{ animationDelay: `${index * 40}ms` }}
                            className='bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-border-light hover:shadow-md transition-all duration-300 animate-fade-in-up' 
                            key={docId}
                        >
                            <div className='relative overflow-hidden aspect-square bg-surface-raised'>
                                <img className='w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105' src={item.image || assets.doc_img} alt="" />
                                <div className='absolute bottom-3 left-3'>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white shadow-sm`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.available ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        <span className={item.available ? 'text-green-700' : 'text-text-muted'}>
                                            {item.available ? t('doctors.available') : t('doctors.busy')}
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <div className='p-4'>
                                <p className='text-text-muted text-xs font-semibold uppercase tracking-wider mb-0.5'>{item.speciality || item.specialization}</p>
                                <p className='text-base font-bold text-text line-clamp-1'>{docName}</p>
                                <div className='flex items-center justify-between mt-3 pt-3 border-t border-border-light'>
                                    <div className='flex items-center gap-1'>
                                        <span className='text-amber text-sm font-bold'>&#9733; {avgRating.toFixed(1)}</span>
                                        <span className='text-xs text-text-muted font-medium'>({item.numRatings || 0})</span>
                                    </div>
                                    <span className='text-xs font-semibold bg-primary/5 text-primary px-2.5 py-1 rounded-lg'>
                                        {item.experience}y
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <button 
                onClick={() => { navigate('/doctors'); scrollTo(0, 0) }} 
                className='bg-primary/5 text-primary hover:bg-primary hover:text-white px-10 py-3.5 rounded-xl mt-8 transition-all duration-300 font-semibold text-sm active:scale-[0.97]'
            >
                {t('topDoctors.viewAllDoctors')}
            </button>
        </div>
    )
}

export default TopDoctors