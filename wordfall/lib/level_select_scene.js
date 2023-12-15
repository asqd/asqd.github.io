const LEVEL = "Уровень"

class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super("LevelSelectScene")
    this.currentPage = 1
  }

  create() {
    // Количество уровней на странице
    const levelsPerPage = 9
    // Общее количество уровней
    const totalLevels = Object.keys(LEVEL_LIST).length
    const totalPages = Math.ceil(totalLevels / levelsPerPage) // Общее количество страниц


    // Размеры сетки
    const gridCols = 3
    const gridRows = 3

    // Размер и отступы между кнопками
    const buttonWidth = 200
    const buttonHeight = 150
    const buttonSpacingX = 60
    const buttonSpacingY = 50

    const startX = 75
    const startY = 150

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
        levelButton.setInteractive()
        Phaser.Display.Align.In.BottomCenter(levelTitle, levelButton)
        Phaser.Display.Align.In.TopCenter(levelRect, levelButton)
        Phaser.Display.Align.In.Center(levelText, levelRect, 0, -20)
        Phaser.Display.Align.In.Center(starsText, levelRect, 0, 20)

        levelButton.on('pointerdown', () => {
          this.scene.start("ThemedLevelScene", { collectionId: i+1})
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
        y: startY
      });
    }

    createLevelButtons()

    if (this.currentPage > 1) {
      const prevButton = this.add.text(50, 1000, '<<', TEXT_CONFIG)
      prevButton.setInteractive()

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
      const nextButton = this.add.text(710, 1000, '>>', TEXT_CONFIG)
      nextButton.setInteractive()

      nextButton.on('pointerdown', () => {
        if (this.currentPage < totalPages) {
          this.currentPage++
          this.scene.restart()
        }
      })

      nextButton.on('pointerover', () => nextButton.setColor(UiConfig.PASTEL_GREEN_COLOR))
      nextButton.on('pointerout', () => nextButton.setColor(UiConfig.LIGHT_GREY_COLOR))
    }
  }
}
