// assets/js/utils/EnumOptionsTable.js

/**
 * @fileoverview Contém constantes globais e enumerações (Enums) para
 * ser utilizadas em toda a aplicação, especialmente para preenchimento
 * de opções de formulário (selects) e validação de dados no Model Layer.
 *
 * Faz parte da Camada Service/Utils.
 */

// 1. Status de Acompanhamento de Jogo
/**
 * Array de strings representando os possíveis status de acompanhamento de um jogo.
 * Usado pelo Model (GameRow.js) para validação e
 * pelo Component Layer (TableManager.js) para renderizar a interface de seleção.
 * @type {Array<string>}
 */
export const GameStatus = [
  "Não Iniciado", // Status padrão para jogos adicionados
  "Jogando",
  "Pausado",
  "Zerado",
];

// 2. Notas (0 a 10)
/**
 * Array de strings representando as notas possíveis para um jogo (de 0 a 10).
 * Criado dinamicamente para garantir a integridade do intervalo.
 * @type {Array<string>}
 */
export const GameNote = Array.from({ length: 11 }, (_, i) => i.toString());

// 3. Níveis de Dificuldade
/**
 * Array de strings representando os níveis de dificuldade configuráveis para um jogo.
 * Usado como uma lista de opções para preenchimento de campos.
 * @type {Array<string>}
 */
export const GameDifficulty = [
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
  "S+", // Nível máximo de dificuldade
];
