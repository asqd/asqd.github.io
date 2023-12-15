class UiConfig {
  static get UI_FONT_CONFIG() {
    return { ...FONT_CONFIG, ...{ fontSize: 36, color: "#fff" } }
  }
  static get BUTTON_FONT_CONFIG() {
    return { ...FONT_CONFIG, ...{ fontSize: BUTTON_SIZE } }
  }

  static get BLACK_COLOR() {
    return "#000000"
  }

  static get BLACK_COLOR_HEX() {
    return Phaser.Display.Color.HexStringToColor(UiConfig.BLACK_COLOR).color
  }

  static get PASTEL_GREEN_COLOR() {
    return "#77dd77"
  }

  static get GREEN_COLOR() {
    return "#99cc99"
  }

  static get ROSE_COLOR() {
    return "#db7070"
  }

  static get RED_COLOR() {
    return "#CC3333"
  }

  static get LIGHT_GREY_COLOR() {
    return "#f5f6f7"
  }
  
  static get GREY_COLOR() {
    return "#bbbbbb"
  }

  static get GREY_COLOR_HEX() {
    return Phaser.Display.Color.HexStringToColor(UiConfig.GREY_COLOR).color
  }

  static get APPLY_ICON() {
    return "✓"
  }

  static get CANCEL_ICON() {
    return "✗"
  }

  static get UI_X() {
    return 670
  }

  static get UI_Y() {
    return 90
  }

  static get TIME_TEXT() {
    return "Time \n %{time}"
  }

  static get SCORE_TEXT() {
    return "Score \n %{score}"
  }
  static get WORDS_COUNT_TEXT() {
    return "Words \n %{words}"
  }
}
