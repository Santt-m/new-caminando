import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ProductSkeleton: React.FC = () => {
    return (
        <Card className="overflow-hidden border-none shadow-none bg-transparent animate-in fade-in duration-500">
            {/* Image Placeholder */}
            <Skeleton className="aspect-square w-full rounded-2xl mb-4 shadow-sm" />

            {/* Content Placeholders */}
            <div className="space-y-3 px-1">
                <Skeleton className="h-4 w-1/3 rounded-full opacity-60" />
                <Skeleton className="h-6 w-full rounded-lg" />

                <div className="flex items-center gap-2 pt-1">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-4 w-12 rounded-full opacity-40" />
                </div>

                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-10 flex-1 rounded-xl" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
            </div>
        </Card>
    );
};

export const SidebarSkeleton: React.FC = () => {
    return (
        <div className="space-y-8 pr-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4" />
                    </div>
                    {i === 1 ? (
                        <div className="space-y-3">
                            <Skeleton className="h-8 w-full rounded-md" />
                            <Skeleton className="h-8 w-full rounded-md" />
                            <Skeleton className="h-8 w-full rounded-md" />
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-8 w-16 rounded-full" />
                            <Skeleton className="h-8 w-20 rounded-full" />
                            <Skeleton className="h-8 w-14 rounded-full" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export const ProductDetailSkeleton: React.FC = () => {
    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* Breadcrumbs Skeleton */}
            <div className="flex gap-2 mb-8 px-2">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32 rounded-full" />
            </div>

            <div className="grid lg:grid-cols-12 gap-10 xl:gap-16">
                {/* Left Column: Images */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="aspect-square rounded-2xl bg-muted/30 overflow-hidden shadow-2xl">
                        <Skeleton className="w-full h-full" />
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="flex-shrink-0 w-24 h-24 rounded-2xl" />
                        ))}
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-24 rounded-full opacity-60" />
                        <Skeleton className="h-12 w-full rounded-2xl" />
                        <Skeleton className="h-10 w-3/4 rounded-xl" />

                        <div className="flex items-center gap-4 py-2 opacity-50">
                            <Skeleton className="h-4 w-32 rounded-full" />
                            <Skeleton className="h-4 w-24 rounded-full" />
                        </div>

                        <div className="flex items-baseline gap-3 pt-4">
                            <Skeleton className="h-12 w-48 rounded-2xl" />
                            <Skeleton className="h-6 w-12 rounded-full opacity-40" />
                        </div>
                    </div>

                    <div className="h-px bg-muted/60" />

                    {/* Options Skeleton */}
                    <div className="space-y-6">
                        {[1, 2].map(i => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-20 rounded-full opacity-60" />
                                    <Skeleton className="h-4 w-24 rounded-full opacity-40" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4].map(j => (
                                        <Skeleton key={j} className="h-11 w-16 rounded-xl" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-muted/30">
                        <Skeleton className="h-8 w-40 rounded-full opacity-70" />
                        <div className="flex gap-4">
                            <Skeleton className="h-14 w-32 rounded-2xl opacity-40" />
                            <Skeleton className="h-14 flex-1 rounded-2xl" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6">
                        {[1, 2].map(i => (
                            <Skeleton key={i} className="h-20 rounded-2xl opacity-50" />
                        ))}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Skeleton className="h-12 flex-1 rounded-xl opacity-40" />
                        <Skeleton className="h-12 w-12 rounded-xl opacity-40" />
                    </div>
                </div>
            </div>
        </div>
    );
};
