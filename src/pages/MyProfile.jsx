import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { uploadApi } from '../api/client'

const MyProfile = () => {
    const { patientData, setPatientData, updateUserProfileData, loadPatientData, createPatientProfile, session } = useContext(AppContext)
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
        <div className='max-w-lg flex flex-col gap-2 text-sm pt-5'>

            {isEdit
                ? <label htmlFor='image' >
                    <div className='inline-block relative cursor-pointer'>
                        <img className='w-36 rounded opacity-75' src={image || patientData?.image || assets.profile_icon} alt="" />
                        <img className='w-10 absolute bottom-12 right-12' src={assets.upload_icon} alt="" />
                    </div>
                    <input onChange={handleImageChange} type="file" id="image" hidden accept="image/*" />
                </label>
                : <img className='w-36 rounded' src={patientData?.image || assets.profile_icon} alt="" />
            }

            {isEdit
                ? (
                    <div className="flex gap-2">
                        <input className='bg-gray-50 text-3xl font-medium max-w-60' type="text"
                            onChange={(e) => setPatientData(prev => ({ ...prev, firstName: e.target.value }))}
                            value={patientData?.firstName || ''} placeholder="First name" />
                        <input className='bg-gray-50 text-3xl font-medium max-w-60' type="text"
                            onChange={(e) => setPatientData(prev => ({ ...prev, lastName: e.target.value }))}
                            value={patientData?.lastName || ''} placeholder="Last name" />
                    </div>
                )
                : <p className='font-medium text-3xl text-[#262626] mt-4'>{fullName}</p>
            }

            <hr className='bg-[#ADADAD] h-[1px] border-none' />

            <div>
                <p className='text-gray-600 underline mt-3'>CONTACT INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-[#363636]'>
                    <p className='font-medium'>Email id:</p>
                    <p className='text-blue-500'>{patientData?.email || session?.user?.email}</p>
                    <p className='font-medium'>Phone:</p>

                    {isEdit
                        ? <input className='bg-gray-50 max-w-52' type="text"
                            onChange={(e) => setPatientData(prev => ({ ...prev, phone: e.target.value }))}
                            value={patientData?.phone || ''} />
                        : <p className='text-blue-500'>{patientData?.phone || 'Not set'}</p>
                    }

                    <p className='font-medium'>Address:</p>

                    {isEdit
                        ? <input className='bg-gray-50' type="text"
                            onChange={(e) => setPatientData(prev => ({ ...prev, address: e.target.value }))}
                            value={patientData?.address || ''} />
                        : <p className='text-gray-500'>{patientData?.address || 'Not set'}</p>
                    }

                </div>
            </div>
            <div>
                <p className='text-[#797979] underline mt-3'>BASIC INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-gray-600'>
                    <p className='font-medium'>Gender:</p>

                    {isEdit
                        ? <select className='max-w-20 bg-gray-50'
                            onChange={(e) => setPatientData(prev => ({ ...prev, gender: e.target.value }))}
                            value={patientData?.gender || 'Not Selected'} >
                            <option value="Not Selected">Not Selected</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        : <p className='text-gray-500'>{patientData?.gender || 'Not Selected'}</p>
                    }

                    <p className='font-medium'>Birthday:</p>

                    {isEdit
                        ? <input className='max-w-28 bg-gray-50' type='date'
                            onChange={(e) => setPatientData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                            value={patientData?.dateOfBirth ? patientData.dateOfBirth.split('T')[0] : ''} />
                        : <p className='text-gray-500'>{formatDate(patientData?.dateOfBirth)}</p>
                    }

                </div>
            </div>
            <div className='mt-10'>

                {isEdit
                    ? <button onClick={handleUpdateProfile} className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'>Save information</button>
                    : <button onClick={() => setIsEdit(true)} className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'>Edit</button>
                }

            </div>
        </div>
    )
}

export default MyProfile
