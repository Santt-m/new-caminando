/**
 * Convierte un texto en un slug amigable para URLs.
 */
export const slugify = (text: string): string => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .normalize('NFD')                     // Descompone caracteres combinados (acentos)
        .replace(/[\u0300-\u036f]/g, '')     // Elimina los acentos
        .replace(/[^a-z0-9 -]/g, '')          // Elimina caracteres no permitidos
        .replace(/\s+/g, '-')                // Reemplaza espacios por guiones
        .replace(/-+/g, '-');                // Elimina guiones repetidos
};
