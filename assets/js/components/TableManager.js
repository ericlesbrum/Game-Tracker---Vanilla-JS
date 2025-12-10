// assets/js/components/TableManager.js

/**
 * @fileoverview Componente de UI (View Layer) responsável pela renderização e gestão
 * dos eventos da tabela principal de jogos, incluindo a lógica de paginação.
 *
 * Implementa o Component Pattern dentro da Camada Componente.
 */

// Importa os arrays de enumeração (opções) para preenchimento dos campos <select>
import {
  GameStatus, // Opções de Status
  GameNote, // Opções de Nota
  GameDifficulty, // Opções de Dificuldade
} from "../utils/EnumOptionsTable.js";

const ROWS_PER_PAGE = 10; // Constante para definir o limite de linhas por página
const TABLE_LABELS = ["Título", "Status", "Nota", "Dificuldade", "Ação"]; // Cabeçalhos da tabela

/**
 * Utilitário: Cria um elemento <select> dinâmico com base em um array de opções.
 *
 * Centraliza a lógica de criação do SELECT e o tratamento de valores de dados que
 * podem não mais existir nas opções (valores 'Inválidos' salvos anteriormente).
 *
 * @param {Array<string>} options Lista de strings para as tags <option>.
 * @param {string | number} defaultValue O valor que deve vir selecionado.
 * @param {function} onChangeCallback Função do Controller a ser chamada na mudança de valor.
 * @returns {HTMLSelectElement} O elemento <select> configurado.
 */
function createSelectElement(options, defaultValue, onChangeCallback) {
  const select = document.createElement("select");
  select.className = "select-input";

  const normalizedDefault = String(defaultValue || "").trim();
  let defaultExists = false;

  options.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = String(optionText);
    option.textContent = String(optionText);
    if (option.value.trim() === normalizedDefault) {
      option.selected = true;
      defaultExists = true;
    }
    select.appendChild(option);
  });

  // Lógica de Resiliência: Se o valor padrão não for encontrado nas opções atuais,
  // cria uma opção "Inválida" para que o usuário possa visualizar e corrigir o dado.
  if (!defaultExists && normalizedDefault !== "") {
    const missingOption = document.createElement("option");
    missingOption.value = normalizedDefault;
    missingOption.textContent = normalizedDefault + " (Inválido)";
    missingOption.selected = true;
    select.appendChild(missingOption);
  }

  if (onChangeCallback) {
    // Delega o evento de mudança ao handler do Controller
    select.addEventListener("change", onChangeCallback);
  }

  return select;
}

/**
 * Gerencia a renderização e interação da tabela de jogos.
 */
export class TableManager {
  /**
   * @param {HTMLElement} domContent O elemento DOM principal (geralmente a área de conteúdo da aba) onde a tabela será renderizada.
   * @param {object} callbacks Funções do Controller para delegar ações (Injeção de Dependência).
   */
  constructor(domContent, callbacks) {
    this.domContent = domContent;
    // Callbacks do Controller/Mediator
    this.updateGame = callbacks.updateGame;
    this.deleteGame = callbacks.deleteGame;
    this.addRow = callbacks.addRow;

    this.currentPage = 1; // Estado interno para controle de paginação
    this.activeTab = null; // Estado interno para os dados da aba atual
  }

  /**
   * Chamado pelo Controller para atualizar o estado interno do Manager.
   * Este é o método que dispara a atualização da View (render).
   * @param {object | null} activeTab Os dados da aba ativa (incluindo o array de jogos).
   */
  setState(activeTab) {
    this.activeTab = activeTab;
    // Ajusta a página atual se a aba mudar ou se a página atual não existir mais (ex: após exclusão)
    if (activeTab && this.currentPage > this.getTotalPages()) {
      this.currentPage = 1;
    }
    this.render();
  }

  /**
   * Calcula o número total de páginas necessárias para a paginação.
   * @returns {number}
   */
  getTotalPages() {
    if (!this.activeTab || !this.activeTab.games) return 1;
    return Math.ceil(this.activeTab.games.length / ROWS_PER_PAGE);
  }

  /**
   * Cria uma célula de tabela (TD) com um input de texto ou um select de opções.
   * Centraliza a criação de elementos de formulário e a ligação com o Controller.
   *
   * @param {HTMLTableRowElement} row A linha (TR) onde a célula será inserida.
   * @param {object} game Os dados do objeto GameRow (em formato JSON).
   * @param {string} propertyName O nome da propriedade a ser editada ('title', 'status', etc.).
   * @param {Array<string> | null} options Opções para o select, ou null se for input.
   * @param {boolean} isInput Se true, renderiza um <input> em vez de <select>.
   */
  createGameCell(row, game, propertyName, options, isInput = false) {
    // Tenta encontrar o label correspondente para acessibilidade (data-label)
    const cellIndex = TABLE_LABELS.findIndex((l) =>
      l.toLowerCase().includes(propertyName.toLowerCase())
    );
    const cell = row.insertCell();
    if (cellIndex !== -1)
      cell.setAttribute("data-label", TABLE_LABELS[cellIndex]);

    // O handler de evento chama o Controller para atualizar o dado do jogo (Delegação)
    const handler = (e) =>
      this.updateGame(game.id, propertyName, e.target.value);

    if (isInput) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "text-input";
      input.value = game[propertyName] || "";
      input.placeholder = TABLE_LABELS[cellIndex];
      // Atualiza o Controller no evento 'change' (perda de foco ou Enter)
      input.addEventListener("change", handler);
      input.addEventListener("blur", handler); // Salva ao perder o foco
      cell.appendChild(input);
    } else {
      // Cria o select usando a função utilitária
      const select = createSelectElement(options, game[propertyName], handler);
      cell.appendChild(select);
    }
  }

  /**
   * Renderiza a tabela principal, os botões de ação e a paginação.
   */
  render() {
    const tab = this.activeTab;
    this.domContent.innerHTML = ""; // Limpa o conteúdo da aba antes de renderizar

    if (!tab) return; // Não renderiza nada se não houver aba ativa

    const totalPages = this.getTotalPages();
    const startIndex = (this.currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    // Obtém apenas os jogos da página atual (Lógica de Paginação)
    const gamesToDisplay = tab.games.slice(startIndex, endIndex);

    // Estrutura da Tabela
    const tableContainer = document.createElement("div");
    tableContainer.className = "data-table-container";
    const table = document.createElement("table");
    table.className = "data-table";

    // 1. Cabeçalho (Thead)
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    TABLE_LABELS.forEach((label) => {
      const th = document.createElement("th");
      th.textContent = label;
      headerRow.appendChild(th);
    });

    // 2. Corpo da Tabela (Tbody) - Renderização dos Dados
    const tbody = table.createTBody();
    gamesToDisplay.forEach((game) => {
      const row = tbody.insertRow();

      // Renderiza as células interativas usando a função centralizada
      this.createGameCell(row, game, "title", null, true); // Input para Título
      this.createGameCell(row, game, "status", GameStatus);
      this.createGameCell(row, game, "note", GameNote);
      this.createGameCell(row, game, "difficulty", GameDifficulty);

      // Célula de Ação (Delete)
      const actionCell = row.insertCell();
      actionCell.setAttribute("data-label", TABLE_LABELS[4]);
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = '<span class="icon delete-icon">🗑️</span>';
      deleteBtn.className = "icon-btn delete-icon-btn";
      deleteBtn.title = "Excluir Jogo";
      // Delega a ação de exclusão ao Controller
      deleteBtn.onclick = () => this.deleteGame(game.id);
      actionCell.appendChild(deleteBtn);
    });

    tableContainer.appendChild(table);
    this.domContent.appendChild(tableContainer);

    // Botão Adicionar Linha
    const addRowButton = document.createElement("button");
    addRowButton.textContent = "➕ Adicionar Nova Linha";
    addRowButton.className = "secondary-btn";
    // Delega a ação de adição de linha ao Controller
    addRowButton.onclick = () => this.addRow();
    this.domContent.appendChild(addRowButton);

    // Renderiza Controles de Paginação (se houver mais de uma página)
    if (totalPages > 1) {
      this.renderPagination(totalPages, tab.games.length);
    }
  }

  /**
   * Renderiza os controles de navegação de página.
   * @param {number} totalPages Número total de páginas.
   * @param {number} totalItems Número total de jogos na aba.
   */
  renderPagination(totalPages, totalItems) {
    const paginationControls = document.createElement("div");
    paginationControls.className = "pagination-controls";

    // Botão Anterior
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Anterior";
    prevBtn.className = "pagination-btn";
    prevBtn.disabled = this.currentPage === 1;
    prevBtn.onclick = () => this.setPage(this.currentPage - 1); // Chama a lógica interna de paginação
    paginationControls.appendChild(prevBtn);

    // Informação de Página
    const info = document.createElement("span");
    info.className = "pagination-info";
    info.textContent = `Página ${this.currentPage} de ${totalPages} (${totalItems} jogos)`;
    paginationControls.appendChild(info);

    // Botão Próximo
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Próximo";
    nextBtn.className = "pagination-btn";
    nextBtn.disabled = this.currentPage === totalPages;
    nextBtn.onclick = () => this.setPage(this.currentPage + 1); // Chama a lógica interna de paginação
    paginationControls.appendChild(nextBtn);

    this.domContent.appendChild(paginationControls);
  }

  /**
   * Define a página atual e força a re-renderização da tabela.
   * @param {number} page Número da página para ir.
   */
  setPage(page) {
    const totalPages = this.getTotalPages();
    // Validação básica para evitar páginas inválidas
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.render(); // Re-renderiza a tabela com o novo índice de início
    }
  }
}
