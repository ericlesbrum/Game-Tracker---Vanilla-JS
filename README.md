# 🎮 Projeto Vanilla JS - Multi-Page Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://www.ecma-international.org/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://html.spec.whatwg.org/)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)

> Uma aplicação web moderna construída com JavaScript puro (Vanilla JS), demonstrando arquitetura MPA (Multi-Page Application) com persistência local e componentização.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [Padrões de Projeto](#-padrões-de-projeto)
- [Tecnologias](#-tecnologias)
- [Responsividade](#-responsividade)
- [Melhorias Futuras](#-melhorias-futuras)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

## 🎯 Visão Geral

Este projeto demonstra a criação de uma aplicação web completa utilizando apenas **HTML**, **CSS** e **JavaScript puro**, sem dependências de frameworks ou bibliotecas externas. Implementa conceitos modernos de desenvolvimento front-end como:

- ✅ Arquitetura baseada em componentes
- ✅ Padrão Mediator/Controller
- ✅ Separação de responsabilidades (MVC adaptado)
- ✅ Persistência de dados com localStorage
- ✅ Validação de dados com classes modelo
- ✅ Interface responsiva (mobile-first)
- ✅ ES6 Modules

## ✨ Funcionalidades

### 1. 🎮 Game Tracker (Rastreador de Jogos)

Sistema completo de gerenciamento de jogos com múltiplas abas:

#### Recursos Principais:

- **Gerenciamento de Abas**

  - Criar múltiplas listas de jogos
  - Renomear abas (duplo clique)
  - Excluir abas (com confirmação)
  - Navegação entre abas

- **Gerenciamento de Jogos**

  - Adicionar novos jogos
  - Editar informações (Título, Status, Nota, Dificuldade)
  - Excluir jogos
  - Validação automática de dados

- **Paginação**

  - 10 itens por página
  - Navegação entre páginas
  - Contador de itens

- **Importação/Exportação**
  - Exportar dados para JSON
  - Importar dados de JSON
  - Validação de dados importados
  - Backup e migração entre dispositivos

#### Campos de Dados:

- **Título**: Nome do jogo (texto livre)
- **Status**: Não Iniciado, Jogando, Pausado, Zerado, Abandonado
- **Nota**: 0 a 10
- **Dificuldade**: F, E-, E, E+, D-, D, D+, C-, C, C+, B-, B, B+, A-, A, A+, S, S+

### 2. ✂️ Processador de Arquivos

Utilitário para limpeza e organização de nomes de arquivos:

#### Recursos:

- **Seleção de Pasta**

  - Carregamento de pasta completa
  - Processamento recursivo de subpastas

- **Limpeza de Nomes**

  - Remove extensões
  - Remove padrões de versão/disco
  - Remove conteúdo entre colchetes e parênteses
  - Normaliza espaços

- **Filtros**

  - Ignorar pastas específicas (DLC, Bônus, etc.)
  - Deduplicação automática

- **Exportação**
  - Copiar lista para clipboard
  - Feedback visual de ação

## 🏗️ Arquitetura

O projeto segue uma arquitetura modular inspirada em MVC (Model-View-Controller) adaptada para Vanilla JS:

```
┌─────────────────────────────────────────────────────────┐
│                     HTML Pages (View)                    │
│          index.html | processor.html | game_tracker.html│
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│              Domain Controllers (Mediator)               │
│          processor.js | game_tracker.js                  │
│  - Gerencia estado global                                │
│  - Coordena componentes                                  │
│  - Controla fluxo de dados                               │
└─────┬─────────────────────────────────────────┬─────────┘
      │                                         │
┌─────▼──────────────┐              ┌──────────▼─────────┐
│    Components       │              │      Models        │
│  - TabManager       │              │  - GameRow         │
│  - TableManager     │              │                    │
│  - UIManager        │              │                    │
│  (Gerenciam UI)     │              │  (Validação)       │
└─────┬───────────────┘              └──────────┬─────────┘
      │                                         │
      └──────────────────┬──────────────────────┘
                         │
              ┌──────────▼──────────┐
              │    Utils/Services    │
              │ - EnumOptionsTable   │
              │ - LocalStorageService│
              └──────────────────────┘
```

### Camadas da Aplicação:

#### 1. **View Layer (HTML)**

- Estrutura semântica
- Acessibilidade (ARIA labels)
- Separação de concerns

#### 2. **Controller Layer (Domain)**

- `game_tracker.js`: Mediator do Game Tracker
- `processor.js`: Controller do Processador
- Gerencia estado global
- Coordena componentes
- Controla persistência

#### 3. **Component Layer**

- `TabManager.js`: Gerencia renderização de abas
- `TableManager.js`: Gerencia tabela e paginação
- `UIManager.js`: Gerencia modais e feedback
- Componentes reutilizáveis e desacoplados

#### 4. **Model Layer**

- `GameRow.js`: Modelo de dados com validação
- Encapsulamento de lógica de negócio
- Métodos de validação

#### 5. **Service Layer**

- `LocalStorageService.js`: Abstração do localStorage
- `EnumOptionsTable.js`: Enumerações e constantes

## 📁 Estrutura do Projeto

```
projeto-vanilla-js/
│
├── index.html                      # Página inicial
├── processor.html                  # Processador de arquivos
├── game_tracker.html              # Rastreador de jogos
│
├── assets/
│   ├── css/
│   │   ├── main.css               # Ponto de entrada CSS
│   │   ├── _base.css              # Variáveis, reset, modais
│   │   ├── _layout.css            # Layout geral (sidebar, main)
│   │   ├── _buttons.css           # Estilos de botões e abas
│   │   └── _tables.css            # Tabelas e paginação
│   │
│   └── js/
│       ├── domains/               # Controllers/Mediators
│       │   ├── game_tracker.js    # Controller do Game Tracker
│       │   └── processor.js       # Controller do Processador
│       │
│       ├── components/            # Componentes de UI
│       │   ├── TabManager.js      # Gerenciamento de abas
│       │   ├── TableManager.js    # Gerenciamento de tabela
│       │   └── UIManager.js       # Gerenciamento de modais
│       │
│       ├── models/                # Classes de modelo
│       │   └── GameRow.js         # Modelo de jogo com validação
│       │
│       └── utils/                 # Utilitários e serviços
│           ├── EnumOptionsTable.js    # Enumerações
│           └── LocalStorageService.js # Serviço de persistência
│
└── README.md                      # Este arquivo
```

## 🚀 Instalação

### Pré-requisitos

- Navegador web moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Servidor web local (opcional, mas recomendado)

### Opção 1: Servidor Local (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/projeto-vanilla-js.git
cd projeto-vanilla-js

# Usando Python 3
python -m http.server 8000

# Usando Node.js (npx)
npx http-server -p 8000

# Usando PHP
php -S localhost:8000
```

Acesse: `http://localhost:8000`

### Opção 2: Abrir Diretamente

Abra o arquivo `index.html` diretamente no navegador (pode ter limitações com CORS para alguns recursos).

## 📖 Uso

### Game Tracker

1. **Criar Nova Aba**

   - Clique em "➕ Nova Lista"
   - A aba será criada com nome padrão

2. **Renomear Aba**

   - Dê duplo clique na aba
   - Digite o novo nome no modal
   - Clique em "Confirmar"

3. **Adicionar Jogo**

   - Clique em "➕ Adicionar Nova Linha"
   - Preencha os campos (Título, Status, Nota, Dificuldade)
   - Dados salvos automaticamente ao alterar

4. **Exportar Dados**

   - Clique em "💾 Exportar JSON"
   - Arquivo será baixado automaticamente

5. **Importar Dados**
   - Clique em "📂 Importar JSON"
   - Selecione o arquivo JSON
   - Confirme a substituição dos dados

### Processador de Arquivos

1. **Configurar Filtros (Opcional)**

   - Digite nomes de pastas a ignorar
   - Separe com vírgulas (ex: "DLC, Bonus, Extras")

2. **Selecionar Pasta**

   - Clique em "➕ Selecionar e Processar Pasta"
   - Navegue até a pasta desejada
   - Clique em "Select" ou "Selecionar"

3. **Copiar Resultados**
   - Clique em "📋 Copiar Lista"
   - Cole onde necessário (Ctrl+V / Cmd+V)

## 🎨 Padrões de Projeto

### 1. **Mediator Pattern**

O arquivo `game_tracker.js` atua como mediador entre todos os componentes:

- Centraliza comunicação
- Reduz acoplamento
- Facilita manutenção

### 2. **Observer Pattern**

Através do método `updateUI()`:

- Notifica componentes de mudanças
- Sincroniza estado
- Renderiza interface

### 3. **Factory Pattern**

Classe `GameRow`:

- `createDefault()`: Cria instâncias com valores padrão
- `fromJSON()`: Cria a partir de dados brutos

### 4. **Service Locator**

`LocalStorageService`:

- Abstrai acesso ao localStorage
- Centraliza lógica de persistência
- Facilita testes

### 5. **Strategy Pattern**

Validações em `GameRow`:

- Diferentes estratégias de validação
- Extensível para novos campos

## 🛠️ Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**:
  - CSS Variables (Custom Properties)
  - Flexbox
  - Grid (preparado para uso)
  - Media Queries
  - Animations
- **JavaScript ES6+**:
  - Modules (import/export)
  - Classes
  - Arrow Functions
  - Destructuring
  - Template Literals
  - Async/Await
- **Web APIs**:
  - localStorage
  - File API
  - Clipboard API
  - FileReader API

## 📱 Responsividade

O projeto é totalmente responsivo com breakpoints:

### Desktop (> 900px)

- Sidebar lateral fixa
- Layout de 2 colunas
- Tabelas completas

### Tablet (600px - 900px)

- Sidebar horizontal no topo
- Navegação compacta
- Tabelas com scroll horizontal

### Mobile (< 600px)

- Sidebar em navegação horizontal
- Tabelas em formato de cards
- Inputs e botões adaptados
- Touch-friendly

## 🔮 Melhorias Futuras

### Curto Prazo

- [ ] Ordenação de colunas na tabela
- [ ] Busca/filtro de jogos
- [ ] Temas customizáveis (claro/escuro)
- [ ] Atalhos de teclado

### Médio Prazo

- [ ] Gráficos e estatísticas
- [ ] Categorias/tags para jogos
- [ ] Sincronização com nuvem
- [ ] PWA (Progressive Web App)

### Longo Prazo

- [ ] Backend com autenticação
- [ ] Compartilhamento de listas
- [ ] Integração com APIs de jogos
- [ ] Aplicativo mobile nativo

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes

- Mantenha o código limpo e comentado
- Siga os padrões de projeto existentes
- Teste em múltiplos navegadores
- Atualize a documentação quando necessário

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvido como projeto educacional para demonstrar conceitos de desenvolvimento web com Vanilla JS.

---

## 📚 Recursos Adicionais

### Conceitos Demonstrados

- ✅ Componentização sem frameworks
- ✅ Gerenciamento de estado
- ✅ Persistência de dados
- ✅ Validação de formulários
- ✅ Manipulação de arquivos
- ✅ Programação funcional
- ✅ Orientação a objetos
- ✅ Design patterns
- ✅ Acessibilidade (A11y)
- ✅ Responsividade

### Aprendizados

Este projeto serve como referência para:

- Desenvolvedores aprendendo JavaScript puro
- Estudantes de desenvolvimento web
- Profissionais migrando de frameworks para Vanilla JS
- Quem busca entender fundamentos sem abstrações

---

**⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!**
