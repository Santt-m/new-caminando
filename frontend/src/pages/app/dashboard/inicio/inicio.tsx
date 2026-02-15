import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Activity,
    User,
    Settings,
    Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { traducciones } from './traduccion';

export const DashboardInicio: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Welcome */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        {t(traducciones, 'hello')}, {user?.name.split(' ')[0] || t(traducciones, 'user')} 👋
                    </h1>
                    <p className="text-muted-foreground">{t(traducciones, 'welcome')}</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/app/dashboard/ajustes')}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t(traducciones, 'settings')}
                </Button>
            </div>

            {/* Quick Stats Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t(traducciones, 'accountStatus')}</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{t(traducciones, 'active')}</div>
                        <p className="text-xs text-muted-foreground">
                            {t(traducciones, 'planStandard')}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t(traducciones, 'security')}</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{t(traducciones, 'protected')}</div>
                        <p className="text-xs text-muted-foreground">
                            {t(traducciones, 'authEnabled')}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t(traducciones, 'recentActivity')}</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12%</div>
                        <p className="text-xs text-muted-foreground">
                            {t(traducciones, 'vsLastMonth')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>{t(traducciones, 'generalSummary')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            {t(traducciones, 'activityChart')}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>{t(traducciones, 'recentAccess')}</CardTitle>
                        <div className="text-sm text-muted-foreground">
                            {t(traducciones, 'loginHistory')}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <Badge variant="outline" className="mr-2">{t(traducciones, 'new')}</Badge>
                                <span className="text-sm text-muted-foreground">{t(traducciones, 'loginFrom')} Chrome (Linux)</span>
                            </div>
                            <div className="flex items-center">
                                <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                                <span className="text-sm text-muted-foreground">{t(traducciones, 'profileUpdated')}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
