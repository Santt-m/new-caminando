
export interface IScraperNode {
    /**
     * Nombre único del nodo (ej: 'CARREFOUR_HOME', 'COTO_PRODUCT')
     */
    name: string;

    /**
     * Método principal de ejecución
     * @param data Datos de entrada variables según el nodo
     */
    execute(data?: any): Promise<any>;

    /**
     * Valida si el nodo puede procesar estos datos
     */
    canHandle(data: any): boolean;
}
