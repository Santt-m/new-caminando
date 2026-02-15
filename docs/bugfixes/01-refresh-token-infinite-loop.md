# 🐛 Bug Fix: Bucle Infinito de Refresh Token

## Problema

Al cargar la aplicación sin una sesión activa, se generaba un bucle infinito de requests a `/auth/refresh` que devolvían 401:

```
[2026-02-12 16:13:25] POST /auth/refresh - 401
[2026-02-12 16:13:25] POST /auth/refresh - 401
[2026-02-12 16:13:26] POST /auth/refresh - 401
[2026-02-12 16:13:26] POST /auth/refresh - 401
... (infinito)
```

## Causa Raíz

El bucle se generaba por dos problemas en la lógica de autenticación:

### 1. Interceptor de Axios (`authService.ts`)

El interceptor de respuesta intentaba refrescar el token **para cualquier error 401**, incluyendo los del propio endpoint `/auth/refresh`:

```typescript
// ❌ ANTES (causaba bucle)
if (error.response?.status === 401 && !originalRequest._retry) {
    const newToken = await authService.refresh(); // Esto falla con 401
    // El interceptor captura este 401 y vuelve a llamar refresh()
    // = BUCLE INFINITO
}
```

### 2. AuthContext (`AuthContext.tsx`)

No manejaba correctamente el caso donde NO existe un refresh token válido:

```typescript
// ❌ ANTES (no manejaba el error)
if (!authTokenManager.hasToken()) {
    const token = await authService.refresh(); // Si falla lanza error
    authTokenManager.setToken(token);
}
```

## Solución

### 1. Excluir `/refresh` del Interceptor

```typescript
// ✅ DESPUÉS
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // NO intentar refrescar si el error viene de /refresh
        if (originalRequest.url?.includes('/refresh')) {
            return Promise.reject(error.response?.data || { message: 'Session expired' });
        }

        // El resto del código del interceptor...
    }
);
```

### 2. Manejo Silencioso en AuthContext

```typescript
// ✅ DESPUÉS
if (!authTokenManager.hasToken()) {
    try {
        const token = await authService.refresh();
        authTokenManager.setToken(token);
    } catch {
        // No hay refresh token válido - es normal, usuario no logueado
        setUser(null);
        authTokenManager.clearToken();
        setIsLoading(false);
        return; // Salir temprano
    }
}
```

## Archivos Modificados

1. **`frontend/src/services/auth/authService.ts`**
   - Agregado check para prevenir que el interceptor procese errores de `/refresh`

2. **`frontend/src/contexts/AuthContext/AuthContext.tsx`**
   - Agregado try-catch para manejar silenciosamente cuando no hay refresh token

## Resultado

✅ El frontend ya NO genera requests infinitas  
✅ Cuando no hay sesión activa, se maneja silenciosamente  
✅ El interceptor solo intenta refrescar para endpoints que NO sean `/refresh`  
✅ Experiencia de usuario sin errores en consola al cargar sin sesión

## Prevención

Este tipo de bugs se pueden prevenir con:

1. **Guardias en interceptores**: Verificar que el interceptor no procese sus propias llamadas
2. **Early returns**: Salir temprano cuando no hay condiciones necesarias (ej: no hay refresh token)
3. **Logging condicional**: Solo registrar errores cuando NO sean parte del flujo normal (como no estar logueado)
