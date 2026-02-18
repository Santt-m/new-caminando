import React, { useState } from 'react';
import {
    Filter,
    RotateCcw,
    ChevronDown,
    ChevronRight,
    Search,
    DollarSign
} from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useLanguage } from '@/hooks/useLanguage';
import { traducciones } from '../traduccion';
import type { FilterData } from '@/services/publicProducts.service';
import { cn } from '@/utils/cn';

interface FilterSidebarProps {
    filters: FilterData;
    activeFilters: {
        category?: string;
        subcategory?: string;
        brand?: string[];
        minPrice?: number;
        maxPrice?: number;
        attributes?: Record<string, string[]>;
    };
    onFilterChange: (newFilters: any) => void;
    onClear: () => void;
    onLoadMoreBrands?: () => void;
    isLoadingBrands?: boolean;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
    filters,
    activeFilters,
    onFilterChange,
    onClear,
    onLoadMoreBrands,
    isLoadingBrands
}) => {
    const { t } = useLanguage();
    const [brandSearch, setBrandSearch] = useState('');

    const handleCategoryClick = (slug: string, isSub = false) => {
        if (isSub) {
            onFilterChange({ ...activeFilters, subcategory: slug });
        } else {
            onFilterChange({ ...activeFilters, category: slug, subcategory: undefined });
        }
    };

    const handleBrandChange = (brandSlug: string, checked: boolean) => {
        const currentBrands = activeFilters.brand || [];
        const newBrands = checked
            ? [...currentBrands, brandSlug]
            : currentBrands.filter(b => b !== brandSlug);
        onFilterChange({ ...activeFilters, brand: newBrands.length > 0 ? newBrands : undefined });
    };

    const handleAttributeChange = (key: string, value: string, checked: boolean) => {
        const currentAttrs = { ...(activeFilters.attributes || {}) };
        const currentValues = currentAttrs[key] || [];

        const newValues = checked
            ? [...currentValues, value]
            : currentValues.filter(v => v !== value);

        if (newValues.length > 0) {
            currentAttrs[key] = newValues;
        } else {
            delete currentAttrs[key];
        }

        onFilterChange({ ...activeFilters, attributes: Object.keys(currentAttrs).length > 0 ? currentAttrs : undefined });
    };

    const getName = (name: any): string => {
        if (typeof name === 'string') return name;
        if (typeof name === 'object' && name !== null) {
            return name.es || name.en || name.pt || '';
        }
        return '';
    };

    const hasActiveFilters = Object.values(activeFilters).some(v =>
        v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
    );

    const filteredBrands = filters.brands.items.filter(b =>
        b.name.toLowerCase().includes(brandSearch.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header Fixed */}
            <div className="flex items-center justify-between py-4 px-2 bg-background sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    <h2 className="font-black text-xl tracking-tight">{t(traducciones, 'filters')}</h2>
                </div>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="h-8 px-2 text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                    >
                        <RotateCcw className="h-3 w-3 mr-1.5" />
                        {t(traducciones, 'clearFilters')}
                    </Button>
                )}
            </div>

            <Separator className="bg-muted/50 mb-4" />

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
                <Accordion type="multiple" defaultValue={['categories']} className="w-full space-y-2">

                    {/* 1. Categories */}
                    <AccordionItem value="categories" className="border-none bg-muted/20 rounded-2xl px-4 overflow-hidden">
                        <AccordionTrigger className="hover:no-underline py-4 font-black uppercase text-xs tracking-widest text-muted-foreground">
                            {t(traducciones, 'categories')}
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <ul className="space-y-1">
                                {filters.categories.map((cat) => (
                                    <li key={cat._id} className="group">
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => handleCategoryClick(cat.slug)}
                                                className={cn(
                                                    "flex-1 text-left py-2 text-sm font-medium transition-all group-hover:translate-x-1",
                                                    activeFilters.category === cat.slug ? "text-primary font-black" : "text-foreground/70 hover:text-foreground"
                                                )}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="flex-1">
                                                        {getName(cat.name)}
                                                        <span className="ml-2 text-[10px] opacity-40 font-normal">({cat.count})</span>
                                                    </span>
                                                    {cat.subcategories.length > 0 && (
                                                        activeFilters.category === cat.slug ? (
                                                            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                                        ) : (
                                                            <ChevronRight className="h-3.5 w-3.5 opacity-30" />
                                                        )
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                        {cat.subcategories.length > 0 && cat.slug === activeFilters.category && (
                                            <ul className="pl-4 mt-1 border-l-2 border-primary/20 space-y-1 animate-in slide-in-from-left-2 duration-300">
                                                {cat.subcategories.map((sub) => (
                                                    <li key={sub.slug}>
                                                        <button
                                                            onClick={() => handleCategoryClick(sub.slug, true)}
                                                            className={cn(
                                                                "text-xs block py-2 transition-all hover:translate-x-1",
                                                                activeFilters.subcategory === sub.slug ? "font-black text-primary" : "text-muted-foreground hover:text-foreground"
                                                            )}
                                                        >
                                                            {getName(sub.name)}
                                                            <span className="ml-1 opacity-40">({sub.count})</span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>

                    {/* 2. Brands with Search and Scroll */}
                    <AccordionItem value="brands" className="border-none bg-muted/20 rounded-2xl px-4 overflow-hidden">
                        <AccordionTrigger className="hover:no-underline py-4 font-black uppercase text-xs tracking-widest text-muted-foreground">
                            {t(traducciones, 'brands')}
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="h-9 pl-9 bg-background border-none shadow-inner rounded-xl text-xs"
                                    placeholder="Buscar marca..."
                                    value={brandSearch}
                                    onChange={(e) => setBrandSearch(e.target.value)}
                                />
                            </div>

                            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2.5 custom-scrollbar">
                                {filteredBrands.map((brand) => (
                                    <div key={brand._id} className="flex items-center gap-3 py-1 group cursor-pointer">
                                        <Checkbox
                                            id={`brand-${brand.slug}`}
                                            checked={activeFilters.brand?.includes(brand.slug)}
                                            onCheckedChange={(checked) => handleBrandChange(brand.slug, !!checked)}
                                            className="h-5 w-5 rounded-md border-2 border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <Label
                                            htmlFor={`brand-${brand.slug}`}
                                            className={cn(
                                                "text-sm cursor-pointer transition-all flex-1",
                                                activeFilters.brand?.includes(brand.slug) ? "font-black text-primary" : "font-medium text-foreground/70 group-hover:text-foreground"
                                            )}
                                        >
                                            {brand.name}
                                            <span className="ml-2 text-[10px] opacity-40">({brand.count})</span>
                                        </Label>
                                    </div>
                                ))}

                                {filters.brands.hasMore && (
                                    <Button
                                        variant="ghost"
                                        className="w-full text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/5 py-4"
                                        onClick={onLoadMoreBrands}
                                        disabled={isLoadingBrands}
                                    >
                                        {isLoadingBrands ? 'Cargando...' : 'Ver más marcas +'}
                                    </Button>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* 3. Price Range */}
                    <AccordionItem value="price" className="border-none bg-muted/20 rounded-2xl px-4 overflow-hidden">
                        <AccordionTrigger className="hover:no-underline py-4 font-black uppercase text-xs tracking-widest text-muted-foreground">
                            {t(traducciones, 'priceRange')}
                        </AccordionTrigger>
                        <AccordionContent className="pb-8 px-2">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase opacity-40">Min</span>
                                        <span className="text-sm font-black text-primary">${(activeFilters.minPrice || filters.priceRange.min).toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[10px] font-black uppercase opacity-40">Max</span>
                                        <span className="text-sm font-black text-primary">${(activeFilters.maxPrice || filters.priceRange.max).toLocaleString()}</span>
                                    </div>
                                </div>

                                <Slider
                                    defaultValue={[filters.priceRange.min, filters.priceRange.max]}
                                    max={filters.priceRange.max}
                                    min={filters.priceRange.min}
                                    step={10}
                                    value={[
                                        activeFilters.minPrice || filters.priceRange.min,
                                        activeFilters.maxPrice || filters.priceRange.max
                                    ]}
                                    onValueChange={([min, max]) => {
                                        onFilterChange({ ...activeFilters, minPrice: min, maxPrice: max });
                                    }}
                                    className="py-4"
                                />

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-30" />
                                        <Input
                                            type="number"
                                            className="h-10 pl-8 bg-background border-none rounded-xl font-bold text-xs shadow-inner"
                                            placeholder="Min"
                                            value={activeFilters.minPrice || ''}
                                            onChange={(e) => onFilterChange({ ...activeFilters, minPrice: parseInt(e.target.value) || undefined })}
                                        />
                                    </div>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-30" />
                                        <Input
                                            type="number"
                                            className="h-10 pl-8 bg-background border-none rounded-xl font-bold text-xs shadow-inner"
                                            placeholder="Max"
                                            value={activeFilters.maxPrice || ''}
                                            onChange={(e) => onFilterChange({ ...activeFilters, maxPrice: parseInt(e.target.value) || undefined })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* 4. Attributes */}
                    {filters.availableAttributes.map((attr) => (
                        <AccordionItem key={attr.key} value={attr.key} className="border-none bg-muted/20 rounded-2xl px-4 overflow-hidden">
                            <AccordionTrigger className="hover:no-underline py-4 font-black uppercase text-xs tracking-widest text-muted-foreground">
                                {getName(attr.name)}
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 flex flex-wrap gap-2">
                                {attr.values.map((val) => {
                                    const isActive = activeFilters.attributes?.[attr.key]?.includes(val);
                                    return (
                                        <Badge
                                            key={val}
                                            variant={isActive ? "default" : "outline"}
                                            className={cn(
                                                "cursor-pointer px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all border-none ring-1 ring-inset",
                                                isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" : "bg-background text-foreground/70 ring-muted-foreground/10 hover:ring-primary/40 hover:text-primary"
                                            )}
                                            onClick={() => handleAttributeChange(attr.key, val, !isActive)}
                                        >
                                            {val}{attr.unit ? ` ${attr.unit}` : ''}
                                        </Badge>
                                    );
                                })}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
};
