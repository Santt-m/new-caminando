import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailMetrics } from './components/EmailMetrics';
import { TemplateEditor } from './components/TemplateEditor';
import { EmailLogs } from './components/EmailLogs';
import { adminEmailService, type EmailTemplate } from '@/services/admin/emailService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export const EmailDashboard = () => {
    const { showToast } = useToast();
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const data = await adminEmailService.getTemplates();
            setTemplates(data);
            // Select first template by default if none selected
            if (!selectedTemplate && data.length > 0) {
                setSelectedTemplate(data[0]);
            }
        } catch (error) {
            console.error(error);
            showToast({ type: 'error', message: 'Error al cargar plantillas' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleSave = () => {
        fetchTemplates();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-100px)] flex flex-col">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Emails</h1>
                <p className="text-muted-foreground">Administra plantillas y monitorea el envío de correos.</p>
            </div>

            <Tabs defaultValue="metrics" className="flex-1 flex flex-col">
                <TabsList className="w-max">
                    <TabsTrigger value="metrics">Métricas</TabsTrigger>
                    <TabsTrigger value="logs">Registros (Logs)</TabsTrigger>
                    <TabsTrigger value="templates">Plantillas</TabsTrigger>
                    <TabsTrigger value="settings">Configuración</TabsTrigger>
                </TabsList>

                <TabsContent value="metrics" className="space-y-4">
                    <EmailMetrics />
                </TabsContent>

                <TabsContent value="logs" className="space-y-4">
                    <EmailLogs />
                </TabsContent>

                <TabsContent value="templates" className="flex-1 data-[state=active]:flex flex-col gap-4 h-full mt-4">
                    <Tabs
                        defaultValue={selectedTemplate?._id}
                        onValueChange={(value) => {
                            const template = templates.find(t => t._id === value);
                            if (template) setSelectedTemplate(template);
                        }}
                        className="flex-1 flex flex-col gap-4"
                    >
                        {/* Horizontal TabList for Templates */}
                        <div className="flex items-center justify-between">
                            <TabsList className="w-max h-auto p-1 bg-muted/20">
                                {isLoading ? (
                                    <div className="flex px-4 py-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                    </div>
                                ) : templates.map(template => (
                                    <TabsTrigger
                                        key={template._id}
                                        value={template._id}
                                        className="px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                    >
                                        <Mail className="w-4 h-4 mr-2 opacity-70" />
                                        <span>{template.name}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 h-full overflow-hidden">
                            {selectedTemplate ? (
                                <TemplateEditor
                                    template={selectedTemplate}
                                    onSave={handleSave}
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground border rounded-lg border-dashed">
                                    Selecciona una plantilla para editar
                                </div>
                            )}
                        </div>
                    </Tabs>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración SMTP</CardTitle>
                            <CardDescription>
                                Estas configuraciones se gestionan a través de las variables de entorno (.env).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border rounded bg-muted/50">
                                    <div className="text-sm font-medium text-muted-foreground">Host</div>
                                    <div className="font-mono mt-1">Configurado en .env</div>
                                </div>
                                <div className="p-4 border rounded bg-muted/50">
                                    <div className="text-sm font-medium text-muted-foreground">User</div>
                                    <div className="font-mono mt-1">Configurado en .env</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
