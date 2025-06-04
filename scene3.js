class scene3 extends Phaser.Scene {

    constructor () {
        super ("nivel3");
        this.score = 0;
        this.timeLeft = 3; // Tiempo de supervivencia
    }

    init(data) {
        this.score = data.score || 0;
        // CORREGIDO: El tiempo de supervivencia se reinicia a 30 segundos.
        this.timeLeft = 3;
    }

    create () {
        // --- CONFIGURACIÓN DEL ENTORNO ---
        this.add.image(100,500,"back2").setScale(4);
        this.add.image(800,500,"back2").setScale(4);
        this.add.image(500,850,"fondo").setScale(1).setTint(0xFF4444);
        this.add.image(800,850,"fondo").setScale(1).setTint(0xFF4444);
        this.add.image(1400,850,"fondo").setScale(1).setTint(0xFF4444);

        var map = this.make.tilemap({key:"tilemap"});
        var tilesetPisos = map.addTilesetImage("aaaaa", "Pisos");
        var capaFondo = map.createLayer("PisosDelJuego", tilesetPisos);
        capaFondo.setCollisionByProperty({colision:true});

        // Arena más pequeña para el modo horda
        const worldWidth = 1280; 
        const worldHeight = 1080;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        jugador=this.physics.add.sprite(worldWidth / 2, 800,"jugador");
        jugador.setScale(1);
        jugador.setCollideWorldBounds(true);
        jugador.body.setSize(18, 18);
        jugador.body.setOffset(3, 5);
        jugador.active = true;
        jugador.clearTint(); // Limpiar tinte rojo al reiniciar

        this.anims.create({ key: 'caminar', frames: this.anims.generateFrameNumbers('jugador', { start: 1, end: 7 }), frameRate: 8, repeat: -1, yoyo: true });
        this.anims.create({ key: 'reposo', frames: [ { key: 'jugador', frame: 0 } ], frameRate: 10 });
        this.anims.create({ key: 'mirar_arriba', frames: [ { key: 'jugador', frame: 0 } ], frameRate: 10 });

        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(jugador, true, 0.08, 0.08, 0, 40);
        this.cameras.main.setZoom(2.5);

        // --- CONTROLES Y FÍSICA ---
        this.bullets = this.physics.add.group({ defaultKey: 'bala' });
        Enemigos =this.physics.add.group();

        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.on('pointerdown', () => { this.fireBullet(); }, this);

        this.physics.add.collider(jugador,capaFondo);
        this.physics.add.collider(Enemigos, capaFondo);
        this.physics.add.collider(this.bullets, Enemigos, this.hitEnemy, null, this);
        this.physics.add.collider(jugador, Enemigos, this.playerHit, null, this);

        // --- UI (Interfaz de Usuario) - CORREGIDO ---
        const gameWidth = this.cameras.main.width;
        const textStyle = { fontSize: '24px', fill: '#FFFFFF', stroke: '#000000', strokeThickness: 4 };
        
        // Puntuación a la izquierda
        this.scoreText = this.add.text(16, 16, 'Score: ' + this.score, textStyle)
            .setOrigin(0, 0)
            .setScrollFactor(0);
            
        // Tiempo centrado
        this.timerText = this.add.text(gameWidth / 2, 16, 'Sobrevive: ' + this.timeLeft, textStyle)
            .setOrigin(0.5, 0)
            .setScrollFactor(0);

        // --- TIMERS ---
        this.survivalTimer = this.time.addEvent({ delay: 1000, callback: this.onSecond, callbackScope: this, loop: true });
        this.spawnTimer = this.time.addEvent({ delay: 1500, callback: this.spawnEnemy, callbackScope: this, loop: true });

        this.physics.resume();
    }

    onSecond() {
        if (!jugador.active) return; // Detiene el contador si el jugador ha perdido

        if(this.timeLeft > 0){
            this.timeLeft--;
            this.timerText.setText('Sobrevive: ' + this.timeLeft);
        } else {
            // Detiene los timers y pasa al siguiente nivel
            this.spawnTimer.remove();
            this.survivalTimer.remove();
            this.scene.start('nivel4', { score: this.score });
        }
    }

    spawnEnemy() {
        const x = (Phaser.Math.Between(0, 1) === 0) ? -10 : this.physics.world.bounds.width + 10;
        const y = 800;
        const enemy = Enemigos.create(x, y, "EnemigosEsqueletos").setScale(0.1);
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(0.2);
    }
    
    fireBullet() {
        if (!jugador.active) return;
        const bullet = this.bullets.get(jugador.x, jugador.y);
        if (bullet) {
            bullet.setActive(true).setVisible(true).setScale(0.5).body.setAllowGravity(false);
            bullet.body.enable = true;
            const speed = 600;
            const diagSpeed = speed / Math.sqrt(2); 

            bullet.body.velocity.x = 0;
            bullet.body.velocity.y = 0;

            if (cursors.up.isDown) {
                if (cursors.left.isDown) { bullet.body.velocity.y = -diagSpeed; bullet.body.velocity.x = -diagSpeed; } 
                else if (cursors.right.isDown) { bullet.body.velocity.y = -diagSpeed; bullet.body.velocity.x = diagSpeed; }
                else { bullet.body.velocity.y = -speed; }
            } else if (cursors.down.isDown) {
                if (cursors.left.isDown) { bullet.body.velocity.y = diagSpeed; bullet.body.velocity.x = -diagSpeed; } 
                else if (cursors.right.isDown) { bullet.body.velocity.y = diagSpeed; bullet.body.velocity.x = diagSpeed; }
                else { bullet.body.velocity.y = speed; }
            } else if (cursors.left.isDown) { bullet.body.velocity.x = -speed; } 
            else if (cursors.right.isDown) { bullet.body.velocity.x = speed; } 
            else {
                const direction = jugador.flipX ? -1 : 1;
                bullet.body.velocity.x = speed * direction;
            }

            bullet.checkWorldBounds = true;
            bullet.body.onWorldBounds = true;
            bullet.body.world.once('worldbounds', (body) => {
                if (body.gameObject === bullet) {
                    bullet.setActive(false).setVisible(false).body.enable = false;
                }
            });
        }
    }

    hitEnemy(bullet, enemy) {
        bullet.setActive(false).setVisible(false).body.enable = false;
        enemy.destroy();
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }

    playerHit(player, enemy) {
        this.gameOver("¡TE HAN ATRAPADO!");
    }

    gameOver(message) {
        // Detener timers para que no siga la lógica del juego
        if(this.spawnTimer) this.spawnTimer.remove();
        if(this.survivalTimer) this.survivalTimer.remove();

        this.physics.pause();
        jugador.active = false;
        jugador.setTint(0xff0000);
        jugador.anims.play('reposo');

        const style = { fontSize: '64px', fill: '#FF0000', align: 'center', stroke: '#000000', strokeThickness: 8 };
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, message, style)
            .setOrigin(0.5)
            .setScrollFactor(0);
        
        // CORREGIDO: Lógica de reinicio automático después de 3 segundos
        this.time.delayedCall(3000, () => {
            this.scene.start('nivel1');
        }, [], this);
    }

    update () {
        if (this.rKey.isDown) { this.scene.start('nivel1'); }
        if (!jugador.active) return;

        Enemigos.children.each(function(enemy) {
            if (enemy.active) {
                const speed = Phaser.Math.Between(80, 120);
                if (enemy.x < jugador.x) { enemy.setVelocityX(speed); } 
                else { enemy.setVelocityX(-speed); }
            }
        }, this);

        if (cursors.left.isDown) {
            jugador.setVelocityX(-160);
            jugador.setFlipX(true);
            jugador.anims.play('caminar', true);
        } else if (cursors.right.isDown) {
            jugador.setVelocityX(160);
            jugador.setFlipX(false);
            jugador.anims.play('caminar', true);
        } else {
            jugador.setVelocityX(0);
            if (jugador.body.onFloor()) {
                if (cursors.up.isDown) {
                    jugador.anims.play('mirar_arriba', true);
                } else {
                    jugador.anims.play('reposo');
                }
            }
        }
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && jugador.body.onFloor()) {
            jugador.setVelocityY(-330);
        }
    }
}