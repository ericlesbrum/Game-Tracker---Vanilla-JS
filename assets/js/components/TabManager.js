// assets/js/components/TabManager.js

/**
 * @fileoverview Componente de UI (View Layer) responsável pela renderização
 * e gestão dos eventos de interação da lista de abas (tabs).
 *
 * Implementa o Component Pattern dentro da Camada Componente.
 */

/**
 * Componente de UI responsável pela renderização e eventos das abas.
 * Encapsula a lógica de como as abas são desenhadas e como os eventos de clique
 * são delegados de volta ao Controller (Mediator).
 */
export class TabManager {
  /**
   * @param {HTMLElement} domList O elemento DOM (container <ul> ou <div>) onde as abas serão renderizadas.
   * @param {object} callbacks Funções do Controller (Mediator) para delegar ações de mudança de estado.
   */
  constructor(domList, callbacks) {
    this.domList = domList;
    // Callbacks do Controller (Mediator): Armazena as abstrações das ações de negócio
    this.activateTab = callbacks.activateTab;
    this.addTab = callbacks.addTab;
    this.openRenameModal = callbacks.openRenameModal;
    this.openDeleteModal = callbacks.openDeleteModal;
  }

  /**
   * Atualiza o estado interno do componente (propriedades) e dispara a renderização.
   * Este é o método que o Controller (game_tracker.js) chama para atualizar a View.
   *
   * @param {Array} tabsData Dados de todas as abas.
   * @param {string | null} activeTabId ID da aba ativa.
   */
  setState(tabsData, activeTabId) {
    this.tabsData = tabsData;
    this.activeTabId = activeTabId;
    this.render(); // Redesenha a UI com o novo estado
  }

  /**
   * Renderiza (desenha) todas as abas e o botão de adicionar no DOM.
   * Utiliza a limpeza total (`innerHTML = ""`) seguida de re-renderização completa (padrão comum em Vanilla JS para Views simples).
   */
  render() {
    this.domList.innerHTML = ""; // Limpa a lista existente

    this.tabsData.forEach((tab) => {
      const tabButton = document.createElement("button");
      // Define a classe 'active' com base no estado fornecido pelo Controller
      tabButton.className = `tab-button ${
        tab.id === this.activeTabId ? "active" : ""
      }`;

      const tabText = document.createElement("span");
      tabText.textContent = tab.name;
      tabButton.appendChild(tabText);

      // --- Bindings de Eventos para Delegação ao Controller ---

      // Evento: Duplo clique (Renomear)
      tabButton.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        // Chama o callback do Controller, delegando a responsabilidade de abrir o modal
        this.openRenameModal(tab.id, tab.name);
      });

      // Evento: Clique (Ativar Aba)
      tabButton.addEventListener("click", () => {
        // Só chama o Controller se o clique for em uma aba diferente da ativa (otimização)
        if (tab.id !== this.activeTabId) {
          this.activateTab(tab.id); // Chama o callback do Controller
        }
      });

      // Botão de Excluir
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = '<span class="icon delete-icon">❌</span>';
      deleteBtn.className = "icon-btn delete-icon-btn";
      deleteBtn.title = "Excluir Aba";
      // Evento: Clique no 'X' (Excluir)
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Previne o acionamento do evento de clique da aba pai
        if (this.tabsData.length > 1) {
          this.openDeleteModal(tab.id, tab.name); // Chama o callback do Controller
        } else {
          // Lógica de feedback simples (alerta) quando a regra de negócio é violada
          alert("Pelo menos uma aba deve permanecer!");
        }
      });
      tabButton.appendChild(deleteBtn);

      this.domList.appendChild(tabButton);
    });

    // Botão para Adicionar Nova Aba
    const addTabButton = document.createElement("button");
    addTabButton.className = "tab-button tab-add-btn";
    addTabButton.title = "Adicionar Nova Aba";
    addTabButton.innerHTML = '<span class="icon">➕ Nova Lista</span>';
    addTabButton.onclick = () => this.addTab(); // Chama o callback do Controller
    this.domList.appendChild(addTabButton);
  }
}
