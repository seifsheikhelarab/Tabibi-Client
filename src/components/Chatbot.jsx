import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { chatbotApi } from '../api/client';

// Organic calming breathing visualization component
const BreathingCanvas = () => {
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
        const render = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            
            // Breathe cycle: 8 second cycle (4s in, 4s out)
            const time = Date.now() * 0.0008;
            const breathe = Math.sin(time) * 0.5 + 0.5; // 0 to 1
            
            // Draw calming organic fluid wave (Main)
            ctx.beginPath();
            const gradient = ctx.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.12 + breathe * 0.08})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
            
            ctx.fillStyle = gradient;
            ctx.moveTo(0, height);
            for (let x = 0; x <= width; x += 4) {
                const y = height * 0.55 + 
                          Math.sin(x * 0.008 + phase) * (8 + breathe * 14) + 
                          Math.cos(x * 0.004 - phase) * (4 + breathe * 8);
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fill();

            // Draw a second, slower wave for organic depth
            ctx.beginPath();
            const gradientSec = ctx.createLinearGradient(0, 0, width, 0);
            gradientSec.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
            gradientSec.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
            
            ctx.fillStyle = gradientSec;
            ctx.moveTo(0, height);
            for (let x = 0; x <= width; x += 4) {
                const y = height * 0.6 + 
                          Math.cos(x * 0.01 + phase * 0.7) * (6 + breathe * 10) + 
                          Math.sin(x * 0.005 - phase * 0.9) * (3 + breathe * 6);
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fill();

            phase += 0.012;
            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-90" />;
};

const Chatbot = () => {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.dir() === 'rtl'
    const [isOpen, setIsOpen] = useState(false);
    const [showIntroTooltip, setShowIntroTooltip] = useState(
        () => !localStorage.getItem('chatbot_intro_seen')
    );
    const [messages, setMessages] = useState([
        { role: 'ai', text: t('chatbot.greeting') }
    ]);
    const [input, setInput] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, imagePreview]);

    useEffect(() => {
        if (showIntroTooltip) {
            const timer = setTimeout(() => {
                setShowIntroTooltip(false);
                localStorage.setItem('chatbot_intro_seen', 'true');
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [showIntroTooltip]);

    const dismissTooltip = () => {
        setShowIntroTooltip(false);
        localStorage.setItem('chatbot_intro_seen', 'true');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = async () => {
        if (!input.trim() && !image) return;

        const userMessage = {
            role: 'user',
            text: input,
            image: imagePreview
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        removeImage();
        setIsLoading(true);

        try {
            const response = await chatbotApi.chat({
                message: userMessage.text,
                image: image
            });

            const reply = response.data?.reply || response.data?.response || response.reply || response.message || t('chatbot.sorryNoResponse');
            const doctors = response.data?.doctors || response.doctors || [];

            setMessages(prev => [...prev, {
                role: 'ai',
                text: reply,
                doctors: doctors
            }]);
        } catch (error) {
            console.error(error);
            toast.error(t('chatbot.failedToConnect'));
            setMessages(prev => [...prev, { role: 'ai', text: t('chatbot.networkError') }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className={`fixed bottom-14 z-50 flex flex-col gap-4 font-sans items-end ${isRTL ? 'left-8' : 'right-8'} ${!isOpen ? 'pointer-events-none' : ''}`}>
            
            {/* Chat Window with elegant organic morphing blossom transition */}
            <div className={`bg-white rounded-2xl shadow-lg border border-border-light w-[350px] sm:w-[410px] h-[540px] max-h-[78vh] flex flex-col overflow-hidden transition-all duration-500 ${isRTL ? 'origin-bottom-left' : 'origin-bottom-right'} ${
                isOpen 
                ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto' 
                : 'scale-[0.1] opacity-0 translate-y-16 pointer-events-none'
            }`}>
                
                {/* Custom Calming Header with Canvas Breathing visualization */}
                <div className="relative bg-gradient-to-r from-primary to-blue-600 p-6 flex justify-between items-center text-white overflow-hidden">
                    {/* Organic Breathing Wave Background */}
                    <BreathingCanvas />

                    <div className='flex items-center gap-3 relative z-10'>
                        <div className='relative'>
                            <div className='w-11 h-11 bg-white/20 rounded-full flex items-center justify-center shadow-inner transition-transform duration-300 hover:scale-105'>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                </svg>
                            </div>
                            <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-primary rounded-full animate-pulse-ring'></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg tracking-tight">{t('chatbot.tabibiCalmingAI')}</h3>
                            <div className='flex items-center gap-1.5'>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                <p className='text-[10px] text-white/90 uppercase font-bold tracking-wider'>{t('chatbot.breatheAndConnect')}</p>
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={() => setIsOpen(false)} className="relative z-10 hover:bg-white/20 p-2.5 rounded-2xl transition-all group active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:rotate-90 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Calming Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 scroll-smooth bg-gradient-to-b from-blue-50/20 to-white/40">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex flex-col gap-2.5 ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-bubble`}>
                            
                            {/* Message Bubble with organic asymmetrical corners */}
                            <div className={`p-4 rounded-3xl max-w-[85%] text-sm leading-relaxed transition-all shadow-[0_4px_12px_rgba(0,0,0,0.02)] ${msg.role === 'user'
                                ? 'bg-primary text-white rounded-br-none shadow-md shadow-primary/10'
                                : 'bg-white text-text border border-border-light rounded-bl-none'
                                }`}>
                                {msg.image && (
                                    <div className='mb-3 overflow-hidden rounded-2xl border border-gray-100 shadow-inner'>
                                        <img src={msg.image} alt="Uploaded" className="max-w-full transform transition-transform duration-500 hover:scale-105" />
                                    </div>
                                )}
                                <p className="whitespace-pre-line">{msg.text}</p>
                            </div>

                            {/* Beautiful Doctor Recommendations */}
                            {msg.doctors && msg.doctors.length > 0 && (
                                <div className="flex overflow-x-auto gap-4 w-full py-2.5 no-scrollbar scroll-smooth">
                                    {msg.doctors.map((doc, i) => {
                                        const doctorName = `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || doc.name || 'Doctor';
                                        const exp = doc.experience ? `${doc.experience} yrs` : '';
                                        const fee = doc.fees ? `$${doc.fees}` : '';
                                        return (
                                            <div 
                                                key={i} 
                                                onClick={() => { navigate(`/appointment/${doc.id || doc._id}`); setIsOpen(false); }}
                                                className="min-w-[210px] bg-white p-4 rounded-2xl border border-border-light shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                
                                                <div className='relative mb-3 z-10'>
                                                    <img src={doc.image} alt={doctorName} className="w-16 h-16 rounded-full object-cover bg-blue-50 border border-primary/10 group-hover:border-primary transition-all duration-300" />
                                                    <div className='absolute -bottom-0.5 -right-0.5 bg-green-400 w-4 h-4 rounded-full border-2 border-white shadow-sm'></div>
                                                </div>
                                                <p className="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors text-center z-10 line-clamp-1">{doctorName}</p>
                                                <p className="text-[10px] text-gray-500 font-medium z-10">{doc.speciality || doc.specialization}</p>
                                                <div className="flex items-center gap-3 mt-2 mb-3 z-10">
                                                    {exp && <span className="text-[9px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">{exp}</span>}
                                                    {doc.qualification && <span className="text-[9px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full truncate max-w-[80px]">{doc.qualification}</span>}
                                                </div>
                                                {fee && <p className="text-[10px] text-gray-400 mb-2 z-10">{fee} consultation</p>}
                                                <button className='w-full text-[10px] bg-gray-50 text-primary py-2.5 rounded-xl font-bold group-hover:bg-primary group-hover:text-white transition-all shadow-sm z-10 active:scale-95'>
                                                    {t('chatbot.bookSlot')}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start animate-pulse">
                            <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-border-light">
                                <div className="flex gap-1.5 items-center">
                                    <div className="w-2.5 h-2.5 bg-primary/40 rounded-full animate-bounce"></div>
                                    <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-5 bg-white border-t border-border-light rounded-b-2xl">
                    {imagePreview && (
                        <div className="relative inline-block mb-3 ml-2 group animate-fade-in-up">
                            <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-2xl border border-primary/20 shadow-md ring-4 ring-white" />
                            <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-lg hover:bg-red-600 transition-colors transform hover:scale-105 active:scale-95">✕</button>
                        </div>
                    )}
                    <div className="flex gap-2 bg-surface-raised p-2 rounded-xl border border-border-light focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all items-center">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="p-2 rounded-xl transition-all text-gray-400 hover:text-primary hover:bg-primary/5 group"
                            title={t('chatbot.uploadMedicalReport')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5 transition-transform group-hover:scale-105">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94a3 3 0 114.243 4.243L8.767 17.45a1.5 1.5 0 01-2.121-2.121l10.191-10.191m-4.722 9.91l-3.322 3.322" />
                            </svg>
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={image ? t('chatbot.describeImage') : t('chatbot.howCanIHelp')}
                            className="flex-1 bg-transparent px-2 py-2 outline-none text-sm text-text font-medium placeholder:text-text-muted"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="bg-primary hover:opacity-90 text-white p-3 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-primary/25 active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 ml-0.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* First-visit tooltip notification */}
            <div
                className={`pointer-events-auto relative transition-all duration-500 ${
                    showIntroTooltip
                        ? 'scale-100 opacity-100 translate-y-0'
                        : 'scale-75 opacity-0 translate-y-4 pointer-events-none'
                }`}
            >
                <div className="bg-white text-gray-700 text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 whitespace-nowrap">
                    <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                    {t('chatbot.tryAssistant')}
                    <button
                        onClick={(e) => { e.stopPropagation(); dismissTooltip(); }}
                        className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className={`absolute -bottom-1.5 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45 ${isRTL ? 'left-8' : 'right-8'}`}></div>
            </div>

            {/* Calming, pulsing floating trigger button */}
            <button
                onClick={() => { dismissTooltip(); setIsOpen(!isOpen); }}
                className={`pointer-events-auto ${showIntroTooltip ? 'ring-2 ring-primary/40' : ''} bg-primary text-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] flex items-center justify-center group relative overflow-hidden`}
            >
                {/* Subtle continuous organic background breathing pulse */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-7 h-7 group-hover:-rotate-6 transition-transform duration-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default Chatbot;