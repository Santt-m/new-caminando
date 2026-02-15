import { useQuery } from '@tanstack/react-query';
import { Package, FolderTree, Tag, Sliders, TrendingUp, AlertCircle } from 'lucide-react';
import { AdminProductsService } from '@/services/admin/products.service';
import { AdminCategoriesService } from '@/services/admin/categories.service';
import { AdminBrandsService } from '@/services/admin/brands.service';
import { AdminAttributesService } from '@/services/admin/attributes.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

export const EcommerceDashboard = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();

    // Fetch data for stats
    const { data: productsData } = useQuery({
        queryKey: ['admin-products-stats'],
        queryFn: () => AdminProductsService.getAll({ limit: 1 }),
    });

    const { data: categoriesData } = useQuery({
        queryKey: ['admin-categories-stats'],
        queryFn: () => AdminCategoriesService.getAll({ limit: 1 }),
    });

    const { data: brandsData } = useQuery({
        queryKey: ['admin-brands-stats'],
        queryFn: () => AdminBrandsService.getAll({ limit: 1 }),
    });

    const { data: attributesData } = useQuery({
        queryKey: ['admin-attributes-stats'],
        queryFn: () => AdminAttributesService.getAll({ limit: 1 }),
    });

    const stats = [
        {
            title: language === 'es' ? 'Productos' : language === 'en' ? 'Products' : 'Produtos',
            value: productsData?.pagination?.total || 0,
            icon: Package,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            route: '/panel/products',
        },
        {
            title: language === 'es' ? 'Categorías' : language === 'en' ? 'Categories' : 'Categorias',
            value: categoriesData?.pagination?.total || 0,
            icon: FolderTree,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
            route: '/panel/categories',
        },
        {
            title: language === 'es' ? 'Marcas' : language === 'en' ? 'Brands' : 'Marcas',
            value: brandsData?.pagination?.total || 0,
            icon: Tag,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
            route: '/panel/brands',
        },
        {
            title: language === 'es' ? 'Atributos' : language === 'en' ? 'Attributes' : 'Atributos',
            value: attributesData?.pagination?.total || 0,
            icon: Sliders,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
            route: '/panel/attributes',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {language === 'es' ? 'Panel de E-commerce' : language === 'en' ? 'E-commerce Dashboard' : 'Painel de E-commerce'}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {language === 'es'
                        ? 'Gestiona tu catálogo de productos, categorías y marcas'
                        : language === 'en'
                            ? 'Manage your product catalog, categories and brands'
                            : 'Gerencie seu catálogo de produtos, categorias e marcas'}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={stat.title}
                            className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => navigate(stat.route)}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </p>
                                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                    {language === 'es' ? 'Acciones Rápidas' : language === 'en' ? 'Quick Actions' : 'Ações Rápidas'}
                </h2>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => navigate('/panel/products/new')}
                    >
                        <Package className="mr-2 h-4 w-4" />
                        {language === 'es' ? 'Nuevo Producto' : language === 'en' ? 'New Product' : 'Novo Produto'}
                    </Button>
                    <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => navigate('/panel/categories')}
                    >
                        <FolderTree className="mr-2 h-4 w-4" />
                        {language === 'es' ? 'Gestionar Categorías' : language === 'en' ? 'Manage Categories' : 'Gerenciar Categorias'}
                    </Button>
                    <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => navigate('/panel/brands')}
                    >
                        <Tag className="mr-2 h-4 w-4" />
                        {language === 'es' ? 'Gestionar Marcas' : language === 'en' ? 'Manage Brands' : 'Gerenciar Marcas'}
                    </Button>
                    <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => navigate('/panel/attributes')}
                    >
                        <Sliders className="mr-2 h-4 w-4" />
                        {language === 'es' ? 'Gestionar Atributos' : language === 'en' ? 'Manage Attributes' : 'Gerenciar Atributos'}
                    </Button>
                </div>
            </Card>

            {/* Info Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-green-500/10">
                            <TrendingUp className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold mb-1">
                                {language === 'es' ? 'Catálogo Activo' : language === 'en' ? 'Active Catalog' : 'Catálogo Ativo'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {language === 'es'
                                    ? 'Tu tienda está lista para recibir pedidos con productos disponibles'
                                    : language === 'en'
                                        ? 'Your store is ready to receive orders with available products'
                                        : 'Sua loja está pronta para receber pedidos com produtos disponíveis'}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-blue-500/10">
                            <AlertCircle className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold mb-1">
                                {language === 'es' ? 'Gestión de Inventario' : language === 'en' ? 'Inventory Management' : 'Gestão de Estoque'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {language === 'es'
                                    ? 'Mantén el control de stock y precios actualizados en tiempo real'
                                    : language === 'en'
                                        ? 'Keep stock and prices updated in real time'
                                        : 'Mantenha o controle de estoque e preços atualizados em tempo real'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
