import type { ITranslation } from '@/hooks/useLanguage';

export const traduccionSettings: ITranslation = {
    es: {
        title: 'Configuración',
        subtitle: 'Gestiona tus preferencias y la seguridad de la cuenta.',

        // Tabs
        tabAccount: 'Cuenta',
        tabAppearance: 'Apariencia',
        tabSystem: 'Sistema',

        // Account Section
        sectionProfile: 'Perfil del Administrador',
        labelName: 'Nombre',
        labelEmail: 'Correo Electrónico',
        labelRole: 'Rol',

        sectionSecurity: 'Seguridad',
        labelCurrentPassword: 'Contraseña Actual',
        labelNewPassword: 'Nueva Contraseña',
        labelConfirmPassword: 'Confirmar Contraseña',
        btnUpdatePassword: 'Actualizar Contraseña',

        // Appearance Section
        sectionTheme: 'Tema del Sistema',
        themeLight: 'Claro',
        themeDark: 'Oscuro',
        themeSystem: 'Sistema',

        // Messages
        successPassword: 'La contraseña se ha actualizado correctamente.',
        errorPassword: 'No se pudo actualizar la contraseña. Verifica que la contraseña actual sea correcta.',
        passwordsDoNotMatch: 'Las contraseñas no coinciden.',
    },
    en: {
        title: 'Settings',
        subtitle: 'Manage your preferences and account security.',

        tabAccount: 'Account',
        tabAppearance: 'Appearance',
        tabSystem: 'System',

        sectionProfile: 'Admin Profile',
        labelName: 'Name',
        labelEmail: 'Email',
        labelRole: 'Role',

        sectionSecurity: 'Security',
        labelCurrentPassword: 'Current Password',
        labelNewPassword: 'New Password',
        labelConfirmPassword: 'Confirm Password',
        btnUpdatePassword: 'Update Password',

        sectionTheme: 'System Theme',
        themeLight: 'Light',
        themeDark: 'Dark',
        themeSystem: 'System',

        successPassword: 'Password has been updated successfully.',
        errorPassword: 'Could not update password. Please verify current password.',
        passwordsDoNotMatch: 'Passwords do not match.',
    },
    pt: {
        title: 'Configurações',
        subtitle: 'Gerencie suas preferências e segurança da conta.',

        tabAccount: 'Conta',
        tabAppearance: 'Aparência',
        tabSystem: 'Sistema',

        sectionProfile: 'Perfil do Administrador',
        labelName: 'Nome',
        labelEmail: 'Email',
        labelRole: 'Função',

        sectionSecurity: 'Segurança',
        labelCurrentPassword: 'Senha Atual',
        labelNewPassword: 'Nova Senha',
        labelConfirmPassword: 'Confirmar Senha',
        btnUpdatePassword: 'Atualizar Senha',

        sectionTheme: 'Tema do Sistema',
        themeLight: 'Claro',
        themeDark: 'Escuro',
        themeSystem: 'Sistema',

        successPassword: 'Senha atualizada com sucesso.',
        errorPassword: 'Não foi possível atualizar a senha. Verifique a senha atual.',
        passwordsDoNotMatch: 'As senhas não coincidem.',
    }
};
