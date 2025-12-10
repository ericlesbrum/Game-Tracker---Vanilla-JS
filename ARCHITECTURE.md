# 🏗️ Arquitetura Técnica - Projeto Vanilla JS

## 📑 Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Camadas da Aplicação](#camadas-da-aplicação)
3. [Fluxo de Dados](#fluxo-de-dados)
4. [Componentes Detalhados](#componentes-detalhados)
5. [Padrões de Projeto](#padrões-de-projeto)
6. [Persistência de Dados](#persistência-de-dados)
7. [Gestão de Estado](#gestão-de-estado)
8. [Convenções de Código](#convenções-de-código)

---

## Visão Geral da Arquitetura

Este projeto implementa uma arquitetura em camadas inspirada em MVC (Model-View-Controller), adaptada para JavaScript puro sem frameworks.

### Princípios Arquiteturais

1. **Separação de Responsabilidades**: Cada módulo tem uma responsabilidade única e bem definida
2. **Baixo Acoplamento**: Componentes comunicam-se através de interfaces definidas (callbacks)
3. **Alta Coesão**: Funcionalidades relacionadas ficam agrupadas
4. **Inversão de Dependência**: Componentes dependem de abstrações, não de implementações
5. **Single Source of Truth**: Estado centralizado no Controller/Mediator

### Diagrama Arquitetural

```
┌──────────────────────────────────────────────────────────────┐
│                         VIEW LAYER                            │
│                    (HTML + CSS Modules)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  index.html  │  │processor.html│  │game_tracker. │       │
│  │              │  │              │  │    html      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────┬─────────────────────────────────────┘
                         │ Renderiza/Eventos DOM
┌────────────────────────▼─────────────────────────────────────┐
│                    CONTROLLER LAYER                           │
│                    (Domain Controllers)                       │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  game_tracker.js (Mediator)                          │    │
│  │  • Gerencia estado global (tabsData, activeTabId)    │    │
│  │  • Coordena componentes (TabManager, TableManager)   │    │
│  │  • Controla fluxo de dados (updateUI)                │    │
│  │  • Persiste dados (LocalStorageService)              │    │
│  └──────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  processor.js (Controller)                            │    │
│  │  • Controla processamento de arquivos                 │    │
│  │  • Gerencia estado de UI                              │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────┬────────────────────────────┬────────────────────┘
             │ Callbacks                  │ Estado
┌────────────▼──────────┐    ┌───────────▼────────────────────┐
│   COMPONENT LAYER      │    │      MODEL LAYER               │
│ (UI Components)        │    │   (Business Logic)             │
│                        │    │                                │
│ • TabManager.js        │    │ • GameRow.js                   │
│   - Renderiza abas     │    │   - Validação de dados         │
│   - Eventos de aba     │    │   - Getters/Setters            │
│                        │    │   - Factory methods            │
│ • TableManager.js      │    │   - Serialização               │
│   - Renderiza tabela   │    │                                │
│   - Paginação          │    └────────────────────────────────┘
│   - Eventos de células │                │
│                        │                │ Usa
│ • UIManager.js         │                │
│   - Gerencia modais    │    ┌───────────▼────────────────────┐
│   - Feedback visual    │    │     SERVICE/UTILS LAYER        │
│                        │    │                                │
└────────────────────────┘    │ • LocalStorageService.js       │
                               │   - Abstração do localStorage  │
                               │   - Tratamento de erros        │
                               │                                │
                               │ • EnumOptionsTable.js          │
                               │   - Constantes globais         │
                               │   - Enumerações                │
                               └────────────────────────────────┘
```

---

## Camadas da Aplicação

### 1. View Layer (HTML + CSS)

**Responsabilidade**: Apresentação e estrutura visual

#### Características:

- HTML semântico (uso correto de tags)
- Acessibilidade (ARIA labels, roles)
- Separação de concerns (sem lógica em HTML)
- CSS modular (arquivos separados por função)

#### Arquivos:

```
views/
├── index.html           # Landing page
├── processor.html       # Processador de arquivos
└── game_tracker.html    # Rastreador de jogos

styles/
├── main.css            # Ponto de entrada (@import)
├── _base.css           # Variáveis, reset, modais
├── _layout.css         # Layout geral (sidebar, grid)
├── _buttons.css        # Botões, abas, ícones
└── _tables.css         # Tabelas, paginação
```

#### Padrão CSS:

```css
/* Variáveis CSS para consistência */
:root {
  --color-primary: #8b5cf6;
  --color-surface: #131924;
  --spacing-md: 20px;
}

/* Mobile-first approach */
.elemento {
  /* Estilos mobile por padrão */
}

@media (min-width: 600px) {
  /* Tablet */
}

@media (min-width: 900px) {
  /* Desktop */
}
```

---

### 2. Controller Layer (Domain)

**Responsabilidade**: Orquestração, lógica de negócio, gerenciamento de estado

#### game_tracker.js (Mediator Pattern)

```javascript
// Estado global (Single Source of Truth)
let tabsData = []; // Array de todas as abas
let activeTabId = null; // ID da aba ativa
let modalState = {}; // Estado dos modais

// Componentes gerenciados
const tabManager = new TabManager(DOM.tabList, callbacks);
const tableManager = new TableManager(DOM.tabContent, callbacks);
const uiManager = new UIManager(DOM);

// Função central que coordena todas as atualizações
const updateUI = () => {
  // 1. Persiste estado
  LocalStorageService.save(STORAGE_KEY, tabsData);

  // 2. Atualiza todos os componentes
  const activeTab = tabsData.find((t) => t.id === activeTabId);
  tabManager.setState(tabsData, activeTabId);
  tableManager.setState(activeTab);
};
```

**Fluxo de Comunicação**:

```
User Action (DOM Event)
    ↓
Component (e.g., TabManager)
    ↓
Callback to Controller
    ↓
Controller updates state (tabsData)
    ↓
updateUI() called
    ↓
All Components re-render with new state
```

---

### 3. Component Layer

**Responsabilidade**: Gerenciamento de UI, renderização, eventos

#### TabManager.js

```javascript
export class TabManager {
  constructor(domList, callbacks) {
    this.domList = domList; // Elemento DOM
    this.activateTab = callbacks.activateTab;
    this.addTab = callbacks.addTab;
    this.openRenameModal = callbacks.openRenameModal;
    this.openDeleteModal = callbacks.openDeleteModal;
  }

  // Controller chama este método para atualizar
  setState(tabsData, activeTabId) {
    this.tabsData = tabsData;
    this.activeTabId = activeTabId;
    this.render(); // Re-renderiza com novo estado
  }

  // Renderização declarativa
  render() {
    this.domList.innerHTML = "";
    // Cria elementos DOM baseado no estado
    this.tabsData.forEach((tab) => {
      const button = this.createTabButton(tab);
      this.domList.appendChild(button);
    });
  }
}
```

**Princípios**:

- Sem estado interno (state vem do Controller)
- Métodos públicos: `setState()`, `render()`
- Comunicação via callbacks (inversão de controle)

#### TableManager.js

```javascript
export class TableManager {
  constructor(domContent, callbacks) {
    this.domContent = domContent;
    this.updateGame = callbacks.updateGame;
    this.deleteGame = callbacks.deleteGame;
    this.addRow = callbacks.addRow;
    this.currentPage = 1; // Estado local de paginação
  }

  setState(activeTab) {
    this.activeTab = activeTab;
    if (activeTab && this.currentPage > this.getTotalPages()) {
      this.currentPage = 1; // Reset se necessário
    }
    this.render();
  }

  // Renderização com paginação
  render() {
    const startIndex = (this.currentPage - 1) * ROWS_PER_PAGE;
    const gamesToDisplay = this.activeTab.games.slice(
      startIndex,
      startIndex + ROWS_PER_PAGE
    );
    // Cria tabela, inputs, eventos...
  }
}
```

---

### 4. Model Layer

**Responsabilidade**: Modelagem de dados, validação, regras de negócio

#### GameRow.js (Entity Pattern)

```javascript
export class GameRow {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.title = data.title || "";
    this._status = data.status || GameStatus[0];
    // Usa underscores para propriedades privadas
  }

  // Getters/Setters com validação
  get status() {
    return this._status;
  }

  set status(value) {
    if (this.isValidStatus(value)) {
      this._status = value;
    } else {
      console.warn(`Status inválido: "${value}"`);
    }
  }

  // Validação completa
  validate() {
    const errors = [];
    if (!this.title.trim()) {
      errors.push("Título não pode estar vazio");
    }
    // ... mais validações
    return { isValid: errors.length === 0, errors };
  }

  // Factory methods
  static createDefault(index) {
    return new GameRow({
      title: `Novo Jogo ${index}`,
      status: GameStatus[0],
      // ... valores padrão
    });
  }

  // Serialização
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      status: this._status,
      // ... todas as propriedades
    };
  }
}
```

**Benefícios**:

- Encapsulamento de lógica de negócio
- Validação centralizada
- Tipo seguro (dentro do possível em JS)
- Fácil manutenção

---

### 5. Service/Utils Layer

**Responsabilidade**: Serviços compartilhados, utilitários

#### LocalStorageService.js (Service Locator)

```javascript
export const LocalStorageService = {
  load(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Erro ao carregar ${key}:`, e);
      return null;
    }
  },

  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      // QuotaExceededError
      console.error(`Erro ao salvar ${key}:`, e);
      alert("Armazenamento local cheio!");
    }
  },
};
```

**Vantagens**:

- Abstração de implementação
- Tratamento centralizado de erros
- Fácil substituição (ex: IndexedDB)
- Testável (mock service)

---

## Fluxo de Dados

### Fluxo Unidirecional (Inspirado em Flux)

```
┌─────────────────────────────────────────────────┐
│                  USER ACTION                     │
│          (click, change, submit)                 │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│               COMPONENT EVENT                    │
│        (TabManager, TableManager)                │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│            CALLBACK TO CONTROLLER                │
│    (activateTab, updateGame, deleteGame)         │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│           UPDATE GLOBAL STATE                    │
│        (tabsData, activeTabId)                   │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│              PERSIST TO STORAGE                  │
│        LocalStorageService.save()                │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│           NOTIFY ALL COMPONENTS                  │
│     tabManager.setState(), tableManager.setState()│
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│              COMPONENTS RENDER                   │
│         (Re-create DOM elements)                 │
└─────────────────────────────────────────────────┘
```

### Exemplo Prático: Adicionar Jogo

```javascript
// 1. USER: Clica em "Adicionar Nova Linha"
// DOM Event → TableManager

// 2. COMPONENT: TableManager chama callback
this.addRow(); // Callback para Controller

// 3. CONTROLLER: Atualiza estado
callbacks.addRow = () => {
  const tab = tabsData.find((t) => t.id === activeTabId);
  const newGame = GameRow.createDefault(tab.games.length + 1);
  tab.games.push(newGame.toJSON()); // Adiciona ao estado

  // 4. PERSIST: Salva
  updateUI(); // ← Função central
};

// 5. UPDATE UI: Notifica componentes
const updateUI = () => {
  LocalStorageService.save(STORAGE_KEY, tabsData);
  const activeTab = tabsData.find((t) => t.id === activeTabId);

  // 6. RENDER: Componentes re-renderizam
  tabManager.setState(tabsData, activeTabId);
  tableManager.setState(activeTab);
};
```

---

## Padrões de Projeto Implementados

### 1. Mediator Pattern (game_tracker.js)

**Problema**: Componentes precisam se comunicar, mas não devem conhecer uns aos outros.

**Solução**: Controller centraliza toda comunicação.

```javascript
// ❌ SEM Mediator (acoplamento alto)
class TabManager {
  addTab() {
    this.tableManager.reset(); // Conhece TableManager
    this.uiManager.showFeedback(); // Conhece UIManager
  }
}

// ✅ COM Mediator (baixo acoplamento)
class TabManager {
  addTab() {
    this.callbacks.addTab(); // Só conhece interface
  }
}

// Controller (Mediator) coordena
callbacks.addTab = () => {
  // Lógica centralizada aqui
  tabsData.push(newTab);
  updateUI(); // Notifica TODOS os componentes
};
```

### 2. Observer Pattern (updateUI)

**Problema**: Mudanças de estado devem propagar para múltiplos componentes.

**Solução**: Função central que notifica todos os observadores.

```javascript
const updateUI = () => {
  // 1. Persiste (pode falhar)
  LocalStorageService.save(STORAGE_KEY, tabsData);

  // 2. Prepara dados
  const activeTab = tabsData.find((t) => t.id === activeTabId);

  // 3. Notifica observadores
  tabManager.setState(tabsData, activeTabId);
  tableManager.setState(activeTab);
  // Pode adicionar mais observadores facilmente
};
```

### 3. Factory Pattern (GameRow)

**Problema**: Criação de objetos complexos com validação.

**Solução**: Métodos estáticos de criação.

```javascript
class GameRow {
  // Factory para novo jogo
  static createDefault(index) {
    return new GameRow({
      title: `Novo Jogo ${index}`,
      status: GameStatus[0],
      note: GameNote[0],
      difficulty: GameDifficulty[0],
    });
  }

  // Factory para desserialização
  static fromJSON(data) {
    return new GameRow(data);
  }
}

// Uso
const newGame = GameRow.createDefault(5);
const loadedGame = GameRow.fromJSON(savedData);
```

### 4. Strategy Pattern (Validação)

**Problema**: Diferentes campos têm diferentes regras de validação.

**Solução**: Métodos específicos de validação.

```javascript
class GameRow {
  isValidStatus(status) {
    return GameStatus.includes(status);
  }

  isValidNote(note) {
    return GameNote.includes(String(note));
  }

  isValidDifficulty(difficulty) {
    return GameDifficulty.includes(difficulty);
  }

  // Validação composta
  validate() {
    const errors = [];
    if (!this.title.trim()) errors.push("Título vazio");
    if (!this.isValidStatus(this._status)) errors.push("Status inválido");
    // ... mais validações
    return { isValid: errors.length === 0, errors };
  }
}
```

### 5. Module Pattern (ES6 Modules)

**Problema**: Namespace global poluído, sem encapsulamento.

**Solução**: ES6 Modules com imports/exports.

```javascript
// EnumOptionsTable.js
export const GameStatus = ["Não Iniciado", "Jogando", ...];
export const GameNote = Array.from({ length: 11 }, (_, i) => i.toString());

// GameRow.js
import { GameStatus, GameNote } from "../utils/EnumOptionsTable.js";

export class GameRow {
  // Usa as constantes importadas
}

// game_tracker.js
import { GameRow } from "../models/GameRow.js";
import { LocalStorageService } from "../utils/LocalStorageService.js";
```

---

## Gestão de Estado

### Estado Global (game_tracker.js)

```javascript
// Single Source of Truth
const state = {
  // Dados de negócio
  tabsData: [
    {
      id: "tab_1",
      name: "Minha Lista",
      games: [
        {
          id: "game_1",
          title: "Dark Souls",
          status: "Zerado",
          note: "9",
          difficulty: "S+",
        },
      ],
    },
  ],

  // Estado de UI
  activeTabId: "tab_1",

  // Estado de modais
  modalState: {
    tabToRenameId: null,
    tabToDeleteId: null,
  },
};
```

### Estado Local (Componentes)

```javascript
// TableManager mantém paginação local
class TableManager {
  constructor(domContent, callbacks) {
    // ...
    this.currentPage = 1; // Estado local OK (UI pura)
    this.activeTab = null; // Recebido via setState()
  }
}
```

**Regra**:

- **Estado de negócio** → Controller
- **Estado de UI efêmera** → Componente (ex: página atual)

---

## Persistência de Dados

### Estratégia de Persistência

```javascript
// 1. Carregamento inicial
function initialize() {
  // Tenta carregar do localStorage
  tabsData = LocalStorageService.load(STORAGE_KEY) || [];

  // Fallback: cria aba padrão
  if (tabsData.length === 0) {
    tabsData = [{ id: "default_1", name: "Minha Lista", games: [] }];
  }

  // Valida e normaliza dados carregados
  tabsData = tabsData.map((tab) => ({
    ...tab,
    games: tab.games.map((gameData) => {
      const gameRow = GameRow.fromJSON(gameData);
      return gameRow.toJSON(); // Normaliza
    }),
  }));

  updateUI(); // Renderiza
}

// 2. Salvamento automático
const updateUI = () => {
  // SEMPRE salva após qualquer mudança
  LocalStorageService.save(STORAGE_KEY, tabsData);
  // ... renderiza componentes
};
```

### Formato de Dados (JSON)

```json
[
  {
    "id": "1702384729401",
    "name": "Minha Lista Principal",
    "games": [
      {
        "id": "1702384729402",
        "title": "Elden Ring",
        "status": "Jogando",
        "note": "10",
        "difficulty": "S+"
      },
      {
        "id": "1702384729403",
        "title": "Hollow Knight",
        "status": "Zerado",
        "note": "9",
        "difficulty": "A+"
      }
    ]
  }
]
```

---

## Convenções de Código

### Nomenclatura

```javascript
// Classes: PascalCase
class GameRow { }
class TableManager { }

// Funções/métodos: camelCase
function updateUI() { }
const handleRename = () => { };

// Constantes: UPPER_SNAKE_CASE
const STORAGE_KEY = "gameTrackerTabs";
const ROWS_PER_PAGE = 10;

// Exports nomeados para constantes
export const GameStatus = [...];

// Propriedades privadas: prefixo _
this._status = value;

// Callbacks: verbos descritivos
this.activateTab = callbacks.activateTab;
this.updateGame = callbacks.updateGame;
```

### Estrutura de Funções

```javascript
// 1. Funções pequenas e focadas
function createSelectElement(options, defaultValue, onChangeCallback) {
  // Faz UMA coisa bem feita
}

// 2. Comentários descritivos
/**
 * Cria um elemento <select> com opções e valor padrão.
 * @param {Array<string>} options - Opções do select
 * @param {string} defaultValue - Valor selecionado
 * @param {Function} onChangeCallback - Handler de mudança
 * @returns {HTMLSelectElement}
 */

// 3. Early returns
function validate() {
  if (!this.title.trim()) {
    return { isValid: false, errors: ["Título vazio"] };
  }
  // ... lógica principal
}
```

### Organização de Arquivos

```javascript
// Ordem de imports
// 1. Utils/Services
import { GameStatus } from "../utils/EnumOptionsTable.js";
import { LocalStorageService } from "../utils/LocalStorageService.js";

// 2. Models
import { GameRow } from "../models/GameRow.js";

// 3. Components
import { TabManager } from "../components/TabManager.js";

// Ordem dentro de classe
class GameRow {
  // 1. Constructor
  constructor(data) {}

  // 2. Getters/Setters
  get status() {}
  set status(value) {}

  // 3. Métodos públicos
  validate() {}
  updateProperty() {}

  // 4. Métodos de conversão
  toJSON() {}
  toString() {}

  // 5. Métodos estáticos
  static fromJSON(data) {}
  static createDefault() {}
}
```

---

## Tratamento de Erros

### Estratégias Implementadas

```javascript
// 1. Try-catch em I/O
export const LocalStorageService = {
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Erro ao salvar ${key}:`, e);
      alert('Armazenamento cheio!');  // Feedback ao usuário
    }
  }
};

// 2. Validação preventiva
set status(value) {
  if (this.isValidStatus(value)) {
    this._status = value;
  } else {
    console.warn(`Status inválido: "${value}"`);
    // Mantém valor anterior (não quebra)
  }
}

// 3. Fallbacks seguros
tabsData = LocalStorageService.load(STORAGE_KEY) || [];
if (tabsData.length === 0) {
  tabsData = [createDefaultTab()];  // Garante estado válido
}

// 4. Validação na importação
const importedData = JSON.parse(e.target.result);
if (Array.isArray(importedData) &&
    importedData.every(t => t.id && t.name && Array.isArray(t.games))) {
  // Valida estrutura antes de usar
  tabsData = importedData.map(validateTab);
} else {
  alert('Arquivo JSON inválido!');
}
```

---

## Performance

### Otimizações Implementadas

1. **Paginação**: Renderiza apenas 10 itens por vez
2. **Event Delegation**: Poderia ser usado para tabelas grandes
3. **Debouncing**: Inputs salvam no `change` e `blur` (evita salvamento excessivo)
4. **CSS Variables**: Reduz recálculos de estilo
5. **Minimal DOM**: Re-renderiza apenas o necessário

### Pontos de Melhoria

```javascript
// TODO: Implementar debounce em inputs
const debouncedSave = debounce((gameId, property, value) => {
  this.updateGame(gameId, property, value);
}, 500);

// TODO: Virtual scrolling para muitos jogos
// TODO: Lazy loading de abas
// TODO: Web Workers para processamento pesado
```

---

## Testabilidade

### Princípios para Testes

```javascript
// ✅ Testável: Funções puras
function cleanFileName(rawName) {
  // Sem efeitos colaterais
  return rawName.replace(/\.[^/.]+$/, "");
}

// ✅ Testável: Classes com injeção de dependência
class TableManager {
  constructor(domContent, callbacks) {
    // Mock de DOM e callbacks em testes
  }
}

// ✅ Testável: Service abstrato
const MockStorageService = {
  load: (key) => testData[key],
  save: (key, data) => {
    testData[key] = data;
  },
};
```

### Exemplo de Estrutura de Testes

```javascript
// gameRow.test.js (hipotético)
describe("GameRow", () => {
  describe("Validation", () => {
    it("should reject empty title", () => {
      const game = new GameRow({ title: "" });
      const result = game.validate();
      expect(result.isValid).toBe(false);
    });

    it("should accept valid status", () => {
      const game = new GameRow({ status: "Jogando" });
      expect(game.isValidStatus("Jogando")).toBe(true);
    });
  });

  describe("Factory Methods", () => {
    it("should create default game", () => {
      const game = GameRow.createDefault(1);
      expect(game.title).toBe("Novo Jogo 1");
    });
  });
});
```

---

## Conclusão

Esta arquitetura demonstra que é possível criar aplicações complexas e manuteníveis com JavaScript puro, seguindo princípios sólidos de engenharia de software:

✅ **Modularidade**: Código organizado em módulos coesos
✅ **Testabilidade**: Componentes desacoplados e testáveis
✅ **Manutenibilidade**: Responsabilidades claras, fácil de modificar
✅ **Escalabilidade**: Estrutura preparada para crescimento
✅ **Performance**: Otimizações onde necessário

O projeto serve como referência para desenvolvedores que desejam entender fundamentos sem abstrações de frameworks.
