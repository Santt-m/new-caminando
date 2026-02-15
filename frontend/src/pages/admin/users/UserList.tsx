import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
    Search,
    Loader2,
    Shield,
    UserCheck,
    UserX,
    Mail,
    Pencil,
    ShoppingBag,
    Bell
} from 'lucide-react';
import { AdminUsersService } from '@/services/admin/users.service';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionAdminUsers } from './traduccion';
import { format } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';
import { UserDetailModal } from './UserDetailModal';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface UserListProps {
    className?: string;
    limit?: number;
    minimal?: boolean;
    showViewAll?: boolean;
}

export const UserList = ({ className, limit = 10, minimal = false }: UserListProps) => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const { language } = useLanguage();
    const text = traduccionAdminUsers[language];

    const getDateLocale = () => {
        if (language === 'pt') return ptBR;
        if (language === 'en') return enUS;
        return es;
    };

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', page, search, limit],
        queryFn: () => AdminUsersService.getAll({
            page,
            search: search || undefined,
            limit
        }),
        placeholderData: (prev) => prev,
    });

    // Mutation unused in this view for now
    /* const toggleStatusMutation = useMutation({ ... }); */

    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    return (
        <div className={`space-y-6 ${className || ''}`}>
            {!minimal && (
                <>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{text.title}</h1>
                            <p className="text-muted-foreground">{text.subtitle}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={text.searchPlaceholder}
                                className="pl-9"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>
                </>
            )}

            <Card className="rounded-md border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{text.tableUser}</TableHead>
                            <TableHead>{text.tableRole}</TableHead>
                            <TableHead>{text.tableStatus}</TableHead>
                            <TableHead>{text.tableRegistered}</TableHead>
                            <TableHead className="text-center">{text.tableStats}</TableHead>
                            <TableHead className="text-right">{text.tableActions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <span className="text-muted-foreground">{text.loading}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data?.users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    {text.noUsers}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.users.map((user) => (
                                <TableRow
                                    key={user.id}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedUserId(user.id)}
                                >
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground hover:underline">
                                                {user.name}
                                            </span>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <Mail className="mr-1 h-3 w-3" />
                                                {user.email}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' || user.role === 'super_admin' ? 'default' : 'secondary'} className="gap-1">
                                            {user.role === 'admin' || user.role === 'super_admin' ? (
                                                <Shield className="h-3 w-3" />
                                            ) : null}
                                            {user.role === 'admin' || user.role === 'super_admin' ? text.roleAdmin : text.roleUser}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.isActive ? (
                                            <Badge variant="success" className="h-5 px-1.5 text-[10px]">
                                                <UserCheck className="mr-1 h-3 w-3" /> {text.statusActive}
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                                                <UserX className="mr-1 h-3 w-3" /> {text.statusInactive}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: getDateLocale() })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center gap-3">
                                            <div title={text.carts} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-md border border-transparent hover:border-border transition-colors cursor-help">
                                                <ShoppingBag className="h-3.5 w-3.5" />
                                                <span>{user.cartsCount}</span>
                                            </div>
                                            <div title={text.alerts} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-md border border-transparent hover:border-border transition-colors cursor-help">
                                                <Bell className="h-3.5 w-3.5" />
                                                <span>{user.alertsCount}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedUserId(user.id);
                                            }}
                                            title={text.viewDetails}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Paginación */}
            {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        {text.previous}
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        {text.pageInfo
                            .replace('{{page}}', String(page))
                            .replace('{{total}}', String(data.pagination.totalPages))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                        disabled={page === data.pagination.totalPages}
                    >
                        {text.next}
                    </Button>
                </div>
            )}

            <UserDetailModal
                userId={selectedUserId}
                onClose={() => setSelectedUserId(null)}
            />
        </div>
    );
};
