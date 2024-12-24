const LEVEL = "Уровень"

class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super("LevelSelectScene")
    this.currentPage = 1
  }

  create() {
    // Размеры сетки
    const gridCols = 2
    const gridRows = 4

    // Размер и отступы между кнопками
    const buttonWidth = 200
    const buttonHeight = 150
    const buttonSpacingX = 90
    const buttonSpacingY = 50

    const startX = 60
    const startY = 100

    // Количество уровней на странице
    const levelsPerPage = gridCols * gridRows
    // Общее количество уровней
    const totalLevels = Object.keys(LEVEL_LIST).length
    const totalPages = Math.ceil(totalLevels / levelsPerPage) // Общее количество страниц



    const levelGroup = this.add.group()

    const createLevelButtons = () => {
      for (let i = (this.currentPage - 1) * levelsPerPage; i < Math.min(this.currentPage * levelsPerPage, totalLevels); i++) {

        const levelText = this.add.text(0, 0, `${LEVEL} ${i + 1}`, { ...TEXT_CONFIG, ...{ fontSize: 36 }})
        const starsText = this.add.text(0, 0, `\n☆☆☆`, { ...TEXT_CONFIG, ...{ fontSize: 36 }})
        const levelTitle = this.add.text(0, 0, `${LEVEL_LIST[i+1].title}`, { ...TEXT_CONFIG, ...{ fontSize: 32 }})
        const levelRect = this.add.rectangle(0, 0, buttonWidth, buttonHeight)
        levelRect.setStrokeStyle(4, UiConfig.GREY_COLOR_HEX)


        const levelButton = this.add.container(0, 0, [levelText, starsText, levelTitle, levelRect])
        levelButton.setSize(buttonWidth, levelTitle.height + levelRect.height + 20)
        levelButton.setInteractive({ cursor: 'pointer' })
        Phaser.Display.Align.In.BottomCenter(levelTitle, levelButton)
        Phaser.Display.Align.In.TopCenter(levelRect, levelButton)
        Phaser.Display.Align.In.Center(levelText, levelRect, 0, -20)
        Phaser.Display.Align.In.Center(starsText, levelRect, 0, 20)

        levelButton.on('pointerdown', () => {
          this.scene.sleep()
          this.scene.add('ThemedLevelScene', ThemedLevelScene, false, { collectionId: i + 1 })

          this.scene.launch("ThemedLevelScene", { collectionId: i+1})
          console.log(`${LEVEL} ${i + 1}`)
        })

        levelButton.on('pointerover', () => [levelText, levelTitle].forEach((text) => text.setColor(UiConfig.PASTEL_GREEN_COLOR)))
        levelButton.on('pointerout', () => [levelText, levelTitle].forEach((text) => text.setColor(UiConfig.LIGHT_GREY_COLOR)))

        levelGroup.add(levelButton)
      }

      Phaser.Actions.GridAlign(levelGroup.getChildren(), {
        width: gridCols,
        height: gridRows,
        cellWidth: buttonWidth + buttonSpacingX,
        cellHeight: buttonHeight + buttonSpacingY * 2,
        x: startX,
        y: startY,
        position: Phaser.Display.Align.CENTER
      });
    }

    createLevelButtons()

    if (this.currentPage > 1) {
      const prevButton = this.add.text(50, 1150, '⧀', { TEXT_CONFIG, ...{ fontSize: 120 } })
      prevButton.setInteractive({ cursor: 'pointer' })

      prevButton.on('pointerdown', () => {
        if (this.currentPage > 1) {
          this.currentPage--
          this.scene.restart()
        }
      })

      prevButton.on('pointerover', () => prevButton.setColor(UiConfig.PASTEL_GREEN_COLOR))
      prevButton.on('pointerout', () => prevButton.setColor(UiConfig.LIGHT_GREY_COLOR))
    }

    if (this.currentPage < totalPages) {
      const nextButton = this.add.text(580, 1150, '⧁', { TEXT_CONFIG, ...{ fontSize: 120 } })
      nextButton.setInteractive({ cursor: 'pointer' })

      nextButton.on('pointerdown', () => {
        if (this.currentPage < totalPages) {
          this.currentPage++
          this.scene.restart()
        }
      })

      nextButton.on('pointerover', () => nextButton.setColor(UiConfig.PASTEL_GREEN_COLOR))
      nextButton.on('pointerout', () => nextButton.setColor(UiConfig.LIGHT_GREY_COLOR))
    }

    const menuButton = this.add.text(320, 1160, '☰', { TEXT_CONFIG, ...{ fontSize: 90 } })
    menuButton.setInteractive({ cursor: 'pointer' })

    menuButton.on('pointerdown', () => {
      this.scene.sleep(this.scene.key).run('MenuScene')
    })

    menuButton.on('pointerover', () => menuButton.setColor(UiConfig.PASTEL_GREEN_COLOR))
    menuButton.on('pointerout', () => menuButton.setColor(UiConfig.LIGHT_GREY_COLOR))
  }
}
