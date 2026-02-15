import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useToast } from '../../../hooks/useToast';
import type { ToastMessage } from '../../../contexts/ToastContext';
import { Button } from '../button';
import { AlertCircle, Copy, Send, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { supportService } from '../../../services/support/supportService';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    showDetails: boolean;
    isReporting: boolean;
    isReported: boolean;
}

interface ErrorBoundaryProps extends Props {
    showToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

class LocalErrorBoundaryInternal extends Component<ErrorBoundaryProps, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
        showDetails: false,
        isReporting: false,
        isReported: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null, showDetails: false, isReporting: false, isReported: false };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleCopyError = () => {
        const errorText = `Error: ${this.state.error?.message}\n\nStack Trace:\n${this.state.error?.stack}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack}`;
        navigator.clipboard.writeText(errorText);
        this.props.showToast({
            type: 'success',
            title: 'Copiado',
            message: 'Los detalles del error se han copiado al portapapeles.',
            duration: 3000
        });
    };

    private handleReload = () => {
        window.location.reload();
    };

    private handleSendReport = async () => {
        if (this.state.isReported) return;
        this.setState({ isReporting: true });
        try {
            const technicalMessage = `
[DETALLES TÉCNICOS REPORTADOS AUTOMÁTICAMENTE]
----------------------------------------------
ERROR: ${this.state.error?.message}
URL: ${window.location.href}
FECHA: ${new Date().toLocaleString()}
NAVEGADOR: ${navigator.userAgent}

STACK TRACE:
${this.state.error?.stack}

COMPONENT STACK:
${this.state.errorInfo?.componentStack || 'No disponible'}
----------------------------------------------

MENSAJE ORIGINAL:
Detalles técnicos del error reportados automáticamente desde el ErrorBoundary del sistema.
`.trim();

            await supportService.createTicket({
                email: 'anonymous@report.com',
                type: 'reporte_error',
                subject: `Error Panel: ${this.state.error?.message}`,
                message: technicalMessage,
                metadata: {
                    error_stack: this.state.error?.stack,
                    component_stack: this.state.errorInfo?.componentStack || undefined,
                    url: window.location.href,
                    browser_info: navigator.userAgent,
                    timestamp: new Date().toISOString()
                }
            });

            this.props.showToast({
                type: 'success',
                title: 'Reporte Enviado',
                message: 'Gracias por notificarnos. Investigaremos el problema.',
            });
            this.setState({ isReported: true });
        } catch {
            this.props.showToast({
                type: 'error',
                title: 'Error',
                message: 'No se pudo enviar el reporte automático.',
            });
        } finally {
            this.setState({ isReporting: false });
        }
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="p-6 rounded-2xl border-2 border-destructive/20 bg-destructive/5 my-4 flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-destructive">
                        <AlertCircle className="h-6 w-6" />
                        <h3 className="text-lg font-bold font-heading">Vaya, algo salió mal</h3>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Este componente ha tenido un problema técnico. Puedes intentar recargar la página o enviar un reporte.
                    </p>

                    <div className="flex flex-wrap gap-3 mt-2">
                        <Button variant="outline" size="sm" onClick={this.handleReload} className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Recargar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={this.handleCopyError} className="gap-2">
                            <Copy className="h-4 w-4" />
                            Copiar Error
                        </Button>
                        <Button
                            variant={this.state.isReported ? "outline" : "default"}
                            size="sm"
                            className="gap-2 ml-auto"
                            onClick={this.handleSendReport}
                            disabled={this.state.isReporting || this.state.isReported}
                        >
                            <Send className="h-4 w-4" />
                            {this.state.isReporting ? 'Enviando...' : this.state.isReported ? 'Reporte Enviado' : 'Enviar Reporte'}
                        </Button>
                    </div>

                    <div className="mt-2 border-t border-destructive/10 pt-2">
                        <button
                            onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {this.state.showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            {this.state.showDetails ? 'Ocultar detalles técnicos' : 'Mostrar detalles técnicos'}
                        </button>

                        {this.state.showDetails && (
                            <div className="mt-3 p-4 rounded-lg bg-card border border-border overflow-auto max-h-48 text-[10px] font-mono text-muted-foreground">
                                <p className="font-bold text-destructive mb-2">{this.state.error?.toString()}</p>
                                <pre className="whitespace-pre-wrap">
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export const LocalErrorBoundary: React.FC<Props> = (props) => {
    const { showToast } = useToast();
    return <LocalErrorBoundaryInternal {...props} showToast={showToast} />;
};
