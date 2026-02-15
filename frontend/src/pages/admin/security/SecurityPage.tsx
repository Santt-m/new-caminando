import { Shield, Activity, Globe, AlertTriangle, Settings, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SecurityOverview } from './SecurityOverview';
import { SecurityLogs } from './SecurityLogs';
import { ThreatAnalysis } from './ThreatAnalysis';
import { SecuritySettings } from './SecuritySettings';
import { UserTracking } from './UserTracking';
import { VisitorTracking } from './VisitorTracking';
import { Monitor } from 'lucide-react';

export const SecurityPage = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-linear-to-br from-primary to-primary/70 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Centro de Seguridad</h1>
                            <p className="text-muted-foreground">Monitoreo y análisis de seguridad en tiempo real</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-medium text-emerald-600">Sentinel Activo</span>
                </div>
            </div>

            {/* Tabs Navigation */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
                    <TabsTrigger
                        value="overview"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-2"
                    >
                        <Activity className="h-4 w-4" />
                        Panel General
                    </TabsTrigger>
                    <TabsTrigger
                        value="logs"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-2"
                    >
                        <Globe className="h-4 w-4" />
                        Logs en Vivo
                    </TabsTrigger>
                    <TabsTrigger
                        value="threats"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-2"
                    >
                        <AlertTriangle className="h-4 w-4" />
                        Análisis de Amenazas
                    </TabsTrigger>
                    <TabsTrigger
                        value="users"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-2"
                    >
                        <Users className="h-4 w-4" />
                        Tracking de Usuarios
                    </TabsTrigger>
                    <TabsTrigger
                        value="visitors"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-2"
                    >
                        <Monitor className="h-4 w-4" />
                        Tracking de Visitantes
                    </TabsTrigger>
                    <TabsTrigger
                        value="settings"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-2"
                    >
                        <Settings className="h-4 w-4" />
                        Configuración
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="overview">
                        <SecurityOverview />
                    </TabsContent>

                    <TabsContent value="logs">
                        <SecurityLogs />
                    </TabsContent>

                    <TabsContent value="threats">
                        <ThreatAnalysis />
                    </TabsContent>

                    <TabsContent value="users">
                        <UserTracking />
                    </TabsContent>

                    <TabsContent value="visitors">
                        <VisitorTracking />
                    </TabsContent>

                    <TabsContent value="settings">
                        <SecuritySettings />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};
