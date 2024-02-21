Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
}

Array.prototype.shuffle = function () {
  let a = [...this],
    n = a.length;

  for (let i = n - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a
}

String.prototype.shuffle = function () {
  let a = this.split(""),
    n = a.length;

  for (let i = n - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a.join("");
}

String.prototype.capitalize = function () {
  return `${this.charAt(0).toUpperCase()}${this.slice(1)}`
}

String.prototype.format = function () {
  let args = arguments
  // args is strings
  if (args.length === 1 && args[0] !== null && typeof args[0] === 'object') {
    args = args[0];
  }

  let string = this
  for (let key in args) {
    string = string.replace("%{" + key + "}", args[key])
  }

  return string
}

const GAME_STATE_KEY = 'SAVE_STATE';
const initialGameState = {
  topScore: 0,
  totalWordsCount: 0,
  longestWordLength: 0,
  levelStats: {},
  totalPlayTime: 0,
  timer: 0
};

// functions to save and load the State (if you want to persist it)

function loadStateData() {
  return JSON.parse(localStorage.getItem(GAME_STATE_KEY));
}

function saveStateData(gameState) {
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
}
