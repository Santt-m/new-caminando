import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../hooks/useLanguage';
import { traducciones } from '../../../pages/public/legal/traduccion';
import { Button } from '../button';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookieBanner: React.FC = () => {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-6 left-6 right-6 z-[100] max-w-4xl mx-auto"
                >
                    <div className="bg-card/95 backdrop-blur-xl border border-border/50 p-6 rounded-2xl shadow-2xl shadow-primary/10 flex flex-col md:flex-row items-center gap-6">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0 hidden md:block">
                            <Cookie className="h-6 w-6" />
                        </div>

                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <p className="text-sm text-foreground leading-relaxed">
                                {t(traducciones, 'cookieBannerText')}
                            </p>
                            <Link
                                to="/cookies"
                                className="text-xs font-bold text-primary hover:underline"
                                onClick={() => setIsVisible(false)}
                            >
                                {t(traducciones, 'moreInfo')}
                            </Link>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <Button variant="ghost" size="sm" onClick={handleDecline}>
                                {t(traducciones, 'decline')}
                            </Button>
                            <Button onClick={handleAccept} variant="default" size="sm" className="text-sm">
                                {t(traducciones, 'accept')}
                            </Button>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="p-1 rounded-full text-muted-foreground hover:bg-muted transition-colors ml-2"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
