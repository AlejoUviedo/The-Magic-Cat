// Declaramos las variables globales fuera de la función
var game;
var jugador;
var cursors;
var Enemigos;

// La configuración del juego no cambia
var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720,
    },
    parent: 'game-container', 
    render: {
        pixelArt: true
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 750 },
            debug: false
        }
    },
    scene: [scene1, scene2, scene3, scene4]
};

// MODIFICADO: La función ahora se llama directamente para iniciar el juego en segundo plano.
function launchGame() {
    game = new Phaser.Game(config);
}