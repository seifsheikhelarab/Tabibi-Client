import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { chatbotApi } from '../api/client';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hello! I am your Tabibi assistant. Describe your symptoms, and I will recommend a specialist for you.' }
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

            setMessages(prev => [...prev, {
                role: 'ai',
                text: response.reply || response.message || "I understand your symptoms. Let me help you find the right specialist.",
                doctors: response.doctors || []
            }]);
        } catch (error) {
            console.error(error);
            toast.error("Failed to connect to assistant.");
            setMessages(prev => [...prev, { role: 'ai', text: "Network error. Please make sure the backend is running." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="fixed bottom-14 right-8 z-50 flex flex-col items-end gap-5 font-sans transition-all duration-300">

            {/* Chat Window */}
            {isOpen && (
                <div className="glass rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-[360px] sm:w-[400px] h-[520px] max-h-[75vh] flex flex-col overflow-hidden animate-fade-in-up border border-white/50 ring-1 ring-black/5">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-blue-600 p-5 flex justify-between items-center text-white shadow-md">
                        <div className='flex items-center gap-3'>
                            <div className='relative'>
                                <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm'>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                    </svg>
                                </div>
                                <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-primary rounded-full'></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg tracking-tight">Tabibi AI</h3>
                                <p className='text-[10px] text-white/80 uppercase font-bold tracking-widest'>Always Online</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-all group">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:rotate-90 transition-transform">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 scroll-smooth bg-transparent">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex flex-col gap-3 ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in-up`}>

                                {/* Message Bubble */}
                                <div className={`p-4 rounded-3xl max-w-[88%] text-sm leading-relaxed transition-all transform hover:scale-[1.01] ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-primary to-blue-700 text-white rounded-br-none shadow-lg shadow-primary/20'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
                                    }`}>
                                    {msg.image && (
                                        <div className='mb-3 overflow-hidden rounded-xl border border-white/30 shadow-inner'>
                                            <img src={msg.image} alt="Uploaded" className="max-w-full transform transition-transform hover:scale-110 duration-500" />
                                        </div>
                                    )}
                                    <p>{msg.text}</p>
                                </div>

                                {/* Recommended Doctors Cards */}
                                {msg.doctors && msg.doctors.length > 0 && (
                                    <div className="flex overflow-x-auto gap-4 w-full py-2 no-scrollbar">
                                        {msg.doctors.map((doc, i) => (
                                            <div key={i} onClick={() => { navigate(`/appointment/${doc._id}`); setIsOpen(false) }}
                                                className="min-w-[180px] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center group">
                                                <div className='relative mb-3'>
                                                    <img src={doc.image} alt={doc.name} className="w-16 h-16 rounded-full object-cover bg-blue-50 border-2 border-primary/10 group-hover:border-primary transition-colors" />
                                                    <div className='absolute -bottom-1 -right-1 bg-green-400 w-4 h-4 rounded-full border-2 border-white'></div>
                                                </div>
                                                <p className="text-xs font-extra-bold text-gray-900 group-hover:text-primary transition-colors">{doc.name}</p>
                                                <p className="text-[10px] text-gray-500 mb-3 font-medium">{doc.speciality}</p>
                                                <button className='w-full text-[10px] bg-gray-50 text-primary py-2 rounded-xl font-bold group-hover:bg-primary group-hover:text-white transition-all shadow-sm'>Book Now</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start">
                                <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white/80 backdrop-blur-md border-t border-white/30 rounded-b-3xl">
                        {imagePreview && (
                            <div className="relative inline-block mb-3 ml-2 group">
                                <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-2xl border-2 border-primary/20 shadow-lg ring-4 ring-white" />
                                <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[12px] shadow-xl hover:bg-red-600 transition-colors transform hover:scale-110 active:scale-95">✕</button>
                            </div>
                        )}
                        <div className="flex gap-2 bg-white/60 p-1.5 rounded-3xl border border-gray-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all items-center shadow-inner">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                ref={fileInputRef}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="p-2.5 rounded-2xl transition-all text-gray-400 hover:text-primary hover:bg-primary/5 group"
                                title="Upload Medical Report/Image"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 transition-transform group-hover:scale-110">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94a3 3 0 114.243 4.243L8.767 17.45a1.5 1.5 0 01-2.121-2.121l10.191-10.191m-4.722 9.91l-3.322 3.322" />
                                </svg>
                            </button>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={image ? "Describe this image..." : "How can I help you today?"}
                                className="flex-1 bg-transparent px-2 py-2 outline-none text-sm text-gray-800 font-medium placeholder:text-gray-400"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading}
                                className="bg-primary hover:bg-blue-600 text-white p-3 rounded-2xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-primary/30 active:scale-90"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 ml-0.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gradient-to-br from-primary to-blue-600 text-white p-5 rounded-[2rem] shadow-[0_15px_30px_rgba(59,130,246,0.3)] hover:shadow-[0_20px_40px_rgba(59,130,246,0.5)] transition-all duration-300 transform hover:-translate-y-2 active:scale-95 flex items-center justify-center ring-4 ring-white/80 backdrop-blur-sm group"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 group-hover:rotate-12 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 group-hover:-rotate-12 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default Chatbot;
