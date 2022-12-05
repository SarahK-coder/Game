class Game {
    constructor() {
        this.player = null;

        this.time = 0; // time loop for create planes / bombs

        this.planes = []; // will hold instances of the class Planes
        this.randomPlaneInterval = Math.floor(Math.random() * (200 - 100 + 1) + 100);

        this.bombs = []; // holds instances of class Bomb
        this.randomBombInterval = Math.floor(Math.random() * (280 - 100 + 1) + 100);

        this.gameStatus = null;
        
    }

    start() {

        
        this.player = new Player();
        this.detectPlayerMovement();
        //this.width = 20; // player width
        //this.height = 75; // player height
        //this.movementAmount = 1; // player movement amount

      
        // Create planes
        setInterval(() => {
            this.time++;
            if (this.time % 10 === 0) {
                if (this.planes.length < 2) { // limit to 1 plane for initial level / testing
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
        }, 10); // move plane every xxx ms

        // Create bombs
        setInterval(() => {
            this.time++;
            if (this.time % 10 === 0) {
                if (this.bombs.length < 4) { // limit to 1 bomb for initial level / testing
                    this.planes.forEach((planeInstance) => {
                        //only drop bombs when plane is within the boundries of the game
                        if (planeInstance.positionX > 20 && planeInstance.positionX < (planeInstance.gameElmWidth - 20)) {
                            const newBomb = new Bomb(planeInstance);
                            this.bombs.push(newBomb);
                        }
                    });
                }
            }
        }, this.randomBombInterval);

        // Move Bombs
        setInterval(() => {
            this.bombs.forEach((bombInstance) => {
                // move current plane
                bombInstance.moveDown();
                
                //detect if there's a collision between player and current obstacle
                this.detectBombHitsPlayer(bombInstance);

                // check if we need to remove current plane
                this.removeBombIfOutside(bombInstance);
            });
        }, 25);

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

    // if bomb hits player -> Game Over
    detectBombHitsPlayer(bombInstance){
        if (
            this.player.positionX < bombInstance.positionX + bombInstance.width &&
            this.player.positionX + this.player.width > bombInstance.positionX &&
            this.player.positionY < bombInstance.positionY + bombInstance.height &&
            this.player.height + this.player.positionY > bombInstance.positionY
        ) {
            for (let i = 1; i < 99999; i++) {
                window.clearInterval(i);
            }
            this.gameOver();
        }
    }

    // remove bomb if it's outside the game div
    removeBombIfOutside(bombInstance) {
        if (bombInstance.positionY <= -5) {
            bombInstance.domElement.remove(); // remove dom element
            for (let i=0; i < this.bombs.length; i++) {
                if(this.bombs[i] === bombInstance) {
                    this.bombs.splice(i, 1); // removes the instance at the index of the array
                    i--;
                }
            }
        }
    }
    
    // Game Over
    gameOver() {
		console.log("GAME OVER !!! ");
        
        // target element + width and height of this element
        this.gameElm = document.getElementById("game");
        this.gameElmWidth = this.gameElm.offsetWidth;
        this.gameElmHeight = this.gameElm.offsetHeight;


        this.domElement = document.createElement('div');
        this.domElement.id = "game-over";
        this.domElement.style.width = (this.gameElmWidth / 3) + "px";
        this.domElement.style.height = (this.gameElmHeight / 4) + "px";
        this.domElement.style.left = (this.gameElmWidth / 3) + "px";
        this.domElement.style.top = (this.gameElmHeight / 3) + "px";
        this.domElement.innerHTML = `
        Game Over
        <button>Restart</button>
        `; // add an eventlistener to reload game
        //step3: append to the dom: `parentElm.appendChild()`
        this.gameElm.appendChild(this.domElement);
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
        this.movementAmount = 10;

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
        this.domElement.style.left = this.positionX + "px";
        this.domElement.style.bottom = this.positionY + "px";

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
        this.width = 180;
        this.height = 150;
        this.positionX = -190;
        this.positionY = Math.floor(Math.random() * ((this.gameElmHeight - this.height) - (this.gameElmHeight / 2) + 1) + (this.gameElmHeight / 2));
        this.movementAmount = Math.floor(Math.random() * (5 - 1 + 1) + 1);

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

class Bomb {
    constructor(plane) {
        // target element + width and height of this element
        this.gameElm = document.getElementById("game");
        this.gameElmWidth = this.gameElm.offsetWidth;
        this.gameElmHeight = this.gameElm.offsetHeight;
        // get a Plane Position X and Y
        this.plane = plane;
        this.planePositionX = plane.positionX;
        this.planePositionY = plane.positionY;

        this.width = 10;
        this.height = 30;
        this.positionX = this.planePositionX; // plane position X
        this.positionY = this.planePositionY; // plane position y
        this.movementAmount = Math.floor(Math.random() * (5 - 1 + 1) + 1);

        this.domElement = null;
        this.createDomElement();
    }
    createDomElement() {
        // step1: create the element:
        this.domElement = document.createElement('div');

        // step2: add content or modify (ex. innerHTML...)
        this.domElement.className = "bomb";
        this.domElement.style.width = this.width + "px";
        this.domElement.style.height = this.height + "px";
        this.domElement.style.bottom = this.positionY + "vh";
        this.domElement.style.left = this.positionX + "px";

        //step3: append to the dom: `parentElm.appendChild()`
        this.gameElm.appendChild(this.domElement);
    }
    moveDown() {
        this.positionY = this.positionY - this.movementAmount;
        this.domElement.style.bottom = this.positionY + "px";

    }
}

const game = new Game();
game.start();