// assets/js/utils/LocalStorageService.js

/**
 * @fileoverview Serviço utilitário para abstração e gerenciamento da API localStorage.
 * Este serviço implementa o padrão Service Locator, isolando a lógica de persistência
 * da aplicação e fornecendo um ponto centralizado para tratamento de erros
 * (como QuotaExceededError) e serialização/desserialização de JSON.
 *
 */

/**
 * Service para abstrair o acesso ao localStorage.
 *
 * Faz parte da Camada Service/Utils.
 *
 */
export const LocalStorageService = {
  /**
   * Carrega dados do localStorage e faz o parse de JSON.
   * Centraliza o tratamento de erros de leitura (ex: JSON mal formatado).
   *
   * @param {string} key Chave do localStorage a ser carregada (ex: STORAGE_KEY).
   * @returns {any} Dados parseados ou `null` em caso de falha na leitura ou se a chave não existir.
   *
   */
  load(key) {
    const storedData = localStorage.getItem(key);
    try {
      // Retorna o objeto parseado se houver dados, senão retorna null.
      return storedData ? JSON.parse(storedData) : null;
    } catch (e) {
      // Tratamento de erro de parsing (ex: se o valor salvo não for um JSON válido)
      console.error(
        `[LocalStorageService] Erro ao carregar ou parsear dados para a chave ${key}:`,
        e
      );
      return null;
    }
  },

  /**
   * Salva dados no localStorage, serializando o objeto em JSON.
   * Centraliza o tratamento de erros de escrita (ex: Storage full).
   *
   * @param {string} key Chave do localStorage onde os dados serão armazenados.
   * @param {any} data Dados (geralmente um objeto/array) a serem serializados e salvos.
   *
   */
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      // Em caso de Storage full (QuotaExceededError) ou outros erros de escrita.
      console.error(
        `[LocalStorageService] Erro ao salvar dados para a chave ${key}:`,
        e
      );
      // Feedback explícito ao usuário conforme a estratégia de tratamento de erros da arquitetura.
      //
      alert(
        "Atenção: O armazenamento local do seu navegador está cheio. Não foi possível salvar as alterações."
      );
    }
  },
};
