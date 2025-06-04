class scene1 extends Phaser.Scene {

    constructor () {
        super ("nivel1");
        // Definir propiedades de la escena, en lugar de depender de globales para estos
        this.jugador = null;
        this.cursors = null;
        this.rKey = null;
        this.music = null;
        // this.score no necesita this aquí porque se pasa/maneja en init/create
    }

    preload () {
        console.log("GH_PAGES_DEBUG: scene1 preload() INICIO");
        // Verifica que estas rutas y nombres sean EXACTOS a tus archivos en GitHub
        this.load.image("fondo","assets/Background.png");
        this.load.spritesheet("jugador","assets/jugador.png",{frameWidth:23, frameHeight:22});
        this.load.image("Pisos","assets/Pisos.png");
        this.load.image("decoration", "assets/decoration.png");
        this.load.tilemapTiledJSON("tilemap","assets/PisosJuego.json");
        // this.load.image("EnemigosEsqueletos","assets/enemigo.png"); // No se usa directamente en scene1
        // this.load.image("bala", "assets/bala.png"); // No se usa directamente en scene1
        this.load.image("back2", "assets/background2.png");
        this.load.audio("musica_nivel1", "assets/musica.mp3");

        this.load.on('loaderror', function (file) {
            console.error('GH_PAGES_DEBUG: Error cargando asset:', file.key, file.url, file.xhrLoader && file.xhrLoader.status);
        });
        this.load.on('complete', function () {
            console.log('GH_PAGES_DEBUG: scene1 preload() FIN - Carga de assets completada.');
        });
        console.log("GH_PAGES_DEBUG: scene1 preload() FIN de configuración de carga.");
    }

    create () {
        console.log("GH_PAGES_DEBUG: scene1 create() INICIO");

        const worldWidth = 3840;
        const worldHeight = 1080;

        // Fondos (usando tu método original, asegúrate que las texturas carguen)
        this.add.image(100,600,"back2").setScale(1).setDepth(-2).setScrollFactor(0.3);
        this.add.image(800,600,"back2").setScale(1).setDepth(-2).setScrollFactor(0.3);
        this.add.image(500,600,"fondo").setScale(1).setDepth(-1).setScrollFactor(0.6);
        let fondoPositions = [800, 1400, 1900, 2400, 2700, 3100, 3500];
        fondoPositions.forEach(posX => {
            this.add.image(posX, 850, "fondo").setScale(1).setDepth(-1).setScrollFactor(0.6);
        });
        console.log("GH_PAGES_DEBUG: Fondos manuales añadidos (si las texturas cargaron).");


        var map = this.make.tilemap({key:"tilemap"});
        var tilesetPisos = map.addTilesetImage("aaaaa", "Pisos");
        var tilesetDecor = map.addTilesetImage("decoration", "decoration");

        var capaDecorFondo = map.createLayer("Decoraciones_Fondo", tilesetDecor);
        var capaFondo = map.createLayer("PisosDelJuego", tilesetPisos);
        capaFondo.setCollisionByProperty({colision:true});
        console.log("GH_PAGES_DEBUG: Tilemap y capas creadas.");

        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // JUGADOR - Usando this.jugador
        this.jugador = this.physics.add.sprite(200, 800,"jugador");
        if (this.jugador && this.jugador.body) {
            this.jugador.setScale(1);
            this.jugador.setCollideWorldBounds(true);
            this.jugador.body.setSize(18, 18);
            this.jugador.body.setOffset(3, 5);
            console.log("GH_PAGES_DEBUG: Jugador (this.jugador) creado y configurado:", this.jugador);
        } else {
            console.error("GH_PAGES_DEBUG: ¡Error al crear this.jugador!");
        }
        

        var capaDecorFrente = map.createLayer("Decoraciones_Frente", tilesetDecor);

        // ANIMACIONES (Asegúrate que 'jugador' sea la clave correcta de tu spritesheet)
        if (this.anims.get('caminar')) { // Verifica si la animación ya existe
             console.log("GH_PAGES_DEBUG: Animación 'caminar' ya existe.");
        } else {
            this.anims.create({
                key: 'caminar',
                frames: this.anims.generateFrameNumbers('jugador', { start: 1, end: 7 }),
                frameRate: 8,
                repeat: -1,
                yoyo: true
            });
            console.log("GH_PAGES_DEBUG: Animación 'caminar' creada.");
        }
        if (this.anims.get('reposo')) {
            console.log("GH_PAGES_DEBUG: Animación 'reposo' ya existe.");
        } else {
            this.anims.create({ key: 'reposo', frames: [ { key: 'jugador', frame: 0 } ], frameRate: 10 });
            console.log("GH_PAGES_DEBUG: Animación 'reposo' creada.");
        }
        // Si usas 'mirar_arriba' y no está definida globalmente, defínela aquí también.
        if (!this.anims.get('mirar_arriba')) {
             this.anims.create({ key: 'mirar_arriba', frames: [ { key: 'jugador', frame: 0 } ], frameRate: 10 });
        }


        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.jugador, true, 0.08, 0.08, 0, 40); // Sigue a this.jugador
        this.cameras.main.setZoom(3.5);

        // CURSORES - Usando this.cursors
        this.cursors = this.input.keyboard.createCursorKeys();
        if (this.cursors) {
            console.log("GH_PAGES_DEBUG: Objeto cursors (this.cursors) creado:", this.cursors);
        } else {
            console.error("GH_PAGES_DEBUG: ¡Error al crear this.cursors!");
        }
        
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        this.physics.add.collider(this.jugador,capaFondo); // Colisiona con this.jugador

        let helpText = this.add.text(this.cameras.main.width / 2, 30, 'Usa las flechas para moverte y saltar.\nLlega al final del camino.', {
            fontSize: '20px',
            fill: '#FFFFFF',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        });
        helpText.setOrigin(0.5).setScrollFactor(0); // CORREGIDO: ScrollFactor 0 para que se quede fijo

        // Profundidades
        if (capaDecorFondo) capaDecorFondo.setDepth(0);
        capaFondo.setDepth(1);
        if (this.jugador) this.jugador.setDepth(2);
        if (capaDecorFrente) capaDecorFrente.setDepth(3);
        helpText.setDepth(4);

        // Música
        // Detener música previa si existe y está sonando (importante para reinicios)
        if (this.sound.get('musica_nivel1') && this.sound.get('musica_nivel1').isPlaying) {
            this.sound.get('musica_nivel1').stop();
            console.log("GH_PAGES_DEBUG: Música previa 'musica_nivel1' detenida.");
        }
        this.music = this.sound.add('musica_nivel1', { loop: true, volume: 0.5 });
        if (this.music) {
            this.music.play();
            console.log("GH_PAGES_DEBUG: Música 'musica_nivel1' iniciada.");
        } else {
            console.error("GH_PAGES_DEBUG: Error al crear objeto de música 'musica_nivel1'.");
        }
        console.log("GH_PAGES_DEBUG: scene1 create() FINALIZADO.");
    }

    update(time, delta) {
        // Es buena práctica verificar que los objetos existen antes de usarlos en update
        if (!this.jugador || !this.jugador.active || !this.jugador.body) {
            // console.warn("GH_PAGES_DEBUG: this.jugador no disponible en update de scene1.");
            return;
        }
        if (!this.cursors) {
            console.warn("GH_PAGES_DEBUG: this.cursors no disponible en update de scene1.");
            return;
        }

        if (this.rKey && this.rKey.isDown) {
            console.log("GH_PAGES_DEBUG: Tecla R presionada - Reiniciando scene1.");
            if (this.music && this.music.isPlaying) this.music.stop();
            this.scene.restart(); // Phaser se encarga de llamar a init() y create() de nuevo
            return;
        }

        if (this.jugador.x > 3800) {
            console.log("GH_PAGES_DEBUG: Jugador superó x=3800 - Cambiando a nivel2.");
            if (this.music && this.music.isPlaying) this.music.stop();
            this.scene.start('nivel2', { score: this.score || 0 });
            return;
        }

        // Lógica de movimiento usando this.jugador y this.cursors
        if (this.cursors.left.isDown) {
            this.jugador.setVelocityX(-160); // Unificada velocidad
            this.jugador.setFlipX(true);
            this.jugador.anims.play('caminar', true);
        } else if (this.cursors.right.isDown) {
            this.jugador.setVelocityX(160); // Unificada velocidad
            this.jugador.setFlipX(false);
            this.jugador.anims.play('caminar', true);
        } else {
            this.jugador.setVelocityX(0);
            if (this.jugador.body.onFloor()) {
                this.jugador.anims.play('reposo');
            }
        }
        
        if (this.cursors.up.isDown && this.jugador.body.onFloor()) {
            this.jugador.setVelocityY(-330);
        }
    }
}
