// assets/js/domains/game_tracker.js

/**
 * @fileoverview Módulo principal (Controller/Mediator) da aplicação Game Tracker.
 * Este módulo gerencia o estado global, coordena a comunicação entre os componentes
 * (TabManager, TableManager) e a lógica de negócio (GameRow), e lida com a
 * persistência de dados (LocalStorageService).
 *
 * Implementa o padrão Controller/Mediator e Single Source of Truth.
 */

// Importa os módulos necessários (Inversão de Dependência)
import { TabManager } from "../components/TabManager.js"; // Componente da View (abas)
import { TableManager } from "../components/TableManager.js"; // Componente da View (tabela de jogos)
import { UIManager } from "../components/UIManager.js"; // Componente da View (modais/interações gerais)
import { LocalStorageService } from "../utils/LocalStorageService.js"; // Service para persistência
import { GameRow } from "../models/GameRow.js"; // Model Layer (entidade e validação)

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Mapeamento de Elementos do DOM ---
  // Todos os elementos necessários para a interação do Controller são mapeados aqui.
  const DOM = {
    tabList: document.getElementById("tab-list"),
    tabContent: document.getElementById("tab-content"),
    exportJsonBtn: document.getElementById("export-json-btn"),
    importJsonBtn: document.getElementById("import-json-btn"),
    importJsonInput: document.getElementById("import-json-input"),
    // Mapeamento dos elementos do Modal para uso pelo UIManager
    renameModal: document.getElementById("rename-modal"),
    renameInput: document.getElementById("rename-input"),
    confirmRenameBtn: document.getElementById("confirm-rename-btn"),
    cancelRenameBtn: document.getElementById("cancel-rename-btn"),
    deleteModal: document.getElementById("delete-modal"),
    deleteTabNameDisplay: document.getElementById("delete-tab-name"),
    confirmDeleteBtn: document.getElementById("confirm-delete-btn"),
    cancelDeleteBtn: document.getElementById("cancel-delete-btn"),
  };

  // --- 2. Estado Global (Source of Truth) ---
  // O Controller é o único responsável por armazenar e modificar este estado.
  const STORAGE_KEY = "gameTrackerTabs";
  let tabsData = []; // Array principal: [{ id, name, games: [GameRow.toJSON(), ...] }]
  let activeTabId = null; // ID da aba atualmente ativa
  let modalState = {
    tabToRenameId: null, // ID da aba sendo renomeada
    tabToDeleteId: null, // ID da aba sendo deletada
  };

  // --- 3. Instância dos Componentes ---
  const uiManager = new UIManager(DOM);

  // Callbacks/Handlers para as Ações (Centralizadas no Controller/Mediator)
  // O Controller fornece estes callbacks aos Componentes (Inversão de Dependência).
  const callbacks = {
    // TabManager Callbacks: Ações que mudam o estado das abas
    activateTab: (id) => {
      activeTabId = id;
      updateUI(); // Chama o Mediator para persistir e re-renderizar
    },
    addTab: () => {
      const newTab = {
        id: Date.now().toString(),
        name: `Nova Lista ${tabsData.length + 1}`,
        games: [], // Jogos inicializados vazios
      };
      tabsData.push(newTab);
      activeTabId = newTab.id;
      updateUI();
    },
    openRenameModal: (id, name) => {
      modalState.tabToRenameId = id;
      uiManager.openModal("rename", name); // Delega a abertura do modal à View (UIManager)
    },
    openDeleteModal: (id, name) => {
      modalState.tabToDeleteId = id;
      uiManager.openModal("delete", name); // Delega a abertura do modal à View (UIManager)
    },

    // TableManager Callbacks: Ações que mudam o estado dos jogos na aba ativa
    updateGame: (gameId, property, value) => {
      const tab = tabsData.find((t) => t.id === activeTabId);
      const gameData = tab.games.find((g) => g.id === gameId);

      if (gameData) {
        // Usa GameRow para validar a atualização (Model Layer)
        const gameRow = GameRow.fromJSON(gameData);
        const updated = gameRow.updateProperty(property, value); // Usa o setter com validação

        if (updated) {
          // Atualiza o objeto original no estado global com os dados validados
          Object.assign(gameData, gameRow.toJSON());
          updateUI();
        } else {
          // O GameRow já emitiu um warn, aqui apenas registra um erro no fluxo
          console.error(
            `Falha ao atualizar propriedade "${property}" do jogo ${gameId}`
          );
        }
      }
    },
    deleteGame: (gameId) => {
      const tab = tabsData.find((t) => t.id === activeTabId);
      tab.games = tab.games.filter((g) => g.id !== gameId); // Atualiza o estado
      updateUI();
    },
    addRow: () => {
      const tab = tabsData.find((t) => t.id === activeTabId);
      if (!tab) return;

      // Usa o método Factory do GameRow para criar uma nova linha válida
      const newGame = GameRow.createDefault(tab.games.length + 1);
      tab.games.push(newGame.toJSON()); // Adiciona a versão JSON ao estado

      // Move para a última página e renderiza
      // O TableManager precisa desta lógica de navegação, mas o Controller coordena
      tableManager.setPage(Math.ceil(tab.games.length / 10));
      updateUI();
    },
  };

  // Instancia os componentes, injetando as dependências do DOM e os Callbacks do Controller.
  const tableManager = new TableManager(DOM.tabContent, callbacks);
  const tabManager = new TabManager(DOM.tabList, callbacks);

  // --- 4. Funções de Ação/Persistência (Controller/Mediator) ---

  /**
   * Salva o estado e re-renderiza a UI, atuando como o ponto central (Mediator)
   * que coordena o fluxo de dados do Model (tabsData) para a View (Components).
   */
  const updateUI = () => {
    // 1. Persistência: Salva o estado no LocalStorage (Service Layer)
    LocalStorageService.save(STORAGE_KEY, tabsData);

    const activeTab = tabsData.find((tab) => tab.id === activeTabId) || null;

    // 2. Renderização: Atualiza todos os componentes com o estado atual (View Layer)
    tabManager.setState(tabsData, activeTabId);
    tableManager.setState(activeTab);
  };

  /** Lógica para renomear uma aba a partir da ação no modal. */
  const handleRename = () => {
    const newName = DOM.renameInput.value.trim();
    if (!newName) {
      alert("O nome da aba não pode estar vazio!");
      return;
    }

    const tab = tabsData.find((t) => t.id === modalState.tabToRenameId);
    if (tab) {
      tab.name = newName;
      uiManager.closeAllModals();
      updateUI(); // Persiste e re-renderiza
    }
  };

  /** Lógica para deletar uma aba a partir da ação no modal. */
  const handleDelete = () => {
    if (tabsData.length <= 1) {
      alert("Pelo menos uma aba deve permanecer!");
      uiManager.closeAllModals();
      return;
    }

    const tabIndex = tabsData.findIndex(
      (t) => t.id === modalState.tabToDeleteId
    );
    if (tabIndex > -1) {
      tabsData.splice(tabIndex, 1);
      // Garante que a aba ativa mude se a aba deletada era a ativa
      if (activeTabId === modalState.tabToDeleteId) {
        activeTabId = tabsData.length > 0 ? tabsData[0].id : null;
      }
      uiManager.closeAllModals();
      updateUI(); // Persiste e re-renderiza
    }
  };

  // Funções de Importação/Exportação (I/O)

  /** Exporta o estado global (tabsData) como um arquivo JSON. */
  const exportToJson = () => {
    if (tabsData.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }
    const dataStr = JSON.stringify(tabsData, null, 2);
    // Cria um Blob e dispara o download (padrão de exportação)
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "game_tracker_data.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  /** Importa dados de um arquivo JSON e substitui o estado global. */
  const importJson = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Validação básica da estrutura esperada
        if (
          Array.isArray(importedData) &&
          importedData.every((t) => t.id && t.name && Array.isArray(t.games))
        ) {
          if (
            confirm(
              `Deseja substituir seus ${tabsData.length} itens atuais por ${importedData.length} itens importados?`
            )
          ) {
            // Validação e Normalização Profunda:
            // Itera sobre os dados importados e usa GameRow.fromJSON
            // para garantir que os objetos se conformem às regras do Model,
            // aplicando valores padrão se necessário e limpando dados inválidos.
            const validatedData = importedData.map((tab) => ({
              ...tab,
              games: tab.games.map((gameData) => {
                const gameRow = GameRow.fromJSON(gameData);
                const validation = gameRow.validate();

                if (!validation.isValid) {
                  // Apenas registra o problema, mas a GameRow retorna uma versão sanitizada/normalizada
                  console.warn(
                    `Jogo "${gameData.title}" contém dados inválidos:`,
                    validation.errors
                  );
                }
                // Salva no estado a versão sanitizada pelo Model
                return gameRow.toJSON();
              }),
            }));

            tabsData = validatedData;
            activeTabId = tabsData.length > 0 ? tabsData[0].id : null;
            alert("Dados importados e validados com sucesso!");
            updateUI();
          }
        } else {
          alert(
            "Erro na importação: O arquivo JSON não está no formato esperado (Array de Abas com ID, Nome e Array de Jogos)."
          );
        }
      } catch (error) {
        alert("Erro ao processar o arquivo JSON. Verifique a formatação.");
        console.error("Erro na importação:", error);
      }
    };
    reader.readAsText(file);
    // Limpa o input file para permitir a importação do mesmo arquivo novamente, se necessário
    DOM.importJsonInput.value = "";
  };

  // --- 5. Inicialização ---

  /** Configura todos os Listeners de eventos de alto nível (modais, I/O). */
  function setupEventListeners() {
    // Modals
    DOM.confirmRenameBtn.addEventListener("click", handleRename);
    DOM.cancelRenameBtn.addEventListener("click", () =>
      uiManager.closeAllModals()
    );
    DOM.renameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleRename();
    });

    DOM.confirmDeleteBtn.addEventListener("click", handleDelete);
    DOM.cancelDeleteBtn.addEventListener("click", () =>
      uiManager.closeAllModals()
    );

    // I/O (Import/Export)
    DOM.exportJsonBtn.addEventListener("click", exportToJson);
    // O botão de Importação apenas dispara o input file oculto
    DOM.importJsonBtn.addEventListener("click", () =>
      DOM.importJsonInput.click()
    );
    DOM.importJsonInput.addEventListener("change", importJson);
  }

  /** Carrega o estado inicial do LocalStorage e inicializa a aplicação. */
  function initialize() {
    tabsData = LocalStorageService.load(STORAGE_KEY) || [];

    // Se não houver dados no localStorage, cria uma aba padrão
    if (tabsData.length === 0) {
      const defaultTab = { id: "default_1", name: "Minha Lista", games: [] };
      tabsData.push(defaultTab);
    } else {
      // Normalização ao carregar: Garante que todos os objetos GameRow carregados
      // tenham os valores padrão e a estrutura do Model, mesmo se o JSON salvo for antigo ou corrompido.
      tabsData = tabsData.map((tab) => ({
        ...tab,
        games: tab.games.map((gameData) => {
          const gameRow = GameRow.fromJSON(gameData);
          return gameRow.toJSON(); // Retorna o objeto normalizado pelo Model
        }),
      }));
    }

    // Garante que haja uma aba ativa no início
    if (!activeTabId || !tabsData.some((t) => t.id === activeTabId)) {
      activeTabId = tabsData[0].id;
    }

    setupEventListeners();
    updateUI(); // Primeira renderização da interface
  }

  initialize();
});
