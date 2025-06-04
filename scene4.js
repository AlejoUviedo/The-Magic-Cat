class scene4 extends Phaser.Scene {

    constructor () {
        super ("nivel4");
        this.score = 0;
    }

    init(data) {
        this.score = data.score || 0;
    }

    preload() {
        this.load.image("jefe", "assets/enemigo.png");
        this.load.image("bala_jefe", "assets/bala.png"); 
    }

    create () {
        // --- CONFIGURACIÓN DEL ENTORNO ---
        this.add.image(100,500,"back2").setScale(4);
        this.add.image(800,500,"back2").setScale(4);
        this.add.image(500,850,"fondo").setScale(1).setTint(0x4444FF);
        this.add.image(800,850,"fondo").setScale(1).setTint(0x4444FF);

        var map = this.make.tilemap({key:"tilemap"});
        var tilesetPisos = map.addTilesetImage("aaaaa", "Pisos");
        var capaFondo = map.createLayer("PisosDelJuego", tilesetPisos);
        capaFondo.setCollisionByProperty({colision:true});

        const worldWidth = 1280;
        const worldHeight = 1080;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        jugador=this.physics.add.sprite(200, 800,"jugador");
        jugador.setScale(1);
        jugador.setCollideWorldBounds(true);
        jugador.body.setSize(18, 18);
        jugador.body.setOffset(3, 5);
        jugador.active = true;
        jugador.setTint(0xffffff);
        
        this.anims.create({ key: 'mirar_arriba', frames: [ { key: 'jugador', frame: 0 } ], frameRate: 10 });


        // --- JEFE ---
        this.boss = this.physics.add.sprite(worldWidth / 2, 300, "jefe").setScale(0.4).setImmovable(true);
        this.boss.setCollideWorldBounds(true);
        this.boss.health = 20;
        this.boss.body.setAllowGravity(false);
        this.boss.isAttacking = false;

        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(jugador, true, 0.08, 0.08, 0, 40);
        this.cameras.main.setZoom(2.5);

        // --- CONTROLES Y FÍSICA ---
        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.on('pointerdown', () => { this.fireBullet(); }, this);

        this.bullets = this.physics.add.group({ defaultKey: 'bala' });
        this.bossBullets = this.physics.add.group();

        this.physics.add.collider(jugador, capaFondo);
        this.physics.add.collider(this.boss, capaFondo);
        this.physics.add.collider(this.bullets, this.boss, this.hitBoss, null, this);
        this.physics.add.collider(jugador, this.boss, this.playerHit, null, this);
        this.physics.add.collider(jugador, this.bossBullets, this.playerHit, null, this);


        // --- UI (Interfaz de Usuario) - MODIFICADO ---
        const gameWidth = this.cameras.main.width;
        const textStyle = { fontSize: '24px', fill: '#FFFFFF', stroke: '#000000', strokeThickness: 4 };

        // Puntuación a la izquierda
        this.scoreText = this.add.text(16, 16, 'Score: ' + this.score, textStyle)
            .setOrigin(0, 0)
            .setScrollFactor(0);

        // Vida del jefe a la derecha
        this.bossHealthText = this.add.text(gameWidth - 16, 16, 'Vida del Jefe: ' + this.boss.health, textStyle)
            .setOrigin(1, 0)
            .setScrollFactor(0);
        
        // --- IA DEL JEFE ---
        this.bossAIEvent = this.time.addEvent({
            delay: 2500,
            callback: this.bossAI,
            callbackScope: this,
            loop: true
        });
        this.boss.body.velocity.x = 150;

        this.physics.resume();
    }

    // ... (copiar las funciones bossAI, bossSwoopAttack, bossShootAttack de la versión anterior)
    bossAI() {
        if (this.boss.isAttacking || !this.boss.active) { return; }
        const attackChoice = Phaser.Math.Between(1, 10);
        if (attackChoice <= 6) { this.bossSwoopAttack(); } 
        else { this.bossShootAttack(); }
    }
    bossSwoopAttack() {
        if (this.boss.isAttacking) return;
        this.boss.isAttacking = true;
        this.boss.body.velocity.x = 0;
        const targetX = jugador.x;
        this.tweens.add({
            targets: this.boss, x: targetX, y: 700, duration: 700, ease: 'Power2', yoyo: true,
            onComplete: () => {
                this.boss.isAttacking = false;
                this.boss.body.velocity.x = 150 * (this.boss.x > jugador.x ? -1 : 1);
            }
        });
    }
    bossShootAttack() {
        if (this.boss.isAttacking) return;
        this.boss.isAttacking = true;
        this.boss.body.velocity.x = 0;
        this.time.addEvent({
            delay: 200, repeat: 2,
            callback: () => {
                const bullet = this.bossBullets.create(this.boss.x, this.boss.y + 50, 'bala_jefe');
                bullet.setScale(0.5).setTint(0xff00ff);
                bullet.body.setAllowGravity(false);
                bullet.body.velocity.y = 400;
            },
            callbackScope: this
        });
        this.time.delayedCall(1000, () => {
            this.boss.isAttacking = false;
            this.boss.body.velocity.x = 150 * (this.boss.x > jugador.x ? -1 : 1);
        }, [], this);
    }
    
    // ... (copiar la función fireBullet de la versión anterior)
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

    hitBoss(boss, bullet) {
        bullet.setActive(false).setVisible(false).body.enable = false;
        boss.health--;
        this.bossHealthText.setText('Vida del Jefe: ' + boss.health);
        this.score += 50;
        this.scoreText.setText('Score: ' + this.score);

        boss.setTint(0xff0000);
        this.time.delayedCall(100, () => {
            boss.clearTint();
        });

        if (boss.health <= 0) {
            this.boss.active = false;
            this.gameOver("¡HAS GANADO!", true);
        }
    }

    playerHit(player, entity) {
        if (this.bossBullets.contains(entity)) {
            entity.destroy();
        }
        this.gameOver("FIN DEL JUEGO", false);
    }

    // --- gameOver() con reinicio automático ---
    gameOver(message, isVictory) {
        if (this.bossAIEvent) this.bossAIEvent.destroy();
        this.physics.pause();
        jugador.active = false;
        jugador.setTint(0xff0000);
        jugador.anims.play('reposo');

        const style = {
            fontSize: '64px',
            fill: isVictory ? '#00FF00' : '#FF0000',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 8
        };
        // Mensaje centrado en la cámara
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, message, style)
            .setOrigin(0.5)
            .setScrollFactor(0);
        
        // Lógica de reinicio
        this.time.delayedCall(3000, () => {
            // Reinicia el juego desde el primer nivel, reseteando la puntuación
            this.scene.start('nivel1', { score: 0 });
        }, [], this);
    }

    update() {
        if (this.rKey.isDown) { this.scene.start('nivel1'); }
        if (!jugador.active) {
            return;
        }

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

        if(this.boss.active && !this.boss.isAttacking) {
            if (this.boss.body.x <= 0) {
                this.boss.body.velocity.x = 150;
            } else if (this.boss.body.right >= this.physics.world.bounds.width) {
                this.boss.body.velocity.x = -150;
            }
            if (this.boss.body.velocity.x < 0) {
                this.boss.setFlipX(true);
            } else {
                this.boss.setFlipX(false);
            }
        }
    }
}