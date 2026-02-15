import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../hooks/useLanguage';
import { PublicLayout } from '../../../components/layout/PublicLayout';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Switch } from '../../../components/ui/switch';
import { Checkbox } from '../../../components/ui/checkbox';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../../../components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '../../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Skeleton } from '../../../components/ui/skeleton';
import { Textarea } from '../../../components/ui/textarea';
import { LocalErrorBoundary } from '../../../components/ui/ErrorBoundary/LocalErrorBoundary';
import { useToast } from '../../../hooks/useToast';
import { traducciones } from './traduccion';
import { ArrowLeft, ExternalLink, Code, Bomb } from 'lucide-react';

const BuggyComponent = () => {
    const { t } = useLanguage();
    const [shouldError, setShouldError] = React.useState(false);
    if (shouldError) throw new Error(t(traducciones, 'bugError'));
    return (
        <Button variant="destructive" onClick={() => setShouldError(true)} className="gap-2">
            <Bomb className="h-4 w-4" />
            {t(traducciones, 'bugTrigger')}
        </Button>
    );
};

interface SectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

const Section = ({ title, description, children }: SectionProps) => (
    <section className="space-y-6">
        <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-primary font-heading">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
        </div>
        <Card className="p-6 md:p-10 backdrop-blur-md bg-card/40 border-border/40 shadow-xl overflow-hidden">
            {children}
        </Card>
    </section>
);

export const ComponentsShowcase: React.FC = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('tab1');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [counterValue, setCounterValue] = useState(1234);
    const [selectValue, setSelectValue] = useState<string | number>('1');
    const [switchState, setSwitchState] = useState(true);


    return (
        <PublicLayout>
            <div className="max-w-7xl mx-auto space-y-16 py-12 px-4">
                {/* Header */}
                <div className="space-y-6">
                    <Link to="/">
                        <Button variant="ghost" size="sm" className="gap-2 group">
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            {t(traducciones, 'backHome')}
                        </Button>
                    </Link>
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground font-heading">
                            {t(traducciones, 'title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed font-light">
                            {t(traducciones, 'description')}
                        </p>
                    </div>
                </div>

                {/* Actions Section */}
                <Section title={t(traducciones, 'actions')} description={t(traducciones, 'actionsDesc')}>
                    <div className="space-y-8">
                        <div className="flex flex-wrap gap-4">
                            <Button variant="default">Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="default">Default</Button>
                            <Button variant="default">Success</Button>
                            <Button variant="destructive">Destructive</Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-primary/5">
                            <div className="flex gap-4">
                                <Button size="sm">Small</Button>
                                <Button size="default">Medium</Button>
                                <Button size="lg">Large</Button>
                                <Button size="icon"><Code className="h-4 w-4" /></Button>
                            </div>
                            <div className="flex gap-4">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" size="sm">Hover Tooltip</Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>This is a top tooltip</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Forms Section */}
                <Section title={t(traducciones, 'forms')} description={t(traducciones, 'formsDesc')}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>{t(traducciones, 'emailLabel')}</Label>
                                <Input placeholder="usuario@ejemplo.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>{t(traducciones, 'passwordLabel')}</Label>
                                <Input type="password" placeholder="Enter your secret" />
                            </div>
                            <div className="space-y-2">
                                <Label>With Error</Label>
                                <Input placeholder="Invalid data" />
                                <p className="text-sm text-destructive">This is a required field</p>
                            </div>
                            <div className="space-y-2">
                                <Label>{t(traducciones, 'messageLabel')}</Label>
                                <Textarea placeholder="Type your message here..." />
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="flex flex-wrap gap-8 items-center bg-accent/30 p-4 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Checkbox id="terms" defaultChecked />
                                    <Label htmlFor="terms">{t(traducciones, 'acceptTerms')}</Label>
                                </div>
                                <Switch checked={switchState} onCheckedChange={setSwitchState} />
                                <div className="flex items-center gap-4">
                                    <Button size="sm" variant="ghost" onClick={() => setCounterValue(c => c - 1)}>-</Button>
                                    <span className="text-lg font-mono">{counterValue}</span>
                                    <Button size="sm" variant="ghost" onClick={() => setCounterValue(c => c + 1)}>+</Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    value={String(selectValue)}
                                    onValueChange={setSelectValue}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Option 1</SelectItem>
                                        <SelectItem value="2">Option 2</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex items-center gap-4 py-2">
                                    {/* Radio Components Removed */}
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Data Display Section */}
                <Section title={t(traducciones, 'dataDisplay')} description={t(traducciones, 'dataDisplayDesc')}>
                    <div className="space-y-8">
                        <div className="flex flex-wrap gap-3">
                            <Badge variant="default">Default</Badge>
                            <Badge variant="outline">Outline</Badge>
                            <Badge variant="default">Default</Badge>
                            <Badge variant="default">Success</Badge>
                            <Badge variant="destructive">Warning</Badge>
                            <Badge variant="destructive">Destructive</Badge>
                            <Avatar className="ml-4">
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                        </div>

                        <Tabs defaultValue="tab1" onValueChange={setActiveTab} value={activeTab}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="tab1">{t(traducciones, 'overview')}</TabsTrigger>
                                <TabsTrigger value="tab2">{t(traducciones, 'settings')}</TabsTrigger>
                                <TabsTrigger value="tab3">{t(traducciones, 'history')}</TabsTrigger>
                            </TabsList>
                            <TabsContent value="tab1">
                                <p className="p-4 text-muted-foreground">Main dashboard overview content.</p>
                            </TabsContent>
                            <TabsContent value="tab2">
                                <p className="p-4 text-muted-foreground">Configuration and preferences.</p>
                            </TabsContent>
                            <TabsContent value="tab3">
                                <p className="p-4 text-muted-foreground">Activity logs and records.</p>
                            </TabsContent>
                        </Tabs>

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>What is Santt Market?</AccordionTrigger>
                                <AccordionContent>
                                    It is an e-commerce platform designed to provide the best shopping experience.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Is it secure?</AccordionTrigger>
                                <AccordionContent>
                                    We use high-level encryption for all your identity vault data.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <div className="border border-primary/10 rounded-xl overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t(traducciones, 'store')}</TableHead>
                                        <TableHead>{t(traducciones, 'price')}</TableHead>
                                        <TableHead>{t(traducciones, 'savings')}</TableHead>
                                        <TableHead className="text-right">{t(traducciones, 'action')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Market X</TableCell>
                                        <TableCell>$12.50</TableCell>
                                        <TableCell className="text-emerald-500">-15%</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="ghost"><ExternalLink className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Store Y</TableCell>
                                        <TableCell>$14.20</TableCell>
                                        <TableCell className="text-muted-foreground">0%</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="ghost"><ExternalLink className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </Section>

                {/* Feedback Section */}
                <Section title={t(traducciones, 'feedback')} description={t(traducciones, 'feedbackDesc')}>
                    <div className="space-y-12">
                        {/* Toasts Demo */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold font-heading">{t(traducciones, 'toastHeading')}</h3>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    variant="default"
                                    onClick={() => showToast({ type: 'success', title: t(traducciones, 'successTitle'), message: t(traducciones, 'successMessage') })}
                                >
                                    {t(traducciones, 'successTrigger')}
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => showToast({ type: 'error', title: t(traducciones, 'errorTitle'), message: t(traducciones, 'errorMessage') })}
                                >
                                    {t(traducciones, 'errorTrigger')}
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => showToast({ type: 'warning', title: t(traducciones, 'warningTitle'), message: t(traducciones, 'warningMessage') })}
                                >
                                    {t(traducciones, 'warningTrigger')}
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={() => showToast({ type: 'info', title: t(traducciones, 'infoTitle'), message: t(traducciones, 'infoMessage') })}
                                >
                                    {t(traducciones, 'infoTrigger')}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border/50">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span>Syncing data...</span>
                                        <span>75%</span>
                                    </div>
                                    {/* Progress Removed */}
                                </div>
                                <div className="space-y-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-[80%]" />
                                    <Skeleton className="h-4 w-[60%]" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 justify-center items-center h-full">
                                <div className="flex gap-4">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline">{t(traducciones, 'showInfo')}</Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <div className="p-3">Useful information inside a popover.</div>
                                        </PopoverContent>
                                    </Popover>
                                    <Button onClick={() => setIsModalOpen(true)} variant="default">{t(traducciones, 'openModal')}</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Navigation Section Removed */}

                {/* Stability Section */}
                <Section title={t(traducciones, 'stabilityTitle')} description={t(traducciones, 'stabilityDesc')}>
                    <div className="flex flex-col items-center justify-center py-8 gap-4 border-2 border-dashed border-border rounded-2xl">
                        <p className="text-sm text-muted-foreground text-center max-w-md">
                            {t(traducciones, 'stabilityBody')}
                        </p>
                        <LocalErrorBoundary>
                            <BuggyComponent />
                        </LocalErrorBoundary>
                    </div>
                </Section>
            </div >

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t(traducciones, 'modalTitle')}</DialogTitle>
                        <DialogDescription>
                            {t(traducciones, 'modalBody')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setIsModalOpen(false)}>{t(traducciones, 'close')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PublicLayout >
    );
};
