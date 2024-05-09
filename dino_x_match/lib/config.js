const VERSION = 'v0.168'
const TIME_LIMIT = 120
const MOVES_LIMIT = 50
const GAME_MODES = Object.freeze({
  CLASSIC: 'classic',
  TIME_ATTACK: 'timeAttack',
  MOVES_ATTACK: 'movesAttack'
})
const END_GAME_TEXT = "\n\n\n\n\n\nВаш Результат\n🏅%{score}\n\nЛучший результат: \n🏆%{totalScore}\n\nМакс. комбо: %{maxCombo}\n\nНажмите на экран, \nчтобы перезапустить\nуровень";
const TIME_ATTACK_END_GAME_TEXT = `Время вышло.${END_GAME_TEXT}`;
const MOVES_ATTACK_END_GAME_TEXT = `Ходы закончились.${END_GAME_TEXT}`;
const CLEAR_FIELD_END_GAME_TEXT = `Вы очистили всё поле!${END_GAME_TEXT}`;
const TIME_TEXT = "⏱ %{time}"
const MOVES_TEXT = "Ходы: %{moves}"
const MISSIONS_COUNT = 3

const GAME_OPTIONS = {
  gemSpriteSize: 256,
  gemSize: 74,
  baseSize: 74,
  boardOffset: { x: 60, y: 210 },
  destroySpeed: 200,
  fallSpeed: 100,
  slideSpeed: 300,
  rows: 11,
  columns: 8,
  maxRows: 11,
  maxColumns: 8,
  items: 4,
  minimumMatches: 2,
};
