class UiManager {
  constructor(scene) {
    this.scene = scene
    this.gameManager = scene.gameManager

    this.fontSize = BOTTOM_TEXT_SIZE
  }

  initUI() {
    this.timeTextInit()
    this.scoreTextInit()
    this.wordsCountTextInit()
    this.wordTextInit()
    this.applyButtonInit()
    this.resetButtonInit()
  }

  timeTextInit() {
    this.timeText = this.scene.add.text(
      UiConfig.UI_X,
      UiConfig.UI_Y,
      UiConfig.TIME_TEXT.format({ time: this.scene.data.get('time') }),
      UiConfig.UI_FONT_CONFIG
    )
  }
  scoreTextInit() {
    this.scoreText = this.scene.add.text(
      UiConfig.UI_X,
      UiConfig.UI_Y + 100,
      UiConfig.SCORE_TEXT.format({ score: this.scene.data.get('score') }),
      UiConfig.UI_FONT_CONFIG
    )
  }
  wordsCountTextInit() {
    this.wordsText = this.scene.add.text(
      UiConfig.UI_X,
      UiConfig.UI_Y + 200,
      UiConfig.WORDS_COUNT_TEXT.format({ words: this.scene.data.get('words') }),
      UiConfig.UI_FONT_CONFIG
    )
  }

  wordTextInit() {
    this.wordText = this.scene.add.text(
      335,
      1050,
      "",
      { ...FONT_CONFIG, ...{ fontSize: BOTTOM_TEXT_SIZE } }
    )
    this.wordText.setOrigin(0.5)
  }

  applyButtonInit() {
    this.wordApplyFrame = this.scene.add.rectangle(495, 1150, 300, 85)
    this.wordApplyFrame.setStrokeStyle(4, UiConfig.BLACK_COLOR_HEX)
    // this.wordApplyFrame.setOrigin(0.5, 0)

    this.wordApply = this.scene.add.text(500, 1150, UiConfig.APPLY_ICON, { ...UiConfig.BUTTON_FONT_CONFIG, ...{ color: UiConfig.GREEN_COLOR } })
    this.wordApply.setOrigin(0.5)

    this.wordApplyFrame.setInteractive()
      .on("pointerdown", this.completeWord, this)
  }

  resetButtonInit() {
    this.wordResetFrame = this.scene.add.rectangle(185, 1150, 300, 85)
    this.wordResetFrame.setStrokeStyle(4, UiConfig.BLACK_COLOR_HEX)

    this.wordReset = this.scene.add.text(185, 1150, UiConfig.CANCEL_ICON, { ...UiConfig.BUTTON_FONT_CONFIG, ...{ color: UiConfig.ROSE_COLOR } })
    this.wordReset.setOrigin(0.5)

    this.wordResetFrame.setInteractive()
      .on("pointerdown", this.clearWord, this)
  }

  formatTime(seconds) {
    // Minutes
    var minutes = Math.floor(seconds / 60);
    // Seconds
    var seconds = seconds % 60;
    // Adds left zeros to seconds
    seconds = seconds.toString().padStart(2, '0');
    // Returns formated time
    return `${minutes}:${seconds}`;
  }

  updateTimer() {
    if (this.scene.gameOver) return

    this.scene.data.inc('time')

    let time = this.scene.data.get('time')

    if (time > 60)
      time = this.formatTime(time)

    this.timeText.text = UiConfig.TIME_TEXT.format({ time: time })
  }

  transitionColor(tween, color_from, color_to, length = 200) {
    return Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(color_from),
      Phaser.Display.Color.ValueToColor(color_to),
      length,
      tween.getValue()
    )
  }

  RGBToString(color) {
    return Phaser.Display.Color.RGBToString(color.r, color.g, color.b)
  }

  updateScore() {
    this.scene.data.inc('words')
    this.scene.data.values.score += this.wordText.text.length * 5 + 5
    
    this.wordsText.setText(UiConfig.WORDS_COUNT_TEXT.format({ words: this.scene.data.get('words') }))
    this.scoreText.setText(UiConfig.SCORE_TEXT.format({ score: this.scene.data.get('score') }))
  }

  clearUsedLetters() {
    this.gameManager.letterGroup.children.entries.forEach((letter) => {
      if (letter.selected) {
        letter.delete()
      }
    })
  }

  clearWordText() {
    this.wordText.text = ""
    this.wordText.setAlpha(1)
    this.wordText.setFontSize(BOTTOM_TEXT_SIZE)
    this.fontSize = BOTTOM_TEXT_SIZE
    this.gameManager.letterGroup.children.each((letter) => {
      letter.unSelect()
    })
  }

  clearSuccessWord() {
    this.wordText.text = ""
    this.wordText.setColor(UiConfig.BLACK_COLOR)
    this.wordText.setScale(1)
    this.wordText.setFontSize(BOTTOM_TEXT_SIZE)
  }

  tweenErrorApply() {
    this.scene.tweens.addCounter({
      from: 50,
      to: 200,
      ease: 'Circ',
      duration: 200,
      onUpdate: (tween) => {
        const color = this.transitionColor(tween, UiConfig.BLACK_COLOR, UiConfig.RED_COLOR)
        this.wordApply.setColor(this.RGBToString(color))
        this.wordText.setColor(this.RGBToString(color))
      },
      onComplete: () => {
        this.wordApply.setColor(UiConfig.GREEN_COLOR)
        this.wordText.setColor(UiConfig.BLACK_COLOR)
      }
    })
  }

  tweenErrorShakeWordText() {
    this.scene.tweens.add({
      targets: this.wordText,
      x: this.wordText.x - 10,
      ease: 'Bounce.InOut',
      duration: 70,
      yoyo: true,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.wordText,
          x: this.wordText.x + 10,
          ease: 'Bounce.InOut',
          duration: 70,
          yoyo: true,
        })
      }
    })
  }

  tweenSuccessApply() {
    this.scene.tweens.addCounter({
      from: 50,
      to: 200,
      ease: 'Circ',
      duration: 400,
      onUpdate: (tween) => {
        const color = this.transitionColor(tween, UiConfig.BLACK_COLOR, UiConfig.GREEN_COLOR,)
        this.wordText.setColor(this.RGBToString(color))
      }
    })
  }

  tweenSuccessScaleWordText() {
    this.scene.tweens.add({
      targets: this.wordText,
      scale: 1.2,
      ease: 'Circ',
      duration: 400,
      onComplete: () => {
        this.clearSuccessWord()
      }
    })
  }

  tweenClearTransition() {
    this.scene.tweens.addCounter({
      from: 50,
      to: 200,
      ease: 'Circ',
      duration: 400,
      onUpdate: (tween) => {
        const color = this.transitionColor(tween, UiConfig.ROSE_COLOR, UiConfig.GREY_COLOR)
        this.wordReset.setColor(this.RGBToString(color))
      },
      onComplete: () => {
        this.wordReset.setColor(UiConfig.ROSE_COLOR)
      }
    })
  }

  tweenClearWordText() {
    this.scene.tweens.add({
      targets: this.wordText,
      alpha: 0.3,
      ease: 'Circ',
      duration: 200,
      onComplete: () => {
        this.clearWordText()
        // this.wordText.text = ""
        // this.wordText.setAlpha(1)
        // this.wordText.setFontSize(BOTTOM_TEXT_SIZE)
        // this.fontSize = BOTTOM_TEXT_SIZE
        // this.gameManager.letterGroup.children.each((letter) => {
        //   letter.unSelect()
        // })
      }
    })
  }

  completeWord() {
    if (!window.wordList.includes(this.wordText.text.toLocaleLowerCase())) {
      this.tweenErrorApply()
      this.tweenErrorShakeWordText()

      return
    }

    // увеличиваем счётчик очков
    this.updateScore()

    this.tweenSuccessApply()
    this.tweenSuccessScaleWordText()

    this.clearUsedLetters()
  }

  clearWord() {
    this.tweenClearTransition()
    this.tweenClearWordText()
  }
}
