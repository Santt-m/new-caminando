
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { BRANDING } from '@/config/branding';

interface ConversionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ConversionModal: React.FC<ConversionModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    // Logos de tiendas (Simulados con texto estilizado por ahora o iconos si tuviéramos)
    const stores = ['Tienda A', 'Tienda B', 'Tienda C'];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-lg relative"
                >
                    <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl">
                        {/* Header con gradiente */}
                        <div className="bg-linear-to-r from-indigo-600 to-violet-600 p-6 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <TrendingUp size={120} />
                            </div>

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3">
                                    <TrendingUp size={14} />
                                    <span>Ahorro Inteligente</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                                    ¡Ahorra Inteligentemente!
                                </h2>
                                <p className="text-indigo-100">
                                    Desbloquea todo el potencial de {BRANDING.appName}.
                                </p>
                            </motion.div>
                        </div>

                        {/* Body */}
                        <div className="p-6 md:p-8 space-y-6 bg-background">

                            {/* Social Proof Counter */}
                            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                                <div className="flex -space-x-3 overflow-hidden">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={`inline - block h - 8 w - 8 rounded - full ring - 2 ring - background bg - indigo - ${i * 100 + 100} `} />
                                    ))}
                                    <div className="h-8 w-8 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[10px] font-bold">
                                        +1k
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        <span className="text-primary font-bold">1.250 personas</span> ahorraron hoy.
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Últimas 24hs usando filtros inteligentes.
                                    </p>
                                </div>
                            </div>

                            {/* Value Proposition */}
                            <div className="text-center space-y-2">
                                <p className="text-muted-foreground text-sm">
                                    Los usuarios registrados ahorran en promedio
                                </p>
                                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-violet-600">
                                    $15.400
                                </div>
                                <p className="text-muted-foreground text-sm font-medium">
                                    al mes comparando precios.
                                </p>
                            </div>

                            {/* Store Logos Strip */}
                            <div className="pt-2">
                                <p className="text-xs text-center text-muted-foreground uppercase tracking-wider mb-3">
                                    Compara en tiempo real
                                </p>
                                <div className="flex flex-wrap justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                    {stores.map(store => (
                                        <span key={store} className="px-2 py-1 bg-muted rounded text-xs font-semibold">
                                            {store}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* CTAs */}
                            <div className="space-y-3 pt-2">
                                <Button
                                    variant="default"
                                    className="w-full text-base py-6 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                    onClick={() => navigate('/register')}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Crear cuenta gratis
                                        <CheckCircle2 size={18} />
                                    </span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-muted-foreground hover:text-foreground"
                                    onClick={() => navigate('/login')}
                                >
                                    Ya tengo cuenta
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
