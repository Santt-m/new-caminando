import React from 'react';
import { cn } from '../../utils/cn';
import { Skeleton } from '../ui/skeleton';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    className?: string;
    emptyMessage?: string;
}

export function DataTable<T>({
    data,
    columns,
    isLoading,
    className,
    emptyMessage = "No hay datos disponibles.",
}: DataTableProps<T>) {
    return (
        <div className={cn("relative w-full overflow-auto rounded-xl border border-border bg-card shadow-sm", className)}>
            <table className="w-full caption-bottom text-sm">
                <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-md">
                    <tr className="border-b border-border transition-colors">
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={cn(
                                    "h-12 px-4 text-left align-middle font-semibold text-muted-foreground uppercase tracking-wider text-[10px]",
                                    column.className
                                )}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b border-border/50">
                                {columns.map((_, j) => (
                                    <td key={j} className="p-4 align-middle">
                                        <Skeleton className="h-4 w-full opacity-40" />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="h-24 text-center align-middle text-muted-foreground font-light italic"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item, i) => (
                            <tr
                                key={i}
                                className="border-b border-border/50 transition-all duration-300 hover:bg-accent/40 group"
                            >
                                {columns.map((column, j) => (
                                    <td key={j} className={cn("p-4 align-middle group-hover:text-primary transition-colors", column.className)}>
                                        {typeof column.accessor === 'function'
                                            ? column.accessor(item)
                                            : (item[column.accessor] as React.ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
