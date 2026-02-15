import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { adminEmailService, type EmailTemplate } from '@/services/admin/emailService';
import { useToast } from '@/hooks/useToast';
import { Copy } from 'lucide-react';

interface TemplateEditorProps {
    template: EmailTemplate; // Template is now required
    onSave: () => void;
}

export const TemplateEditor = ({ template, onSave }: TemplateEditorProps) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        body: '',
        variables: [] as string[],
    });

    useEffect(() => {
        if (template) {
            setFormData({
                name: template.name,
                subject: template.subject,
                body: template.body,
                variables: template.variables || [],
            });
        }
    }, [template]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                // Variables are system defined, typically not editable by user logic unless explicitly allowed.
                // Here we keep existing ones to not break type, but user doesn't edit them.
            };

            await adminEmailService.updateTemplate(template._id, data);
            showToast({ type: 'success', message: 'Plantilla actualizada' });
            onSave();
        } catch (error: any) {
            showToast({ type: 'error', message: error.message || 'Error al guardar' });
        }
    };

    const copyVariable = (variable: string) => {
        navigator.clipboard.writeText(`{{${variable}}}`);
        showToast({ type: 'success', message: `Variable {{${variable}}} copiada` });
    }

    const senderEmail = import.meta.env.VITE_SMTP_FROM || 'noreply@misturnos.com';

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full min-h-0 bg-transparent font-sans">
            {/* Editor Side */}
            <div className="flex-1 flex flex-col h-full bg-background border-r border-border pr-8 min-h-0 space-y-6">
                {/* Email Client Header */}
                <div className="space-y-4 pb-6 border-b border-border">
                    <div className="grid grid-cols-[80px_1fr] items-center gap-4">
                        <Label className="text-right text-muted-foreground font-medium text-xs uppercase tracking-tight">De:</Label>
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-1 ring-primary/20">S</div>
                            <Input
                                value={`Sistema <${senderEmail}>`}
                                disabled
                                className="bg-transparent border-none shadow-none h-auto p-0 text-sm font-semibold opacity-100 disabled:opacity-100 text-foreground"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] items-center gap-4">
                        <Label className="text-right text-muted-foreground font-medium text-xs uppercase tracking-tight">Para:</Label>
                        <Input
                            value="{{user.email}}"
                            disabled
                            className="bg-transparent border-none shadow-none h-auto p-0 text-sm font-medium opacity-80 disabled:opacity-80 text-foreground"
                        />
                    </div>
                    <div className="grid grid-cols-[80px_1fr] items-center gap-4">
                        <Label htmlFor="subject" className="text-right text-muted-foreground font-medium text-xs uppercase tracking-tight">Asunto:</Label>
                        <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="bg-background border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 p-2 h-9 text-lg font-bold placeholder:text-muted-foreground/50"
                            placeholder="Añade un asunto..."
                        />
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col min-h-0 min-h-[400px]">
                    <RichTextEditor
                        value={formData.body}
                        onChange={(value) => setFormData(prev => ({ ...prev, body: value }))}
                        className="flex-1 border-none shadow-sm rounded-lg focus-within:ring-2 focus-within:ring-primary/10 transition-all bg-card/30"
                    />
                </div>

                {/* Variables Buttons */}
                <div className="space-y-3 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Variables Dinámicas</Label>
                        <span className="text-[10px] text-muted-foreground font-medium">Click para insertar/copiar</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.variables.map(variable => (
                            <Button
                                key={variable}
                                variant="secondary"
                                size="sm"
                                className="h-8 text-xs font-mono border border-border hover:border-primary/50 hover:bg-primary/5 gap-2 px-4 rounded-md transition-all active:scale-95"
                                onClick={() => copyVariable(variable)}
                            >
                                <Copy className="w-3 h-3 text-primary/70" />
                                {variable}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="pt-6 flex justify-end gap-3 sticky bottom-0 bg-background py-4 z-10">
                    <Button variant="ghost" onClick={onSave} className="text-muted-foreground hover:text-foreground">Descartar</Button>
                    <Button onClick={handleSubmit} className="px-10 h-10 shadow-lg shadow-primary/20 font-bold tracking-tight">
                        Guardar Plantilla
                    </Button>
                </div>
            </div>

            {/* Preview Side */}
            <div className="flex-1 flex flex-col h-full bg-muted/5 rounded-2xl border border-border/50 p-8 overflow-hidden min-h-0">
                <div className="bg-background border border-border shadow-2xl rounded-xl flex flex-col h-full overflow-hidden">
                    {/* Preview Email View - Header */}
                    <div className="p-8 border-b border-border bg-muted/10">
                        <h2 className="text-2xl font-black text-foreground tracking-tight mb-3 leading-tight">{formData.subject || '(Sin Asunto)'}</h2>
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 text-primary w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border border-primary/20">S</div>
                            <div className="text-xs text-muted-foreground font-medium">
                                <span className="font-bold text-foreground">Sistema</span> &lt;{senderEmail}&gt;
                            </div>
                        </div>
                        <div className="mt-2 text-[10px] text-muted-foreground/60 flex gap-2 items-center">
                            <span>Para: <b>{"{{user.email}}"}</b></span>
                            <span className="w-1 h-1 bg-muted-foreground/30 rounded-full"></span>
                            <span>Hoy, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>

                    {/* Preview Email View - Content */}
                    <div className="flex-1 overflow-y-auto p-12 bg-white text-black selection:bg-primary/10">
                        <div
                            className="prose prose-sm max-w-none prose-neutral prose-p:leading-relaxed prose-headings:text-black prose-a:text-primary"
                            dangerouslySetInnerHTML={{ __html: formData.body }}
                        />
                    </div>

                    {/* Preview Email View - Footer (System Style) */}
                    <div className="p-4 bg-muted/20 border-t border-border text-[9px] text-center text-muted-foreground font-bold tracking-widest uppercase flex items-center justify-center gap-4">
                        <span className="w-12 h-px bg-border"></span>
                        PREVISUALIZACIÓN EN VIVO
                        <span className="w-12 h-px bg-border"></span>
                    </div>
                </div>
            </div>
        </div>
    );
};
