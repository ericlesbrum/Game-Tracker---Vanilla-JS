// assets/js/components/UIManager.js

/**
 * @fileoverview Componente da View responsável por gerenciar elementos de layout geral,
 * como modais e mensagens de feedback.
 *
 * Faz parte da Camada Componente (View Layer).
 */

/**
 * Gerencia a UI de layout geral (ex: Modals, Feedbacks).
 * Recebe o objeto DOM do Controller (game_tracker.js) para manipular os elementos
 * de forma isolada do restante da View.
 */
export class UIManager {
  /**
   * @param {Object} domElements - Um objeto contendo referências diretas a elementos do DOM
   * (mapeados no Controller) que serão manipulados por este componente.
   */
  constructor(domElements) {
    // O UIManager depende do Controller para fornecer as referências do DOM (Inversão de Dependência)
    this.dom = domElements;
    this.setupModalClosing();
  }

  /**
   * Configura o fechamento dos modais ao clicar no fundo (backdrop).
   * Lógica de manipulação de eventos e estilo de baixo nível é encapsulada aqui.
   */
  setupModalClosing() {
    document.addEventListener("click", (e) => {
      // Se o alvo do clique for o próprio elemento modal (o backdrop)
      if (e.target === this.dom.renameModal) {
        this.dom.renameModal.style.display = "none";
      }
      if (e.target === this.dom.deleteModal) {
        this.dom.deleteModal.style.display = "none";
      }
    });
  }

  /**
   * Abre o modal específico, preenchendo os dados necessários (ex: nome da aba)
   * e configurando o foco.
   *
   * O Controller (game_tracker.js) chama este método para mudar o estado da View.
   *
   * @param {'rename' | 'delete'} type Tipo de modal a ser aberto.
   * @param {string} tabName Nome da aba (necessário para o modal de delete/rename).
   */
  openModal(type, tabName = null) {
    if (type === "rename") {
      this.dom.renameInput.value = tabName || "";
      this.dom.renameModal.style.display = "flex"; // Usa flex para centralizar o modal
      this.dom.renameInput.focus(); // Foca no campo de input para melhor UX
    } else if (type === "delete") {
      this.dom.deleteTabNameDisplay.textContent = tabName; // Exibe o nome da aba a ser deletada
      this.dom.deleteModal.style.display = "flex";
    }
  }

  /**
   * Fecha todos os modais, limpando o estado da View relacionado a eles.
   * Usado como parte da resposta do Controller após o tratamento de uma ação (cancelar ou confirmar).
   */
  closeAllModals() {
    this.dom.renameModal.style.display = "none";
    this.dom.deleteModal.style.display = "none";
  }
}
