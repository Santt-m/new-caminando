import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../hooks/useLanguage';
import { traducciones } from './traduccion';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Switch } from '../../../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Label } from '../../../../components/ui/label';
import { useToast } from '../../../../hooks/useToast';
import { useAuth } from '../../../../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { profileService } from '../../../../services/profile/profileService';
import { SessionsManager } from '../../../../components/settings/SessionsManager';


export const DashboardAjustes: React.FC = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const { user: authUser, refetchUser } = useAuth();

    const [name, setName] = useState(authUser?.name || '');
    const [firstName, setFirstName] = useState(authUser?.profile?.firstName || '');
    const [lastName, setLastName] = useState(authUser?.profile?.lastName || '');
    const [bio, setBio] = useState(authUser?.profile?.bio || ''); // Bio suele estar en profile o root, asumamos profile ahora o fallback
    const [avatar, setAvatar] = useState(authUser?.avatar || '');

    // Datos Personales
    const [dni, setDni] = useState(authUser?.profile?.dni || '');
    const [gender, setGender] = useState<'M' | 'F' | 'X'>(authUser?.profile?.gender || 'X');
    const [phoneArea, setPhoneArea] = useState(authUser?.profile?.phone?.areaCode || '');
    const [phoneNumber, setPhoneNumber] = useState(authUser?.profile?.phone?.number || '');

    // Fecha Nacimiento
    const [dobDay, setDobDay] = useState(authUser?.profile?.dateOfBirth?.day || '');
    const [dobMonth, setDobMonth] = useState(authUser?.profile?.dateOfBirth?.month || '');
    const [dobYear, setDobYear] = useState(authUser?.profile?.dateOfBirth?.year || '');

    // Dirección
    const [street, setStreet] = useState(authUser?.profile?.address?.street || '');
    const [addressNumber, setAddressNumber] = useState(authUser?.profile?.address?.number || '');
    const [city, setCity] = useState(authUser?.profile?.address?.city || '');
    const [zipCode, setZipCode] = useState(authUser?.profile?.address?.zipCode || '');

    const [preferences, setPreferences] = useState<{
        currency: 'ARS' | 'USD' | 'EUR';
        language: 'es' | 'en' | 'pt';
        notifications: {
            recurringReminders: boolean;
            newsletter: boolean;
            syncCompleted: boolean;
        };
    }>({
        currency: 'ARS',
        language: 'es',
        notifications: {
            recurringReminders: false,
            newsletter: false,
            syncCompleted: true,
        }
    });

    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPreferences, setIsSavingPreferences] = useState(false);

    // Sincronizar con usuario de AuthContext cuando cambie
    useEffect(() => {
        if (authUser) {
            setName(authUser.name);
            setAvatar(authUser.avatar || '');
            // Actualizar estados locales si user cambia externamente
            if (authUser.profile) {
                setFirstName(authUser.profile.firstName || '');
                setLastName(authUser.profile.lastName || '');
                setDni(authUser.profile.dni || '');
                setGender(authUser.profile.gender || 'X');
                if (authUser.profile.phone) {
                    setPhoneArea(authUser.profile.phone.areaCode);
                    setPhoneNumber(authUser.profile.phone.number);
                }
                if (authUser.profile.dateOfBirth) {
                    setDobDay(authUser.profile.dateOfBirth.day);
                    setDobMonth(authUser.profile.dateOfBirth.month);
                    setDobYear(authUser.profile.dateOfBirth.year);
                }
                if (authUser.profile.address) {
                    setStreet(authUser.profile.address.street);
                    setAddressNumber(authUser.profile.address.number);
                    setCity(authUser.profile.address.city || '');
                    setZipCode(authUser.profile.address.zipCode || '');
                }
            }
        }
    }, [authUser]);

    const handleAvatarChange = () => {
        const newAvatar = `https://i.pravatar.cc/150?u=${authUser?.id}&t=${Date.now()}`;
        setAvatar(newAvatar);
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        try {
            await profileService.updateProfile({
                name: name.trim(), // Legacy
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                bio: bio.trim(),
                avatar,
                dni: dni.trim(),
                gender,
                phone: {
                    areaCode: phoneArea.trim(),
                    number: phoneNumber.trim()
                },
                dateOfBirth: {
                    day: dobDay,
                    month: dobMonth,
                    year: dobYear
                },
                address: {
                    street: street.trim(),
                    number: addressNumber.trim(),
                    city: city.trim(),
                    zipCode: zipCode.trim()
                }
            });

            await refetchUser();
            showToast({ type: 'success', message: t(traducciones, 'changesSaved') });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({ type: 'error', message: error.message || 'Error al guardar cambios' });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleSavePreferences = async () => {
        setIsSavingPreferences(true);
        try {
            await profileService.updatePreferences(preferences);
            await refetchUser();
            showToast({ type: 'success', message: 'Preferencias guardadas' });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({ type: 'error', message: error.message || 'Error al guardar preferencias' });
        } finally {
            setIsSavingPreferences(false);
        }
    };



    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    {t(traducciones, 'title')}
                </h1>
                <p className="text-muted-foreground">
                    {t(traducciones, 'subtitle')}
                </p>
            </div>

            <Card className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                    👤 {t(traducciones, 'profile')}
                </h2>
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-4 pb-4 border-b border-border/50">
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-primary/10 group-hover:border-primary/30 transition-colors">
                                <img
                                    src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`}
                                    alt={name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <button
                                onClick={handleAvatarChange}
                                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                                title={t(traducciones, 'changeAvatar')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                            </button>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-foreground">{t(traducciones, 'avatar')}</p>
                            <p className="text-xs text-muted-foreground">{t(traducciones, 'uploadNew')}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Nombre</label>
                                <Input
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Tu nombre"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Apellido</label>
                                <Input
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Tu apellido"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                {t(traducciones, 'bio')}
                            </label>
                            <Textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Cuéntanos un poco sobre ti..."
                                rows={3}
                            />
                        </div>

                        <div className="pt-4 border-t border-border">
                            <h3 className="text-lg font-medium mb-4">Datos Personales (Para Registro Automático)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">DNI</label>
                                    <Input value={dni} onChange={e => setDni(e.target.value)} placeholder="Ej: 30123456" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Género</label>
                                    <Select
                                        value={String(gender)}
                                        onValueChange={(val) => setGender(val as any)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccionar género" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="M">Masculino</SelectItem>
                                            <SelectItem value="F">Femenino</SelectItem>
                                            <SelectItem value="X">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Teléfono (Área)</label>
                                    <Input value={phoneArea} onChange={e => setPhoneArea(e.target.value)} placeholder="11" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Teléfono (Número)</label>
                                    <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="45678901" />
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                <label className="text-sm font-medium">Fecha de Nacimiento</label>
                                <div className="flex gap-2">
                                    <Input className="w-20" value={dobDay} onChange={e => setDobDay(e.target.value)} placeholder="DD" />
                                    <Input className="w-20" value={dobMonth} onChange={e => setDobMonth(e.target.value)} placeholder="MM" />
                                    <Input className="w-24" value={dobYear} onChange={e => setDobYear(e.target.value)} placeholder="AAAA" />
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                <label className="text-sm font-medium">Dirección</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input value={street} onChange={e => setStreet(e.target.value)} placeholder="Calle" />
                                    <Input value={addressNumber} onChange={e => setAddressNumber(e.target.value)} placeholder="Altura" />
                                    <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Ciudad" />
                                    <Input value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="CP" />
                                </div>
                            </div>
                        </div>

                    </div>
                    <Button
                        variant="default"
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                    >
                        {isSavingProfile ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            t(traducciones, 'saveChanges')
                        )}
                    </Button>
                </div>
            </Card>

            <Card className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                    ⚙️ {t(traducciones, 'preferences')}
                </h2>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t(traducciones, 'currency')}</Label>
                        <Select
                            value={preferences.currency}
                            onValueChange={(value) => setPreferences({ ...preferences, currency: value as 'ARS' | 'USD' | 'EUR' })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
                                <SelectItem value="USD">USD - Dólar</SelectItem>
                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>{t(traducciones, 'language')}</Label>
                        <Select
                            value={preferences.language}
                            onValueChange={(value) => setPreferences({ ...preferences, language: value as 'es' | 'en' | 'pt' })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="pt">Português</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        variant="default"
                        onClick={handleSavePreferences}
                        disabled={isSavingPreferences}
                    >
                        {isSavingPreferences ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            'Guardar preferencias'
                        )}
                    </Button>
                </div>
            </Card>

            <Card className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                    🔔 {t(traducciones, 'notifications')}
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-foreground">
                                {t(traducciones, 'recurringReminders')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {t(traducciones, 'recurringRemindersDesc')}
                            </p>
                        </div>
                        <Switch
                            checked={preferences.notifications.recurringReminders}
                            onCheckedChange={(checked) => setPreferences({
                                ...preferences,
                                notifications: { ...preferences.notifications, recurringReminders: checked }
                            })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-foreground">
                                {t(traducciones, 'newsletter')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {t(traducciones, 'newsletterDesc')}
                            </p>
                        </div>
                        <Switch
                            checked={preferences.notifications.newsletter}
                            onCheckedChange={(checked) => setPreferences({
                                ...preferences,
                                notifications: { ...preferences.notifications, newsletter: checked }
                            })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-foreground">
                                {t(traducciones, 'syncCompleted')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {t(traducciones, 'syncCompletedDesc')}
                            </p>
                        </div>
                        <Switch
                            checked={preferences.notifications.syncCompleted}
                            onCheckedChange={(checked) => setPreferences({
                                ...preferences,
                                notifications: { ...preferences.notifications, syncCompleted: checked }
                            })}
                        />
                    </div>
                    <Button
                        variant="default"
                        onClick={handleSavePreferences}
                        disabled={isSavingPreferences}
                        className="mt-4"
                    >
                        {isSavingPreferences ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            'Guardar notificaciones'
                        )}
                    </Button>
                </div>
            </Card>

            {/* Sessions Section */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                    🔐 Sesiones y Seguridad
                </h2>
                <SessionsManager />
            </Card>

        </div>
    );
};
