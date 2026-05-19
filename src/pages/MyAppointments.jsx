import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { appointmentsApi, ratingsApi, uploadApi } from "../api/client";

const statusColorMap = {
    PENDING: "bg-amber/5 text-amber border-amber/20",
    CONFIRMED: "bg-primary/5 text-primary border-primary/20",
    COMPLETED: "bg-green/5 text-green border-green/20",
    CANCELLED: "bg-rose/5 text-rose border-rose/20",
};

const paymentStatusColorMap = {
    PENDING: "bg-amber/5 text-amber border-amber/20",
    VERIFYING: "bg-amber/5 text-amber border-amber/20",
    PAID: "bg-green/5 text-green border-green/20",
    FAILED: "bg-rose/5 text-rose border-rose/20",
};

const MyAppointments = () => {
    const { t } = useTranslation();
    const { patientAppointments, loadPatientAppointments, currencySymbol } = useContext(AppContext);
    const [paymentId, setPaymentId] = useState("");
    const [uploading, setUploading] = useState(false);
    
    const [cancellationTarget, setCancellationTarget] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const handleCancelRequest = (appointmentId) => {
        setCancellationTarget(appointmentId);
    };

    const confirmCancelAppointment = async () => {
        if (!cancellationTarget) return;
        try {
            setIsCancelling(true);
            await appointmentsApi.cancel(cancellationTarget);
            toast.success(t('myAppointments.appointmentCancelled'));
            setCancellationTarget(null);
            loadPatientAppointments();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsCancelling(false);
        }
    };

    const appointmentCash = async (appointmentId) => {
        try {
            await appointmentsApi.update(appointmentId, { paymentMethod: 'CASH' });
            toast.success(t('myAppointments.cashPaymentSelected'));
            loadPatientAppointments();
            setPaymentId("");
        } catch (error) {
            toast.error(error.message);
        }
    };

    const rateDoctor = async (appointmentId, doctorId, rating) => {
        try {
            await ratingsApi.create({
                appointmentId,
                doctorId,
                rating
            });
            toast.success(t('myAppointments.ratingSubmitted'));
            loadPatientAppointments();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const appointmentInstapay = async (appointmentId, image) => {
        try {
            if (!image) return toast.error(t('myAppointments.pleaseUploadPaymentImage'));
            
            setUploading(true);
            toast.info(t('myAppointments.uploadPaymentProof'));
            
            const { data } = await uploadApi.uploadImage(image);
            const imageUrl = data.url;
            
            await appointmentsApi.submitPaymentProof(appointmentId, {
                paymentProof: imageUrl,
                paymentMethod: 'INSTAPAY'
            });
            
            toast.success(t('myAppointments.paymentProofSubmitted'));
            loadPatientAppointments();
            setPaymentId("");
        } catch (error) {
            toast.error(error.message || t('myAppointments.uploadFailed'));
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        loadPatientAppointments();
    }, [loadPatientAppointments]);

    return (
        <div className="max-w-4xl mx-auto pb-24 px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mt-12 mb-10 gap-4">
                <div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-widest bg-primary/5 px-4 py-1.5 rounded-full inline-block mb-3">
                        {t('myAppointments.patientWorkspace')}
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-text tracking-tight">
                        {t('myAppointments.myAppointments')}
                    </h1>
                    <p className="text-text-secondary text-sm mt-2 font-medium">
                        {t('myAppointments.viewAndManage')}
                    </p>
                </div>
            </div>
            
            {patientAppointments.length === 0 ? (
                <div className="text-center py-20 px-8 bg-white border border-border-light rounded-2xl shadow-sm flex flex-col items-center gap-6 animate-fade-in-up">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <div className="absolute w-28 h-28 rounded-full bg-primary/5 animate-pulse-ring"></div>
                        
                        <svg className="w-16 h-16 text-primary/30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor" opacity="0.1" />
                            <path d="M17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M12 7V17M7 12H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-display font-bold text-text tracking-tight">{t('myAppointments.yourWellnessScheduleClear')}</h3>
                        <p className="text-text-secondary text-sm mt-2 max-w-sm leading-relaxed mx-auto font-medium">
                            {t('myAppointments.takeThisMoment')}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {patientAppointments
                        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
                        .map((item, index) => {
                            const doctorName = item.doctor 
                                ? `${item.doctor.firstName} ${item.doctor.lastName}`.trim()
                                : t('common.doctor');
                            const avgRating = item.doctor?.numRatings > 0 ? item.doctor.rating / item.doctor.numRatings : 0;
                            
                            return (
                                <div 
                                    key={item.id} 
                                    style={{ animationDelay: `${index * 60}ms` }}
                                    className="bg-white rounded-2xl p-6 border border-border-light shadow-sm transition-all duration-300 hover:shadow-md flex flex-col justify-between"
                                >
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <div className="flex-shrink-0 mx-auto sm:mx-0">
                                            <img className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover bg-surface-raised border border-border-light" src={item.doctor?.image || assets.doc_img} alt={doctorName} />
                                        </div>
                                        
                                        <div className="flex-1 text-center sm:text-left flex flex-col justify-between">
                                            <div>
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-xl font-display font-extrabold text-text leading-tight">{doctorName}</h3>
                                                        <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mt-1">{item.doctor?.specialization || t('common.general')}</p>
                                                    </div>
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border self-center sm:self-start ${statusColorMap[item.status] || "bg-gray-50 text-gray-600 border-gray-300"}`}>
                                                        {item.status || t('common.loading')}
                                                    </span>
                                                </div>

                                                <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-y-2 gap-x-4 text-xs font-medium text-text-secondary">
                                                    <p className="flex items-center gap-1.5 bg-surface-raised px-3 py-1.5 rounded-xl border border-border-light">
                                                        <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {formatDate(item.appointmentDate)}
                                                    </p>
                                                    <p className="flex items-center gap-1.5 bg-surface-raised px-3 py-1.5 rounded-xl border border-border-light">
                                                        <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {item.startTime || 'N/A'}
                                                    </p>
                                                    <p className="flex items-center gap-1.5 bg-surface-raised px-3 py-1.5 rounded-xl border border-border-light">
                                                        <span className="text-amber font-bold">&#9733;</span>
                                                        <span className="text-text-secondary">{avgRating > 0 ? avgRating.toFixed(1) : t('common.new')} {t('doctors.rating')}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 mt-6 pt-5 border-t border-gray-100/80">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {item.paymentStatus && (
                                                        <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${paymentStatusColorMap[item.paymentStatus] || "bg-gray-50 text-gray-600 border-gray-300"}`}>
                                                            {t('myAppointments.payment')} {item.paymentStatus}
                                                        </span>
                                                    )}
                                                    <span className="text-xs font-bold text-text bg-surface-raised px-3 py-1 rounded-xl border border-border-light">
                                                        {t('myAppointments.fee')} {currencySymbol} {item.fees}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    {item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && item.paymentStatus === 'PENDING' && paymentId !== item.id && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => setPaymentId(item.id)} 
                                                            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-primary hover:text-primary transition-all active:scale-95 duration-200"
                                                        >
                                                            {t('myAppointments.payOnline')}
                                                        </button>
                                                    )}

                                                    {item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && item.paymentStatus === 'PENDING' && paymentId === item.id && (
                                                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full mt-2 sm:mt-0">
                                                            <div className="relative">
                                                                <input disabled={uploading} onChange={(e) => appointmentInstapay(item.id, e.target.files[0])} type="file" id={`proof-${item.id}`} hidden accept="image/*" />
                                                                <label htmlFor={`proof-${item.id}`} className={`cursor-pointer px-3 py-2 border border-gray-200 rounded-xl text-xs hover:bg-gray-50 transition-all flex items-center active:scale-95 duration-200 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                                    <img className="max-w-16 max-h-6 object-contain" src={assets.instapay_logo} alt="Instapay" />
                                                                </label>
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => appointmentCash(item.id)} 
                                                                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-primary hover:text-primary transition-all active:scale-95 duration-200"
                                                            >
                                                                {t('myAppointments.cashMethod')}
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setPaymentId("")} 
                                                                className="px-3 py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                                                            >
                                                                {t('myAppointments.cancel')}
                                                            </button>
                                                        </div>
                                                    )}

                                                    {item.paymentStatus === 'VERIFYING' && (
                                                        <button type="button" className="px-4 py-2 border border-orange-200 rounded-xl text-xs font-bold text-orange-700 bg-orange-50/50 cursor-default">{t('myAppointments.verifyingPayment')}</button>
                                                    )}

                                                    {item.paymentStatus === 'PAID' && item.status !== 'COMPLETED' && (
                                                        <button type="button" className="px-4 py-2 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50/50 cursor-default">{t('myAppointments.paid')}</button>
                                                    )}

                                                    {item.status === 'COMPLETED' && !item.rating && (
                                                        <div className="flex items-center gap-2.5 bg-gray-50/50 border border-gray-100 px-3 py-1.5 rounded-xl">
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('myAppointments.rateDoctor')}</span>
                                                            <div className="flex gap-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <button
                                                                        type="button"
                                                                        key={star}
                                                                        onClick={() => rateDoctor(item.id, item.doctorId, star)}
                                                                        className="text-gray-300 hover:text-yellow-500 hover:scale-125 transition-all text-sm font-bold active:scale-90"
                                                                    >
                                                                        ★
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {item.status === 'COMPLETED' && item.rating && (
                                                        <span className="px-4 py-2 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50/50">{t('myAppointments.completed')}</span>
                                                    )}

                                                    {item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleCancelRequest(item.id)} 
                                                            className="px-4 py-2 border border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:border-rose-200 hover:text-rose-600 transition-all active:scale-95 duration-200 sm:ml-auto"
                                                        >
                                                            {t('myAppointments.cancelAppointment')}
                                                        </button>
                                                    )}
                                                    
                                                    {item.status === 'CANCELLED' && (
                                                        <span className="px-4 py-2 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 bg-rose-50/50">{t('myAppointments.cancelled')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}

            {/* Cancellation Confirmation Modal */}
            {cancellationTarget && (
                <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center p-4 z-50 animate-fade-in-up">
                    <div className="bg-white max-w-md w-full rounded-2xl p-6 md:p-8 border border-border-light shadow-xl animate-fade-in-up">
                        <div className="w-12 h-12 rounded-full bg-rose-light flex items-center justify-center text-rose mb-5">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        
                        <h3 className="text-xl font-display font-bold text-text leading-tight">{t('myAppointments.cancelYourAppointment')}</h3>
                        <p className="text-text-secondary text-sm mt-3 leading-relaxed font-medium">
                            {t('myAppointments.cancelConfirmMsg')}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border-light">
                            <button
                                type="button"
                                disabled={isCancelling}
                                onClick={() => setCancellationTarget(null)}
                                className="flex-1 py-3 border border-border hover:bg-surface-raised rounded-xl text-xs font-semibold text-text-secondary transition-all active:scale-[0.97] duration-200"
                            >
                                {t('myAppointments.keepAppointment')}
                            </button>
                            <button
                                type="button"
                                disabled={isCancelling}
                                onClick={confirmCancelAppointment}
                                className="flex-1 py-3 bg-rose hover:opacity-90 text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-[0.97] duration-200"
                            >
                                {isCancelling ? t('myAppointments.cancelling') : t('myAppointments.confirmCancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyAppointments;
