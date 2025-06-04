class scene1 extends Phaser.Scene {

    constructor () {
        super ("nivel1");
        // Inicializar variables de la escena si es necesario
        this.music = null;
    }

    preload () {
        console.log("GH_DEBUG: scene1 preload() INICIO");
        // Verifica que estas rutas y nombres sean EXACTOS a tus archivos en GitHub
        this.load.image("fondo","assets/Background.png");
        this.load.spritesheet("jugador","assets/jugador.png",{frameWidth:23, frameHeight:22});
        this.load.image("Pisos","assets/Pisos.png");
        this.load.image("decoration", "assets/decoration.png");
        this.load.tilemapTiledJSON("tilemap","assets/PisosJuego.json");
        // this.load.image("EnemigosEsqueletos","assets/enemigo.png"); // No se usa en scene1
        // this.load.image("bala", "assets/bala.png"); // No se usa en scene1
        this.load.image("back2", "assets/background2.png");
        this.load.audio("musica_nivel1", "assets/musica.mp3");

        this.load.on('loaderror', function (file) {
            console.error('GH_DEBUG: Error cargando asset:', file.key, file.url, file.xhrLoader && file.xhrLoader.status);
        });
        this.load.on('complete', function () {
            console.log('GH_DEBUG: scene1 preload() FIN - Carga de assets completada.');
        });
        console.log("GH_DEBUG: scene1 preload() FIN de configuración de carga.");
    }

    create () {
        console.log("GH_DEBUG: scene1 create() INICIO");

        const worldWidth = 3840;
        const worldHeight = 1080;

        // Fondos (usando tu método original por ahora para simplificar la depuración del movimiento)
        // Si estos no aparecen, es un problema de carga de assets (revisar consola y rutas)
        this.add.image(100,600,"back2").setScale(1).setDepth(-2).setScrollFactor(0.3);
        this.add.image(800,600,"back2").setScale(1).setDepth(-2).setScrollFactor(0.3); // Asegúrate que este X sea el correcto
        this.add.image(500,600,"fondo").setScale(1).setDepth(-1).setScrollFactor(0.6);
        // Continuar con los demás fondos si es necesario, ajustando depth y scrollFactor
        let fondoPositions = [800, 1400, 1900, 2400, 2700, 3100, 3500];
        fondoPositions.forEach(posX => {
            this.add.image(posX, 850, "fondo").setScale(1).setDepth(-1).setScrollFactor(0.6);
        });
        console.log("GH_DEBUG: Fondos manuales añadidos (si las texturas cargaron).");


        var map = this.make.tilemap({key:"tilemap"});
        var tilesetPisos = map.addTilesetImage("aaaaa", "Pisos"); // Nombre del tileset en Tiled
        var tilesetDecor = map.addTilesetImage("decoration", "decoration"); // Nombre del tileset en Tiled

        var capaDecorFondo = map.createLayer("Decoraciones_Fondo", tilesetDecor);
        var capaFondo = map.createLayer("PisosDelJuego", tilesetPisos);
        capaFondo.setCollisionByProperty({colision:true});
        console.log("GH_DEBUG: Tilemap y capas creadas.");

        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // JUGADOR
        jugador = this.physics.add.sprite(200, 800,"jugador"); // Asigna a la variable global
        if (jugador && jugador.body) {
            jugador.setScale(1);
            jugador.setCollideWorldBounds(true);
            jugador.body.setSize(18, 18);
            jugador.body.setOffset(3, 5);
            console.log("GH_DEBUG: Jugador creado y configurado:", jugador);
        } else {
            console.error("GH_DEBUG: ¡Error al crear el jugador!");
        }
        

        var capaDecorFrente = map.createLayer("Decoraciones_Frente", tilesetDecor);

        // ANIMACIONES
        if (!this.anims.exists('caminar')) { // Evita recrear animaciones si la escena se reinicia
            this.anims.create({
                key: 'caminar',
                frames: this.anims.generateFrameNumbers('jugador', { start: 1, end: 7 }),
                frameRate: 8,
                repeat: -1,
                yoyo: true
            });
            this.anims.create({ key: 'reposo', frames: [ { key: 'jugador', frame: 0 } ], frameRate: 10 });
            // Asegúrate de tener 'mirar_arriba' si lo usas, aunque no es para movimiento.
            // this.anims.create({ key: 'mirar_arriba', frames: [ { key: 'jugador', frame: 0 } ], frameRate: 10 });
            console.log("GH_DEBUG: Animaciones creadas.");
        }


        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(jugador, true, 0.08, 0.08, 0, 40); // offsetY = 40 para que el jugador esté algo arriba del centro
        this.cameras.main.setZoom(3.5);

        // CURSORES
        cursors = this.input.keyboard.createCursorKeys(); // Asigna a la variable global
        if (cursors) {
            console.log("GH_DEBUG: Objeto cursors creado:", cursors);
        } else {
            console.error("GH_DEBUG: ¡Error al crear cursors!");
        }
        
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        this.physics.add.collider(jugador,capaFondo);

        let helpText = this.add.text(this.cameras.main.width / 2, 30, 'Usa las flechas para moverte y saltar.\nLlega al final del camino.', {
            fontSize: '20px', // Ajustado para el zoom
            fill: '#FFFFFF',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        });
        helpText.setOrigin(0.5).setScrollFactor(0); // ScrollFactor 0 para que se quede fijo

        // Profundidades
        if (capaDecorFondo) capaDecorFondo.setDepth(0);
        capaFondo.setDepth(1);
        if (jugador) jugador.setDepth(2);
        if (capaDecorFrente) capaDecorFrente.setDepth(3);
        helpText.setDepth(4);

        // Música
        if (this.music && this.music.isPlaying) {
            // No hacer nada si ya está sonando (ej. por reinicio de escena rápido)
        } else {
            this.music = this.sound.add('musica_nivel1', { loop: true, volume: 0.5 });
            if (this.music) {
                this.music.play();
                console.log("GH_DEBUG: Música iniciada.");
            } else {
                console.error("GH_DEBUG: Error al crear objeto de música.");
            }
        }
        console.log("GH_DEBUG: scene1 create() FINALIZADO.");
    }

    update(time, delta) { // Añadido time y delta por si los necesitas para depurar
        // Descomenta esto con cuidado, genera MUCHOS mensajes:
        // console.log("GH_DEBUG: scene1 update() - time:", time);

        if (!jugador || !jugador.active || !jugador.body) { // Comprobación robusta de que el jugador existe y está activo
            // console.error("GH_DEBUG: Jugador no disponible en update."); // Puede ser muy ruidoso
            return;
        }
        if (!cursors) {
            console.error("GH_DEBUG: Cursors no disponible en update.");
            return;
        }

        if (this.rKey && this.rKey.isDown) {
            console.log("GH_DEBUG: Tecla R presionada - Reiniciando escena.");
            if (this.music && this.music.isPlaying) this.music.stop();
            this.scene.restart();
            return; // Evita más procesamiento en este frame
        }

        if (jugador.x > 3800) {
            console.log("GH_DEBUG: Jugador superó x=3800 - Cambiando a nivel2.");
            if (this.music && this.music.isPlaying) this.music.stop();
            this.scene.start('nivel2', { score: this.score || 0 }); // Pasa el score que tengas
            return; // Evita más procesamiento en este frame
        }

        // Lógica de movimiento
        if (cursors.left.isDown) {
            jugador.setVelocityX(-160); // Velocidad unificada
            jugador.setFlipX(true);
            jugador.anims.play('caminar', true);
        } else if (cursors.right.isDown) {
            jugador.setVelocityX(160); // Velocidad unificada
            jugador.setFlipX(false);
            jugador.anims.play('caminar', true);
        } else {
            jugador.setVelocityX(0);
            if (jugador.body.onFloor()) {
                jugador.anims.play('reposo');
            }
        }
        
        if (cursors.up.isDown && jugador.body.onFloor()) {
            jugador.setVelocityY(-330);
        }
    }
}