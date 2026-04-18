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
            const [hours, minutes] = selectedSlot.slotTime.split(':')
            const startTime = `${hours}:${minutes}`
            const endDate = new Date(selectedSlot.datetime.getTime() + 30 * 60000)
            const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`

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
        <div>
            <div className='flex flex-col sm:flex-row gap-4'>
                <div>
                    <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image || assets.doc_img} alt={doctorName} />
                </div>

                <div className='flex-1 border border-[#ADADAD] rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>

                    <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{doctorName} <img className='w-5' src={assets.verified_icon} alt="" /></p>
                    <div className='flex items-center gap-2 mt-1 text-gray-600'>
                        <p>{docInfo.degree} - {docInfo.specialization || docInfo.speciality}</p>
                        <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience} years</button>
                    </div>

                    <div className='flex items-center gap-1 mt-2 text-primary font-medium'>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <img key={star} className='w-3.5' src={star <= avgRating ? assets.verified_icon : assets.info_icon} alt="" style={{ filter: star <= avgRating ? 'none' : 'grayscale(1)' }} />
                        ))}
                        <p className='ml-2 text-gray-500 text-sm'>({docInfo.numRatings || 0} reviews)</p>
                    </div>

                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>About <img className='w-3' src={assets.info_icon} alt="" /></p>
                        <p className='text-sm text-gray-600 max-w-[700px] mt-1'>{docInfo.about}</p>
                    </div>

                    <p className='text-gray-600 font-medium mt-4'>Appointment fee: <span className='text-gray-800'>{currencySymbol}{docInfo.fees}</span> </p>
                </div>
            </div>

            <div className='sm:ml-72 sm:pl-4 mt-8 font-medium text-[#565656]'>
                <p >Booking slots</p>
                <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
                    {docSlots.length > 0 && docSlots.map((item, index) => (
                        item.length > 0 && (
                            <div onClick={() => setSlotIndex(index)} key={index} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-[#DDDDDD]'}`}>
                                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                                <p>{item[0] && item[0].datetime.getDate()}</p>
                            </div>
                        )
                    ))}
                </div>

                <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
                    {docSlots[slotIndex]?.length > 0 && docSlots[slotIndex].map((item, index) => (
                        <p onClick={() => setSlotTime(item.time)} key={index} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-[#949494] border border-[#B4B4B4]'}`}>{item.time.toLowerCase()}</p>
                    ))}
                </div>

                <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-20 py-3 rounded-full my-6'>Book an appointment</button>
            </div>

            <RelatedDoctors speciality={docInfo.specialization || docInfo.speciality} docId={docId} />
        </div>
    )
}

export default Appointment
