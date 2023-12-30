class TextView extends Phaser.GameObjects.Text {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, x, y, text, style = TextView.textConfig) {
    super(scene, x, y, text, style)
    this.scene.add.existing(this)
    // this.onChanqgeData()
  }

  static get textConfig() {
    return {
      ...UiConfig.UI_FONT_CONFIG,
      fontSize: 40,
      color: '#fff'
    }
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

  setPattern(string) {
    this.pattern = string
  }

  onChangeData(keyProp, callback, context=this) {
    this.scene.data.events.on(
      'changedata', 
      (gameObject, key, value) => {
        if (key === keyProp) {
          callback.apply(context)
        }
      }
    )
  }
}
