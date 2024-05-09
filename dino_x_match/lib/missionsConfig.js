const MISSIONS = [
  {
    tileType: 0,
    targetCount: 150,
    missionName: "collectByType"
  },
  // comboCountByType: {
  //   type: 0,
  //   comboCount: 8,
  //   targetCount: 5
  // },
  {
    targerScore: 5000,
    missionName: "scoresPerLevel"
  }
]

const missionConfigs = {
  collectByType: {
    createContainer: (scene, x, y, mission) => {
      const tileType = mission.tileType

      let rect = scene.add.rectangle(
        0, 0,
        scene.gameOptions.gemSize + scene.gameOptions.gemSize / 2,
        scene.gameOptions.gemSize,
        0x6BE26D,
        0.5
      ).setOrigin(0, 0.5)

      let collectByTypeTile = scene.add.sprite(0, 0, "tiles", tileType)
        .setScale(scene.gameOptions.gemScale / 1.3)
      let collectByTypeText = scene.add.text(
        0, 0,
        `${String(scene.tilesCounters[tileType].count).padStart(3, '0')}/${mission.targetCount}`,
        { color: "#fff", ...scene.fontOptions, fontSize: 30 }
      )
      collectByTypeText.setName('text')

      rect.displayWidth = collectByTypeText.displayWidth + collectByTypeTile.displayWidth

      Phaser.Display.Align.In.Center(rect, collectByTypeTile, 5)
      let container = scene.add.container(x, y, [rect, collectByTypeTile, collectByTypeText])
      scene.missionViews[mission.missionName] = container
    },
  },
  // WIP
  comboCountByType: {
    createContainer: (scene, x, y, mission) => {
      let comboTile = scene.add.sprite(x, comboY, "tiles", frameNumber)
        .setScale(scene.gameOptions.gemScale / 1.3)
      let comboTileText = scene.add.text(x + 10, y, `X${MISSIONS}`, { color: "#fff", ...scene.fontOptions, fontSize: 30 })

      let container = scene.add.container(x, y, [comboTile, comboTileText])
      scene.missions.push(container)
    },
  },
  scoresPerLevel: {
    createContainer: (scene, x, y, mission) => {
      let rect = scene.add.rectangle(
        0, 0,
        scene.gameOptions.gemSize + scene.gameOptions.gemSize / 2,
        scene.gameOptions.gemSize,
        0x6BE26D,
        0.5
      ).setOrigin(0, 0.5)

      let scoresPerLevelText = scene.add.text(
        0, 0,
        `${String(scene.data.values.score).padStart(3, '0')}/${mission.targerScore}`,
        { color: "#fff", ...scene.fontOptions, fontSize: 30 })
      scoresPerLevelText.setName('text')

      rect.displayWidth = scoresPerLevelText.displayWidth + 10

      let container = scene.add.container(x + 20, y, [rect, scoresPerLevelText])
      scene.missionViews[mission.missionName] = container
    },
  },
};
