// assets/js/models/GameRow.js

/**
 * @fileoverview Classe Model GameRow, que define a estrutura de dados,
 * getters/setters e a lógica de validação para um registro de jogo.
 * Implementa o Entity Pattern e o Factory Pattern.
 *
 * Faz parte da Camada Model (Business Logic).
 */

// Importa as constantes globais necessárias para a validação (Strategy Pattern)
import {
  GameStatus, // Array de status permitidos
  GameNote, // Array de notas permitidas
  GameDifficulty, // Array de dificuldades permitidas
} from "../utils/EnumOptionsTable.js";

/**
 * Classe que representa uma linha de jogo na tabela.
 * Encapsula as propriedades, validações e regras de negócio de um registro de jogo.
 */
export class GameRow {
  /**
   * @param {Object} data - Dados iniciais do jogo.
   * @param {string} data.id - ID único do jogo.
   * @param {string} data.title - Título do jogo.
   * @param {string} data.status - Status do jogo.
   * @param {string} data.note - Nota do jogo (0-10).
   * @param {string} data.difficulty - Dificuldade do jogo.
   */
  constructor(data = {}) {
    // 1. Construtor: Inicializa propriedades
    // O ID é gerado automaticamente se não for fornecido (usando timestamp para unicidade simples).
    this.id = data.id || Date.now().toString();
    this.title = data.title || "";
    // Propriedades internas (privadas, conforme convenção _ prefixo) usam o primeiro valor padrão.
    this._status = data.status || GameStatus[0];
    this._note = data.note || GameNote[0];
    this._difficulty = data.difficulty || GameDifficulty[0];
  }

  // --- Getters e Setters com validação (Encapsulamento) ---

  /**
   * Getter para o status do jogo.
   * @returns {string}
   */
  get status() {
    return this._status;
  }

  /**
   * Setter para o status. Aplica o Strategy Pattern para validação.
   * Se o valor for inválido, registra um aviso e **mantém o valor anterior**,
   * evitando quebra de dados.
   * @param {string} value - Novo status.
   */
  set status(value) {
    if (this.isValidStatus(value)) {
      this._status = value;
    } else {
      console.warn(
        `Status inválido: "${value}". Mantendo valor anterior: "${this._status}"`
      );
    }
  }

  /**
   * Getter para a nota do jogo.
   * @returns {string}
   */
  get note() {
    return this._note;
  }

  /**
   * Setter para a nota.
   * @param {string} value - Nova nota.
   */
  set note(value) {
    if (this.isValidNote(value)) {
      this._note = value;
    } else {
      console.warn(
        `Nota inválida: "${value}". Mantendo valor anterior: "${this._note}"`
      );
    }
  }

  /**
   * Getter para a dificuldade do jogo.
   * @returns {string}
   */
  get difficulty() {
    return this._difficulty;
  }

  /**
   * Setter para a dificuldade.
   * @param {string} value - Nova dificuldade.
   */
  set difficulty(value) {
    if (this.isValidDifficulty(value)) {
      this._difficulty = value;
    } else {
      console.warn(
        `Dificuldade inválida: "${value}". Mantendo valor anterior: "${this._difficulty}"`
      );
    }
  }

  // --- Métodos de validação (Strategy Pattern) ---

  /**
   * Valida se o status está na lista de valores permitidos (GameStatus).
   * @param {string} status - Status a validar
   * @returns {boolean}
   */
  isValidStatus(status) {
    return GameStatus.includes(status);
  }

  /**
   * Valida se a nota está na lista de valores permitidos (GameNote).
   * Converte a nota para string antes de verificar a inclusão.
   * @param {string} note - Nota a validar
   * @returns {boolean}
   */
  isValidNote(note) {
    return GameNote.includes(String(note));
  }

  /**
   * Valida se a dificuldade está na lista de valores permitidos (GameDifficulty).
   * @param {string} difficulty - Dificuldade a validar
   * @returns {boolean}
   */
  isValidDifficulty(difficulty) {
    return GameDifficulty.includes(difficulty);
  }

  /**
   * Validação completa de todos os campos do jogo.
   * Implementa o princípio de early return na arquitetura, embora esta versão retorne um objeto de erros.
   * @returns {Object} Objeto com o estado de validade (`isValid`) e um array de mensagens de `errors`.
   */
  validate() {
    const errors = [];

    // Validação de presença (Título)
    if (!this.title || this.title.trim().length === 0) {
      errors.push("Título não pode estar vazio");
    }

    // Validação de enumeração (usando os métodos de estratégia)
    if (!this.isValidStatus(this._status)) {
      errors.push(`Status "${this._status}" é inválido`);
    }

    if (!this.isValidNote(this._note)) {
      errors.push(`Nota "${this._note}" é inválida`);
    }

    if (!this.isValidDifficulty(this._difficulty)) {
      errors.push(`Dificuldade "${this._difficulty}" é inválida`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Atualiza uma propriedade específica do jogo, usando os setters para garantir a validação.
   * @param {string} property - Nome da propriedade (ex: 'title', 'status').
   * @param {any} value - Novo valor.
   * @returns {boolean} True se a propriedade for válida e atualizada, False caso contrário.
   */
  updateProperty(property, value) {
    const validProperties = ["title", "status", "note", "difficulty"];

    if (!validProperties.includes(property)) {
      console.warn(`Propriedade "${property}" não existe`);
      return false;
    }

    // Usa os setters (this[property] = value) para garantir validação e lógica.
    this[property] = value;
    return true;
  }

  /**
   * Converte o objeto GameRow para o formato JSON simples para persistência.
   * @returns {Object} Representação serializável do jogo.
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      status: this._status, // Usa a propriedade privada para garantir o valor atualizado
      note: this._note,
      difficulty: this._difficulty,
    };
  }

  /**
   * Cria uma cópia (clone) completa da instância GameRow.
   * @returns {GameRow} Nova instância GameRow.
   */
  clone() {
    return new GameRow(this.toJSON());
  }

  // --- Métodos Estáticos (Factory Pattern) ---

  /**
   * Cria uma instância de GameRow a partir de dados brutos carregados (ex: do LocalStorageService).
   * @param {Object} data - Dados do jogo.
   * @returns {GameRow}
   */
  static fromJSON(data) {
    return new GameRow(data);
  }

  /**
   * Cria um novo GameRow com valores padrão definidos.
   * @param {number} index - Índice para criar um título padrão único (ex: "Novo Jogo 1").
   * @returns {GameRow}
   */
  static createDefault(index = 1) {
    return new GameRow({
      title: `Novo Jogo ${index}`,
      status: GameStatus[0], // "Não Iniciado"
      note: GameNote[0], // "0"
      difficulty: GameDifficulty[0], // "F"
    });
  }

  /**
   * Retorna uma representação em string do jogo para fins de depuração.
   * @returns {string}
   */
  toString() {
    return `GameRow(id=${this.id}, title="${this.title}", status="${this._status}", note=${this._note}, difficulty="${this._difficulty}")`;
  }
}
