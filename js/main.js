class Game {
    constructor() {
        this.player = null;
        this.planes = []; //will hold instances of the class Planes
        this.time = 0;
        this.randomPlaneInterval = Math.floor(Math.random() * (300 - 100 + 1) + 100);
    }

    start() {

        this.player = new Player();
        this.detectPlayerMovement();
        this.width = 50;
        this.height = 75;
        this.movementAmount = 3;

        // Create planes
        setInterval(() => {
            this.time++;
            if (this.time % 10 === 0) {
                if (this.planes.length <= 3) { // limit to 4 planes for initial level
                    const newPlane = new Plane();
                    this.planes.push(newPlane);
                }
            }
        }, this.randomPlaneInterval);

        // Move Planes
        setInterval(() => {
            this.planes.forEach((planeInstance) => {

                // move current plane
                planeInstance.moveLeft();

                // check if we need to remove current plane
                this.removePlaneIfOutside(planeInstance);
                
            });
        }, 150);

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

    // remove plane if it's outside the game div
    removePlaneIfOutside(planeInstance) {
        this.gameElmWidth = document.getElementById("game").offsetWidth;
        if (planeInstance.positionX >= this.gameElmWidth + (planeInstance.width / 2)) {
            planeInstance.domElement.remove(); // remove dom element
            for (let i=0; i < this.planes.length; i++) {
                if (this.planes[i] === planeInstance) {
                    this.planes.splice(i, 1); // removes the instance at the index of the array
                    i--;
                }
            }
        }
    }
    
}

class Player {
    constructor() {
        // target element + width and height of this element
        this.gameElm = document.getElementById("game");
        this.gameElmWidth = this.gameElm.offsetWidth;
        this.gameElmHeight = this.gameElm.offsetHeight;
        // use pixels after finding div width and height -> to implement on window resizing
        this.width = 50;
        this.height = 75;
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

class Plane {
    constructor() {
        // target element + width and height of this element
        this.gameElm = document.getElementById("game");
        this.gameElmWidth = this.gameElm.offsetWidth;
        this.gameElmHeight = this.gameElm.offsetHeight;
        this.width = 200;
        this.height = 50;
        this.positionX = -190;
        this.positionY = Math.floor(Math.random() * ((this.gameElmHeight - this.height) - (this.gameElmHeight / 2) + 1) + (this.gameElmHeight / 2));
        this.movementAmount = Math.floor(Math.random() * (50 - 20 + 1) + 20);

        this.domElement = null;
        this.createDomElement();
    }
    createDomElement() {
        // step1: create the element:
        this.domElement = document.createElement('div');

        // step2: add content or modify (ex. innerHTML...)
        this.domElement.className = "plane";
        this.domElement.style.width = this.width + "px";
        this.domElement.style.height = this.height + "px";
        this.domElement.style.bottom = this.positionY + "px";
        this.domElement.style.left = this.positionX - this.width + "px";

        //step3: append to the dom: `parentElm.appendChild()`
        const boardElm = document.getElementById("game");
        boardElm.appendChild(this.domElement);
    }
    moveLeft() {
        this.positionX = this.positionX + this.movementAmount;
        this.domElement.style.left = this.positionX + "px";
    }
}

const game = new Game();
game.start();