import React, { useState, useContext, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { specialityData } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const SpecialistFinder = ({ section }) => {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const { doctors, currencySymbol } = useContext(AppContext)

    // Onboarding flow states
    const [step, setStep] = useState(1)
    const [isAnimating, setIsAnimating] = useState(false)
    const [selectedSpeciality, setSelectedSpeciality] = useState('')
    const [availableOnly, setAvailableOnly] = useState(false)
    const [ratingPreference, setRatingPreference] = useState('all') // 'all' or 'top' (>= 4.5)
    const [feePreference, setFeePreference] = useState('all') // 'all', 'budget' (< 300)

    const getClinicalDescription = (speciality) => {
        const key = speciality.toLowerCase().replace(/\s+/g, '')
        return t(`specialistFinder.clinicalDescriptions.${key}`, t('specialistFinder.scheduleAnAppointment'))
    }

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

    // Smooth page transitions
    const handleNextStep = () => {
        if (step === 1 && !selectedSpeciality) return
        setIsAnimating(true)
        setTimeout(() => {
            setStep(prev => prev + 1)
            setIsAnimating(false)
        }, 250)
    }

    const handlePrevStep = () => {
        setIsAnimating(true)
        setTimeout(() => {
            setStep(prev => prev - 1)
            setIsAnimating(false)
        }, 250)
    }

    const resetFinder = () => {
        setIsAnimating(true)
        setTimeout(() => {
            setStep(1)
            setSelectedSpeciality('')
            setAvailableOnly(false)
            setRatingPreference('all')
            setFeePreference('all')
            setIsAnimating(false)
        }, 250)
    }

    // Dynamic Matching logic
    const matchedDoctors = useMemo(() => {
        if (!selectedSpeciality) return []

        return doctors.filter(doc => {
            const docSpeciality = doc.speciality || doc.specialization || ''
            if (docSpeciality.toLowerCase() !== selectedSpeciality.toLowerCase()) return false

            if (availableOnly && !doc.available) return false

            if (ratingPreference === 'top') {
                const avgRating = doc.numRatings > 0 ? doc.rating / doc.numRatings : 0
                if (avgRating < 4.5) return false
            }

            if (feePreference === 'budget') {
                if (Number(doc.fees) > 300) return false
            }

            return true
        })
    }, [doctors, selectedSpeciality, availableOnly, ratingPreference, feePreference])

    const doctorCountText = matchedDoctors.length === 1 
        ? t('specialistFinder.singleMatch') 
        : `${matchedDoctors.length} ${t('specialistFinder.matchesLabel')}`

    return (
        <div className={`text-gray-800 max-w-6xl mx-auto px-4 animate-fade-in-up ${section ? '' : 'py-12 md:py-20'}`}>
            {/* Header section with back button */}
            <div className={`${section ? 'mb-4' : 'mb-10'}`}>
                {!section && (
                    <button 
                        onClick={() => navigate(-1)} 
                        className='text-xs font-bold text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 mb-6 active:scale-95 duration-200'
                    >
                        {t('specialistFinder.backToPreviousPage')}
                    </button>
                )}
                <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
                    <div className='max-w-xl'>
                        <span className='text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 px-4 py-1.5 rounded-full inline-block mb-3'>
                            {t('specialistFinder.guidedMatchmaker')}
                        </span>
                        <h1 className='text-3xl md:text-4xl font-display font-extrabold text-text tracking-tight'>
                            {t('specialistFinder.interactiveFinder')}
                        </h1>
                        <p className='text-text-secondary text-sm mt-3 leading-relaxed font-medium'>
                            {t('specialistFinder.diagnosticMatching')}
                        </p>
                    </div>

                    {step > 1 && (
                        <button 
                            onClick={resetFinder}
                            className='text-xs font-bold text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 active:scale-95 duration-200'
                        >
                            {t('specialistFinder.resetStartOver')}
                        </button>
                    )}
                </div>
            </div>

            {/* Onboarding Container */}
            <div className='bg-white border border-border-light rounded-2xl shadow-sm overflow-hidden p-6 md:p-10 transition-all duration-500'>
                
                {/* Continuous Spring Progress Track */}
                <div className='mb-12 max-w-md'>
                    <div className='flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2.5'>
                        <span className={step >= 1 ? 'text-primary' : ''}>{t('specialistFinder.step1')}</span>
                        <span className={step >= 2 ? 'text-primary' : ''}>{t('specialistFinder.step2')}</span>
                        <span className={step >= 3 ? 'text-primary' : ''}>{t('specialistFinder.step3')}</span>
                    </div>
                    <div className='h-2 bg-gray-100 rounded-full overflow-hidden relative'>
                        <div 
                            className='h-full bg-primary rounded-full transition-all duration-600 cubic-bezier(0.16, 1, 0.3, 1)' 
                            style={{ 
                                width: step === 1 ? '33.3%' : step === 2 ? '66.6%' : '100%',
                                ...(i18n.dir() === 'rtl' ? { transform: 'scaleX(-1)' } : {})
                            }}
                        />
                    </div>
                </div>

                {/* Animated Inner Flow Container */}
                <div className={`transition-all duration-300 ease-out ${
                    isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                }`}>
                    
                    {/* Step 1: Select Specialty */}
                    {step === 1 && (
                        <div className='animate-fade-in-up duration-300'>
                            <h2 className='text-xl md:text-2xl font-extrabold text-gray-900 mb-6'>
                                {t('specialistFinder.whatDepartment')}
                            </h2>
                            
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
                                {specialityData.map((item, index) => {
                                    const isSelected = selectedSpeciality === item.speciality
                                    return (
                                        <button
                                            key={item.speciality}
                                            type="button"
                                            onClick={() => {
                                                setSelectedSpeciality(item.speciality)
                                                // Smooth auto-advance for polished UX
                                                setTimeout(() => {
                                                    handleNextStep()
                                                }, 250)
                                            }}
                                            style={{
                                                animationDelay: `${index * 40}ms`
                                            }}
                                            className={`flex items-start text-left rtl:text-right p-5 rounded-2xl border transition-all duration-300 group relative overflow-hidden active:scale-[0.98] animate-fade-in-up ${
                                                isSelected 
                                                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' 
                                                    : 'border-gray-100 bg-gray-50/40 hover:border-gray-200 hover:bg-gray-50/80 hover:shadow-md'
                                            }`}
                                        >
                                            <div className='w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white shadow-sm border border-gray-100 mr-4 rtl:ml-4 rtl:mr-0 transition-transform group-hover:scale-105'>
                                                <img className='w-8 h-8 object-contain' src={item.image} alt={item.speciality} />
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm transition-colors ${
                                                    isSelected ? 'text-primary' : 'text-gray-800'
                                                }`}>
                                                    {tSpeciality(item.speciality)}
                                                </p>
                                                <p className='text-gray-400 text-xs mt-1 leading-normal font-medium'>
                                                    {getClinicalDescription(item.speciality)}
                                                </p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>

                            <div className='flex justify-between items-center pt-6 border-t border-gray-50'>
                                <Link 
                                    to='/doctors' 
                                    className='text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors'
                                >
                                    {t('specialistFinder.browseAllSpecialists')}
                                </Link>

                                <button
                                    type="button"
                                    disabled={!selectedSpeciality}
                                    onClick={handleNextStep}
                                    className={`px-7 py-3 rounded-xl text-sm font-bold shadow-sm transition-all duration-300 active:scale-[0.97] ${
                                        selectedSpeciality 
                                            ? 'bg-primary text-white hover:shadow-lg hover:shadow-primary/20 cursor-pointer' 
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {t('specialistFinder.nextStep')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Preferences */}
                    {step === 2 && (
                        <div className='animate-fade-in-up duration-300 max-w-2xl'>
                            <h2 className='text-xl md:text-2xl font-extrabold text-gray-900 mb-6'>
                                {t('specialistFinder.tellUsPreference')} <span className='text-primary'>{tSpeciality(selectedSpeciality)}</span>
                            </h2>

                            <div className='space-y-6 mb-10'>
                                {/* Preference 1: Availability */}
                                <div className='flex flex-col gap-2 animate-fade-in-up' style={{ animationDelay: '50ms' }}>
                                    <span className='text-xs font-bold text-gray-400 uppercase tracking-wide'>{t('specialistFinder.appointmentSchedule')}</span>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                        <button
                                            type="button"
                                            onClick={() => setAvailableOnly(false)}
                                            className={`p-4 rounded-xl border text-left rtl:text-right text-sm font-bold transition-all duration-300 active:scale-[0.98] ${
                                                !availableOnly 
                                                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary shadow-sm' 
                                                    : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {t('specialistFinder.showAllSchedules')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAvailableOnly(true)}
                                            className={`p-4 rounded-xl border text-left rtl:text-right text-sm font-bold transition-all duration-300 active:scale-[0.98] ${
                                                availableOnly 
                                                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary shadow-sm' 
                                                    : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {t('specialistFinder.availableToday')}
                                        </button>
                                    </div>
                                </div>

                                {/* Preference 2: Ratings */}
                                <div className='flex flex-col gap-2 animate-fade-in-up' style={{ animationDelay: '100ms' }}>
                                    <span className='text-xs font-bold text-gray-400 uppercase tracking-wide'>{t('specialistFinder.doctorRating')}</span>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                        <button
                                            type="button"
                                            onClick={() => setRatingPreference('all')}
                                            className={`p-4 rounded-xl border text-left rtl:text-right text-sm font-bold transition-all duration-300 active:scale-[0.98] ${
                                                ratingPreference === 'all' 
                                                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary shadow-sm' 
                                                    : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {t('specialistFinder.allTrustedDoctors')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRatingPreference('top')}
                                            className={`p-4 rounded-xl border text-left rtl:text-right text-sm font-bold transition-all duration-300 active:scale-[0.98] ${
                                                ratingPreference === 'top' 
                                                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary shadow-sm' 
                                                    : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {t('specialistFinder.topRatedOnly')}
                                        </button>
                                    </div>
                                </div>

                                {/* Preference 3: Fees */}
                                <div className='flex flex-col gap-2 animate-fade-in-up' style={{ animationDelay: '150ms' }}>
                                    <span className='text-xs font-bold text-gray-400 uppercase tracking-wide'>{t('specialistFinder.consultationFeeLimit')}</span>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                        <button
                                            type="button"
                                            onClick={() => setFeePreference('all')}
                                            className={`p-4 rounded-xl border text-left rtl:text-right text-sm font-bold transition-all duration-300 active:scale-[0.98] ${
                                                feePreference === 'all' 
                                                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary shadow-sm' 
                                                    : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {t('specialistFinder.showAllFees')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFeePreference('budget')}
                                            className={`p-4 rounded-xl border text-left rtl:text-right text-sm font-bold transition-all duration-300 active:scale-[0.98] ${
                                                feePreference === 'budget' 
                                                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary shadow-sm' 
                                                    : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {t('specialistFinder.budgetFriendly')} {currencySymbol})
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className='flex justify-between items-center pt-6 border-t border-gray-50'>
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className='text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors active:scale-95 duration-200'
                                >
                                    {t('specialistFinder.back')}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className='px-7 py-3 rounded-xl text-sm font-bold bg-primary text-white hover:shadow-lg hover:shadow-primary/20 shadow-sm transition-all active:scale-[0.97]'
                                >
                                    {t('specialistFinder.findMatches')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Matches & Direct Booking */}
                    {step === 3 && (
                        <div className='animate-fade-in-up duration-300'>
                            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in-up' style={{ animationDelay: '50ms' }}>
                                <div>
                                    <h2 className='text-xl md:text-2xl font-extrabold text-gray-900'>
                                        {t('specialistFinder.yourCuratedMatches')} {tSpeciality(selectedSpeciality)} {t('specialistFinder.matches')}
                                    </h2>
                                    <p className='text-gray-400 text-sm font-semibold mt-1'>
                                        {t('specialistFinder.basedOnChoices')} <span className='text-primary font-bold'>{doctorCountText}</span>.
                                    </p>
                                </div>

                                {matchedDoctors.length > 0 && (
                                    <button
                                        onClick={() => navigate(`/doctors/${selectedSpeciality}`)}
                                        className='text-sm font-bold text-primary hover:underline self-start sm:self-center active:scale-95 duration-200'
                                    >
                                        {t('specialistFinder.viewAllSpecialists')}
                                    </button>
                                )}
                            </div>

                            {matchedDoctors.length > 0 ? (
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
                                    {matchedDoctors.slice(0, 6).map((item, index) => {
                                        const avgRating = item.numRatings > 0 ? item.rating / item.numRatings : 0
                                        const docId = item.id || item._id
                                        return (
                                            <div 
                                                key={docId}
                                                onClick={() => {
                                                    navigate(`/appointment/${docId}`)
                                                    scrollTo(0, 0)
                                                }}
                                                style={{
                                                    animationDelay: `${index * 50 + 100}ms`
                                                }}
                                                className='bg-gray-50/50 hover:bg-white rounded-3xl p-5 border border-gray-100 hover:shadow-xl hover:border-transparent transition-all duration-300 cursor-pointer flex flex-col justify-between group active:scale-[0.99] animate-fade-in-up'
                                            >
                                                <div>
                                                    <div className='flex items-center gap-4 mb-4'>
                                                        <div className='w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0'>
                                                            <img className='w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105' src={item.image} alt={item.name} />
                                                        </div>
                                                        <div>
                                                            <p className='text-xs font-bold text-gray-400 uppercase tracking-wide'>{item.degree}</p>
                                                            <h3 className='text-base font-extrabold text-gray-800 group-hover:text-primary transition-colors line-clamp-1'>
                                                                {item.name}
                                                            </h3>
                                                            <div className='flex items-center gap-1 mt-1'>
                                                                <span className={`w-2 h-2 rounded-full ${item.available ? "bg-green-500" : "bg-gray-400"}`}></span>
                                                                <span className={`text-[10px] font-bold ${item.available ? "text-green-700" : "text-gray-400"}`}>
                                                                    {item.available ? t('specialistFinder.available') : t('specialistFinder.scheduleFull')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className='text-gray-500 text-xs font-medium leading-relaxed line-clamp-2 mb-4'>
                                                        {item.about}
                                                    </p>
                                                </div>

                                                <div className='flex items-center justify-between pt-4 border-t border-gray-100/60'>
                                                    <div>
                                                        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-wider'>{t('specialistFinder.consultationFee')}</p>
                                                        <p className='text-sm font-extrabold text-gray-900'>{currencySymbol} {item.fees}</p>
                                                    </div>

                                                    <div className='flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-gray-100'>
                                                        <span className='text-yellow-500 text-xs font-extrabold'>★</span>
                                                        <span className='text-xs font-bold text-gray-700'>{avgRating > 0 ? avgRating.toFixed(1) : t('specialistFinder.new')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className='bg-gray-50/50 rounded-2xl p-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto mb-8 border border-dashed border-gray-200 animate-fade-in-up' style={{ animationDelay: '150ms' }}>
                                    <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xl font-bold mb-4'>?</div>
                                    <h3 className='text-base font-extrabold text-gray-800 mb-1'>{t('specialistFinder.noExactMatch')}</h3>
                                    <p className='text-xs text-gray-400 leading-relaxed font-semibold mb-6'>
                                        {t('specialistFinder.couldNotFind')} {tSpeciality(selectedSpeciality)}. {t('specialistFinder.tryLoosening')}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAvailableOnly(false)
                                            setRatingPreference('all')
                                            setFeePreference('all')
                                        }}
                                        className='text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/20 transition-all active:scale-95'
                                    >
                                        {t('specialistFinder.resetFilters')}
                                    </button>
                                </div>
                            )}

                            <div className='flex justify-between items-center pt-6 border-t border-gray-50'>
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className='text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors active:scale-95'
                                >
                                    {t('specialistFinder.back')}
                                </button>

                                <button
                                    type="button"
                                    onClick={resetFinder}
                                    className='text-sm font-bold text-primary hover:text-primary-dark transition-colors active:scale-95'
                                >
                                    {t('specialistFinder.startNewSearch')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SpecialistFinder