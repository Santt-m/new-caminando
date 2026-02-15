import { useEffect, useState } from 'react';
import { Save, Shield, Zap, Lock, Bell, Plus, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { API_BASE_URL } from '@/utils/api.config';

interface ProxyConfig {
  trackingEnabled: boolean;
  cacheEnabled: boolean;
  rateLimitEnabled: boolean;
  hotlinkProtectionEnabled: boolean;
  cacheTTL: number;
  cacheMaxSize: number;
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  rateLimitPerDay: number;
  allowedDomains: string[];
  allowEmptyReferer: boolean;
  blacklistedIPs: string[];
  whitelistedIPs: string[];
  autoBlockThreshold: number;
  autoBlockEnabled: boolean;
  alertsEnabled: boolean;
  alertEmail?: string;
  alertWebhook?: string;
  alertThresholdRequests: number;
  alertThresholdUniqueIPs: number;
  retentionDays: number;
  isActive: boolean;
}

export const ProxySettings = () => {
  const [config, setConfig] = useState<ProxyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newIP, setNewIP] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [ipToBlock, setIpToBlock] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const API_URL = API_BASE_URL;

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/panel/cloudinary/proxy/config`, {
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/panel/cloudinary/proxy/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config)
      });

      if (res.ok) {
        alert('Configuración guardada exitosamente');
        loadConfig();
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleBlockIP = async () => {
    if (!ipToBlock.trim()) return;

    try {
      const res = await fetch(`${API_URL}/panel/cloudinary/proxy/config/block-ip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ip: ipToBlock, reason: blockReason })
      });

      if (res.ok) {
        setIpToBlock('');
        setBlockReason('');
        loadConfig();
      }
    } catch (error) {
      console.error('Error blocking IP:', error);
    }
  };

  const handleUnblockIP = async (ip: string) => {
    try {
      const res = await fetch(`${API_URL}/panel/cloudinary/proxy/config/unblock-ip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ip })
      });

      if (res.ok) {
        loadConfig();
      }
    } catch (error) {
      console.error('Error unblocking IP:', error);
    }
  };

  const addToWhitelist = () => {
    if (!newIP.trim() || !config) return;
    setConfig({
      ...config,
      whitelistedIPs: [...config.whitelistedIPs, newIP.trim()]
    });
    setNewIP('');
  };

  const removeFromWhitelist = (ip: string) => {
    if (!config) return;
    setConfig({
      ...config,
      whitelistedIPs: config.whitelistedIPs.filter(i => i !== ip)
    });
  };

  const addDomain = () => {
    if (!newDomain.trim() || !config) return;
    setConfig({
      ...config,
      allowedDomains: [...config.allowedDomains, newDomain.trim()]
    });
    setNewDomain('');
  };

  const removeDomain = (domain: string) => {
    if (!config) return;
    setConfig({
      ...config,
      allowedDomains: config.allowedDomains.filter(d => d !== domain)
    });
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  if (loading || !config) {
    return <div className="p-8 text-center">Cargando configuración...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración del Proxy</h1>
          <p className="text-muted-foreground mt-1">
            Configura el sistema de proxy, cache y protección de imágenes
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      {/* Sistema Principal */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema Principal</CardTitle>
          <CardDescription>Activación global del proxy de imágenes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isActive">Sistema Activo</Label>
              <p className="text-sm text-muted-foreground">
                {config.isActive ? 'El proxy está activo y procesando requests' : 'El proxy está desactivado'}
              </p>
            </div>
            <Switch
              checked={config.isActive}
              onCheckedChange={(checked: boolean) => setConfig({ ...config, isActive: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Características
          </CardTitle>
          <CardDescription>Activa o desactiva funcionalidades del proxy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="trackingEnabled">Tracking de Accesos</Label>
              <p className="text-sm text-muted-foreground">Registra cada acceso en MongoDB</p>
            </div>
            <Switch
              checked={config.trackingEnabled}
              onCheckedChange={(checked: boolean) => setConfig({ ...config, trackingEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="cacheEnabled">Sistema de Cache</Label>
              <p className="text-sm text-muted-foreground">Cachea imágenes en Redis</p>
            </div>
            <Switch
              checked={config.cacheEnabled}
              onCheckedChange={(checked: boolean) => setConfig({ ...config, cacheEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="rateLimitEnabled">Rate Limiting</Label>
              <p className="text-sm text-muted-foreground">Limita requests por IP</p>
            </div>
            <Switch
              checked={config.rateLimitEnabled}
              onCheckedChange={(checked: boolean) => setConfig({ ...config, rateLimitEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="hotlinkProtectionEnabled">Hotlink Protection</Label>
              <p className="text-sm text-muted-foreground">Solo permite dominios autorizados</p>
            </div>
            <Switch
              checked={config.hotlinkProtectionEnabled}
              onCheckedChange={(checked: boolean) => setConfig({ ...config, hotlinkProtectionEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cache Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Cache</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cacheTTL">Tiempo de Vida (segundos)</Label>
              <Input
                id="cacheTTL"
                type="number"
                min="60"
                max="86400"
                value={config.cacheTTL}
                onChange={(e) => setConfig({ ...config, cacheTTL: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">Min: 60s, Max: 86400s (24h)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cacheMaxSize">Tamaño Máximo por Imagen</Label>
              <Input
                id="cacheMaxSize"
                type="number"
                value={Math.round(config.cacheMaxSize / (1024 * 1024))}
                onChange={(e) => setConfig({ ...config, cacheMaxSize: parseInt(e.target.value) * 1024 * 1024 })}
              />
              <p className="text-xs text-muted-foreground">En MB. Actual: {formatBytes(config.cacheMaxSize)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limiting</CardTitle>
          <CardDescription>Límites de requests por IP</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="rateLimitPerMinute">Por Minuto</Label>
              <Input
                id="rateLimitPerMinute"
                type="number"
                min="1"
                value={config.rateLimitPerMinute}
                onChange={(e) => setConfig({ ...config, rateLimitPerMinute: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rateLimitPerHour">Por Hora</Label>
              <Input
                id="rateLimitPerHour"
                type="number"
                min="1"
                value={config.rateLimitPerHour}
                onChange={(e) => setConfig({ ...config, rateLimitPerHour: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rateLimitPerDay">Por Día</Label>
              <Input
                id="rateLimitPerDay"
                type="number"
                min="1"
                value={config.rateLimitPerDay}
                onChange={(e) => setConfig({ ...config, rateLimitPerDay: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Block */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Auto-Bloqueo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoBlockEnabled">Auto-bloqueo Activado</Label>
              <p className="text-sm text-muted-foreground">Bloquea IPs sospechosas automáticamente</p>
            </div>
            <Switch
              checked={config.autoBlockEnabled}
              onCheckedChange={(checked: boolean) => setConfig({ ...config, autoBlockEnabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="autoBlockThreshold">Umbral de Bloqueo (requests/hora)</Label>
            <Input
              id="autoBlockThreshold"
              type="number"
              min="1"
              value={config.autoBlockThreshold}
              onChange={(e) => setConfig({ ...config, autoBlockThreshold: parseInt(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              Bloquear IP si excede este número de requests en 1 hora
            </p>
          </div>
        </CardContent>
      </Card>

      {/* IP Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Gestión de IPs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Block IP */}
          <div className="space-y-3">
            <Label>Bloquear IP Manualmente</Label>
            <div className="flex gap-2">
              <Input
                placeholder="192.168.1.1"
                value={ipToBlock}
                onChange={(e) => setIpToBlock(e.target.value)}
              />
              <Input
                placeholder="Razón (opcional)"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleBlockIP} variant="destructive">
                <Lock className="h-4 w-4 mr-2" />
                Bloquear
              </Button>
            </div>
          </div>

          {/* Blacklist */}
          {config.blacklistedIPs.length > 0 && (
            <div className="space-y-2">
              <Label>IPs Bloqueadas ({config.blacklistedIPs.length})</Label>
              <div className="flex flex-wrap gap-2">
                {config.blacklistedIPs.map((ip) => (
                  <Badge key={ip} variant="destructive" className="flex items-center gap-1">
                    {ip}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-white"
                      onClick={() => handleUnblockIP(ip)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Whitelist */}
          <div className="space-y-3">
            <Label>Whitelist (IPs Siempre Permitidas)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="192.168.1.1"
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
              />
              <Button onClick={addToWhitelist} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
            {config.whitelistedIPs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {config.whitelistedIPs.map((ip) => (
                  <Badge key={ip} variant="default" className="flex items-center gap-1">
                    {ip}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFromWhitelist(ip)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hotlink Protection */}
      <Card>
        <CardHeader>
          <CardTitle>Hotlink Protection</CardTitle>
          <CardDescription>Dominios permitidos para acceder a las imágenes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allowEmptyReferer">Permitir Referer Vacío</Label>
              <p className="text-sm text-muted-foreground">Permite acceso directo sin referer</p>
            </div>
            <Switch
              checked={config.allowEmptyReferer}
              onCheckedChange={(checked: boolean) => setConfig({ ...config, allowEmptyReferer: checked })}
            />
          </div>

          <div className="space-y-3">
            <Label>Dominios Permitidos</Label>
            <div className="flex gap-2">
              <Input
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
              />
              <Button onClick={addDomain} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
            {config.allowedDomains.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {config.allowedDomains.map((domain) => (
                  <Badge key={domain} className="flex items-center gap-1">
                    {domain}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeDomain(domain)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Sistema de Alertas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="alertsEnabled">Alertas Activadas</Label>
              <p className="text-sm text-muted-foreground">Envía notificaciones por actividad sospechosa</p>
            </div>
            <Switch
              checked={config.alertsEnabled}
              onCheckedChange={(checked: boolean) => setConfig({ ...config, alertsEnabled: checked })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="alertEmail">Email de Alertas</Label>
              <Input
                id="alertEmail"
                type="email"
                placeholder="admin@ejemplo.com"
                value={config.alertEmail || ''}
                onChange={(e) => setConfig({ ...config, alertEmail: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alertWebhook">Webhook URL</Label>
              <Input
                id="alertWebhook"
                type="url"
                placeholder="https://..."
                value={config.alertWebhook || ''}
                onChange={(e) => setConfig({ ...config, alertWebhook: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retention */}
      <Card>
        <CardHeader>
          <CardTitle>Retención de Datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="retentionDays">Días de Retención</Label>
            <Input
              id="retentionDays"
              type="number"
              min="1"
              max="365"
              value={config.retentionDays}
              onChange={(e) => setConfig({ ...config, retentionDays: parseInt(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              Los eventos más antiguos se eliminarán automáticamente
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button Footer */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Toda la Configuración'}
        </Button>
      </div>
    </div>
  );
};
