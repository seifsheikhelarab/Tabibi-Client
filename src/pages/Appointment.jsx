import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import { appointmentsApi } from '../api/client'

const Appointment = () => {

    const { docId } = useParams()
    const { doctors, currencySymbol, patientData, getDoctosData, loadPatientAppointments } = useContext(AppContext)
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    const [docInfo, setDocInfo] = useState(false)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')

    const navigate = useNavigate()

    const fetchDocInfo = async () => {
        const docInfo = doctors.find((doc) => doc.id === docId || doc._id === docId)
        setDocInfo(docInfo)
    }

    const getAvailableSlots = async () => {
        setDocSlots([])

        let today = new Date()

        for (let i = 0; i < 7; i++) {
            let currentDate = new Date(today)
            currentDate.setDate(today.getDate() + i)

            const dayName = daysOfWeek[currentDate.getDay()]
            if (docInfo.availableDays && !docInfo.availableDays.includes(dayName)) {
                continue;
            }

            let endTime = new Date()
            endTime.setDate(today.getDate() + i)

            const startHour = docInfo.startTime ? parseInt(docInfo.startTime.split(':')[0]) : 10;
            const startMinute = docInfo.startTime ? parseInt(docInfo.startTime.split(':')[1]) : 0;
            const endHour = docInfo.endTime ? parseInt(docInfo.endTime.split(':')[0]) : 21;
            const endMinute = docInfo.endTime ? parseInt(docInfo.endTime.split(':')[1]) : 0;

            endTime.setHours(endHour, endMinute, 0, 0)

            if (today.getDate() === currentDate.getDate()) {
                let currentH = currentDate.getHours()
                let currentM = currentDate.getMinutes()

                if (currentH > startHour || (currentH === startHour && currentM > startMinute)) {
                    currentDate.setHours(currentDate.getHours() + 1)
                    currentDate.setMinutes(0)
                } else {
                    currentDate.setHours(startHour)
                    currentDate.setMinutes(startMinute)
                }
            } else {
                currentDate.setHours(startHour)
                currentDate.setMinutes(startMinute)
            }

            let timeSlots = [];

            while (currentDate < endTime) {
                let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                let day = currentDate.getDate()
                let month = currentDate.getMonth() + 1
                let year = currentDate.getFullYear()

                const slotDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const slotTimeStr = formattedTime

                const bookedSlots = docInfo.slots_booked?.[slotDate] || []
                const isSlotAvailable = !bookedSlots.includes(slotTimeStr)

                if (isSlotAvailable) {
                    timeSlots.push({
                        datetime: new Date(currentDate),
                        time: formattedTime,
                        slotDate,
                        slotTime: slotTimeStr
                    })
                }

                currentDate.setMinutes(currentDate.getMinutes() + 30);
            }

            setDocSlots(prev => ([...prev, timeSlots]))
        }
    }

    const bookAppointment = async () => {
        if (!patientData) {
            toast.warning('Please complete your profile first')
            return navigate('/my-profile')
        }

        if (!docSlots[slotIndex] || docSlots[slotIndex].length === 0) {
            return toast.error('No available slots for this day')
        }

        const selectedSlot = docSlots[slotIndex].find(s => s.time === slotTime)
        if (!selectedSlot) {
            return toast.warning('Please select a booking time')
        }

        try {
            const timeMatch = selectedSlot.datetime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).match(/(\d{2}):(\d{2})/);
            const startTime = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : selectedSlot.time.split(' ')[0];
            const endDate = new Date(selectedSlot.datetime.getTime() + 30 * 60000);
            const endTimeMatch = endDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).match(/(\d{2}):(\d{2})/);
            const endTime = endTimeMatch ? `${endTimeMatch[1]}:${endTimeMatch[2]}` : '00:00';

            await appointmentsApi.create({
                doctorId: docId,
                patientId: patientData.id,
                appointmentDate: selectedSlot.slotDate,
                startTime,
                endTime,
                notes: '',
                fees: docInfo.fees
            })
            
            toast.success('Appointment request submitted')
            getDoctosData()
            loadPatientAppointments()
            navigate('/my-appointments')
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (doctors.length > 0) {
            fetchDocInfo()
        }
    }, [doctors, docId])

    useEffect(() => {
        if (docInfo) {
            getAvailableSlots()
        }
    }, [docInfo])

    if (!docInfo) {
        return (
            <div className='flex items-center justify-center min-h-[60vh]'>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    const doctorName = `${docInfo.firstName || ''} ${docInfo.lastName || ''}`.trim() || docInfo.name || 'Doctor'
    const avgRating = docInfo.numRatings > 0 ? docInfo.rating / docInfo.numRatings : 0

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in-up">
            {/* Doctor Info */}
            <div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
                <div className='flex flex-col md:flex-row'>
                    <div className='md:w-72'>
                        <img className='w-full h-64 md:h-full object-cover' src={docInfo.image || assets.doc_img} alt={doctorName} />
                    </div>

                    <div className='flex-1 p-6 md:p-8'>
                        <div className='flex items-center gap-2'>
                            <h1 className='text-2xl font-semibold text-gray-800'>{doctorName}</h1>
                            <img className='w-5' src={assets.verified_icon} alt="" />
                        </div>
                        <div className='flex items-center gap-2 mt-2 text-gray-500'>
                            <span>{docInfo.degree}</span>
                            <span className='text-gray-300'>•</span>
                            <span>{docInfo.specialization || docInfo.speciality}</span>
                            <span className='px-2 py-1 bg-gray-100 rounded-full text-xs'>{docInfo.experience} years exp.</span>
                        </div>

                        <div className='flex items-center gap-1 mt-3'>
                            <span className='text-yellow-500'>★</span>
                            <span className='font-medium text-gray-800'>{avgRating.toFixed(1)}</span>
                            <span className='text-gray-400 text-sm'>({docInfo.numRatings || 0} reviews)</span>
                        </div>

                        <div className='mt-5'>
                            <h3 className='text-sm font-medium text-gray-600 mb-1'>About</h3>
                            <p className='text-gray-500 text-sm leading-relaxed'>{docInfo.about}</p>
                        </div>

                        <div className='mt-5 pt-5 border-t'>
                            <span className='text-gray-500'>Appointment fee: </span>
                            <span className='text-xl font-semibold text-gray-800'>{currencySymbol}{docInfo.fees}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Slots */}
            <div className='mt-8'>
                <h2 className='text-lg font-semibold text-gray-800 mb-4'>Select a Date</h2>
                <div className='flex gap-3 overflow-x-auto pb-2'>
                    {docSlots.length > 0 && docSlots.map((item, index) => (
                        item.length > 0 && (
                            <button 
                                onClick={() => {
                                    setSlotIndex(index)
                                    setSlotTime('')
                                }} 
                                key={index} 
                                className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center transition-all ${
                                    slotIndex === index 
                                    ? 'bg-primary text-white' 
                                    : 'bg-white border border-gray-200 hover:border-primary'
                                }`}
                            >
                                <span className='text-xs uppercase'>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</span>
                                <span className={`text-lg font-semibold ${slotIndex === index ? 'text-white' : 'text-gray-800'}`}>
                                    {item[0] && item[0].datetime.getDate()}
                                </span>
                            </button>
                        )
                    ))}
                </div>

                {docSlots[slotIndex]?.length > 0 ? (
                    <>
                        <h2 className='text-lg font-semibold text-gray-800 mt-6 mb-4'>Select a Time</h2>
                        <div className='flex flex-wrap gap-2'>
                            {docSlots[slotIndex].map((item, index) => (
                                <button
                                    onClick={() => setSlotTime(item.time)}
                                    key={index}
                                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                                        item.time === slotTime
                                        ? 'bg-primary text-white'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                                    }`}
                                >
                                    {item.time}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className='text-gray-500 mt-4'>No available slots for this selection</p>
                )}

                <button 
                    onClick={bookAppointment}
                    disabled={!slotTime}
                    className='w-full md:w-auto px-12 py-4 rounded-xl bg-primary text-white font-medium mt-8 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                >
                    Book Appointment
                </button>
            </div>

            <RelatedDoctors speciality={docInfo.specialization || docInfo.speciality} docId={docId} />
        </div>
    )
}

export default Appointment
