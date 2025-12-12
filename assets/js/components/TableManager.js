// assets/js/components/TableManager.js

/**
 * @fileoverview Componente de UI (View Layer) responsável pela renderização e gestão
 * dos eventos da tabela principal de jogos, incluindo a lógica de paginação e ORDENAÇÃO.
 *
 * Implementa o Component Pattern dentro da Camada Componente.
 */

// Importa os arrays de enumeração (opções) para preenchimento dos campos <select>
import {
  GameStatus,
  GameNote,
  GameDifficulty,
} from "../utils/EnumOptionsTable.js";

const ROWS_PER_PAGE = 10;
const TABLE_LABELS = ["Título", "Status", "Nota", "Dificuldade", "Ação"];

/**
 * Utilitário: Cria um elemento <select> dinâmico com base em um array de opções.
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

  if (!defaultExists && normalizedDefault !== "") {
    const missingOption = document.createElement("option");
    missingOption.value = normalizedDefault;
    missingOption.textContent = normalizedDefault + " (Inválido)";
    missingOption.selected = true;
    select.appendChild(missingOption);
  }

  if (onChangeCallback) {
    select.addEventListener("change", onChangeCallback);
  }

  return select;
}

/**
 * Gerencia a renderização e interação da tabela de jogos COM ORDENAÇÃO.
 */
export class TableManager {
  /**
   * @param {HTMLElement} domContent O elemento DOM principal onde a tabela será renderizada.
   * @param {object} callbacks Funções do Controller para delegar ações.
   */
  constructor(domContent, callbacks) {
    this.domContent = domContent;
    this.updateGame = callbacks.updateGame;
    this.deleteGame = callbacks.deleteGame;
    this.addRow = callbacks.addRow;

    this.currentPage = 1;
    this.activeTab = null;

    // Estado de ordenação
    this.sortConfig = {
      column: null, // Coluna atual ordenada (title, status, note, difficulty)
      direction: "asc", // Direção: 'asc' ou 'desc'
    };
  }

  /**
   * Chamado pelo Controller para atualizar o estado interno do Manager.
   */
  setState(activeTab) {
    this.activeTab = activeTab;
    if (activeTab && this.currentPage > this.getTotalPages()) {
      this.currentPage = 1;
    }
    this.render();
  }

  /**
   * Calcula o número total de páginas.
   */
  getTotalPages() {
    if (!this.activeTab || !this.activeTab.games) return 1;
    return Math.ceil(this.activeTab.games.length / ROWS_PER_PAGE);
  }

  /**
   * Ordena os jogos com base na configuração atual.
   * @param {Array} games - Array de jogos a serem ordenados
   * @returns {Array} Array ordenado
   */
  sortGames(games) {
    if (!this.sortConfig.column) return games;

    const sorted = [...games].sort((a, b) => {
      let aValue = a[this.sortConfig.column];
      let bValue = b[this.sortConfig.column];

      // Normalização para comparação
      if (this.sortConfig.column === "title") {
        aValue = (aValue || "").toLowerCase();
        bValue = (bValue || "").toLowerCase();
      } else if (this.sortConfig.column === "note") {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else if (this.sortConfig.column === "difficulty") {
        // Ordem de dificuldade
        const difficultyOrder = [
          "F",
          "E-",
          "E",
          "E+",
          "D-",
          "D",
          "D+",
          "C-",
          "C",
          "C+",
          "B-",
          "B",
          "B+",
          "A-",
          "A",
          "A+",
          "S",
          "S+",
        ];
        aValue = difficultyOrder.indexOf(aValue);
        bValue = difficultyOrder.indexOf(bValue);
      } else if (this.sortConfig.column === "status") {
        // Ordem de status
        const statusOrder = [
          "Não Iniciado",
          "Jogando",
          "Pausado",
          "Zerado",
          "Abandonado",
        ];
        aValue = statusOrder.indexOf(aValue);
        bValue = statusOrder.indexOf(bValue);
      }

      // Comparação
      if (aValue < bValue) return this.sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return this.sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  /**
   * Manipula o clique em um cabeçalho para ordenar.
   * @param {string} column - Nome da coluna clicada
   */
  handleSort(column) {
    // Se clicar na mesma coluna, inverte a direção
    if (this.sortConfig.column === column) {
      this.sortConfig.direction =
        this.sortConfig.direction === "asc" ? "desc" : "asc";
    } else {
      // Nova coluna, começa com ascendente
      this.sortConfig.column = column;
      this.sortConfig.direction = "asc";
    }

    // Volta para a primeira página ao ordenar
    this.currentPage = 1;
    this.render();
  }

  /**
   * Cria uma célula de tabela (TD) com um input de texto ou select.
   */
  createGameCell(row, game, propertyName, options, isInput = false) {
    const cellIndex = TABLE_LABELS.findIndex((l) =>
      l.toLowerCase().includes(propertyName.toLowerCase())
    );
    const cell = row.insertCell();
    if (cellIndex !== -1)
      cell.setAttribute("data-label", TABLE_LABELS[cellIndex]);

    const handler = (e) =>
      this.updateGame(game.id, propertyName, e.target.value);

    if (isInput) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "text-input";
      input.value = game[propertyName] || "";
      input.placeholder = TABLE_LABELS[cellIndex];
      input.addEventListener("change", handler);
      input.addEventListener("blur", handler);
      cell.appendChild(input);
    } else {
      const select = createSelectElement(options, game[propertyName], handler);
      cell.appendChild(select);
    }
  }

  /**
   * Renderiza a tabela principal, os botões de ação e a paginação.
   */
  render() {
    const tab = this.activeTab;
    this.domContent.innerHTML = "";

    if (!tab) return;

    // Ordena os jogos antes de paginar
    const sortedGames = this.sortGames(tab.games);

    const totalPages = Math.ceil(sortedGames.length / ROWS_PER_PAGE);
    const startIndex = (this.currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    const gamesToDisplay = sortedGames.slice(startIndex, endIndex);

    // Estrutura da Tabela
    const tableContainer = document.createElement("div");
    tableContainer.className = "data-table-container";
    const table = document.createElement("table");
    table.className = "data-table";

    // 1. Cabeçalho (Thead) - COM ORDENAÇÃO
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    const sortableColumns = [
      { label: "Título", key: "title" },
      { label: "Status", key: "status" },
      { label: "Nota", key: "note" },
      { label: "Dificuldade", key: "difficulty" },
      { label: "Ação", key: null },
    ];

    sortableColumns.forEach((col) => {
      const th = document.createElement("th");

      if (col.key) {
        // Coluna ordenável
        th.className = "sortable-header";
        th.style.cursor = "pointer";
        th.style.userSelect = "none";
        th.style.position = "relative";
        th.style.paddingRight = "25px";

        const textSpan = document.createElement("span");
        textSpan.textContent = col.label;
        th.appendChild(textSpan);

        // Ícone de ordenação
        const sortIcon = document.createElement("span");
        sortIcon.className = "sort-icon";
        sortIcon.style.position = "absolute";
        sortIcon.style.right = "8px";
        sortIcon.style.top = "50%";
        sortIcon.style.transform = "translateY(-50%)";
        sortIcon.style.fontSize = "0.8rem";
        sortIcon.style.opacity = "0.5";

        if (this.sortConfig.column === col.key) {
          sortIcon.textContent =
            this.sortConfig.direction === "asc" ? "▲" : "▼";
          sortIcon.style.opacity = "1";
          sortIcon.style.color = "var(--color-primary)";
        } else {
          sortIcon.textContent = "⇅";
        }

        th.appendChild(sortIcon);

        // Evento de clique
        th.addEventListener("click", () => this.handleSort(col.key));

        // Hover effect
        th.addEventListener("mouseenter", () => {
          th.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
        });
        th.addEventListener("mouseleave", () => {
          th.style.backgroundColor = "";
        });
      } else {
        // Coluna não ordenável (Ação)
        th.textContent = col.label;
      }

      headerRow.appendChild(th);
    });

    // 2. Corpo da Tabela (Tbody)
    const tbody = table.createTBody();
    gamesToDisplay.forEach((game) => {
      const row = tbody.insertRow();

      this.createGameCell(row, game, "title", null, true);
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
      deleteBtn.onclick = () => this.deleteGame(game.id);
      actionCell.appendChild(deleteBtn);
    });

    tableContainer.appendChild(table);
    this.domContent.appendChild(tableContainer);

    // Botão Adicionar Linha
    const addRowButton = document.createElement("button");
    addRowButton.textContent = "➕ Adicionar Nova Linha";
    addRowButton.className = "secondary-btn";
    addRowButton.onclick = () => this.addRow();
    this.domContent.appendChild(addRowButton);

    // Renderiza Controles de Paginação (se houver mais de uma página)
    if (totalPages > 1) {
      this.renderPagination(totalPages, sortedGames.length);
    }
  }

  /**
   * Renderiza os controles de navegação de página.
   */
  renderPagination(totalPages, totalItems) {
    const paginationControls = document.createElement("div");
    paginationControls.className = "pagination-controls";

    // Botão Anterior
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "◀ Anterior";
    prevBtn.className = "pagination-btn";
    prevBtn.disabled = this.currentPage === 1;
    prevBtn.onclick = () => this.setPage(this.currentPage - 1);
    paginationControls.appendChild(prevBtn);

    // Informação de Página
    const info = document.createElement("span");
    info.className = "pagination-info";
    info.textContent = `Página ${this.currentPage} de ${totalPages} (${totalItems} jogos)`;
    paginationControls.appendChild(info);

    // Botão Próximo
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Próximo ▶";
    nextBtn.className = "pagination-btn";
    nextBtn.disabled = this.currentPage === totalPages;
    nextBtn.onclick = () => this.setPage(this.currentPage + 1);
    paginationControls.appendChild(nextBtn);

    this.domContent.appendChild(paginationControls);
  }

  /**
   * Define a página atual e força a re-renderização da tabela.
   */
  setPage(page) {
    const totalPages = this.getTotalPages();
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.render();
    }
  }
}
