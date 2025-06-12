const APP_VERSION = 'v7.1.8'

const COLOR_OBJECT = new Phaser.Display.Color();
const CHARACTERS = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
const CHARACTERS_LENGTH = CHARACTERS.length;
const VOWELS = 'АУОЫЭЯЮЁИЕ'
const CONSONANTS = 'БВГДЖЗЙКЛМНПРСТФХЦЧШЩ'
const SPECIAL = 'ьъ'
const GAME_OVER_TEXT = "Вас закидали"
const TIME_OVER_TEXT = "Время вышло!"

const SCREEN_WIDHT = 720
const SCREEN_HEIGHT = 1280

const SPAWN_X = 340
const SPAWN_Y = 50

const INITIAL_LETTER_INTERVAL = 300
const LETTER_INTERVAL = 4000
const LETTER_SIZE = 100
const SPAWN_LIMITS_XY = [80 + LETTER_SIZE / 2, 600 - LETTER_SIZE / 2]

const BOTTOM_TEXT_SIZE = 60
const BUTTON_SIZE = 80
const FONT_CONFIG = { color: '#000000', fontSize: 60, fontFamily: 'Arial Helvetica', resolution: window.devicePixelRatio }

const LEVEL_LIST = {
  1: {
    title: "Популярные слова",
    wordList: "frequentNouns",
    // wordsLimit: 1000,
    timeLimit: 0
  },
  2: {
    title: "Животные леса",
    wordList: "animalsList",
    wordsLimit: 30,
    timeLimit: 180
  },
  3: {
    title: "Популярные слова",
    wordList: "frequentNouns",
    // wordsLimit: 1000,
    timeLimit: 0
  },
  4: {
    title: "Животные леса",
    wordList: "animalsList",
    wordsLimit: 30,
    timeLimit: 180
  },
  5: {
    title: "Популярные слова",
    wordList: "frequentNouns",
    // wordsLimit: 1000,
    timeLimit: 0
  },
  6: {
    title: "Животные леса",
    wordList: "animalsList",
    wordsLimit: 30,
    timeLimit: 180
  },
  7: {
    title: "Популярные слова",
    wordList: "frequentNouns",
    // wordsLimit: 1000,
    timeLimit: 0
  },
  8: {
    title: "Животные леса",
    wordList: "animalsList",
    wordsLimit: 30,
    timeLimit: 180
  },
  9: {
    title: "Популярные слова",
    wordList: "frequentNouns",
    // wordsLimit: 1000,
    timeLimit: 0
  },
  10: {
    title: "Животные леса",
    wordList: "animalsList",
    wordsLimit: 30,
    timeLimit: 180
  },
}

const ETALON_LETTERS = {
  "О": 0.10983,
  "Е": 0.08483,
  "А": 0.07998,
  "И": 0.07367,
  "Н": 0.067,
  "Т": 0.06318,
  "С": 0.05473,
  "Р": 0.04746,
  "В": 0.04533,
  "Л": 0.04343,
  "К": 0.03486,
  "М": 0.03203,
  "Д": 0.02977,
  "П": 0.02804,
  "У": 0.02615,
  "Я": 0.02001,
  "Ы": 0.01898,
  "Ь": 0.01735,
  "Г": 0.01687,
  "З": 0.01641,
  "Б": 0.01592,
  "Ч": 0.0145,
  "Й": 0.01208,
  "Х": 0.00966,
  "Ж": 0.0094,
  "Ш": 0.00718,
  "Ю": 0.00639,
  "Ц": 0.00486,
  "Щ": 0.00361,
  "Э": 0.00331,
  "Ф": 0.00267,
  "Ъ": 0.00037,
  "Ё": 0.00013
}
