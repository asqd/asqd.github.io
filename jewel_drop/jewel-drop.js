class JewelDropGame extends Phaser.Scene {
    constructor() {
        super({ key: 'JewelDropGame' });
    }

    preload() {
        this.createCrystalGraphics();
    }

    create() {
        this.gameWidth = 800;
        this.gameHeight = 600;

        this.score = 0;
        this.stars = 0;
        this.gameOver = false;
        this.gameStarted = false;

        this.crystals = [];
        this.basketCrystals = [];
        this.crystalColors = ['blue', 'green', 'yellow', 'purple'];
        this.activeCrystal = null;
        this.needSpawn = true
        this.checkMatchesTimer = null;
        this.lastMotionCheck = 0;
        this.motionThreshold = 0.1;
        this.fallSpeed = 1;
        this.fastFallSpeed = 30;
        this.isDownPressed = false;
        this.isLeftPressed = false;
        this.isRightPressed = false;
        this.crystalMoveSpeed = 2;

        this.createBackground();
        this.createBasket();
        this.createUI();
        this.setupPhysicsWalls();
        this.showStartScreen();

        // this.crystalSpawnTimer = this.time.addEvent({
        //     delay: 2000,
        //     callback: this.spawnCrystal,
        //     callbackScope: this,
        //     loop: true
        // });

        this.matchCheckTimer = this.time.addEvent({
            delay: 2000,
            callback: this.checkForMatches,
            callbackScope: this,
            loop: true
        });

        this.input.keyboard.on('keydown', this.handleAnyKey, this);
        this.input.keyboard.on('keydown-SPACE', this.shakeBasket, this);
        this.input.keyboard.on('keydown-LEFT', this.onLeftPressed, this);
        this.input.keyboard.on('keyup-LEFT', this.onLeftReleased, this);
        this.input.keyboard.on('keydown-RIGHT', this.onRightPressed, this);
        this.input.keyboard.on('keyup-RIGHT', this.onRightReleased, this);
        this.input.keyboard.on('keydown-DOWN', this.onDownPressed, this);
        this.input.keyboard.on('keyup-DOWN', this.onDownReleased, this);
        this.input.on('pointerdown', this.handleClick, this);

        this.matter.world.on('collisionstart', this.onCollisionStart, this);
    }

    createCrystalGraphics() {
        ['blue', 'green', 'yellow', 'purple', 'red', 'star'].forEach(color => {
            const graphics = this.add.graphics();
            const colorMap = {
                'blue': 0x0066cc,
                'green': 0x00cc66,
                'yellow': 0xcccc00,
                'purple': 0x9966cc,
                'red': 0xcc3333,
                'star': 0xffdd44
            };

            graphics.fillStyle(colorMap[color]);
            graphics.lineStyle(2, 0xffffff, 0.8);

            if (color === 'star') {
                graphics.beginPath();
                for (let i = 0; i < 10; i++) {
                    const angle = (i * Math.PI) / 5;
                    const radius = i % 2 === 0 ? 15 : 8;
                    const x = Math.cos(angle - Math.PI / 2) * radius + 15;
                    const y = Math.sin(angle - Math.PI / 2) * radius + 15;
                    if (i === 0) graphics.moveTo(x, y);
                    else graphics.lineTo(x, y);
                }
                graphics.closePath();
                graphics.fillPath();
                graphics.strokePath();
            } else {
                // Создаем восьмиугольник
                const centerX = 15;
                const centerY = 15;
                const radius = 15;
                const sides = 8;

                graphics.beginPath();
                for (let i = 0; i < sides; i++) {
                    const angle = (i * Math.PI * 2) / sides;
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;
                    if (i === 0) {
                        graphics.moveTo(x, y);
                    } else {
                        graphics.lineTo(x, y);
                    }
                }
                graphics.closePath();
                graphics.fillPath();
                graphics.strokePath();
            }

            graphics.generateTexture(color, 30, 30);
            graphics.destroy();
        });
    }

    createBackground() {
        this.add.rectangle(400, 300, 800, 600, 0x654321);

        this.add.text(400, 50, 'JEWEL DROP', {
            fontSize: '32px',
            fill: '#ffdd44',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
    }

    createBasket() {
        const basketHeight = 400;
        const basketWidth = 200;
        const basketBottom = 520;
        const basketTop = basketBottom - basketHeight;

        this.basket = this.add.graphics();
        this.basket.lineStyle(4, 0x8b4513);
        this.basket.strokeRect(-basketWidth/2, -basketHeight, basketWidth, basketHeight);
        this.basket.x = 400;
        this.basket.y = basketBottom;

        this.basketBounds = {
            left: 400 - basketWidth/2,
            right: 400 + basketWidth/2,
            top: basketTop,
            bottom: basketBottom
        };

        const basketBottomBody = this.matter.add.rectangle(400, basketBottom + 5, basketWidth, 10, {
            isStatic: true,
            label: 'basketBottom',
            render: { fillStyle: 'transparent' }
        });

        const basketLeftWall = this.matter.add.rectangle(400 - basketWidth/2 - 5, basketBottom - basketHeight/2, 10, basketHeight, {
            isStatic: true,
            label: 'basketWall',
            render: { fillStyle: 'transparent' }
        });

        const basketRightWall = this.matter.add.rectangle(400 + basketWidth/2 + 5, basketBottom - basketHeight/2, 10, basketHeight, {
            isStatic: true,
            label: 'basketWall',
            render: { fillStyle: 'transparent' }
        });
    }

    setupPhysicsWalls() {
        const ground = this.matter.add.rectangle(400, 590, 800, 20, {
            isStatic: true,
            label: 'ground',
            render: { fillStyle: 'transparent' }
        });

        const leftWall = this.matter.add.rectangle(-10, 300, 20, 600, {
            isStatic: true,
            label: 'wall',
            render: { fillStyle: 'transparent' }
        });

        const rightWall = this.matter.add.rectangle(810, 300, 20, 600, {
            isStatic: true,
            label: 'wall',
            render: { fillStyle: 'transparent' }
        });
    }

    createUI() {
        this.scoreText = this.add.text(50, 50, `Score: ${this.score}`, {
            fontSize: '24px',
            fill: '#ffffff'
        });

        this.starsText = this.add.text(50, 80, `Stars: ${this.stars}`, {
            fontSize: '24px',
            fill: '#ffdd44'
        });

        this.controlsText = this.add.text(550, 50, 'Controls:', {
            fontSize: '18px',
            fill: '#cccccc'
        });

        this.moveText = this.add.text(550, 75, '← → Move crystal', {
            fontSize: '16px',
            fill: '#ffffff'
        });

        this.fallText = this.add.text(550, 95, '↓ Fast fall', {
            fontSize: '16px',
            fill: '#ffffff'
        });

        this.shakeText = this.add.text(550, 115, 'Space: Shake basket', {
            fontSize: '16px',
            fill: '#ffffff'
        });

        // Скрываем UI до старта игры
        this.hideGameUI();
    }

    showGameUI() {
        this.scoreText.setVisible(true);
        this.starsText.setVisible(true);
        this.controlsText.setVisible(true);
        this.moveText.setVisible(true);
        this.fallText.setVisible(true);
        this.shakeText.setVisible(true);
    }

    hideGameUI() {
        this.scoreText.setVisible(false);
        this.starsText.setVisible(false);
        this.controlsText.setVisible(false);
        this.moveText.setVisible(false);
        this.fallText.setVisible(false);
        this.shakeText.setVisible(false);
    }

    showStartScreen() {
        this.startBg = this.add.rectangle(400, 300, 500, 150, 0x000000, 0.8);
        this.startTitle = this.add.text(400, 280, 'JEWEL DROP', {
            fontSize: '36px',
            fill: '#ffdd44',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        this.startText = this.add.text(400, 320, 'Нажмите любую клавишу, чтобы начать игру', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
    }

    hideStartScreen() {
        if (this.startBg) this.startBg.destroy();
        if (this.startTitle) this.startTitle.destroy();
        if (this.startText) this.startText.destroy();
    }

    spawnCrystal() {
        if (this.gameOver || !this.gameStarted) return;

        if (this.needSpawn) this.needSpawn = false

        const colors = this.score >= 1000 ? [...this.crystalColors, 'red'] : this.crystalColors;
        const isStarCrystal = Math.random() < 0.1;
        const isBigCrystal = Math.random() < 0.15;
        const color = isStarCrystal ? 'star' : Phaser.Utils.Array.GetRandom(colors);

        let size = 1;
        if (isBigCrystal && !isStarCrystal) {
            size = Phaser.Math.Between(2, 4);
        }

        const crystal = this.add.image(400, 0, color);

        crystal.setData('color', color);
        crystal.setData('isStar', isStarCrystal);
        crystal.setData('inBasket', false);
        crystal.setData('size', size);
        crystal.setData('isActive', true);
        crystal.setData('isFalling', true);
        crystal.setData('fallSpeed', this.fallSpeed);

        if (size > 1) {
            crystal.setScale(size);
        }

        this.activeCrystal = crystal;
        this.crystals.push(crystal);
    }

    onCollisionStart(event) {
        event.pairs.forEach(pair => {
            const { bodyA, bodyB } = pair;

            if (bodyA.label === 'crystal' && bodyB.label === 'basketBottom') {
                const crystal = bodyA.gameObject;
                if (crystal) this.handleCrystalInBasket(crystal);
            } else if (bodyB.label === 'crystal' && bodyA.label === 'basketBottom') {
                const crystal = bodyB.gameObject;
                if (crystal) this.handleCrystalInBasket(crystal);
            } else if (bodyA.label === 'crystal' && bodyB.label === 'ground') {
                const crystal = bodyA.gameObject;
                if (crystal) this.handleCrystalOutOfBounds(crystal);
            } else if (bodyB.label === 'crystal' && bodyA.label === 'ground') {
                const crystal = bodyB.gameObject;
                if (crystal) this.handleCrystalOutOfBounds(crystal);
            }
        });
    }

    activatePhysicsForCrystal(crystal) {
        if (crystal.body) return;

        const size = crystal.getData('size') || 1;
        const baseRadius = 15; // базовый радиус физического тела
        const x = crystal.x;
        const y = crystal.y;
        const texture = crystal.texture.key;

        console.log(`Activating physics for crystal at (${x.toFixed(1)}, ${y.toFixed(1)}) with size ${size}`);

        // Сохраняем все данные кристалла
        const color = crystal.getData('color');
        const isStar = crystal.getData('isStar');
        const inBasket = crystal.getData('inBasket');
        const scale = crystal.scaleX;

        // Удаляем старый sprite
        crystal.destroy();

        // Создаем новый физический кристалл с базовым размером физического тела
        const physicsCrystal = this.matter.add.image(x, y, texture, null, {
            shape: {
                type: 'polygon',
                sides: 8,
                radius: baseRadius  // всегда базовый размер для физики
            },
            restitution: 0.1,
            friction: 0.8,
            frictionAir: 0.02,
            density: 0.001,
            label: 'crystal'
        });

        // Устанавливаем визуальный масштаб (физическое тело остается базового размера)
        physicsCrystal.setScale(size);

        // Восстанавливаем все данные
        physicsCrystal.setData('color', color);
        physicsCrystal.setData('isStar', isStar);
        physicsCrystal.setData('inBasket', inBasket);
        physicsCrystal.setData('size', size);
        physicsCrystal.setData('isFalling', false);
        physicsCrystal.setData('isActive', false);
        physicsCrystal.setScale(scale);

        // Обновляем ссылки в массивах
        const crystalIndex = this.crystals.indexOf(crystal);
        if (crystalIndex > -1) {
            this.crystals[crystalIndex] = physicsCrystal;
        }

        const basketIndex = this.basketCrystals.indexOf(crystal);
        if (basketIndex > -1) {
            this.basketCrystals[basketIndex] = physicsCrystal;
        }

        this.activeCrystal = null
        this.needSpawn = true

        return physicsCrystal;
    }

    handleCrystalInBasket(crystal) {
        if (!crystal || crystal.getData('inBasket')) return;

        crystal.setData('inBasket', true);
        crystal.setData('isActive', false);
        crystal.setData('isFalling', false);

        if (this.activeCrystal === crystal) {
            this.activeCrystal = null;
        }

        this.basketCrystals.push(crystal);

        const index = this.crystals.indexOf(crystal);
        if (index > -1) this.crystals.splice(index, 1);

        if (this.checkMatchesTimer) {
            this.checkMatchesTimer.remove();
        }

        this.checkMatchesTimer = this.time.delayedCall(500, () => {
            this.checkForMatches();
            this.checkForOverflow();
        });
    }

    handleFallingCrystalReachedBasket(crystal) {
        if (crystal.x < this.basketBounds.left || crystal.x > this.basketBounds.right) {
            this.endGame();
            return;
        }

        // Создаем физический кристалл прямо на дне корзины
        const size = crystal.getData('size') || 1;
        const radius = 15 * size;
        crystal.y = this.basketBounds.bottom - radius;
        const physicsCrystal = this.activatePhysicsForCrystal(crystal);

        if (physicsCrystal) {
            // Устанавливаем нулевую скорость, чтобы кристалл остановился на дне
            this.matter.body.setVelocity(physicsCrystal.body, { x: 0, y: 0 });
            this.handleCrystalInBasket(physicsCrystal);
        }
    }

    handleCrystalOutOfBounds(crystal) {
        if (crystal && (crystal.x < this.basketBounds.left - 50 || crystal.x > this.basketBounds.right + 50)) {
            this.endGame();
        }
    }

    checkForOverflow() {
        const topCrystals = this.basketCrystals.filter(crystal =>
            crystal.y < this.basketBounds.top / 2 + 80
        );

        if (topCrystals.length > 5) {
            this.endGame();
        }
    }

    checkForMatches() {
        if (this.basketCrystals.length === 0) return;

        console.log(`Checking matches for ${this.basketCrystals.length} crystals in basket`);

        const connectedGroups = this.findConnectedCrystals();
        console.log(`Found ${connectedGroups.length} connected groups:`, connectedGroups.map(group => ({
            color: group[0]?.getData('color'),
            count: group.length,
            hasStars: group.some(c => c.getData('isStar'))
        })));

        let matchFound = false;

        connectedGroups.forEach(group => {
            const shouldRemove = group.length >= 4 || (group.length >= 3 && group.some(c => c.getData('isStar')));
            console.log(`Group of ${group.length} ${group[0]?.getData('color')} crystals: ${shouldRemove ? 'REMOVING' : 'keeping'}`);

            if (shouldRemove) {
                matchFound = true;
                this.removeMatches(group);
            }
        });

        if (matchFound) {
            console.log('Match found, scheduling next check');
            this.time.delayedCall(1000, () => this.checkForMatches());
        } else {
            console.log('No matches found');
        }
    }

    findConnectedCrystals() {
        const visited = new Set();
        const groups = [];

        console.log(`Finding connections among ${this.basketCrystals.length} crystals`);
        console.log('Crystal positions:', this.basketCrystals.map(c => ({
            color: c.getData('color'),
            x: c.x.toFixed(1),
            y: c.y.toFixed(1),
            size: c.getData('size')
        })));

        this.basketCrystals.forEach(crystal => {
            if (visited.has(crystal)) return;

            const group = [];
            const stack = [crystal];
            const color = crystal.getData('color');

            console.log(`\n=== Starting new group for color: ${color} ===`);

            while (stack.length > 0) {
                const current = stack.pop();
                if (visited.has(current)) continue;

                visited.add(current);
                group.push(current);
                console.log(`Added crystal to group: ${color} at (${current.x.toFixed(1)}, ${current.y.toFixed(1)}). Group size now: ${group.length}`);

                console.log(`Checking neighbors for crystal at (${current.x.toFixed(1)}, ${current.y.toFixed(1)})`);

                this.basketCrystals.forEach(other => {
                    if (visited.has(other)) {
                        console.log(`  - Skipping already visited crystal at (${other.x.toFixed(1)}, ${other.y.toFixed(1)})`);
                        return;
                    }
                    if (other.getData('color') !== color) {
                        console.log(`  - Skipping different color crystal (${other.getData('color')}) at (${other.x.toFixed(1)}, ${other.y.toFixed(1)})`);
                        return;
                    }

                    const distance = Phaser.Math.Distance.Between(
                        current.x, current.y, other.x, other.y
                    );

                    // Динамический порог на основе размеров кристаллов
                    // Алгоритм: для определения соприкосновения двух кристаллов
                    // рассчитываем сумму их радиусов + небольшой зазор.
                    // Это обеспечивает корректную работу с кристаллами разных размеров:
                    // - маленький + маленький (1+1): 15+15+5 = 35px
                    // - маленький + большой (1+3): 15+45+5 = 65px
                    // - большой + большой (4+4): 60+60+5 = 125px
                    const currentSize = current.getData('size') || 1;
                    const otherSize = other.getData('size') || 1;
                    const currentRadius = 15 * currentSize;
                    const otherRadius = 15 * otherSize;
                    const threshold = currentRadius + otherRadius + 5; // +5 для небольшого зазора

                    console.log(`  - Crystal ${color} at (${other.x.toFixed(1)}, ${other.y.toFixed(1)}): distance=${distance.toFixed(1)}, threshold=${threshold.toFixed(1)}`);

                    if (distance < threshold) {
                        console.log(`    -> ADDING to stack! Distance ${distance.toFixed(1)} < ${threshold.toFixed(1)}`);
                        stack.push(other);
                    } else {
                        console.log(`    -> Too far. Distance ${distance.toFixed(1)} >= ${threshold.toFixed(1)}`);
                    }
                });

                console.log(`Stack size after checking neighbors: ${stack.length}`);
            }

            if (group.length >= 1) {
                console.log(`=== Group completed: ${color} with ${group.length} crystals ===\n`);
                groups.push(group);
            }
        });

        return groups;
    }

    removeMatches(crystals) {
        console.log(`Removing ${crystals.length} crystals from match`);
        let points = crystals.length * 10;
        let starsEarned = 0;

        crystals.forEach(crystal => {
            console.log(`Processing crystal: ${crystal.getData('color')}, size: ${crystal.getData('size')}`);

            if (crystal.getData('isStar')) {
                starsEarned++;
            }

            const currentSize = crystal.getData('size');
            if (currentSize > 1) {
                console.log(`Reducing crystal size from ${currentSize} to ${currentSize - 1}`);
                const newSize = currentSize - 1;
                crystal.setData('size', newSize);
                crystal.setScale(newSize);
                points += 5;

                const baseRadius = 15; // базовый радиус
                const x = crystal.x;
                const y = crystal.y;

                // Безопасно удаляем старое физическое тело
                if (crystal.body && this.matter.world) {
                    try {
                        this.matter.world.remove(crystal.body);
                    } catch (e) {
                        console.warn('Error removing old physics body:', e);
                    }
                }

                // Создаем новое физическое тело как полноценный физический кристалл
                const tempCrystal = this.matter.add.image(x, y, crystal.texture.key, null, {
                    shape: {
                        type: 'polygon',
                        sides: 8,
                        radius: baseRadius
                    },
                    restitution: 0.1,
                    friction: 0.8,
                    frictionAir: 0.02,
                    density: 0.001,
                    label: 'crystal'
                });

                // Масштабируем новое физическое тело под нужный размер
                tempCrystal.setScale(newSize);

                // Переносим физическое тело на исходный кристалл
                crystal.body = tempCrystal.body;
                tempCrystal.body.gameObject = crystal;

                // Удаляем временный объект, оставляя только его физическое тело
                tempCrystal.body = null; // отсоединяем тело перед удалением
                tempCrystal.destroy();

                this.tweens.add({
                    targets: crystal,
                    scaleX: newSize * 1.2,
                    scaleY: newSize * 1.2,
                    duration: 200,
                    yoyo: true,
                    onComplete: () => {
                        crystal.setScale(newSize);
                    }
                });
            } else {
                console.log(`Destroying crystal completely`);

                // Сначала удаляем из массивов
                const index = this.basketCrystals.indexOf(crystal);
                if (index > -1) {
                    this.basketCrystals.splice(index, 1);
                }

                // Сохраняем ссылку на физическое тело до анимации
                const physicsBody = crystal.body;

                this.tweens.add({
                    targets: crystal,
                    alpha: 0,
                    scale: 0.5,
                    duration: 300,
                    onComplete: () => {
                        // Безопасно удаляем физическое тело
                        if (physicsBody && this.matter.world) {
                            try {
                                this.matter.world.remove(physicsBody);
                            } catch (e) {
                                console.warn('Error removing physics body:', e);
                            }
                        }

                        // Очищаем ссылку на тело
                        if (crystal.body) {
                            crystal.body = null;
                        }

                        crystal.destroy();
                    }
                });
            }
        });

        this.score += points;
        this.stars += starsEarned;

        this.updateUI();
    }

    shakeBasket() {
        if (this.stars <= 0) return;

        this.stars--;

        this.tweens.add({
            targets: this.basket,
            x: this.basket.x + 10,
            duration: 100,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.basketCrystals.forEach(crystal => {
                    if (crystal.body) {
                        const forceX = Phaser.Math.Between(-0.005, 0.005);
                        const forceY = Phaser.Math.Between(-0.008, -0.003);
                        this.matter.body.applyForce(crystal.body,
                            { x: crystal.x, y: crystal.y },
                            { x: forceX, y: forceY }
                        );
                    }
                });

                this.time.delayedCall(2000, () => {
                    console.log('Checking matches after basket shake');
                    this.checkForMatches();
                });
            }
        });

        this.updateUI();
    }

    onLeftPressed() {
        this.isLeftPressed = true;
    }

    onLeftReleased() {
        this.isLeftPressed = false;
    }

    onRightPressed() {
        this.isRightPressed = true;
    }

    onRightReleased() {
        this.isRightPressed = false;
    }

    onDownPressed() {
        this.isDownPressed = true;
        if (this.activeCrystal && this.activeCrystal.getData('isFalling')) {
            this.activeCrystal.setData('fallSpeed', this.fastFallSpeed);
        }
    }

    onDownReleased() {
        this.isDownPressed = false;
        if (this.activeCrystal && this.activeCrystal.getData('isFalling')) {
            this.activeCrystal.setData('fallSpeed', this.fallSpeed);
        }
    }

    handleClick(pointer) {

    }

    handleAnyKey(event) {
        console.log('Key pressed! gameStarted:', this.gameStarted, 'gameOver:', this.gameOver);
        if (!this.gameStarted && !this.gameOver) {
            // Начало игры
            console.log('Starting game');
            this.startGame();
        } else if (this.gameOver) {
            // Перезапуск игры
            console.log('Restarting game');
            this.restartGame();
        }
    }

    startGame() {
        this.gameStarted = true;
        this.hideStartScreen();
        this.showGameUI();
    }

    restartGame() {
        console.log('Restarting game - clearing elements');

        // Останавливаем таймеры
        if (this.matchCheckTimer) this.matchCheckTimer.remove();
        if (this.checkMatchesTimer) this.checkMatchesTimer.remove();

        // Останавливаем физику и очищаем мир
        this.matter.world.enabled = false;

        // Добавляем небольшую задержку перед перезапуском
        this.time.delayedCall(500, () => {
            this.scene.restart();
        });
    }

    updateUI() {
        this.scoreText.setText(`Score: ${this.score}`);
        this.starsText.setText(`Stars: ${this.stars}`);
    }

    endGame() {
        this.gameOver = true;
        this.needSpawn = false
        // this.crystalSpawnTimer.remove();
        if (this.matchCheckTimer) this.matchCheckTimer.remove();
        if (this.checkMatchesTimer) this.checkMatchesTimer.remove();

        this.gameOverBg = this.add.rectangle(400, 300, 400, 250, 0x000000, 0.8);
        this.gameOverTitle = this.add.text(400, 260, 'GAME OVER', {
            fontSize: '32px',
            fill: '#ff0000',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        this.finalScoreText = this.add.text(400, 300, `Final Score: ${this.score}`, {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.time.delayedCall(500, () => {
            this.restartText = this.add.text(400, 340, 'Нажмите любую клавишу, чтобы перезапустить', {
                fontSize: '16px',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif'
            }).setOrigin(0.5);
        });
    }

    update() {
        if (this.gameOver || !this.gameStarted) return;
        if (this.needSpawn) this.spawnCrystal()
        for (let i = this.crystals.length - 1; i >= 0; i--) {
            const crystal = this.crystals[i];

            if (crystal.getData('isFalling')) {
                const fallSpeed = crystal.getData('fallSpeed') || this.fallSpeed;
                crystal.y += fallSpeed;

                // Проверяем, находится ли кристалл внутри корзины
                const isInsideBasket = crystal.x >= this.basketBounds.left && crystal.x <= this.basketBounds.right;

                if (isInsideBasket) {
                    // Проверяем касание дна корзины
                    if (crystal.y >= this.basketBounds.bottom - 20) {
                        this.handleFallingCrystalReachedBasket(crystal);
                        this.crystals.splice(i, 1);
                    }
                    // Проверяем столкновение с другими кристаллами в корзине
                    else if (this.checkCollisionWithBasketCrystals(crystal)) {
                        console.log('Falling crystal hit basket crystal, activating physics');
                        const physicsCrystal = this.activatePhysicsForCrystal(crystal);
                        if (physicsCrystal) {
                            // Добавляем небольшую скорость вниз для естественного падения
                            this.matter.body.setVelocity(physicsCrystal.body, { x: 0, y: 3 });
                            this.handleCrystalInBasket(physicsCrystal);
                            if (physicsCrystal.y < this.basketBounds.top - 100) this.endGame()

                        }
                        this.crystals.splice(i, 1);
                    }
                } else if (crystal.y > 650) {
                    crystal.destroy();
                    this.crystals.splice(i, 1);
                }
            } else if (crystal.body && crystal.y > 650) {
                this.matter.world.remove(crystal.body);
                crystal.destroy();
                this.crystals.splice(i, 1);
            }
        }

        // Плавное управление активным кристаллом
        if (this.activeCrystal && !this.gameOver && this.activeCrystal.getData('isFalling')) {
            const size = this.activeCrystal.getData('size') || 1;
            const radius = 15 * size;

            // Границы движения с учетом размера кристалла и границ корзины
            const leftBound = this.basketBounds.left + radius;
            const rightBound = this.basketBounds.right - radius;

            if (this.isLeftPressed) {
                this.activeCrystal.x = Math.max(leftBound, this.activeCrystal.x - this.crystalMoveSpeed);
            }
            if (this.isRightPressed) {
                this.activeCrystal.x = Math.min(rightBound, this.activeCrystal.x + this.crystalMoveSpeed);
            }
        }

        if (this.time.now - this.lastMotionCheck > 2000) {
            this.checkCrystalMotion();
            this.lastMotionCheck = this.time.now;
        }
    }

    checkCollisionWithBasketCrystals(fallingCrystal) {
        if (this.basketCrystals.length === 0) return false;

        const fallingSize = fallingCrystal.getData('size') || 1;
        const fallingRadius = 15 * fallingSize;

        for (let basketCrystal of this.basketCrystals) {
            const basketSize = basketCrystal.getData('size') || 1;
            const basketRadius = 15 * basketSize;

            const distance = Phaser.Math.Distance.Between(
                fallingCrystal.x, fallingCrystal.y,
                basketCrystal.x, basketCrystal.y
            );

            const collisionDistance = fallingRadius + basketRadius;

            if (distance <= collisionDistance) {
                console.log(`Collision detected: distance=${distance.toFixed(1)}, threshold=${collisionDistance.toFixed(1)}`);
                return true;
            }
        }

        return false;
    }

    checkCrystalMotion() {
        if (this.basketCrystals.length === 0) return;

        let totalMotion = 0;
        let crystalCount = 0;

        this.basketCrystals.forEach(crystal => {
            if (crystal.body && crystal.body.velocity) {
                const velocity = Math.abs(crystal.body.velocity.x) + Math.abs(crystal.body.velocity.y);
                totalMotion += velocity;
                crystalCount++;
            }
        });

        if (crystalCount > 0) {
            const averageMotion = totalMotion / crystalCount;
            console.log(`Average crystal motion: ${averageMotion.toFixed(3)}`);

            if (averageMotion < this.motionThreshold) {
                console.log('Crystals have settled, checking for matches');
                this.checkForMatches();
            }
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2c1810',
    scene: JewelDropGame,
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0.8 },
            debug: true,
            enableSleeping: false
        }
    },
};

const game = new Phaser.Game(config);
