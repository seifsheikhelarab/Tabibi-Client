import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { uploadApi } from '../api/client'

const MyProfile = () => {
    const { patientData, setPatientData, updateUserProfileData, createPatientProfile, session } = useContext(AppContext)
    const [isEdit, setIsEdit] = useState(false)

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Not set'
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }
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

    const handleUpdateProfile = async () => {
        try {
            let imageUrl = patientData?.image

            if (newImageFile) {
                const uploadResult = await uploadApi.uploadImage(newImageFile)
                imageUrl = uploadResult.url
            }

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
        <div className='max-w-2xl mx-auto py-8 animate-fade-in-up'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row items-center gap-6 mb-10'>
                <div className='relative'>
                    {isEdit
                        ? <label htmlFor='image' className='cursor-pointer block'>
                            <div className='w-28 h-28 rounded-full overflow-hidden bg-gray-100'>
                                <img className='w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity' src={image || patientData?.image || assets.profile_icon} alt="" />
                            </div>
                            <div className='absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center'>
                                <img className='w-4' src={assets.upload_icon} alt="" />
                            </div>
                            <input onChange={handleImageChange} type="file" id="image" hidden accept="image/*" />
                        </label>
                        : <div className='w-28 h-28 rounded-full overflow-hidden bg-gray-100'>
                            <img className='w-full h-full object-cover' src={patientData?.image || assets.profile_icon} alt="" />
                        </div>
                    }
                </div>

                <div className='flex-1 text-center sm:text-left'>
                    {isEdit
                        ? (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input className='bg-gray-50 px-4 py-3 rounded-lg text-xl font-medium w-full' type="text"
                                    onChange={(e) => setPatientData(prev => ({ ...prev, firstName: e.target.value }))}
                                    value={patientData?.firstName || ''} placeholder="First name" />
                                <input className='bg-gray-50 px-4 py-3 rounded-lg text-xl font-medium w-full' type="text"
                                    onChange={(e) => setPatientData(prev => ({ ...prev, lastName: e.target.value }))}
                                    value={patientData?.lastName || ''} placeholder="Last name" />
                            </div>
                        )
                        : <h1 className='text-2xl font-semibold text-gray-800'>{fullName}</h1>
                    }
                    <p className='text-gray-500 mt-1'>{patientData?.email || session?.user?.email}</p>
                </div>
            </div>

            {/* Contact Information */}
            <div className='bg-white rounded-2xl p-6 shadow-sm mb-6'>
                <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4'>Contact Information</h2>
                <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                        <span className='text-gray-500'>Email</span>
                        <span className='text-gray-800'>{patientData?.email || session?.user?.email}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                        <span className='text-gray-500'>Phone</span>
                        {isEdit
                            ? <input className='bg-gray-50 px-3 py-2 rounded-lg text-right' type="text"
                                onChange={(e) => setPatientData(prev => ({ ...prev, phone: e.target.value }))}
                                value={patientData?.phone || ''} placeholder="Add phone number" />
                            : <span className='text-gray-800'>{patientData?.phone || 'Not set'}</span>
                        }
                    </div>
                    <div className='flex justify-between items-center'>
                        <span className='text-gray-500'>Address</span>
                        {isEdit
                            ? <input className='bg-gray-50 px-3 py-2 rounded-lg text-right' type="text"
                                onChange={(e) => setPatientData(prev => ({ ...prev, address: e.target.value }))}
                                value={patientData?.address || ''} placeholder="Add address" />
                            : <span className='text-gray-800'>{patientData?.address || 'Not set'}</span>
                        }
                    </div>
                </div>
            </div>

            {/* Basic Information */}
            <div className='bg-white rounded-2xl p-6 shadow-sm mb-6'>
                <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4'>Basic Information</h2>
                <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                        <span className='text-gray-500'>Gender</span>
                        {isEdit
                            ? <select className='bg-gray-50 px-3 py-2 rounded-lg'
                                onChange={(e) => setPatientData(prev => ({ ...prev, gender: e.target.value }))}
                                value={patientData?.gender || 'Not Selected'} >
                                <option value="Not Selected">Not Selected</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                            : <span className='text-gray-800'>{patientData?.gender || 'Not set'}</span>
                        }
                    </div>
                    <div className='flex justify-between items-center'>
                        <span className='text-gray-500'>Birthday</span>
                        {isEdit
                            ? <input className='bg-gray-50 px-3 py-2 rounded-lg' type='date'
                                onChange={(e) => setPatientData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                value={patientData?.dateOfBirth ? patientData.dateOfBirth.split('T')[0] : ''} />
                            : <span className='text-gray-800'>{formatDate(patientData?.dateOfBirth)}</span>
                        }
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className='flex justify-end gap-3'>
                {isEdit
                    ? <button onClick={() => setIsEdit(false)} className='px-6 py-3 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors'>Cancel</button>
                    : null
                }
                {isEdit
                    ? <button onClick={handleUpdateProfile} className='px-6 py-3 rounded-full bg-primary text-white hover:opacity-90 transition-all'>Save Changes</button>
                    : <button onClick={() => setIsEdit(true)} className='px-6 py-3 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-all'>Edit Profile</button>
                }
            </div>
        </div>
    )
}

export default MyProfile
