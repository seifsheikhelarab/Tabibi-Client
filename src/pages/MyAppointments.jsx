import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { appointmentsApi, ratingsApi, uploadApi } from "../api/client";

const statusColorMap = {
    PENDING: "text-yellow-600 border-yellow-500",
    CONFIRMED: "text-blue-600 border-blue-500",
    COMPLETED: "text-green-600 border-green-500",
    CANCELLED: "text-red-600 border-red-500",
};

const paymentStatusColorMap = {
    PENDING: "text-yellow-600 border-yellow-500",
    VERIFYING: "text-orange-600 border-orange-500",
    PAID: "text-green-600 border-green-500",
    FAILED: "text-red-600 border-red-500",
};

const MyAppointments = () => {
    const { patientAppointments, setPatientAppointments, loadPatientAppointments, getDoctosData } = useContext(AppContext);
    const [payment, setPayment] = useState("");
    const [uploading, setUploading] = useState(false);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            await appointmentsApi.cancel(appointmentId)
            toast.success('Appointment cancelled successfully')
            loadPatientAppointments()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const appointmentCash = async (appointmentId) => {
        try {
            await appointmentsApi.update(appointmentId, { paymentMethod: 'CASH' })
            toast.success('Cash payment selected')
            loadPatientAppointments()
            setPayment("")
        } catch (error) {
            toast.error(error.message)
        }
    }

    const rateDoctor = async (appointmentId, doctorId, rating) => {
        try {
            await ratingsApi.create({
                appointmentId,
                doctorId,
                rating
            })
            toast.success('Rating submitted')
            loadPatientAppointments()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const appointmentInstapay = async (appointmentId, image) => {
        try {
            if (!image) return toast.error("Please upload payment image")
            
            setUploading(true)
            toast.info("Uploading payment proof...")
            
            const { data } = await uploadApi.uploadImage(image)
            const imageUrl = data.url
            
            await appointmentsApi.submitPaymentProof(appointmentId, {
                paymentProof: imageUrl,
                paymentMethod: 'INSTAPAY'
            })
            
            toast.success("Payment proof submitted! Waiting for verification.")
            loadPatientAppointments()
            setPayment("")
        } catch (error) {
            toast.error(error.message || "Failed to upload payment proof")
        } finally {
            setUploading(false)
        }
    }

    useEffect(() => {
        loadPatientAppointments()
    }, [loadPatientAppointments])

    return (
        <div>
            <p className="pb-3 mt-12 text-lg font-medium text-gray-600 border-b">My appointments</p>
            <div>
                {patientAppointments
                    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
                    .map((item) => {
                        const doctorName = item.doctor 
                            ? `${item.doctor.firstName} ${item.doctor.lastName}`.trim()
                            : 'Doctor'
                        
                        return (
                            <div key={item.id} className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b">
                                <div>
                                    <img className="w-36 bg-[#EAEFFF]" src={item.doctor?.image || assets.doc_img} alt={doctorName} />
                                </div>
                                <div className="flex-1 text-sm text-[#5E5E5E]">
                                    <p className="text-[#262626] text-base font-semibold">{doctorName}</p>
                                    <p>{item.doctor?.specialization || 'General'}</p>
                                    <p className="mt-1">
                                        <span className="text-sm text-[#3C3C3C] font-medium">Date & Time:</span> {formatDate(item.appointmentDate)} | {item.startTime || 'N/A'}
                                    </p>
                                    <p className={`inline-block mt-2 text-xs border rounded px-2 py-1 ${statusColorMap[item.status] || "text-gray-600 border-gray-400"}`}>
                                        {item.status || "PENDING"}
                                    </p>
                                    {item.paymentStatus && (
                                        <p className={`inline-block mt-2 ml-2 text-xs border rounded px-2 py-1 ${paymentStatusColorMap[item.paymentStatus] || "text-gray-600 border-gray-400"}`}>
                                            Payment: {item.paymentStatus}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 justify-end text-sm text-center">
                                    {item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && item.paymentStatus === 'PENDING' && payment !== item.id && (
                                        <button onClick={() => setPayment(item.id)} className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300">
                                            Pay Online
                                        </button>
                                    )}

                                    {item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && item.paymentStatus === 'PENDING' && payment === item.id && (
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-xs text-gray-500 text-center max-w-[220px]">Upload Instapay proof to mark this appointment as paid.</p>
                                            <div className="relative">
                                                <input disabled={uploading} onChange={(e) => appointmentInstapay(item.id, e.target.files[0])} type="file" id={`proof-${item.id}`} hidden accept="image/*" />
                                                <label htmlFor={`proof-${item.id}`} className={`cursor-pointer text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 transition-all duration-300 flex items-center justify-center ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <img className="max-w-28 max-h-12 object-contain" src={assets.instapay_logo} alt="Instapay" />
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && item.paymentStatus === 'PENDING' && payment === item.id && (
                                        <button onClick={() => appointmentCash(item.id)} className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center font-medium">
                                            Cash
                                        </button>
                                    )}

                                    {item.paymentStatus === 'VERIFYING' && (
                                        <button className="sm:min-w-48 py-2 border rounded text-orange-600 bg-orange-50 border-orange-200">Verifying Payment...</button>
                                    )}

                                    {item.paymentStatus === 'PAID' && item.status !== 'COMPLETED' && (
                                        <button className="sm:min-w-48 py-2 border rounded text-green-600 bg-green-50 border-green-200">Paid</button>
                                    )}

                                    {item.status === 'COMPLETED' && !item.rating && (
                                        <div className="flex flex-col gap-1 items-center sm:min-w-48">
                                            <p className="text-xs text-gray-500">Rate your experience:</p>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <img
                                                        key={star}
                                                        onClick={() => rateDoctor(item.id, item.doctorId, star)}
                                                        className="w-5 cursor-pointer hover:scale-110 transition-all"
                                                        src={assets.verified_icon}
                                                        alt={`Rate ${star}`}
                                                        title={`Rate ${star} stars`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {item.status === 'COMPLETED' && item.rating && (
                                        <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">Rating Submitted</button>
                                    )}
                                    {item.status === 'COMPLETED' && (
                                        <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">Completed</button>
                                    )}

                                    {item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && (
                                        <button onClick={() => cancelAppointment(item.id)} className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300">
                                            Cancel appointment
                                        </button>
                                    )}
                                    {item.status === 'CANCELLED' && (
                                        <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">Appointment cancelled</button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                {patientAppointments.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-gray-500">No appointments found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAppointments;
