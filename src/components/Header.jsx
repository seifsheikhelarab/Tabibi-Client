import React, { useRef, useEffect } from 'react'
import { assets } from '../assets/assets'
import { useTranslation } from 'react-i18next'

const InteractiveHeaderCanvas = () => {
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

        const blobs = [];
        for (let i = 0; i < 12; i++) {
            blobs.push({
                x: Math.random() * width,
                y: Math.random() * height,
                baseX: Math.random() * width,
                baseY: Math.random() * height,
                radius: 80 + Math.random() * 120,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                angle: Math.random() * Math.PI * 2,
                angleSpeed: 0.002 + Math.random() * 0.004,
                amplitude: 15 + Math.random() * 20,
                color: i % 3 === 0 
                    ? 'rgba(255, 255, 255, 0.06)' 
                    : i % 3 === 1 
                        ? 'rgba(255, 255, 255, 0.04)' 
                        : 'rgba(95, 111, 255, 0.03)'
            });
        }

        let mouse = { x: -1000, y: -1000 };
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };
        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        const parent = canvas.parentElement;
        if (parent) {
            parent.addEventListener('mousemove', handleMouseMove);
            parent.addEventListener('mouseleave', handleMouseLeave);
        }

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            blobs.forEach(blob => {
                blob.angle += blob.angleSpeed;
                const driftX = Math.cos(blob.angle) * blob.amplitude;
                const driftY = Math.sin(blob.angle) * blob.amplitude;

                blob.baseX += blob.speedX;
                blob.baseY += blob.speedY;

                if (blob.baseX < -50) blob.baseX = width + 50;
                if (blob.baseX > width + 50) blob.baseX = -50;
                if (blob.baseY < -50) blob.baseY = height + 50;
                if (blob.baseY > height + 50) blob.baseY = -50;

                let targetX = blob.baseX + driftX;
                let targetY = blob.baseY + driftY;

                const dx = mouse.x - targetX;
                const dy = mouse.y - targetY;
                const dist = Math.hypot(dx, dy);
                if (dist < 260) {
                    const force = (260 - dist) / 260;
                    const angle = Math.atan2(dy, dx);
                    targetX -= Math.cos(angle) * force * 55;
                    targetY -= Math.sin(angle) * force * 55;
                }

                blob.x += (targetX - blob.x) * 0.08;
                blob.y += (targetY - blob.y) * 0.08;

                ctx.beginPath();
                ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
                ctx.fillStyle = blob.color;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (parent) {
                parent.removeEventListener('mousemove', handleMouseMove);
                parent.removeEventListener('mouseleave', handleMouseLeave);
            }
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-85 z-0" />;
};

const Header = () => {
    const { t } = useTranslation()

    return (
        <div className='relative flex flex-col md:flex-row items-center bg-primary rounded-[2rem] px-8 md:px-16 lg:px-20 py-14 md:py-18 overflow-hidden shadow-lg animate-fade-in-up mt-6'>

            <InteractiveHeaderCanvas />

            <div className='absolute top-0 right-0 w-[400px] h-[400px] bg-white/8 rounded-full blur-[100px] pointer-events-none z-0'></div>
            <div className='absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px] pointer-events-none z-0'></div>

            <div className='md:w-7/12 flex flex-col items-start justify-center gap-6 py-4 relative z-10'>
                
                <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse-ring"></span>
                    <span className="text-white/80 text-[10px] uppercase tracking-widest font-semibold">{t('header.bookWithConfidence')}</span>
                </div>

                <h1 className='text-4xl md:text-5xl lg:text-[3.5rem] text-white font-display font-extrabold leading-[1.1] tracking-tight'>
                    {t('header.bookAppointment')} <br />
                    <span className='text-blue-100 relative'>
                        {t('header.withTrustedDoctors')}
                        <svg className="absolute left-0 bottom-[-8px] w-full h-2.5 text-white/25" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 9C60 3.5 180 3.5 297 7.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </span>
                </h1>

                <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 text-white/80 max-w-lg mt-1'>
                    <img className='w-24 drop-shadow-lg hover:scale-105 transition-transform duration-300' src={assets.group_profiles} alt="Trusted Doctors" />
                    <p className='leading-relaxed text-sm font-medium text-white/85'>
                        {t('header.exploreNetwork')}
                    </p>
                </div>

                <a
                    href='#speciality'
                    className='flex items-center gap-3 bg-white px-8 py-4 rounded-xl text-primary font-bold text-sm hover:bg-white/95 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-lg group'
                >
                    {t('header.bookNow')}
                    <img className='w-3 rtl:scale-x-flip group-hover:translate-x-1 group-hover:-translate-x-1 transition-transform' src={assets.arrow_icon} alt="Arrow" />
                </a>
            </div>

            <div className='md:w-5/12 flex items-center justify-center relative z-10 mt-10 md:mt-0'>
                <div className="absolute w-[20rem] h-[20rem] bg-white/5 rounded-full border border-white/10 blur-sm animate-float"></div>
                <div className="absolute w-[16rem] h-[16rem] bg-blue-300/8 rounded-full border border-white/10 scale-95 animate-float [animation-delay:2s]"></div>

                <img
                    className='w-full max-w-sm object-contain drop-shadow-2xl relative z-10 hover:scale-102 transition-transform duration-700'
                    src={assets.header_img}
                    alt="Medical Professional"
                />
            </div>
        </div>
    )
}

export default Header