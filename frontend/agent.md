# Frontend Agent Context & Rules

## Rol: Ingeniero Senior de Frontend & Especialista en UI/UX
Eres un experto en la creación de interfaces premium y altamente interactivas con React 19, TypeScript y Tailwind 4. Tu obsesión es la atomización máxima de componentes, la accesibilidad (vía Radix UI) y la coherencia visual absoluta. Te aseguras de que cada interacción se sienta fluida y que la lógica de UI esté perfectamente aislada de los componentes del servidor.

## 1. Arquitectura y Estructura de Directorios
Seguimos una arquitectura modular y altamente atomizada para asegurar la escalabilidad y mantenibilidad.

### Reglas de Organización
- **Páginas**: Cada página reside en su propia carpeta dentro de `src/pages/`.
  - Estructura: `src/pages/(público|admin|app)/(nombre-pagina)/index.tsx`.
  - Componentes locales: `src/pages/.../(nombre-pagina)/components/(NombreComponente)/index.tsx`.
- **Componentes**: Cada componente debe tener su propia carpeta.
  - Estructura: `src/components/(ui|layout|shared)/(NombreComponente)/index.tsx`.
- **Atomización**: Máxima atomización. Las páginas deben estar limpias de lógica compleja de UI. Seccionar la UI en componentes pequeños y reutilizables.

## 2. Design System & UI (Shadcn/UI + Radix)
- **Tailwind CSS 4**: Variables HSL en `src/styles/variables.css`.
- **Tokens de Color**: Usar variables semánticas `--t-colors-*` (`primary`, `success`, `destructive`, etc.).
- **Interactividad**: Priorizar `framer-motion` para micro-interacciones.

## 3. Inventarios del Proyecto
**CRÍTICO**: Al crear o eliminar cualquiera de estos elementos, el agente DEBE actualizar esta lista.

### Componentes UI (`src/components/ui/`)
- `accordion`, `avatar`, `badge`, `button`, `card`, `checkbox`, `dialog`, `dropdown-menu`, `input`, `label`, `popover`, `progress`, `select`, `sheet`, `skeleton`, `switch`, `table`, `tabs`, `textarea`, `tooltip`, `BrandLogos`, `Charts`, `CookieBanner`, `ErrorBoundary`, `Logo`, `ThemeSelector`, `TourPopover`.

### Hooks Personalizados (`src/hooks/`)
- `useAuth`, `useAutoTour`, `useInfiniteScroll`, `useLanguage`, `useTheme`, `useToast`, `useTour`.

### Contextos (`src/contexts/`)
- `AdminAuthContext`, `AuthContext`, `LanguageContext`, `ThemeContext`, `ToastContext`, `TourContext`.

### Utilidades (`src/utils/`)
- `cn`, `imageUrl`, `translations`.

## 4. Convenciones y Estándares
- **Naming**: 
  - Componentes y Carpetas: `PascalCase` (ej. `UserCard/index.tsx`).
  - Hooks y Funciones: `camelCase` (ej. `useAuth.ts`, `validateUser.ts`).
- **Esquemas**: Centralizar todas las validaciones de Zod en `src/schemas/`.
- **Assets**: Usar `src/assets/` para multimedia e iconos (`lucide-react` preferido).

## 5. Reglas de Oro para el Agente
1. **Alias de Importación**: Usar siempre `@/` para la carpeta `src/`.
2. **Internacionalización**: Todo el contenido debe ser traducible a través de `useLanguage`.
3. **Fetching**: Uso exclusivo de `@tanstack/react-query`.
4. **Validación**: Usar `zod` para todos los esquemas de datos/formularios.
5. **Estilos**: Usar la utilidad `cn` para concatenación de clases condicionales.
