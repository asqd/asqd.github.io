class MissionManager {
  /**
   * @param {Phaser.Scene} scene
  */
  constructor(scene) {
    this.scene = scene;
  }

  pickMissions() {
    this.scene.registry.values.missions ||= {}

    MISSIONS.forEach((picked_mission, _index) => {

      // clone object
      const mission = { ...picked_mission }
      if (mission.missionName === 'collectByType') {
        let tileType = Phaser.Math.RND.pick(Object.keys(this.scene.tilesCounters))
        mission.tileType = tileType
      }

      this.scene.registry.values.missions[mission.missionName] = mission
    })
  }

  drawMissions() {
    Object.values(this.scene.registry.values.missions).forEach((mission, index) => {
      let x = this.scene.gameOptions.boardOffset.x * 1.5 + index * this.scene.gameOptions.gemSize * 2;
      let y = this.scene.gameOptions.boardOffset.y - this.scene.gameOptions.gemSize;

      const config = missionConfigs[mission.missionName];
      if (config && config.createContainer) {
        config.createContainer(this.scene, x, y, mission);
      }
    });
  }

  updateMissionsCouner() {
    if (!this.scene.registry.values.missions) return 

    Object.values(this.scene.registry.values.missions).forEach((mission, _index) => {
      let text = ''
      const missionView = this.scene.missionViews[mission.missionName]

      if (!missionView) return

      if (mission.missionName === 'collectByType') {
        text = `${String(this.scene.tilesCounters[mission.tileType].count).padStart(3, '0')}/${mission.targetCount}`
      }
      if (mission.missionName === 'scoresPerLevel') {
        text = `${String(this.scene.data.values.score).padStart(4, '0')}/${mission.targerScore}`
      }
      missionView.getByName('text').text = text
    })
  }
}
