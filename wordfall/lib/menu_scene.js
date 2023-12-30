const GAME_TITLE_TEXT = "WORDFALL"
const LEVEL_SELECTION_TEXT = "Выбор уровня"
const ENDLESS_TEXT = "Бесконечный режим"
const EXIT_TEXT = "Выход"
const SCREEN_WIDHT_CENTER = SCREEN_WIDHT / 2
const buttonY = 500
const buttonSpacingY = 150

const TEXT_CONFIG = { fontSize: 70, color: '#f5f6f7', fontFamily: 'Arial Helvetica', fontStyle: "bold", resolution: window.devicePixelRatio }

class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  scaleTween(gameObject, scale, duration, onComplete = () => {}) {
    this.tweens.add({
      targets: gameObject,
      scale: scale,
      ease: 'Circ',
      duration: duration,
      onComplete: onComplete
    })
  }

  versionText() {
    this.versionText = this.add.text(
      SCREEN_WIDHT_CENTER,
      1150,
      APP_VERSION,
      { ...UiConfig.UI_FONT_CONFIG, ...{ fontSize: 28 } }
    )
    this.versionText.setOrigin(0.5)
    this.versionText
  }

  preload() {
    IconButton.loadAssets(this)
  }

  create() {
    this.versionText()

    const gameTitle = this.add.text(SCREEN_WIDHT_CENTER, 200, GAME_TITLE_TEXT, { ...TEXT_CONFIG, ...{ fontSize: 110 } })
    gameTitle.setShadow(2, 2, "#c5c6c7", 16, true, true)
    gameTitle.setOrigin(0.5)
    
    const levelSelectButton = this.add.text(SCREEN_WIDHT_CENTER, buttonY, LEVEL_SELECTION_TEXT, TEXT_CONFIG)
    levelSelectButton.setOrigin(0.5)
    levelSelectButton.setInteractive({ cursor: 'pointer' });
    
    levelSelectButton.on('pointerover', () => levelSelectButton.setColor(UiConfig.PASTEL_GREEN_COLOR))
    levelSelectButton.on('pointerout', () => levelSelectButton.setColor(UiConfig.WHITE_COLOR))
    levelSelectButton.on('pointerdown', () => {
      this.scaleTween(
        levelSelectButton,
        1.2,
        400,
        () => {
          this.scene.sleep(this.scene.key).run('LevelSelectScene')
          setTimeout(()=> levelSelectButton.setScale(1), 500)
        }
      )
    })

    const endlessModeButton = this.add.text(SCREEN_WIDHT_CENTER, buttonY + buttonSpacingY, ENDLESS_TEXT, TEXT_CONFIG)
    endlessModeButton.setOrigin(0.5)
    endlessModeButton.setInteractive({ cursor: 'pointer' });
    
    endlessModeButton.on('pointerover', () => endlessModeButton.setColor(UiConfig.PASTEL_GREEN_COLOR))
    endlessModeButton.on('pointerout', () => endlessModeButton.setColor(UiConfig.WHITE_COLOR))
    endlessModeButton.on('pointerdown', () => {
      this.scaleTween(
        endlessModeButton,
        1.1,
        400,
        () => this.scene.start('EndlessGameScene')
      )
    })
    
    const exitButton = this.add.text(SCREEN_WIDHT_CENTER, buttonY + buttonSpacingY * 2, EXIT_TEXT, {...TEXT_CONFIG })
    exitButton.setOrigin(0.5)
    exitButton.setInteractive({ cursor: 'pointer' })

    exitButton.on('pointerover', () => exitButton.setColor("#e97451"))
    exitButton.on('pointerout', () => exitButton.setColor(UiConfig.WHITE_COLOR))
    exitButton.on('pointerdown', () => { 
      this.scaleTween(
        exitButton,
        0.8,
        400,
        () => window.close()
      )
    })
  }
}
