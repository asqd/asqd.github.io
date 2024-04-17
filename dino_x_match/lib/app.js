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
Math.getRandomIntWithStep = function (min, max, step) {
  return Math.floor(Math.random() * ((max - min) / step) + min / step) * step;
}

const SCREEN_WIDHT = 720
const SCREEN_HEIGHT = 1280

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: SCREEN_WIDHT,
    height: SCREEN_HEIGHT,
    parent: 'game',
  },
  scene: [GameScene],
  scene: [MenuScene, GameScene],
  backgroundColor: '#4b4b4b',
  roundPixels: true,
  // pixelArt: true,
};

const game = new Phaser.Game(config);
