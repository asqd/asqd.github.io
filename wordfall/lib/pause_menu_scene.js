PAUSE_MENU_ITEMS = [
  "Продолжить",
  "Перезапустить уровень",
  "Подсказка (-N очков)",
  "Меню"

]

class PauseMenuScene extends Phaser.Scene {
  constructor() {
    super('PauseMenuScene')
  }

  create() {
    this.textGroup = this.add.group()
    this.add.rectangle(SCREEN_WIDHT_CENTER, 390, 660, 530, 0xbbbbbb).setAlpha(0.3);
    // const menuBackground = this.add.graphics().fillStyle(0x000000, 0.5).fillRect(30, 150, 650, 540);

    PAUSE_MENU_ITEMS.forEach((item) => {
      this.textGroup.add(new TextView(this, 0, 0, item, {
        ...UiConfig.UI_FONT_CONFIG,
        fontSize: 60,
        color: '#fff'
      }))
    })

    this.alignTextUI()
  }

  alignTextUI() {
    Phaser.Actions.GridAlign(this.textGroup.getChildren(), {
      width: 1,
      height: -1,//PAUSE_MENU_ITEMS.length,
      // cellWidth: 400,
      cellHeight: 120,
      x: SCREEN_WIDHT_CENTER,
      y: 150,
      position: Phaser.Display.Align.CENTER
    });
  }
}
