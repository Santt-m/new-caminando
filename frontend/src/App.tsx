import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { UserDetail } from './pages/admin/users/UserDetail';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Home } from './pages/public/home';
import { LoginPage } from './pages/public/login/login';
import { RegisterPage } from './pages/public/register/register';
import { VerifyEmailPage } from './pages/public/auth/verify-email/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/public/auth/forgot-password/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/auth/reset-password/ResetPasswordPage';
import { ComponentsShowcase } from './pages/public/components';
import { AvisoLegal, PoliticaPrivacidad, PoliticaCookies, TerminosCondiciones, CondicionesContratacion } from './pages/public/legal';
import { AboutUsSalesPage } from './pages/public/about/AboutUsSalesPage';
import { BuyerFAQPage } from './pages/public/faq/BuyerFAQPage';
import { ContactPage } from './pages/public/contact/Contact';
import { ProductsPage } from './pages/public/products';
import { ProtectedRoute } from './components/shared/ProtectedRoute/ProtectedRoute';
import { ScrollToTop } from './components/shared/ScrollToTop';
import { AppLayout } from './components/layout/AppLayout';
import { PublicLayout } from './components/layout/PublicLayout/PublicLayout';
import DashboardInicio from './pages/app/dashboard/inicio';
import DashboardAjustes from './pages/app/dashboard/ajustes';
import DashboardNotificaciones from './pages/app/dashboard/notificaciones';
import { AdminLoginPage } from './pages/admin/auth/Login';
import { ProtectedAdminRoute } from './components/admin/auth/ProtectedAdminRoute';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionesSidebar } from '@/components/layout/traduccion';
import { AdminDashboard } from './pages/admin/dashboard/Overview';
import { UserList } from './pages/admin/users/UserList';
import { TicketList } from './pages/admin/tickets/TicketList';
import { TicketDetail } from './pages/admin/tickets/TicketDetail';
import { Settings } from './pages/admin/settings/Settings';
import { SecurityPage } from './pages/admin/security/SecurityPage';
import { SeedsPage } from './pages/admin/settings/SeedsPage';
import { CampaignList } from './pages/admin/campaigns/CampaignList';
import { CampaignDetail } from './pages/admin/campaigns/CampaignDetail';
import { EmailDashboard } from './pages/admin/emails/EmailDashboard';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { LocalErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useAttribution } from './hooks/useAttribution';
import { BrandList } from './pages/admin/brands';
import { AttributeList } from './pages/admin/attributes';
import { CategoryList } from './pages/admin/categories';
import { ProductList, ProductForm } from './pages/admin/products';
import { EcommerceDashboard } from './pages/admin/ecommerce/EcommerceDashboard';
import { ProductDetail } from './pages/public/products/ProductDetail';
import { ScraperDashboard } from './pages/admin/scraper/Scraper';

// Database Management Pages
import { DatabaseOverview } from './pages/admin/database/DatabaseOverview';
import { CollectionsList } from './pages/admin/database/mongodb/collections-list';
import { DocumentsList } from './pages/admin/database/mongodb/documents-list';
import { DocumentEditor } from './pages/admin/database/mongodb/document-editor';
import { IndexManager } from './pages/admin/database/mongodb/index-manager';
import { RedisDashboard } from './pages/admin/database/redis/dashboard';
import { KeyExplorer } from './pages/admin/database/redis/key-explorer';
import { MaintenanceTools } from './pages/admin/database/redis/maintenance-tools';
import { CloudinaryDashboard } from './pages/admin/database/cloudinary/dashboard';
import { ImageGallery } from './pages/admin/database/cloudinary/gallery';
import { ImageUploader } from './pages/admin/database/cloudinary/uploader';
import { ImageOptimizer } from './pages/admin/database/cloudinary/optimizer';
import { ImageTracking } from './pages/admin/database/cloudinary/tracking/ImageTracking';
import { ProxySettings } from './pages/admin/database/cloudinary/proxy/ProxySettings';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // User preference
      staleTime: 0, // 0 cache to avoid stale data issues during dev/testing
    },
  },
});

const AdminAuthWrapper = () => (
  <AdminAuthProvider>
    <Outlet />
  </AdminAuthProvider>
);

function App() {
  const { t } = useLanguage();
  useAttribution();


  return (
    <QueryClientProvider client={queryClient}>
      <ScrollToTop />
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/productos/:slug" element={<ProductDetail />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/components" element={<ComponentsShowcase />} />
        <Route path="/about" element={<AboutUsSalesPage />} />
        <Route path="/faq" element={<BuyerFAQPage />} />
        <Route path="/aviso-legal" element={<AvisoLegal />} />
        <Route path="/privacidad" element={<PoliticaPrivacidad />} />
        <Route path="/cookies" element={<PoliticaCookies />} />
        <Route path="/terminos" element={<TerminosCondiciones />} />
        <Route path="/ventas" element={<CondicionesContratacion />} />
        <Route path="/contacto" element={<PublicLayout><ContactPage /></PublicLayout>} />

        {/* Rutas Protegidas - Dashboard */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/app/dashboard/inicio" element={<DashboardInicio />} />
          <Route path="/app/dashboard/notificaciones" element={<DashboardNotificaciones />} />
          <Route path="/app/dashboard/ajustes" element={<DashboardAjustes />} />
        </Route>

        {/* Rutas Admin */}
        <Route element={<AdminAuthWrapper />}>
          <Route path="/panel/login" element={<AdminLoginPage />} />

          <Route element={<ProtectedAdminRoute />}>
            <Route path="/panel" element={<AdminLayout />}>
              <Route index element={<Navigate to="/panel/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserList />} />
              <Route path="users/:id" element={<UserDetail />} />
              <Route path="tickets" element={<TicketList />} />
              <Route path="tickets/:id" element={<TicketDetail />} />
              <Route path="security" element={<SecurityPage />} />
              <Route path="settings" element={<Settings />} />
              <Route path="seeds" element={<SeedsPage />} />
              <Route path="campaigns" element={<CampaignList />} />
              <Route path="campaigns/:id" element={<CampaignDetail />} />
              <Route path="emails" element={<EmailDashboard />} />

              {/* E-commerce Management Routes */}
              <Route path="ecommerce" element={<EcommerceDashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/edit/:id" element={<ProductForm />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="brands" element={<BrandList />} />
              <Route path="attributes" element={<AttributeList />} />
              <Route path="scraper" element={<ScraperDashboard />} />






              {/* Database Management Routes */}
              <Route path="database" element={<LocalErrorBoundary><DatabaseOverview /></LocalErrorBoundary>} />
              <Route path="database/mongodb" element={<LocalErrorBoundary><CollectionsList /></LocalErrorBoundary>} />
              <Route path="database/mongodb/:collection" element={<LocalErrorBoundary><DocumentsList /></LocalErrorBoundary>} />
              <Route path="database/mongodb/:collection/document/:id" element={<LocalErrorBoundary><DocumentEditor /></LocalErrorBoundary>} />
              <Route path="database/mongodb/:collection/indexes" element={<LocalErrorBoundary><IndexManager /></LocalErrorBoundary>} />
              <Route path="database/redis" element={<LocalErrorBoundary><RedisDashboard /></LocalErrorBoundary>} />
              <Route path="database/redis/keys" element={<LocalErrorBoundary><KeyExplorer /></LocalErrorBoundary>} />
              <Route path="database/redis/tools" element={<LocalErrorBoundary><MaintenanceTools /></LocalErrorBoundary>} />
              <Route path="database/cloudinary" element={<LocalErrorBoundary><CloudinaryDashboard /></LocalErrorBoundary>} />
              <Route path="database/cloudinary/gallery" element={<LocalErrorBoundary><ImageGallery /></LocalErrorBoundary>} />
              <Route path="database/cloudinary/upload" element={<LocalErrorBoundary><ImageUploader /></LocalErrorBoundary>} />
              <Route path="database/cloudinary/optimizer" element={<LocalErrorBoundary><ImageOptimizer /></LocalErrorBoundary>} />
              <Route path="database/cloudinary/tracking" element={<LocalErrorBoundary><ImageTracking /></LocalErrorBoundary>} />
              <Route path="database/cloudinary/proxy-settings" element={<LocalErrorBoundary><ProxySettings /></LocalErrorBoundary>} />

              {/* Catch-all for panel */}
              <Route path="*" element={<div className="p-4">{t(traduccionesSidebar, 'pageNotFound')}</div>} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}


export default App;
