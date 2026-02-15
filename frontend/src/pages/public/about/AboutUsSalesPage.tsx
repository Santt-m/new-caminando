import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../hooks/useLanguage';
import { PublicLayout } from '../../../components/layout/PublicLayout';
import { Button } from '../../../components/ui/button';
import { traducciones } from './traduccion';
import { Palette, Rocket, Heart, ShieldCheck } from 'lucide-react';

export const AboutUsSalesPage: React.FC = () => {
    const { t } = useLanguage();

    const values = [
        {
            icon: Palette,
            title: t(traducciones, 'personalizationTitle'),
            desc: t(traducciones, 'personalizationDesc'),
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            border: "hover:border-indigo-500/50"
        },
        {
            icon: Rocket,
            title: t(traducciones, 'turnkeyTitle'),
            desc: t(traducciones, 'turnkeyDesc'),
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "hover:border-amber-500/50"
        },
        {
            icon: Heart,
            title: t(traducciones, 'managedTitle'),
            desc: t(traducciones, 'managedDesc'),
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "hover:border-emerald-500/50"
        }
    ];

    return (
        <PublicLayout fullWidth>
            <div className="flex flex-col w-full min-h-screen">
                {/* Hero Section - Premium Overhaul */}
                <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-32 overflow-hidden">
                    {/* Background Decorative Elements */}
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                            x: [0, 10, 0],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"
                    />
                    <motion.div
                        animate={{
                            y: [0, 20, 0],
                            x: [0, -10, 0],
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none"
                    />

                    <div className="container mx-auto px-4 relative z-10">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: {
                                    transition: {
                                        staggerChildren: 0.2
                                    }
                                }
                            }}
                            className="max-w-5xl mx-auto text-center"
                        >
                            <motion.h1
                                className="text-5xl md:text-8xl font-black mb-8 tracking-tighter text-foreground leading-[0.9]"
                                variants={{
                                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                                    visible: { opacity: 1, y: 0, scale: 1 }
                                }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {t(traducciones, 'title')}
                            </motion.h1>

                            <motion.p
                                className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium"
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {t(traducciones, 'subtitle')}
                            </motion.p>
                        </motion.div>
                    </div>
                </section>

                {/* Values Section - Glassmorphism Cards */}
                <section className="py-24 relative overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-8">
                            {values.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    className={`group relative p-10 rounded-[2.5rem] bg-card/50 backdrop-blur-xl border border-border shadow-sm transition-all duration-500 ${item.border}`}
                                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    whileHover={{ y: -10 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{
                                        duration: 0.8,
                                        delay: idx * 0.1,
                                        ease: [0.16, 1, 0.3, 1]
                                    }}
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                                        <item.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight mb-4 text-foreground">{item.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed font-medium">
                                        {item.desc}
                                    </p>

                                    {/* Decorative subtle gradient on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* New Section: Tech DNA / Excellence Protocol */}
                <section className="py-32 bg-muted/30 relative overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row items-center gap-20">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="lg:w-1/2"
                            >
                                <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground mb-8 leading-tight">
                                    {t(traducciones, 'dnaTitle')}
                                </h2>
                                <div className="space-y-8">
                                    {[
                                        { title: t(traducciones, 'dnaPerfTitle'), icon: Rocket, desc: t(traducciones, 'dnaPerfDesc') },
                                        { title: t(traducciones, 'dnaSecTitle'), icon: ShieldCheck, desc: t(traducciones, 'dnaSecDesc') },
                                        { title: t(traducciones, 'dnaScalTitle'), icon: Palette, desc: t(traducciones, 'dnaScalDesc') }
                                    ].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.15 + 0.3 }}
                                            className="flex gap-6 group"
                                        >
                                            <div className="shrink-0 w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-indigo-500/30 transition-all duration-300">
                                                <item.icon className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-foreground mb-2 group-hover:text-indigo-500 transition-colors">{item.title}</h4>
                                                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 30, scale: 0.9 }}
                                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="lg:w-1/2 w-full"
                            >
                                <div className="relative aspect-square max-w-md mx-auto">
                                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[80px] animate-pulse" />
                                    <div className="relative z-10 w-full h-full bg-card rounded-[3rem] border border-border shadow-2xl p-8 flex items-center justify-center overflow-hidden group">
                                        <div className="text-center">
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                                                className="text-8xl font-black text-indigo-500 mb-4 tracking-tighter"
                                            >
                                                {t(traducciones, 'dnaSpeedVal')}
                                            </motion.div>
                                            <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{t(traducciones, 'dnaSpeedLabel')}</div>
                                        </div>
                                        {/* Abstract lines decoration */}
                                        <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                                            <div className="absolute top-0 right-0 w-full h-full border-[1px] border-indigo-500/30 rounded-full scale-150 -translate-x-1/2 translate-y-1/2" />
                                            <div className="absolute top-0 right-0 w-full h-full border-[1px] border-indigo-500/30 rounded-full scale-125 -translate-x-1/4 translate-y-1/4" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Trust/Narrative Section - Enhanced */}
                <section className="py-32 relative overflow-hidden">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="max-w-6xl mx-auto bg-indigo-600 rounded-[4rem] p-12 md:p-24 relative overflow-hidden text-white shadow-2xl"
                        >
                            {/* Decorative background for trust box */}
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 5, 0],
                                }}
                                transition={{
                                    duration: 15,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"
                            />

                            <div className="relative z-10">
                                <div className="flex flex-col lg:flex-row gap-16 items-center">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3, duration: 0.8 }}
                                        className="lg:w-2/3"
                                    >
                                        <h2 className="text-4xl md:text-5xl font-black mb-10 tracking-tighter leading-none">{t(traducciones, 'trustTitle')}</h2>
                                        <div className="space-y-8 text-xl text-indigo-100 font-medium leading-relaxed">
                                            <p>
                                                {t(traducciones, 'trustDesc')}
                                            </p>
                                            <motion.p
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 0.6, duration: 0.8 }}
                                                className="border-l-4 border-amber-400 pl-8 italic text-2xl text-white"
                                            >
                                                "{t(traducciones, 'trustQuote')}"
                                            </motion.p>
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, rotate: 2 }}
                                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5, duration: 1, type: "spring" }}
                                        className="lg:w-1/3 w-full"
                                    >
                                        <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/20 hover:bg-white/15 transition-colors duration-500 group">
                                            <h4 className="text-xl font-bold mb-8">{t(traducciones, 'teamTitle')}</h4>
                                            <div className="flex flex-col gap-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform">SD</div>
                                                    <div>
                                                        <p className="font-bold">Santt Developments</p>
                                                        <p className="text-xs text-indigo-200 uppercase tracking-widest font-bold">{t(traducciones, 'teamSubtitle')}</p>
                                                    </div>
                                                </div>
                                                <a href="https://santtdevelopments.vercel.app/es/contacto" target="_blank" rel="noopener noreferrer">
                                                    <Button size="lg" className="w-full bg-white text-indigo-600 hover:bg-white/90 font-black py-6 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]" variant="default">
                                                        {t(traducciones, 'cta')}
                                                    </Button>
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
};
