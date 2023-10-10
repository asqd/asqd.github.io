Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
}

Array.prototype.shuffle = function () {
  var a = [...this],
    n = a.length;

  for (var i = n - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a
}

String.prototype.shuffle = function () {
  var a = this.split(""),
    n = a.length;

  for (var i = n - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a.join("");
}

String.prototype.capitalize = function () {
  return `${this.charAt(0).toUpperCase()}${this.slice(1)}`
}

String.prototype.format = function () {
  let args = arguments
  // args is strings
  if (args.length === 1 && args[0] !== null && typeof args[0] === 'object') {
    args = args[0];
  }

  let string = this
  for (key in args) {
    string = string.replace("%{" + key + "}", args[key])
  }

  return string
}

class RoadRacer extends Phaser.Scene {
  constructor() {
    super({
      key: 'RoadRacer',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
    });

    this.isAccelerating = false;
    this.scrollSpeed = 4;
    this.roadHeight = 64;
    this.screenHeight = 960;
    // this.roadSegments = Math.ceil(this.screenHeight / this.roadHeight) + 1;
    this.timer = 0
    this.roadSegments = []
    this.roadList = ['road', 'road_left']
    // this.acceleration = (100 / 3) * 25; // Ускорение, чтобы достичь 100 км/ч за 3 секунды (1 метр = 25 пикселей)
    // this.maxSpeed = (300 / 3) * 25; // Максимальная скорость 300 км/ч
  }

  preload() {
    this.load.spritesheet('road', 'assets/levels/Summer_road (64 x 64).png', {
      frameWidth: 64,
      frameHeight: 64
    });

    this.load.spritesheet('road_left', 'assets/levels/Summer_road (78 x 64) left.png', {
      frameWidth: 78,
      frameHeight: 64
    });

    this.load.spritesheet('car', 'assets/cars/red.png', {
      frameWidth: 14,
      frameHeight: 16
    });
  }

  create() {
    this.minimap = this.cameras.add(520, 370, 100, 300).setZoom(0.2).setName('mini').centerToBounds();
    this.minimap.setBackgroundColor(0x002244);
    this.minimap.scrollX = 192;
    this.minimap.scrollY = 480;

    this.road = this.add.image(256, this.screenHeight / 2, 'road');
    this.road.setScale(8, 30);
    this.road.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    this.car = this.physics.add.sprite(256, this.screenHeight / 2, 'car');
    this.car.setCollideWorldBounds(true);
    this.car.milleage = 0
    this.car.milleagepx = 0
    this.car.setScale(4);
    this.car.setBodySize(9,12)
    this.car.setOffset(4);

    this.car.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.car.speed = 0
    this.car.acceleration = 250
    this.car.maxSpeed = 320
    this.cursors = this.input.keyboard.createCursorKeys();
    this.isAccelerating = false;

    // камера когда понадобится
    // this.cameras.main.setBounds(0, 0, 384, 960)
    // this.cameras.main.startFollow(this.car, true, 0.5, 0.5)

    // this.cameras.main.setFollowOffset(0, 0);

    this.input.keyboard.on('keydown-W', () => {
      this.isAccelerating = true;
    });
    this.input.keyboard.on('keyup-W', () => {
      this.isAccelerating = false;
    });

    this.speedText = this.add.text(520, 10, "Скорость: 0 km/h", {
      fontSize: "24px",
      fill: "#fff",
      fontStyle: "bold",
      fontFamily: 'Arial Helvetica'
    });
    this.milleageText = this.add.text(520, 100, "Путь: 0 km", {
      fontSize: "24px",
      fill: "#fff",
      fontStyle: "bold",
      fontFamily: 'Arial Helvetica'
    });
    this.timerText = this.add.text(520, 190, "Время: 0 с", {
      fontSize: "24px",
      fill: "#fff",
      fontStyle: "bold",
      fontFamily: 'Arial Helvetica'
    });

    this.fpsText = this.add.text(520, 280, '', {
      font: '16px Arial',
      fill: '#ffffff'
    });
    this.speedText.texture.setFilter(Phaser.Textures.FilterMode.NEAREST)

    const graphics = this.add.graphics();
    this.physics.world.setBounds(64, 0, 384, 960)
    const worldBounds = this.physics.world.bounds;
    graphics.lineStyle(2, 0xff0000);
    graphics.strokeRect(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height);
  }

  update(time, dt) {
    this.timer += dt
    if (this.cursors.left.isDown) {
      this.car.setVelocityX(-180);
    } else if (this.cursors.right.isDown) {
      this.car.setVelocityX(180);
    } else {
      this.car.setVelocityX(0);
    }

    const fps = this.game.loop.actualFps

    const frameTime = 1 / this.game.loop.actualFps
    let velocity = 0

    if (this.isAccelerating) {
      const accelerationFactor = (this.car.maxSpeed - this.car.speed) / this.car.maxSpeed;
      velocity = this.car.acceleration * accelerationFactor * frameTime;

      if (this.car.speed < this.car.maxSpeed) {
        if (this.car.speed < 100) {
          this.car.speed += velocity * (dt / 70)

        } else if (this.car.speed > 100 && this.car.speed < 250) {
          this.car.speed += velocity * (dt / 50)

        } else {
          this.car.speed += velocity * (dt / 20)
        }
        // this.road.y += this.car.speed / 50
      }

      // if (velocity > maxSpeed) {
      //   velocity = maxSpeed;
      // }
    } else {
      const decelerationFactor = this.car.speed / this.car.maxSpeed;
      velocity = this.car.acceleration * decelerationFactor * frameTime;

      if (this.car.speed > 0 && this.car.speed > 100) {
        this.car.speed -= velocity * dt / 20
      } else
      if (this.car.speed > 0 && this.car.speed < 100) {
        this.car.speed -= velocity * dt / 10
      }
      if (this.car.speed < 0 || Math.floor(this.car.speed) < 10) {
        this.car.speed = 0
      }
    }

    console.log('velocity', velocity, 'speed', this.car.speed, frameTime)
    this.road.y += (this.car.speed / 3.6) * 10 * frameTime

    // if (this.isAccelerating) {
    //   const speed = this.scrollSpeed * (2 - this.car.speed / this.car.maxSpeed)
    //   if (this.car.speed < this.car.maxSpeed) {
    //     this.car.speed += speed * dt / 100
    //   }

    //   this.road.y += this.car.speed / 50 * 2
    // } else {
    //   if (this.car.speed > 0) {
    //     this.car.speed -= this.scrollSpeed / 4
    //     this.road.y += this.car.speed / 50 *2
    //   }
    //   if (this.car.speed < 0) {
    //     this.car.speed = 0
    //   }
    // }

    if (this.road.y > 960) {
      this.road.y = 480;
    }


    if (this.car.speed > 0) {
      this.car.milleage += this.car.speed / 3.6 * frameTime / 1000
    }

    if (this.timer % 1000) {
      this.timerText.setText(`Время: \n${Math.floor(this.timer/1000)} c`);
    }
    this.speedText.setText(`Скорость: \n${Math.floor(this.car.speed)} km/h`);
    this.milleageText.setText(`Путь: \n${this.car.milleage.toFixed(1)} km`);
    this.fpsText.setText('FPS: ' + Math.round(this.game.loop.actualFps));
  }
}

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  width: 640,
  height: 960,
  scene: RoadRacer,
};

const game = new Phaser.Game(config);
