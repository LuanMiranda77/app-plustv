/**
 * Modo de desenvolvimento — quando true, usa dados mock (JSON + mockData)
 * em vez de buscar do servidor. Útil para testar na TV sem esperar
 * o carregamento completo da lista.
 *
 * Altere para false antes de gerar o build de produção.
 */
declare const __DEV_MODE__: boolean;
export const DEV_MODE: boolean = typeof __DEV_MODE__ !== 'undefined' ? __DEV_MODE__ : true;
