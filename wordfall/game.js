const SCENES = [MenuScene, LevelSelectScene]
// const SCREEN_WIDHT = 720
// const SCREEN_HEIGHT = 1280
const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: SCREEN_WIDHT,
    height: SCREEN_HEIGHT,
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
