Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
}

Array.prototype.shuffle = function () {
  var a = [...this],
    n = a.length;

  for (var i = n - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a
}

String.prototype.shuffle = function () {
  var a = this.split(""),
    n = a.length;

  for (var i = n - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i];
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
  for (key in args) {
    string = string.replace("%{" + key + "}", args[key])
  }

  return string
}

const GAME_STATE_KEY = 'SAVE_STATE';
var initialGameState = {
  topScore: 0,
  totalWordsCount: 0,
  longestWordLength: 0,
  levelStats: {},
  totalPlayTime: 0
};

// functions to save and load the State (if you want to persist it)

function loadStateData() {
  GameState = JSON.parse(localStorage.getItem(GAME_STATE_KEY));
}

function saveStateData(gameState) {
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
}
