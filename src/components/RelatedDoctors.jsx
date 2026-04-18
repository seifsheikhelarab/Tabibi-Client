import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const RelatedDoctors = ({ speciality, docId }) => {

    const navigate = useNavigate()
    const { doctors } = useContext(AppContext)

    const [relDoc, setRelDoc] = useState([])

    const getDoctorName = (doc) => {
        if (doc.name) return doc.name
        return `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || 'Doctor'
    }

    const getDoctorId = (doc) => doc.id || doc._id

    useEffect(() => {
        if (doctors.length > 0 && speciality) {
            const doctorsData = doctors.filter((doc) => {
                const isSameSpecialty = doc.speciality === speciality || doc.specialization === speciality
                const isDifferentDoctor = getDoctorId(doc) !== docId
                return isSameSpecialty && isDifferentDoctor
            })
            setRelDoc(doctorsData)
        }
    }, [doctors, speciality, docId])

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-[#262626]'>
            <h1 className='text-3xl font-medium'>Related Doctors</h1>
            <p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of trusted doctors.</p>
            <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
                {relDoc.map((item) => {
                    const id = getDoctorId(item)
                    const name = getDoctorName(item)
                    return (
                        <div onClick={() => { navigate(`/appointment/${id}`); scrollTo(0, 0) }} className='border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={id}>
                            <img className='bg-[#EAEFFF] hover:bg-primary w-full aspect-square object-cover object-top transition-all duration-500' src={item.image} alt={name} />
                            <div className='p-4'>
                                <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : "text-gray-500"}`}>
                                    <p className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : "bg-gray-500"}`}></p><p>{item.available ? 'Available' : "Not Available"}</p>
                                </div>
                                <p className='text-[#262626] text-lg font-medium'>{name}</p>
                                <p className='text-[#5C5C5C] text-sm'>{item.specialization || item.speciality}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default RelatedDoctors
