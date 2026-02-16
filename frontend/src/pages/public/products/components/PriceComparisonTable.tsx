import React from 'react';

import { ExternalLink, ShoppingCart, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/utils/cn';

interface PriceSource {
    store: string;
    price: number;
    originalUrl?: string;
    lastScraped: string;
}

interface PriceComparisonTableProps {
    sources?: PriceSource[];
    currentPrice: number;
}

export const PriceComparisonTable: React.FC<PriceComparisonTableProps> = ({ sources, currentPrice }) => {
    // const { t } = useLanguage(); // Temporary disabled if not used or needed for labels

    // Filter valid sources with price
    const validSources = sources?.filter(s => typeof s.price === 'number' && !isNaN(s.price)) || [];

    if (validSources.length === 0) return null;

    // Find lowest price
    const lowestPrice = Math.min(...validSources.map(s => s.price), currentPrice);

    // Sort sources by price ascending
    const sortedSources = [...validSources].sort((a, b) => a.price - b.price);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS', // Assuming ARS for now, logic could be improved with currency from product
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold">Comparativa de Precios</h3>
            </div>

            <div className="space-y-3">
                {sortedSources.map((source, idx) => {
                    const isLowest = source.price === lowestPrice;

                    return (
                        <Card
                            key={`${source.store}-${idx}`}
                            className={cn(
                                "flex items-center justify-between p-4 transition-all hover:shadow-md border-muted/60",
                                isLowest ? "border-green-500/50 bg-green-500/5 shadow-green-500/10" : ""
                            )}
                        >
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-base capitalize">{source.store.toLowerCase().replace('_', ' ')}</span>
                                    {isLowest && (
                                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider text-green-600 border-green-200 bg-green-100 px-2 py-0.5 gap-1">
                                            <TrendingDown className="h-3 w-3" />
                                            Mejor Precio
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    Actualizado: {formatDate(source.lastScraped)}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={cn(
                                    "font-black text-xl tracking-tight",
                                    isLowest ? "text-green-600" : "text-foreground"
                                )}>
                                    {formatPrice(source.price)}
                                </span>

                                {source.originalUrl && (
                                    <Button
                                        asChild
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                                        title="Ver en tienda original"
                                    >
                                        <a href={source.originalUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
