class Game {
    constructor() {
        this.player = null;
        this.planes = []; //will hold instances of the class Planes
        this.time = 0;
        this.randomPlaneInterval = Math.floor(Math.random() * (200 - 100 + 1) + 100);        
    }

    start() {

        this.player = new Player();
        this.detectPlayerMovement();
        this.detectScreenResize();

    }

    // detect Player movement (Left / Right)
    detectPlayerMovement() {
        document.addEventListener('keydown', (event) => {
            if (event.key === "ArrowRight") {
                this.player.moveRight();
            } else if (event.key === "ArrowLeft") {
                this.player.moveLeft();
            }
        });
    }

    // detect Screen Resize
    detectScreenResize() {
        window.addEventListener('resize', (event) => {
            //this.gameElmWidth = document.getElementById('game').offsetWidth;
            //this.gameElmHeight = document.getElementById('game').offsetHeight;
            console.log("Screen resized");
        });
    }
}

class Player {
    constructor() {
        // target element + width and height of this element
        this.gameElm = document.getElementById("game");
        this.gameElmWidth = this.gameElm.offsetWidth;
        this.gameElmHeight = this.gameElm.offsetHeight;
        // use pixels after finding div width and height
        this.width = 50;
        this.height = 100;
        this.positionX = this.gameElmWidth - (this.gameElmWidth / 2);
        this.positionY = 0;
        this.movementAmount = 15;

        this.domElement = null;
        this.createDomElement();
    }

    createDomElement() {
        
        // step1: create the element:
        this.domElement = document.createElement('div');

        // step2: add content or modify (ex. innerHTML...)
        this.domElement.id = "player";
        this.domElement.style.width = this.width + "px";
        this.domElement.style.height = this.height + "px";
        this.domElement.style.bottom = this.positionY + "px";
        this.domElement.style.left = this.positionX + "px";

        //step3: append to the dom: `parentElm.appendChild()`
        this.gameElm.appendChild(this.domElement);
    }

    moveLeft() {
        if (this.positionX > 0) {
            this.positionX = this.positionX - this.movementAmount;
            this.domElement.style.left = this.positionX + "px";
        }        
    }

    moveRight() {
        if (this.positionX < (this.gameElmWidth - this.width)) {
            this.positionX = this.positionX + this.movementAmount;
            this.domElement.style.left = this.positionX + "px";
        }
    }
}

const game = new Game();
game.start();