class scene2 extends Phaser.Scene {

    constructor () {
        super ("nivel2");
        this.score = 0;
    }

    init(data) {
        this.score = data.score || 0;
    }

    create () {
        // --- INICIO: COPIA DE CONFIGURACIÓN DE MAPA Y ENTORNO DE SCENE1 ---
        this.add.image(500,800,"fondo").setScale(1).setTint(0xAAAAAA);
        this.add.image(800,800,"fondo").setScale(1).setTint(0xAAAAAA);
        this.add.image(1400,800,"fondo").setScale(1).setTint(0xAAAAAA);
        this.add.image(1900,800,"fondo").setScale(1).setTint(0xAAAAAA);
        this.add.image(2400,800,"fondo").setScale(1).setTint(0xAAAAAA);
        this.add.image(2700,800,"fondo").setScale(1).setTint(0xAAAAAA);
        this.add.image(3100,800,"fondo").setScale(1).setTint(0xAAAAAA);
        this.add.image(3500,800,"fondo").setScale(1).setTint(0xAAAAAA);

        var map = this.make.tilemap({key:"tilemap"});
        var tilesetPisos = map.addTilesetImage("aaaaa", "Pisos");
        var tilesetDecor = map.addTilesetImage("decoration", "decoration");

        var capaDecorFondo = map.createLayer("Decoraciones_Fondo", tilesetDecor);
        var capaFondo = map.createLayer("PisosDelJuego", tilesetPisos);
        capaFondo.setCollisionByProperty({colision:true});

        const worldWidth = 3840;
        const worldHeight = 1080;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        jugador = this.physics.add.sprite(200, 800,"jugador");
        jugador.setScale(1);
        jugador.setCollideWorldBounds(true);
        jugador.body.setSize(18, 18);
        jugador.body.setOffset(3, 5);
        jugador.active = true;
        jugador.setTint(0xffffff);

        var capaDecorFrente = map.createLayer("Decoraciones_Frente", tilesetDecor);

        this.anims.create({ key: 'caminar', frames: this.anims.generateFrameNumbers('jugador', { start: 1, end: 7 }), frameRate: 8, repeat: -1, yoyo: true });
        this.anims.create({ key: 'reposo', frames: [ { key: 'jugador', frame: 0 } ], frameRate: 10 });
        this.anims.create({ key: 'mirar_arriba', frames: [ { key: 'jugador', frame: 0 } ], frameRate: 10 });


        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(jugador, true, 0.08, 0.08, 0, 40);
        this.cameras.main.setZoom(3.5);
        // --- FIN: COPIA DE CONFIGURACIÓN DE MAPA Y ENTORNO DE SCENE1 ---

        // --- ELEMENTOS ESPECÍFICOS DE SCENE2 ---
        this.bullets = this.physics.add.group({ defaultKey: 'bala', maxSize: 10 });
        
        Enemigos =this.physics.add.group();
        // Crear varios enemigos
        this.spawnEnemy(1500);
        this.spawnEnemy(2000);
        this.spawnEnemy(2500);


        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.on('pointerdown', () => { this.fireBullet(); }, this);


        this.physics.add.collider(jugador,capaFondo);
        this.physics.add.collider(Enemigos, capaFondo); 
        this.physics.add.collider(this.bullets, Enemigos, this.hitEnemy, null, this);
        this.physics.add.collider(jugador, Enemigos, this.playerHit, null, this);


        // --- UI (Interfaz de Usuario) - MODIFICADO ---
        const gameWidth = this.cameras.main.width;
        
        // Texto de puntuación centrado
        this.scoreText = this.add.text(gameWidth / 2, 16, 'Score: ' + this.score, {
            fontSize: '20px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0).setScrollFactor(0);


        // Control de Profundidad para Scene 2
        if (capaDecorFondo) capaDecorFondo.setDepth(0);
        capaFondo.setDepth(1);
        Enemigos.setDepth(2);
        jugador.setDepth(2);
        this.bullets.setDepth(2);
        if (capaDecorFrente) capaDecorFrente.setDepth(3);
        this.scoreText.setDepth(4);
    }
    
    spawnEnemy(xPosition) {
        const enemy = Enemigos.create(xPosition, 800, "EnemigosEsqueletos").setScale(0.1);
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(0.2);
    }

    fireBullet() {
        if (!jugador.active) return;
        const bullet = this.bullets.get(jugador.x, jugador.y);
        if (bullet) {
            bullet.setActive(true).setVisible(true).setScale(0.5);
            bullet.body.setAllowGravity(false);
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
        this.gameOver("FIN DEL JUEGO");
    }
    
    gameOver(message) {
        this.physics.pause();
        jugador.active = false;
        jugador.setTint(0xff0000);
        jugador.anims.play('reposo');

        const style = { fontSize: '64px', fill: '#FF0000', align: 'center', stroke: '#000000', strokeThickness: 8 };
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, message, style)
            .setOrigin(0.5)
            .setScrollFactor(0);
        
        // Lógica de reinicio
        this.time.delayedCall(3000, () => {
            this.scene.start('nivel1');
        }, [], this);
    }


    update() {
        if (jugador.x > 3800) {
             this.scene.start('nivel3', { score: this.score });
        }
    
        if (this.rKey.isDown) { this.scene.restart({score: 0}); }
        if (!jugador.active) return;
        
        // Movimiento de los enemigos hacia el jugador
        Enemigos.children.each(function(enemy) {
            if (enemy.active) {
                const speed = 70;
                if (enemy.x > jugador.x) {
                    enemy.setVelocityX(-speed);
                    enemy.flipX = false;
                } else {
                    enemy.setVelocityX(speed);
                    enemy.flipX = true;
                }
            }
        });


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