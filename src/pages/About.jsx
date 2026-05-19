import React, { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { assets } from '../assets/assets'

const AboutCalmCanvas = () => {
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

            const time = Date.now() * 0.0005;
            const breathe = Math.sin(time) * 0.5 + 0.5;

            ctx.beginPath();
            ctx.fillStyle = 'rgba(95, 111, 255, 0.015)';
            ctx.moveTo(0, height);
            for (let x = 0; x <= width; x += 6) {
                const y = height * 0.5 + 
                          Math.sin(x * 0.005 + phase) * (20 + breathe * 25) + 
                          Math.cos(x * 0.002 - phase) * (10 + breathe * 15);
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fill();

            phase += 0.006;
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

const About = () => {
    const { t } = useTranslation()
    return (
        <div className="pb-20 animate-fade-in-up">

            <div className='relative text-center pt-20 pb-16 px-6 bg-gradient-to-b from-blue-50/20 via-white to-transparent rounded-[2rem] overflow-hidden border border-border-light mb-6 mt-6'>
                <AboutCalmCanvas />
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        <span className="text-primary text-[10px] uppercase tracking-widest font-bold">{t('about.ourMission')}</span>
                    </div>

                    <h1 className='text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-text tracking-tight leading-tight max-w-4xl mx-auto'>
                        {t('about.transformingHealthcare')} <br />
                        <span className="text-primary relative">
                            {t('about.accessForEveryone')}
                            <svg className="absolute left-0 bottom-[-8px] w-full h-2.5 text-primary/10" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 9C60 3.5 180 3.5 297 7.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </span>
                    </h1>
                    
                    <p className='mt-5 text-text-secondary max-w-2xl mx-auto text-base font-medium leading-relaxed'>
                        {t('about.discoverStory')}
                    </p>
                </div>
            </div>

            <div className='flex flex-col lg:flex-row items-center gap-14 lg:gap-20 py-16'>
                <div className='relative group flex-shrink-0'>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-[2rem] -rotate-3 blur-sm transition-transform duration-500 group-hover:rotate-0"></div>
                    
                    <img
                        className='w-full lg:max-w-md rounded-[1.8rem] shadow-lg relative z-10 border-4 border-white transition-transform duration-500 group-hover:scale-102'
                        src={assets.about_image}
                        alt="About Tabibi"
                    />
                </div>

                <div className='flex flex-col gap-8 flex-1'>
                    <div className='space-y-5 text-text-secondary leading-relaxed font-medium text-base'>
                        <p>
                            {t('about.welcomeTo')} <span className='text-primary font-bold'>Tabibi</span>, {t('about.yourTrustedCompanion')} {t('about.weUnderstand')}
                        </p>
                        <p>
                            {t('about.atTabibi')}
                        </p>
                    </div>

                    <div className='bg-gradient-to-br from-primary/5 to-transparent p-8 rounded-2xl border border-primary/10 relative overflow-hidden'>
                        <span className="absolute top-2 left-4 text-7xl font-black text-primary/10 select-none">&ldquo;</span>
                        <h3 className='text-xs font-bold text-primary uppercase tracking-widest mb-3 relative z-10'>
                            {t('about.ourUnifiedVision')}
                        </h3>
                        <p className='text-text-secondary relative z-10 font-medium text-sm leading-relaxed'>
                            {t('about.ourGoal')}
                        </p>
                    </div>
                </div>
            </div>

            <div className='mt-24'>
                <div className='mb-10'>
                    <h2 className='text-3xl font-display font-extrabold text-text tracking-tight'>{t('about.whyPatientsChoose')}</h2>
                    <div className='h-0.5 w-16 bg-primary rounded-full mt-3'></div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    {[
                        {
                            title: t('about.absoluteEfficiency'),
                            desc: t('about.frictionFree'),
                            tag: t('about.timeSaving')
                        },
                        {
                            title: t('about.seamlessConvenience'),
                            desc: t('about.instantDirectory'),
                            tag: t('about.easyAccess')
                        },
                        {
                            title: t('about.empatheticFocus'),
                            desc: t('about.soothingVisual'),
                            tag: t('about.wellnessCentered')
                        }
                    ].map((item, index) => (
                        <div
                            key={index}
                            style={{ animationDelay: `${index * 50}ms` }}
                            className='bg-white p-7 rounded-2xl border border-border-light hover:shadow-md transition-all duration-300 animate-fade-in-up'
                        >
                            <span className='inline-block text-[10px] font-bold bg-primary/5 text-primary px-3 py-1.5 rounded-full uppercase tracking-wider mb-4'>{item.tag}</span>
                            <h3 className='text-lg font-display font-bold text-text mb-2'>{item.title}</h3>
                            <p className='text-text-secondary leading-relaxed font-medium text-sm'>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default About