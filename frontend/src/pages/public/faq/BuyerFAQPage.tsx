import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../hooks/useLanguage';
import { PublicLayout } from '../../../components/layout/PublicLayout';
import { traducciones } from './traduccion';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const BuyerFAQPage: React.FC = () => {
    const { t } = useLanguage();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        { q: t(traducciones, 'q1'), a: t(traducciones, 'a1') },
        { q: t(traducciones, 'q2'), a: t(traducciones, 'a2') },
        { q: t(traducciones, 'q3'), a: t(traducciones, 'a3') },
        { q: t(traducciones, 'q4'), a: t(traducciones, 'a4') },
        { q: t(traducciones, 'q5'), a: t(traducciones, 'a5') },
    ];

    return (
        <PublicLayout>
            <div className="container mx-auto px-4 py-20 max-w-4xl">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-12 h-12 text-primary mb-6"
                    >
                        <HelpCircle className="w-10 h-10" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
                        {t(traducciones, 'title')}
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        {t(traducciones, 'subtitle')}
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <motion.div
                            key={idx}
                            className="border border-border/50 rounded-2xl bg-card overflow-hidden"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-muted/30 transition-colors group"
                            >
                                <span className="text-lg font-bold">{faq.q}</span>
                                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {openIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-8 pb-6 text-muted-foreground leading-relaxed">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Content ending without CTA as requested */}
            </div>
        </PublicLayout>
    );
};
