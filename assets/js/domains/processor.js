// assets/js/domains/processor.js

/**
 * @fileoverview Controller do Domínio Processador de Arquivos.
 * Este módulo gerencia a interação do usuário com a API de arquivos,
 * processa e limpa nomes de arquivos/pastas de uma seleção de diretório
 * e renderiza o resultado final para cópia.
 *
 * Faz parte da arquitetura MPA como um Controller de Domínio (página separada).
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Referências de Elementos do DOM (View Layer)
  const DOM = {
    folderPicker: document.getElementById("folder-picker"), // Input oculto do tipo directory/webkitdirectory
    loadFolderBtn: document.getElementById("load-folder-btn"), // Botão que dispara o folderPicker
    resultsArea: document.getElementById("results-area"), // Container para os resultados
    nameList: document.getElementById("name-list"), // Lista (ul) onde os nomes limpos são renderizados
    fileCountSpan: document.getElementById("file-count"), // Span que exibe a contagem de arquivos processados
    copyBtn: document.getElementById("copy-btn"), // Botão para copiar a lista para a área de transferência
    feedbackMessage: document.getElementById("feedback-message"), // Mensagens de status (Processando/Concluído)
    ignoreFolderInput: document.getElementById("ignore-folder-input"), // Input para listar pastas a serem ignoradas
  };

  // 2. Lógica de Limpeza de Nomes (Business Logic)
  /**
   * Aplica uma série de regras de limpeza ao nome do arquivo.
   * Esta função centraliza a lógica de negócio para normalização de títulos.
   * @param {string} rawName - O nome original do arquivo.
   * @returns {string} O nome do arquivo limpo e normalizado.
   */
  function cleanFileName(rawName) {
    let cleanedName = rawName;

    // 0. Remove a substring "versão escrita" (case-insensitive)
    cleanedName = cleanedName.replace(/\s*versão escrita\s*/gi, " ").trim();

    // 1. Remove a extensão (ex: .zip, .rar, .exe)
    cleanedName = cleanedName.replace(/\.[^/.]+$/, "");

    // 2. Remove padrões comuns de disco/versão no final do nome
    // Ex: (v1.0), - Disc 1, (CD2), Parte A, v2, v3.1, etc.
    const multiDiscVersionRegex =
      /\s*[-–]?\s*(v\d+(\.\d+)*|\b(Disc|CD|Disk|Parte)\s*[\dA-Z]+)\s*$/i;
    cleanedName = cleanedName.replace(multiDiscVersionRegex, "").trim();

    // 3. Remove patterns entre colchetes [] ou parênteses ()
    // Ex: [PC], (v1.0), [Raridades], (2020)
    cleanedName = cleanedName.replace(/(\[[^\]]+\]|\([^)]+\))/g, "").trim();

    // 4. Limpa espaços múltiplos e remove espaços em branco extras nas pontas
    cleanedName = cleanedName.replace(/\s+/g, " ").trim();

    return cleanedName;
  }

  // 3. Processamento de Arquivos (Controller Logic)
  /**
   * Lida com o evento 'change' do seletor de diretório, aplicando a lógica de
   * filtragem de pastas, limpeza de nomes e renderização dos resultados.
   *
   * Utiliza um `Set` para garantir que apenas nomes únicos sejam listados (desduplicação).
   * @param {Event} event - O evento de mudança (change event) do input file.
   */
  function processFiles(event) {
    // Array.from é usado para converter o FileList em um Array
    const files = Array.from(event.target.files);
    // Processa a lista de pastas a serem ignoradas, separadas por vírgula
    const ignoredFolders = DOM.ignoreFolderInput.value
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);

    const cleanedNames = new Set(); // Usa Set para garantir unicidade
    let processedCount = 0;

    // Limpeza e feedback inicial da View
    DOM.nameList.innerHTML = "";
    DOM.resultsArea.classList.remove("hidden");
    DOM.feedbackMessage.textContent = "Processando...";

    files.forEach((file) => {
      // webkitRelativePath é crucial para obter o caminho completo do arquivo dentro do diretório selecionado
      const filePath = file.webkitRelativePath || file.name;
      const pathParts = filePath.split("/");

      // Lógica de Filtragem: Verifica se alguma parte do caminho corresponde a uma pasta ignorada
      const shouldIgnore = ignoredFolders.some((folder) =>
        pathParts.some((part) => part.toLowerCase().includes(folder))
      );

      if (!shouldIgnore) {
        const rawName = file.name;
        const cleaned = cleanFileName(rawName); // Aplica a lógica de negócio
        if (cleaned) {
          cleanedNames.add(cleaned); // Adiciona ao Set (garantindo unicidade)
          processedCount++; // Conta arquivos lidos (não a lista final, que é única)
        }
      }
    });

    // Renderiza lista (View Update)
    Array.from(cleanedNames) // Converte o Set de volta para Array
      .sort() // Ordena alfabeticamente
      .forEach((name) => {
        const li = document.createElement("li");
        li.textContent = name;
        DOM.nameList.appendChild(li);
      });

    // Atualiza o feedback final na View
    DOM.fileCountSpan.textContent = processedCount;
    DOM.feedbackMessage.textContent = `Processamento concluído. ${processedCount} arquivos lidos e ${cleanedNames.size} nomes únicos encontrados.`;
  }

  // 4. Lógica de Copiar para Clipboard (I/O e View Feedback)
  /**
   * Copia todos os nomes de arquivos listados (cada um em uma nova linha) para a área de transferência do sistema.
   * Usa a API `navigator.clipboard.writeText` (assíncrona).
   */
  async function copyNamesToClipboard() {
    // Mapeia os elementos da lista para obter o texto limpo
    const names = Array.from(DOM.nameList.children).map((li) => li.textContent);
    const textToCopy = names.join("\n");

    if (textToCopy.length === 0) {
      alert("A lista está vazia!");
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy); // Uso da API assíncrona

      // Feedback visual na View (transição de estado do botão)
      const originalText = DOM.copyBtn.innerHTML;
      DOM.copyBtn.innerHTML = '<span class="icon">✅</span> Copiado!';
      DOM.copyBtn.classList.add("copied");

      setTimeout(() => {
        DOM.copyBtn.innerHTML = originalText;
        DOM.copyBtn.classList.remove("copied");
      }, 1500);
    } catch (err) {
      console.error("Falha ao copiar:", err);
      alert(
        "Erro ao copiar a lista (permissão negada). Por favor, copie manualmente."
      );
    }
  }

  // 5. Bindings de Eventos (Controller Initialization)
  /** Configura os event listeners para iniciar o fluxo da aplicação. */
  function setupEventListeners() {
    // Clique no botão simula o clique no input de arquivo (hack comum para estilização)
    DOM.loadFolderBtn.addEventListener("click", () => DOM.folderPicker.click());
    // Ação principal: dispara o processamento de arquivos ao selecionar
    DOM.folderPicker.addEventListener("change", processFiles);
    // Ação secundária: copia o resultado
    DOM.copyBtn.addEventListener("click", copyNamesToClipboard);
  }

  setupEventListeners();
});
