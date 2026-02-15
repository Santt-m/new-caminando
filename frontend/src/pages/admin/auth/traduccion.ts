import type { ITranslation } from '@/hooks/useLanguage';
import { BRANDING } from '@/config/branding';

export const traduccionAdminLogin: ITranslation = {
    es: {
        title: 'Panel de Administración',
        subtitle: 'Acceso restringido a personal autorizado',
        emailLabel: 'Correo Electrónico',
        emailPlaceholder: `admin@${BRANDING.appName.toLowerCase().replace(/\s+/g, '')}.com`,
        passwordLabel: 'Contraseña',
        loginButton: 'Ingresar al Panel',
        loadingButton: 'Iniciando sesión...',
        welcome: 'Bienvenido al panel',
        errorLogin: 'Error al iniciar sesión. Verifique sus credenciales.',
        monitorSystem: 'Sistema monitorizado por Sentinel.',
        ipRegistered: 'Tu IP {{ip}} ha sido registrada.',
    },
    en: {
        title: 'Admin Panel',
        subtitle: 'Restricted access to authorized personnel',
        emailLabel: 'Email Address',
        emailPlaceholder: `admin@${BRANDING.appName.toLowerCase().replace(/\s+/g, '')}.com`,
        passwordLabel: 'Password',
        loginButton: 'Enter Panel',
        loadingButton: 'Signing in...',
        welcome: 'Welcome to the panel',
        errorLogin: 'Login failed. Please check your credentials.',
        monitorSystem: 'System monitored by Sentinel.',
        ipRegistered: 'Your IP {{ip}} has been logged.',
    },
    pt: {
        title: 'Painel de Administração',
        subtitle: 'Acesso restrito a pessoal autorizado',
        emailLabel: 'Endereço de E-mail',
        emailPlaceholder: `admin@${BRANDING.appName.toLowerCase().replace(/\s+/g, '')}.com`,
        passwordLabel: 'Senha',
        loginButton: 'Entrar no Painel',
        loadingButton: 'Entrando...',
        welcome: 'Bem-vindo ao painel',
        errorLogin: 'Falha no login. Verifique suas credenciais.',
        monitorSystem: 'Sistema monitorado pelo Sentinel.',
        ipRegistered: 'Seu IP {{ip}} foi registrado.',
    }
};
