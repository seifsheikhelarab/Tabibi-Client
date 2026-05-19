import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { uploadApi } from '../api/client'

const MyProfile = () => {
    const { t } = useTranslation()
    const { patientData, setPatientData, updateUserProfileData, createPatientProfile, session } = useContext(AppContext)
    const [isEdit, setIsEdit] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Form validation states
    const [errors, setErrors] = useState({})
    const [shakeField, setShakeField] = useState('')

    const formatDate = (dateStr) => {
        if (!dateStr) return t('myProfile.notSet')
        const date = new Date(dateStr)
        return date.toLocaleDateString(i18n.language || 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }
    const { i18n } = useTranslation()
    const [image, setImage] = useState(false)
    const [newImageFile, setNewImageFile] = useState(null)

    useEffect(() => {
        if (!patientData && session?.user) {
            createPatientProfile({
                firstName: session.user.name?.split(' ')[0] || '',
                lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
                email: session.user.email
            })
        }
    }, [patientData, session?.user, createPatientProfile])

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setNewImageFile(file)
            setImage(URL.createObjectURL(file))
        }
    }

    // Real-time phone format check
    const validatePhone = (value) => {
        if (!value) return true; // Optional field
        const valid = /^\+?[0-9\s-]{7,15}$/.test(value)
        setErrors(prev => ({ ...prev, phone: !valid }))
        return valid
    }

    // Real-time text check
    const validateName = (name, field) => {
        const valid = name.trim().length > 0
        setErrors(prev => ({ ...prev, [field]: !valid }))
        return valid
    }

    const triggerShake = (field) => {
        setShakeField(field)
        setTimeout(() => setShakeField(''), 400)
    }

    const handleUpdateProfile = async () => {
        // Validate final inputs
        const isFirstNameValid = validateName(patientData?.firstName || '', 'firstName')
        const isLastNameValid = validateName(patientData?.lastName || '', 'lastName')
        const isPhoneValid = validatePhone(patientData?.phone || '');
            if (!isFirstNameValid) {
            triggerShake('firstName')
            return toast.error(t('myProfile.firstnameRequired'))
        }
        if (!isLastNameValid) {
            triggerShake('lastName')
            return toast.error(t('myProfile.lastnameRequired'))
        }
        if (!isPhoneValid) {
            triggerShake('phone')
            return toast.error(t('myProfile.validPhone'))
        }

        try {
            setIsSaving(true)
            let imageUrl = patientData?.image

            if (newImageFile) {
                const uploadResult = await uploadApi.uploadImage(newImageFile)
                imageUrl = uploadResult.url
            }

            // Optimistic 800ms loading visual delay for soothing UI consistency
            await new Promise(resolve => setTimeout(resolve, 800))

            const success = await updateUserProfileData({
                firstName: patientData?.firstName,
                lastName: patientData?.lastName,
                phone: patientData?.phone,
                address: patientData?.address,
                gender: patientData?.gender,
                dateOfBirth: patientData?.dateOfBirth,
                image: imageUrl
            })

            if (success) {
                setIsEdit(false)
                setNewImageFile(null)
                setImage(false)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsSaving(false)
        }
    }

    if (!patientData) {
        return (
            <div className='flex items-center justify-center min-h-[60vh]'>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    const fullName = `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim() || session?.user?.name || 'User'

    return (
        <div className='max-w-2xl mx-auto py-8 animate-fade-in-up relative'>
            
            {/* Optimistic saving progress element */}
            {isSaving && (
                <div className="absolute top-0 inset-x-0 h-1 bg-primary/10 overflow-hidden rounded-full z-50">
                    <div className="h-full bg-primary rounded-full animate-[pulse-ring_1.5s_infinite] w-2/3"></div>
                </div>
            )}

            <div className='flex flex-col sm:flex-row items-center gap-6 mb-10 bg-white p-6 rounded-2xl border border-border-light shadow-sm'>
                <div className='relative group'>
                    {isEdit ? (
                        <label htmlFor='image' className='cursor-pointer block relative overflow-hidden rounded-full border-4 border-white shadow-md'>
                            <div className='w-28 h-28 bg-gray-100 overflow-hidden relative'>
                                <img className='w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-75' src={image || patientData?.image || assets.profile_icon} alt="" />
                                <div className='absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                                    <img className='w-5 invert opacity-90' src={assets.upload_icon} alt="" />
                                </div>
                            </div>
                            <input onChange={handleImageChange} type="file" id="image" hidden accept="image/*" />
                        </label>
                    ) : (
                        <div className='w-28 h-28 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md transition-transform duration-500 hover:scale-105'>
                            <img className='w-full h-full object-cover' src={patientData?.image || assets.profile_icon} alt="" />
                        </div>
                    )}
                </div>

                <div className='flex-1 text-center sm:text-left w-full'>
                    {isEdit ? (
                        <div className="flex flex-col sm:flex-row gap-3.5 w-full">
                            <input 
                                className={`bg-gray-50/80 border px-4 py-3 rounded-xl text-lg font-bold w-full transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none ${
                                    errors.firstName ? 'border-red-400 bg-red-50/10' : 'border-gray-100'
                                } ${shakeField === 'firstName' ? 'animate-soft-shake' : ''}`} 
                                type="text"
                                onChange={(e) => {
                                    setPatientData(prev => ({ ...prev, firstName: e.target.value }))
                                    validateName(e.target.value, 'firstName')
                                }}
                                value={patientData?.firstName || ''} 
                                placeholder={t('myProfile.firstName')} 
                            />
                            <input 
                                className={`bg-gray-50/80 border px-4 py-3 rounded-xl text-lg font-bold w-full transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none ${
                                    errors.lastName ? 'border-red-400 bg-red-50/10' : 'border-gray-100'
                                } ${shakeField === 'lastName' ? 'animate-soft-shake' : ''}`} 
                                type="text"
                                onChange={(e) => {
                                    setPatientData(prev => ({ ...prev, lastName: e.target.value }))
                                    validateName(e.target.value, 'lastName')
                                }}
                                value={patientData?.lastName || ''} 
                                placeholder={t('myProfile.lastName')} 
                            />
                        </div>
                    ) : (
                        <h1 className='text-3xl font-display font-extrabold text-text tracking-tight transition-all duration-300'>{fullName}</h1>
                    )}
                    <p className='text-text-muted mt-1 font-medium text-sm'>{patientData?.email || session?.user?.email}</p>
                </div>
            </div>

            <div className='bg-white rounded-2xl p-6 border border-border-light shadow-sm mb-6'>
                <h2 className='text-xs font-bold text-text-muted uppercase tracking-widest mb-5'>{t('myProfile.contactDetails')}</h2>
                <div className='space-y-4'>
                    <div className='flex justify-between items-center py-2 border-b border-border-light'>
                        <span className='text-text-secondary font-medium text-sm'>{t('myProfile.emailAddress')}</span>
                        <span className='text-text font-semibold text-sm'>{patientData?.email || session?.user?.email}</span>
                    </div>
                    
                    <div className='flex justify-between items-center py-2 border-b border-border-light'>
                        <span className='text-text-secondary font-medium text-sm'>{t('myProfile.mobilePhone')}</span>
                        {isEdit ? (
                            <input 
                                className={`bg-gray-50/80 border px-4 py-2.5 rounded-xl text-right text-sm transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none max-w-[200px] ${
                                    errors.phone ? 'border-red-400 bg-red-50/10' : 'border-gray-100'
                                } ${shakeField === 'phone' ? 'animate-soft-shake' : ''}`} 
                                type="text"
                                onChange={(e) => {
                                    setPatientData(prev => ({ ...prev, phone: e.target.value }))
                                    validatePhone(e.target.value)
                                }}
                                value={patientData?.phone || ''} 
                                placeholder={t('myProfile.addMobilePhone')} 
                            />
                        ) : (
                            <span className='text-text font-semibold text-sm'>{patientData?.phone || t('myProfile.notProvided')}</span>
                        )}
                    </div>

                    <div className='flex justify-between items-center py-2'>
                        <span className='text-text-secondary font-medium text-sm'>{t('myProfile.homeAddress')}</span>
                        {isEdit ? (
                            <input 
                                className='bg-gray-50/80 border border-gray-100 px-4 py-2.5 rounded-xl text-right text-sm transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none max-w-[240px]' 
                                type="text"
                                onChange={(e) => setPatientData(prev => ({ ...prev, address: e.target.value }))}
                                value={patientData?.address || ''} 
                                placeholder={t('myProfile.addHomeAddress')} 
                            />
                        ) : (
                            <span className='text-text font-semibold text-sm'>{patientData?.address || t('myProfile.notProvided')}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className='bg-white rounded-2xl p-6 border border-border-light shadow-sm mb-6'>
                <h2 className='text-xs font-bold text-text-muted uppercase tracking-widest mb-5'>{t('myProfile.personalDetails')}</h2>
                <div className='space-y-4'>
                    <div className='flex justify-between items-center py-2 border-b border-border-light'>
                        <span className='text-text-secondary font-medium text-sm'>{t('myProfile.gender')}</span>
                        {isEdit ? (
                            <select 
                                className='bg-gray-50/80 border border-gray-100 px-4 py-2.5 rounded-xl text-sm transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none cursor-pointer text-gray-700 font-medium'
                                onChange={(e) => setPatientData(prev => ({ ...prev, gender: e.target.value }))}
                                value={patientData?.gender || 'Not Selected'} 
                            >
                                <option value="Not Selected">{t('myProfile.preferNotToSay')}</option>
                                <option value="Male">{t('myProfile.male')}</option>
                                <option value="Female">{t('myProfile.female')}</option>
                            </select>
                        ) : (
                            <span className='text-text font-semibold text-sm'>{patientData?.gender || t('myProfile.notSpecified')}</span>
                        )}
                    </div>
                    
                    <div className='flex justify-between items-center py-2'>
                        <span className='text-text-secondary font-medium text-sm'>{t('myProfile.dateOfBirth')}</span>
                        {isEdit ? (
                            <input 
                                className='bg-gray-50/80 border border-gray-100 px-4 py-2.5 rounded-xl text-sm transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-gray-700 font-medium' 
                                type='date'
                                onChange={(e) => setPatientData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                value={patientData?.dateOfBirth ? patientData.dateOfBirth.split('T')[0] : ''} 
                            />
                        ) : (
                            <span className='text-text font-semibold text-sm'>{formatDate(patientData?.dateOfBirth)}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className='flex justify-end gap-3'>
                {isEdit && (
                    <button 
                        onClick={() => {
                            setIsEdit(false)
                            setErrors({})
                        }} 
                        disabled={isSaving}
                        className='px-6 py-3 rounded-xl border border-border text-text-secondary hover:bg-surface-raised transition-all font-semibold active:scale-[0.97] text-sm disabled:opacity-40'
                    >
                        {t('myProfile.cancel')}
                    </button>
                )}
                {isEdit ? (
                    <button 
                        onClick={handleUpdateProfile} 
                        disabled={isSaving}
                        className='px-7 py-3 rounded-xl bg-primary text-white hover:opacity-95 transition-all font-semibold active:scale-[0.97] shadow-md text-sm disabled:opacity-40 flex items-center gap-2'
                    >
                        {isSaving ? t('myProfile.savingChanges') : t('myProfile.saveChanges')}
                    </button>
                ) : (
                    <button 
                        onClick={() => setIsEdit(true)} 
                        className='px-7 py-3 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white transition-all font-semibold active:scale-[0.97] text-sm'
                    >
                        {t('myProfile.editInformation')}
                    </button>
                )}
            </div>
        </div>
    )
}

export default MyProfile