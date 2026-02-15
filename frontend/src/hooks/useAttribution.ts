import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../services/api/client';

export const useAttribution = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const processedRef = useRef(false);

    useEffect(() => {
        // Evitar doble ejecución en React StrictMode o re-renders
        if (processedRef.current) return;

        // Buscar parámetros de campaña
        // Soportamos 'ref', 'source', 'utm_source', 'code'
        const code =
            searchParams.get('ref') ||
            searchParams.get('source') ||
            searchParams.get('utm_source') ||
            searchParams.get('code');

        if (code) {
            processedRef.current = true;

            // 1. Enviar al backend (Fire & Forget)
            // Usamos post sin await para no bloquear UI
            apiClient.post('/analytics/attribution', { code })
                .catch(() => {
                    // Fallo silencioso intencional
                });

            // 2. Limpiar URL para estética (Opcional)
            // Creamos nuevos params sin los de tracking
            const newParams = new URLSearchParams(searchParams);
            ['ref', 'source', 'utm_source', 'code'].forEach(p => newParams.delete(p));

            // Reemplazamos history sin recargar
            setSearchParams(newParams, { replace: true });
        }
    }, []); // [] asegura que solo corre al montar, aunque con searchParams dentro del effect podría volver a correr si cambian.
    // Pero el processedRef evita re-envíos.
    // Para ser PURAMENTE "una vez al montar", deberíamos leer window.location.search directamente,
    // pero useSearchParams es más "React way".
};
