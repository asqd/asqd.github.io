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

class Word extends Phaser.GameObjects.Text {
  constructor(scene, x, y, text, style) {
    super(scene, x, y, text, style)

    scene.add.existing(this)
  }

}

const SCENES = [MenuScene, LevelSelectScene, EndlessGameScene, ThemedLevelScene]

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 860,
    height: 1200,
  },
  scene: SCENES,
  parent: 'phaser-example',
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 0.6 },
      // debug: true
    }
  },
  backgroundColor: '#262626'
};

const game = new Phaser.Game(config);
