import React, { useContext, useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import { appointmentsApi } from '../api/client'

// Peaceful ambient flow background for the doctor card
const CalmingCardBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        };
        window.addEventListener('resize', handleResize);

        let phase = 0;
        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            // Breathe cycle slow drift
            const time = Date.now() * 0.0006;
            const breathe = Math.sin(time) * 0.5 + 0.5;

            ctx.beginPath();
            ctx.fillStyle = 'rgba(95, 111, 255, 0.02)';
            ctx.moveTo(0, height);
            for (let x = 0; x <= width; x += 5) {
                const y = height * 0.4 + 
                          Math.sin(x * 0.006 + phase) * (15 + breathe * 20) + 
                          Math.cos(x * 0.003 - phase) * (8 + breathe * 10);
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fill();

            phase += 0.008;
            animationFrameId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-80 z-0" />;
};

const Appointment = () => {
    const { t, i18n } = useTranslation()
    const { docId } = useParams()
    const { doctors, currencySymbol, patientData, getDoctosData, loadPatientAppointments } = useContext(AppContext)
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    const [docInfo, setDocInfo] = useState(false)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')

    // Calming Booking states
    const [isBooking, setIsBooking] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState(false)
    const [breatheStage, setBreatheStage] = useState(t('appointment.inhalePeace'))

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
            toast.warning(t('appointment.pleaseCompleteProfile'))
            return navigate('/my-profile')
        }

        if (!docSlots[slotIndex] || docSlots[slotIndex].length === 0) {
            return toast.error(t('appointment.noAvailableSlots'))
        }

        const selectedSlot = docSlots[slotIndex].find(s => s.time === slotTime)
        if (!selectedSlot) {
            return toast.warning(t('appointment.pleaseSelectTime'))
        }

        try {
            setIsBooking(true)
            setBookingSuccess(false)

            const timeMatch = selectedSlot.datetime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).match(/(\d{2}):(\d{2})/);
            const startTime = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : selectedSlot.time.split(' ')[0];
            const endDate = new Date(selectedSlot.datetime.getTime() + 30 * 60000);
            const endTimeMatch = endDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).match(/(\d{2}):(\d{2})/);
            const endTime = endTimeMatch ? `${endTimeMatch[1]}:${endTimeMatch[2]}` : '00:00';

            // Wait a peaceful 4.5s breathing cycle before securing the spot
            await new Promise(resolve => setTimeout(resolve, 4500))

            await appointmentsApi.create({
                doctorId: docId,
                patientId: patientData.id,
                appointmentDate: selectedSlot.slotDate,
                startTime,
                endTime,
                notes: '',
                fees: docInfo.fees
            })
            
            setBookingSuccess(true)
            getDoctosData()
            loadPatientAppointments()
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            setIsBooking(false)
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

    // Calming breathing guide cycle sync
    useEffect(() => {
        if (!isBooking || bookingSuccess) return;
        const stages = [t('appointment.inhalePeace'), t('appointment.holdCalmly'), t('appointment.exhaleAnxiety'), t('appointment.holdCalmly')];
        let idx = 0;
        const interval = setInterval(() => {
            idx = (idx + 1) % stages.length;
            setBreatheStage(stages[idx]);
        }, 1875); // 7.5s cycle split into 4 parts
        return () => clearInterval(interval);
    }, [isBooking, bookingSuccess]);

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
            <div className='bg-white rounded-2xl shadow-sm border border-border-light overflow-hidden relative p-6 sm:p-8 mb-8'>
                <CalmingCardBackground />

                <div className='flex flex-col md:flex-row gap-8 relative z-10 items-center md:items-start'>
                    
                    <div className='w-64 h-64 sm:w-72 sm:h-72 flex-shrink-0 relative overflow-hidden rounded-2xl border-4 border-white shadow-md hover:scale-102 transition-transform duration-500 bg-surface-raised'>
                        <img className='w-full h-full object-cover object-top' src={docInfo.image || assets.doc_img} alt={doctorName} />
                        
                        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-white shadow-sm">
                            <span className={`w-1.5 h-1.5 rounded-full ${docInfo.available ? "bg-green-500" : "bg-gray-400"}`}></span>
                            <span className={docInfo.available ? "text-green-700 font-bold" : "text-text-muted font-bold"}>
                                {docInfo.available ? t('appointment.active') : t('appointment.busy')}
                            </span>
                        </div>
                    </div>

                    <div className='flex-1 w-full text-center md:text-left'>
                        <div className='flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start'>
                            <h1 className='text-3xl font-display font-extrabold text-text tracking-tight'>{doctorName}</h1>
                            <img className='w-5' src={assets.verified_icon} alt={t('appointment.verifiedBadge')} />
                        </div>
                        
                        <div className='flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-3.5 text-text-secondary font-medium text-sm'>
                            <span className="px-3 py-1 bg-white border border-border-light rounded-xl text-primary font-bold shadow-sm">{docInfo.degree}</span>
                            <span className='text-border hidden sm:inline'>&bull;</span>
                            <span>{docInfo.specialization || docInfo.speciality}</span>
                            <span className='text-border hidden sm:inline'>&bull;</span>
                            <span className='px-3 py-1 bg-primary/5 text-primary rounded-xl text-xs font-bold'>{docInfo.experience} {t('doctors.yearsExp')}</span>
                        </div>

                        <div className='flex items-center justify-center md:justify-start gap-1.5 mt-4'>
                            <span className='text-amber text-lg'>&#9733;</span>
                            <span className='font-bold text-text text-base'>{avgRating.toFixed(1)}</span>
                            <span className='text-text-muted text-xs font-medium'>({docInfo.numRatings || 0} {t('doctors.trustedReviews')})</span>
                        </div>

                        <div className='mt-6 bg-white p-5 rounded-2xl border border-border-light text-left'>
                            <h3 className='text-xs font-bold text-text-muted uppercase tracking-widest mb-2.5'>{t('appointment.professionalBackground')}</h3>
                            <p className='text-text-secondary text-sm leading-relaxed font-medium'>{docInfo.about}</p>
                        </div>

                        <div className='mt-6 pt-5 border-t border-gray-100 flex items-center justify-between'>
                            <span className='text-gray-400 font-bold text-sm uppercase tracking-wider'>{t('appointment.sessionBookingFee')}</span>
                            <span className='text-3xl font-extrabold text-gray-900'>{currencySymbol}{docInfo.fees}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Date-and-Slot Selectors with tactile dynamic hover styles */}
            <div className='mt-10 bg-white rounded-2xl p-6 sm:p-8 border border-border-light shadow-sm'>
                <h2 className='text-xl font-display font-extrabold text-text mb-5 tracking-tight flex items-center gap-2'>
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse-ring"></span>
                    {t('appointment.selectBookingDate')}
                </h2>
                
                <div className='flex gap-3 overflow-x-auto pb-3.5 pt-1.5 scroll-smooth no-scrollbar'>
                    {docSlots.length > 0 && docSlots.map((item, index) => (
                        item.length > 0 && (
                            <button 
                                onClick={() => {
                                    setSlotIndex(index)
                                    setSlotTime('')
                                }} 
                                key={index} 
                                className={`flex-shrink-0 w-18 h-22 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 ${
                                    slotIndex === index 
                                    ? 'bg-primary text-white scale-105 shadow-lg shadow-primary/20 -translate-y-0.5' 
                                    : 'bg-gray-50/50 border border-gray-150 text-gray-500 hover:border-primary hover:bg-white hover:text-primary'
                                }`}
                            >
                                <span className='text-[10px] font-extrabold uppercase tracking-wider'>{item[0] && item[0].datetime.toLocaleDateString(i18n.language, { weekday: 'short' }).toUpperCase()}</span>
                                <span className={`text-xl font-black mt-1.5 ${slotIndex === index ? 'text-white' : 'text-gray-800'}`}>
                                    {item[0] && item[0].datetime.getDate()}
                                </span>
                            </button>
                        )
                    ))}
                </div>

                {docSlots[slotIndex]?.length > 0 ? (
                    <>
                        <h2 className='text-xl font-display font-extrabold text-text mt-8 mb-5 tracking-tight flex items-center gap-2'>
                            <span className="w-2 h-2 rounded-full bg-green"></span>
                            {t('appointment.availableConsultationSlots')}
                        </h2>
                        
                        <div className='flex flex-wrap gap-2.5'>
                            {docSlots[slotIndex].map((item, index) => (
                                <button
                                    onClick={() => setSlotTime(item.time)}
                                    key={index}
                                    style={{ animationDelay: `${index * 20}ms` }}
                                    className={`px-4.5 py-3 rounded-xl text-sm transition-all animate-bubble font-bold active:scale-95 ${
                                        item.time === slotTime
                                        ? 'bg-primary text-white scale-105 shadow-md shadow-primary/10'
                                        : 'bg-gray-50/80 border border-gray-100 text-gray-600 hover:border-primary hover:bg-white hover:text-primary'
                                    }`}
                                >
                                    {item.time}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="py-8 text-center bg-gray-50 rounded-2xl mt-6 border-2 border-dashed border-gray-150">
                        <p className='text-gray-500 font-bold'>{t('appointment.noConsultations')}</p>
                    </div>
                )}

                <button 
                    onClick={bookAppointment}
                    disabled={!slotTime}
                    className='w-full md:w-auto px-12 py-4.5 rounded-xl bg-primary text-white font-extrabold mt-10 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-primary/20 active:scale-98 text-sm'
                >
                    {t('appointment.confirmBooking')}
                </button>
            </div>

            {/* Related/Specialist Listings */}
            <div className="mt-12">
                <RelatedDoctors speciality={docInfo.specialization || docInfo.speciality} docId={docId} />
            </div>

            {/* Calming Breathing Booking Confirmation full-screen overlay */}
            {isBooking && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md animate-fade-in-up">
                    <div className="max-w-md w-full px-6 text-center flex flex-col items-center gap-10">
                        {!bookingSuccess ? (
                            <>
                                <div>
                                    <h2 className="text-2xl font-display font-extrabold text-text tracking-tight">{t('appointment.securingYourBooking')}</h2>
                                    <p className="text-text-secondary mt-2.5 text-sm leading-relaxed font-medium">{t('appointment.letsBreathe')} {doctorName}.</p>
                                </div>
                                
                                {/* Calming breathing guide circles */}
                                <div className="relative w-48 h-48 flex items-center justify-center">
                                    <div className="absolute w-44 h-44 rounded-full bg-primary/5 animate-pulse-ring"></div>
                                    <div className="absolute w-36 h-36 rounded-full bg-primary/10 animate-breathe-visual"></div>
                                    <div className="relative z-10 flex flex-col items-center">
                                        <span className="text-primary font-extrabold text-sm tracking-widest uppercase transition-all duration-500">
                                            {breatheStage}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-text-muted text-[10px] tracking-widest uppercase font-bold">{t('appointment.calmBookingCore')}</div>
                            </>
                        ) : (
                            <div className="animate-fade-in-up flex flex-col items-center gap-6">
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-md animate-bounce">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-9 h-9">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('appointment.bookingConfirmed')}</h2>
                                    <p className="text-gray-500 mt-3 text-sm leading-relaxed font-semibold">{t('appointment.yourSessionWith')} <strong>{doctorName}</strong> {t('appointment.isBooked')}</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        setIsBooking(false)
                                        navigate('/my-appointments')
                                    }}
                                    className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-sm"
                                >
                                    {t('appointment.viewAppointments')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Appointment