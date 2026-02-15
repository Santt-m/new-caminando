import React from 'react';
import { useLanguage } from '../../../hooks/useLanguage';
import { PublicLayout } from '../../../components/layout/PublicLayout';
import { traducciones } from './traduccion';
import { Shield, FileText, Lock, Info } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Link, useLocation } from 'react-router-dom';

const LegalLayout: React.FC<{ title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, subtitle, icon, children }) => {
    const { pathname } = useLocation();

    const menuItems = [
        { path: '/aviso-legal', label: 'Aviso Legal' },
        { path: '/privacidad', label: 'Privacidad' },
        { path: '/cookies', label: 'Cookies' },
        { path: '/terminos', label: 'Términos' },
        { path: '/ventas', label: 'Contratación' },
    ];

    return (
        <PublicLayout>
            <div className="bg-background pt-24 pb-32">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
                        {/* Sidebar Navigation */}
                        <aside className="lg:w-64 flex-shrink-0">
                            <div className="sticky top-24 space-y-8">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 px-4">
                                        Documentación Legal
                                    </h3>
                                    <nav className="flex flex-col gap-1">
                                        {menuItems.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === item.path
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                                    }`}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </nav>
                                </div>

                                <Card className="p-6 bg-primary/5 border-primary/10 hidden lg:block rounded-2xl">
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Esta documentación es parte integral de nuestro compromiso con la transparencia y el cumplimiento normativo.
                                    </p>
                                </Card>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <main className="flex-1 max-w-3xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    {icon}
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">{title}</h1>
                                    <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
                                </div>
                            </div>

                            <Card className="p-8 md:p-12 border-border/60 shadow-sm rounded-[2.5rem]">
                                <div className="flex justify-between items-center mb-10 pb-6 border-b border-border/40">
                                    <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
                                        Santt Market Motor • Software de Ecommerce
                                    </div>
                                    <div className="text-[10px] text-muted-foreground/40 text-right">
                                        Última actualización<br />Enero 2024
                                    </div>
                                </div>

                                <div className="prose prose-slate dark:prose-invert max-w-none 
                                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                                    prose-p:text-muted-foreground prose-p:leading-relaxed
                                    prose-li:text-muted-foreground
                                    space-y-8"
                                >
                                    {children}
                                </div>
                            </Card>
                        </main>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export const AvisoLegal: React.FC = () => {
    const { t } = useLanguage();
    return (
        <LegalLayout
            title={t(traducciones, 'legalNotice')}
            subtitle={t(traducciones, 'legalNoticeSubtitle')}
            icon={<Info className="h-6 w-6" />}
        >
            <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">{t(traducciones, 'ownerTitle')}</h2>
                <ul className="space-y-2">
                    <li className="flex items-center gap-2">• {t(traducciones, 'ownerName')}</li>
                    <li className="flex items-center gap-2">• {t(traducciones, 'ownerFiscalId')}</li>
                    <li className="flex items-center gap-2">• {t(traducciones, 'ownerAddress')}</li>
                    <li className="flex items-center gap-2">• {t(traducciones, 'ownerEmail')}</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">{t(traducciones, 'objectTitle')}</h2>
                <p>{t(traducciones, 'objectDesc')}</p>
            </section>
        </LegalLayout>
    );
};

export const PoliticaPrivacidad: React.FC = () => {
    const { t } = useLanguage();
    return (
        <LegalLayout
            title={t(traducciones, 'privacyPolicy')}
            subtitle={t(traducciones, 'privacySubtitle')}
            icon={<Lock className="h-6 w-6" />}
        >
            <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">{t(traducciones, 'dataCollection')}</h2>
                <p>{t(traducciones, 'dataCollectionDesc')}</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">{t(traducciones, 'dataPurpose')}</h2>
                <p>{t(traducciones, 'dataPurposeDesc')}</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">{t(traducciones, 'userRights')}</h2>
                <p>{t(traducciones, 'userRightsDesc')}</p>
            </section>
        </LegalLayout>
    );
};

export const PoliticaCookies: React.FC = () => {
    const { t } = useLanguage();
    return (
        <LegalLayout
            title={t(traducciones, 'cookiesPolicy')}
            subtitle={t(traducciones, 'cookiesSubtitle')}
            icon={<Shield className="h-6 w-6" />}
        >
            <section className="space-y-4">
                <p>{t(traducciones, 'cookieIntro')}</p>
            </section>

            <section className="space-y-4 border-l-2 border-primary/20 pl-4 py-2">
                <h2 className="text-lg font-bold text-foreground">{t(traducciones, 'essentialCookies')}</h2>
                <p>{t(traducciones, 'essentialCookiesDesc')}</p>
            </section>

            <section className="space-y-4 border-l-2 border-primary/20 pl-4 py-2">
                <h2 className="text-lg font-bold text-foreground">{t(traducciones, 'analyticalCookies')}</h2>
                <p>{t(traducciones, 'analyticalCookiesDesc')}</p>
            </section>
        </LegalLayout>
    );
};

export const TerminosCondiciones: React.FC = () => {
    const { t } = useLanguage();
    return (
        <LegalLayout
            title={t(traducciones, 'termsConditions')}
            subtitle={t(traducciones, 'termsSubtitle')}
            icon={<FileText className="h-6 w-6" />}
        >
            <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">{t(traducciones, 'usageRules')}</h2>
                <p>{t(traducciones, 'usageRulesDesc')}</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">{t(traducciones, 'liability')}</h2>
                <p>{t(traducciones, 'liabilityDesc')}</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">{t(traducciones, 'intellectualPropertyTitle')}</h2>
                <p>{t(traducciones, 'intellectualPropertyDesc')}</p>
            </section>
        </LegalLayout>
    );
};

export const CondicionesContratacion: React.FC = () => {
    const { t } = useLanguage();
    return (
        <LegalLayout
            title={t(traducciones, 'salesConditions')}
            subtitle={t(traducciones, 'salesSubtitle')}
            icon={<Shield className="h-6 w-6" />}
        >
            <section className="space-y-4 text-sm">
                <h2 className="text-lg font-bold text-foreground">{t(traducciones, 'pricesTitle')}</h2>
                <p>{t(traducciones, 'pricesDesc')}</p>

                <h2 className="text-lg font-bold text-foreground">{t(traducciones, 'paymentTitle')}</h2>
                <p>{t(traducciones, 'paymentDesc')}</p>

                <h2 className="text-lg font-bold text-foreground">{t(traducciones, 'withdrawalTitle')}</h2>
                <p>{t(traducciones, 'withdrawalDesc')}</p>

                <h2 className="text-lg font-bold text-foreground">{t(traducciones, 'warrantyTitle')}</h2>
                <p>{t(traducciones, 'warrantyDesc')}</p>
            </section>
        </LegalLayout>
    );
};
