import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../hooks/useLanguage';
import { traducciones } from '../../../pages/public/home/traduccion';
import { traducciones as traduccionesLegal } from '../../../pages/public/legal/traduccion';
import { traduccionesHeader } from '../Header/traduccion';
import { Logo } from '../../ui/Logo';

export const Footer: React.FC = () => {
    const { t } = useLanguage();
    return (
        <footer className="border-t border-border/40 pt-16 pb-8 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Column 1: Identity */}
                    <div className="space-y-6">
                        <Logo size="lg" />
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            {t(traducciones, 'footerDescr')}
                        </p>
                    </div>

                    {/* Column 2: Explore */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-sm uppercase tracking-widest text-foreground/70">{t(traducciones, 'footerExplore')}</h4>
                        <nav className="flex flex-col gap-4">
                            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t(traduccionesHeader, 'home')}</Link>
                            <Link to="/productos" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t(traduccionesHeader, 'products')}</Link>
                            <Link to="/features" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t(traducciones, 'footerCatalog')}</Link>
                            <Link to="/components" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t(traducciones, 'footerShowcase')}</Link>
                        </nav>
                    </div>

                    {/* Column 3: Empresa */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-sm uppercase tracking-widest text-foreground/70">{t(traducciones, 'footerCompany')}</h4>
                        <nav className="flex flex-col gap-4">
                            <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t(traducciones, 'footerAbout')}</Link>
                            <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t(traducciones, 'footerFaq')}</Link>
                            <Link to="/contacto" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t(traducciones, 'footerContact')}</Link>
                        </nav>
                    </div>

                    {/* Column 4: Legal */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-sm uppercase tracking-widest text-foreground/70">{t(traducciones, 'footerResources')}</h4>
                        <nav className="flex flex-col gap-4">
                            <Link to="/aviso-legal" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t(traduccionesLegal, 'legalNotice')}</Link>
                            <Link to="/privacidad" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t(traduccionesLegal, 'privacyPolicy')}</Link>
                            <Link to="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t(traduccionesLegal, 'cookiesPolicy')}</Link>
                            <Link to="/terminos" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t(traduccionesLegal, 'termsConditions')}</Link>
                            <Link to="/ventas" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t(traduccionesLegal, 'salesConditions')}</Link>
                        </nav>
                    </div>
                </div>

                <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-[10px] text-muted-foreground/40 uppercase tracking-tighter">
                        Powered by <a href="https://santtdevelopments.vercel.app/es" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline underline-offset-2">Santt Developments</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
