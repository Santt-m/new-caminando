import React from 'react';
import { PublicLayout } from '../../../components/layout/PublicLayout';
import { useLanguage } from '@/hooks/useLanguage';
import { traducciones } from './traduccion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Shield, Zap, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <PublicLayout fullWidth>
            {/* Hero Section */}
            <div className="relative py-24 px-6 md:px-12 lg:px-24 bg-background overflow-hidden">
                <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
                    <Badge variant="outline" className="px-4 py-1 text-sm border-primary/20 text-primary bg-primary/5 backdrop-blur-sm">
                        {t(traducciones, 'badge')}
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        {t(traducciones, 'title')} <br />
                        <span className="text-primary">{t(traducciones, 'titleHighlight')}</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {t(traducciones, 'description')}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Button size="lg" className="h-12 px-8 text-lg" onClick={() => navigate('/admin/login')}>
                            {t(traducciones, 'getStarted')}
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8 text-lg" onClick={() => navigate('/components')}>
                            {t(traducciones, 'viewComponents')}
                        </Button>
                    </div>
                </div>
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0 pointer-events-none opacity-20">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
                    <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[100px]" />
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-20 px-6 md:px-12 bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">{t(traducciones, 'everythingTitle')}</h2>
                        <p className="text-muted-foreground">{t(traducciones, 'everythingSubtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-background/60 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
                            <CardHeader>
                                <Rocket className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>{t(traducciones, 'featServerlessTitle')}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground text-sm">
                                {t(traducciones, 'featServerlessDesc')}
                            </CardContent>
                        </Card>
                        <Card className="bg-background/60 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
                            <CardHeader>
                                <Zap className="h-8 w-8 text-yellow-500 mb-2" />
                                <CardTitle>{t(traducciones, 'featStackTitle')}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground text-sm">
                                {t(traducciones, 'featStackDesc')}
                            </CardContent>
                        </Card>
                        <Card className="bg-background/60 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
                            <CardHeader>
                                <Shield className="h-8 w-8 text-green-500 mb-2" />
                                <CardTitle>{t(traducciones, 'featAuthTitle')}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground text-sm">
                                {t(traducciones, 'featAuthDesc')}
                            </CardContent>
                        </Card>
                        <Card className="bg-background/60 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
                            <CardHeader>
                                <Layers className="h-8 w-8 text-blue-500 mb-2" />
                                <CardTitle>{t(traducciones, 'featDesignTitle')}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground text-sm">
                                {t(traducciones, 'featDesignDesc')}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};
