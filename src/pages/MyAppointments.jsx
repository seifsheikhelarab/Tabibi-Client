import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { appointmentsApi, ratingsApi, uploadApi } from "../api/client";

const statusColorMap = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-300",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-300",
    COMPLETED: "bg-green-50 text-green-700 border-green-300",
    CANCELLED: "bg-red-50 text-red-700 border-red-300",
};

const paymentStatusColorMap = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-300",
    VERIFYING: "bg-orange-50 text-orange-700 border-orange-300",
    PAID: "bg-green-50 text-green-700 border-green-300",
    FAILED: "bg-red-50 text-red-700 border-red-300",
};

const MyAppointments = () => {
    const { patientAppointments, loadPatientAppointments } = useContext(AppContext);
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
        <div className="max-w-3xl mx-auto pb-20 animate-fade-in-up">
            <h1 className="text-2xl font-semibold text-gray-800 mt-10 mb-6">My Appointments</h1>
            
            {patientAppointments.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                    <p className="text-gray-500">No appointments found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {patientAppointments
                        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
                        .map((item) => {
                            const doctorName = item.doctor 
                                ? `${item.doctor.firstName} ${item.doctor.lastName}`.trim()
                                : 'Doctor'
                            
                            return (
                                <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-shrink-0">
                                            <img className="w-24 h-24 rounded-xl object-cover bg-primary/5" src={item.doctor?.image || assets.doc_img} alt={doctorName} />
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800">{doctorName}</h3>
                                                    <p className="text-gray-500 text-sm">{item.doctor?.specialization || 'General'}</p>
                                                    <p className="text-gray-500 text-sm mt-1">
                                                        {formatDate(item.appointmentDate)} at {item.startTime || 'N/A'}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColorMap[item.status] || "bg-gray-50 text-gray-600 border-gray-300"}`}>
                                                    {item.status || "PENDING"}
                                                </span>
                                            </div>

                                            {item.paymentStatus && (
                                                <span className={`inline-block mt-2 mr-2 px-3 py-1 rounded-full text-xs font-medium border ${paymentStatusColorMap[item.paymentStatus] || "bg-gray-50 text-gray-600 border-gray-300"}`}>
                                                    Payment: {item.paymentStatus}
                                                </span>
                                            )}

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && item.paymentStatus === 'PENDING' && payment !== item.id && (
                                                    <button onClick={() => setPayment(item.id)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:border-primary hover:text-primary transition-colors">
                                                        Pay Online
                                                    </button>
                                                )}

                                                {item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && item.paymentStatus === 'PENDING' && payment === item.id && (
                                                    <>
                                                        <div className="w-full">
                                                            <p className="text-xs text-gray-500 mb-2">Upload Instapay proof to mark this appointment as paid.</p>
                                                        </div>
                                                        <div className="relative">
                                                            <input disabled={uploading} onChange={(e) => appointmentInstapay(item.id, e.target.files[0])} type="file" id={`proof-${item.id}`} hidden accept="image/*" />
                                                            <label htmlFor={`proof-${item.id}`} className={`cursor-pointer px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                                <img className="max-w-20 max-h-8 object-contain" src={assets.instapay_logo} alt="Instapay" />
                                                            </label>
                                                        </div>
                                                        <button onClick={() => appointmentCash(item.id)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:border-primary hover:text-primary transition-colors">
                                                            Cash
                                                        </button>
                                                    </>
                                                )}

                                                {item.paymentStatus === 'VERIFYING' && (
                                                    <button className="px-4 py-2 border border-orange-300 rounded-lg text-sm text-orange-700 bg-orange-50">Verifying Payment...</button>
                                                )}

                                                {item.paymentStatus === 'PAID' && item.status !== 'COMPLETED' && (
                                                    <button className="px-4 py-2 border border-green-300 rounded-lg text-sm text-green-700 bg-green-50">Paid</button>
                                                )}

                                                {item.status === 'COMPLETED' && !item.rating && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">Rate:</span>
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    onClick={() => rateDoctor(item.id, item.doctorId, star)}
                                                                    className="w-6 h-6 flex items-center justify-center text-yellow-500 hover:scale-110 transition-transform"
                                                                >
                                                                    ★
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {item.status === 'COMPLETED' && item.rating && (
                                                    <span className="px-4 py-2 border border-green-300 rounded-lg text-sm text-green-700 bg-green-50">Completed</span>
                                                )}

                                                {item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && (
                                                    <button onClick={() => cancelAppointment(item.id)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors">
                                                        Cancel
                                                    </button>
                                                )}
                                                {item.status === 'CANCELLED' && (
                                                    <span className="px-4 py-2 border border-red-300 rounded-lg text-sm text-red-700 bg-red-50">Cancelled</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                </div>
            )}
        </div>
    );
};

export default MyAppointments;
