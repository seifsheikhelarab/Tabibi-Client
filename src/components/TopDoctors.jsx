import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'

const TopDoctors = () => {

    const navigate = useNavigate()

    const { doctors } = useContext(AppContext)
    const doctorList = Array.isArray(doctors) ? doctors : []

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-gray-800 md:mx-10'>
            <h1 className='text-3xl font-medium'>Top Doctors to Book</h1>
            <p className='sm:w-1/3 text-center text-sm text-gray-500'>Simply browse through our extensive list of trusted doctors.</p>
            <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-5 px-3 sm:px-0'>
                {doctorList.slice(0, 10).map((item, index) => (
                    <div onClick={() => { navigate(`/appointment/${item._id || item.id}`); scrollTo(0, 0) }} className='bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group' key={index}>
                        <div className='relative'>
                            <img className='bg-primary/5 w-full aspect-square object-cover object-top transition-all duration-500 group-hover:scale-105' src={item.image || assets.doc_img} alt="" />
                            <div className='absolute bottom-3 left-3'>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${item.available ? 'bg-white/90 text-green-700' : 'bg-white/90 text-gray-500'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${item.available ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                    {item.available ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                        </div>
                        <div className='p-4'>
                            <p className='text-lg font-medium text-gray-800 group-hover:text-primary transition-colors duration-300'>{item.name}</p>
                            <p className='text-gray-500 text-sm mt-1'>{item.speciality}</p>
                            <div className='flex items-center gap-1 mt-2'>
                                <img className='w-3.5' src={assets.verified_icon} alt="" />
                                <span className='text-sm font-semibold text-primary'>{(item.rating / item.numRatings || 0).toFixed(1)}</span>
                                <span className='text-xs text-gray-400'>({item.numRatings} reviews)</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={() => { navigate('/doctors'); scrollTo(0, 0) }} className='bg-primary/5 text-gray-600 px-12 py-3 rounded-full mt-10 hover:bg-primary/10 hover:text-primary transition-colors duration-300 font-medium'>
                View all doctors
            </button>
        </div>
    )
}

export default TopDoctors