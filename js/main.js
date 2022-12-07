class Game {
    constructor() {
        // target element + width and height of this element
        this.gameElm = document.getElementById("game");
        this.gameElmWidth = this.gameElm.offsetWidth;
        this.gameElmHeight = this.gameElm.offsetHeight;

        this.player = null;
        this.time = 0; // time loop to create planes / bombs

        this.planes = []; // holds instances of the class Planes
        this.randomPlaneInterval = Math.floor(Math.random() * (200 - 100 + 1) + 100);

        this.bombs = []; // holds instances of class Bomb
        this.randomBombInterval = Math.floor(Math.random() * (120 - 100 + 1) + 100);

        this.bullets = []; // holds instances of class Bullet

        // add game start div
        this.startElement = document.createElement('div');
        this.startElement.id = "start";
        this.startElement.style.width = (this.gameElmWidth / 3) + "px";
        this.startElement.style.height = (this.gameElmHeight / 4) + "px";
        this.startElement.style.left = (this.gameElmWidth / 3) + "px";
        this.startElement.style.top = (this.gameElmHeight / 3) + "px";
        this.startElement.innerHTML = `
            <button id="start-button">Play</button>
        `;
        this.gameElm.appendChild(this.startElement);

        // add game restart div (but hide)
        this.restartElement = document.createElement('div');
        this.restartElement.id = "game-over";
        this.restartElement.style.width = (this.gameElmWidth / 3) + "px";
        this.restartElement.style.height = (this.gameElmHeight / 4) + "px";
        this.restartElement.style.left = (this.gameElmWidth / 3) + "px";
        this.restartElement.style.top = (this.gameElmHeight / 3) + "px";
        this.restartElement.innerHTML = `
            Game Over
            <button id="restart-button">Play Again</button>
        `;
        this.restartElement.style.display = "none";
        this.gameElm.appendChild(this.restartElement);
    }
    
    start() {        
        // check if start div is there, if so delete
        if (document.getElementById("start")) {
            document.getElementById("start").parentNode.removeChild(document.getElementById("start"));
        }
        // check if game over div is there, if so hide it
        if (this.restartElement.style.display === "block") {
            this.restartElement.style.display = "none";
        }
        this.player = new Player();
        this.detectPlayerMovement();
        //this.bullets = new Bullet();
        this.detectPlayerShooting();
      
        // Create planes
        this.intervalPlaneId = setInterval(() => {
            this.time++;
            if (this.time % 10 === 0) {
                if (this.planes.length < 2) { // adjust this to an amount of planes wanted on screen
                    const newPlane = new Plane();
                    this.planes.push(newPlane);
                }
            }
        }, this.randomPlaneInterval);

        // Move Planes
        this.intervalPlaneMoveId = setInterval(() => {
            this.planes.forEach((planeInstance) => {
                // move current plane
                planeInstance.moveLeft();
                // check if we need to remove current plane
                this.removePlaneIfOutside(planeInstance);
            });
        }, 10); // move plane every xxx ms

        // Create bombs
        this.intervalBombId = setInterval(() => {
            this.time++;
            if (this.time % 10 === 0) {
                this.planes.forEach((planeInstance) => {
                    // only drop bombs when plane is within the boundries of the game
                    if (planeInstance.positionX > 20 && planeInstance.positionX < (planeInstance.gameElmWidth - 20)) {
                        if (this.bombs.length < 10) {
                            const newBomb = new Bomb(planeInstance);
                            this.bombs.push(newBomb);
                        }
                    }
                });
            }
        }, this.randomBombInterval);

        // Move Bombs
        this.intervalBombMoveId = setInterval(() => {
            this.bombs.forEach((bombInstance) => {
                // move current bomb
                bombInstance.moveDown();
                //detect if there's a collision between player and current bomb
                this.detectBombHitsPlayer(bombInstance);
                // check if we need to remove current bomb
                this.removeBombIfOutside(bombInstance);
            });
        }, 30);
        
        
        // Move Bullets
        this.intervalBulletMoveId = setInterval(() => {
            this.bullets.forEach((bulletInstance) => {
                // move current bullet
                bulletInstance.shoot();
                // check if we need to remove current bullet
                this.removeBulletIfOutside(bulletInstance);
                //detect if there's a collision between player and current bullet
                this.detectBulletHitsPlane(bulletInstance);
            });
        }, 0);

    }

    // detect Player movement (Left / Right)
    detectPlayerMovement() { // set interval?????
        document.addEventListener('keypress', (event) => {
            if (event.key === "ArrowRight" || event.key === "x") {
                this.player.moveRight();
            } else if (event.key === "ArrowLeft" || event.key === "z") {
                this.player.moveLeft();
            }
        });
    }

    // detect player shooting
    detectPlayerShooting() {
        document.addEventListener('click', () => {
            if (this.bullets.length < 1) {
                const newBullet = new Bullet();
                this.bullets.push(newBullet);
            }
        });
    }

    // remove plane if it's outside the game div
    removePlaneIfOutside(planeInstance) {
        this.gameElmWidth = document.getElementById("game").offsetWidth;
        if (planeInstance.positionX >= this.gameElmWidth + (planeInstance.width / 2)) {
            planeInstance.planeElement.remove(); // remove dom element
            for (let i=0; i < this.planes.length; i++) {
                if (this.planes[i] === planeInstance) {
                    this.planes.splice(i, 1); // removes the instance at the index of the array
                    i--;
                }
            }
        }
    }

    // remove bomb if it's outside the game div
    removeBombIfOutside(bombInstance) {
        if (bombInstance.positionY <= -5) {
            bombInstance.bombElement.remove(); // remove dom element
            for (let i=0; i < this.bombs.length; i++) {
                if (this.bombs[i] === bombInstance) {
                    this.bombs.splice(i, 1); // removes the instance at the index of the array
                    i--;
                }
            }
        }
    }

    // remove bullet if it's outside the game div
    removeBulletIfOutside(bulletInstance) {
        this.gameElmWidth = document.getElementById("game").offsetWidth;
        if (bulletInstance.positionY >= this.gameElmHeight + (bulletInstance.height / 2)) {
            bulletInstance.bulletElement.remove(); // remove dom element
            for (let i=0; i < this.bullets.length; i++) {
                if (this.bullets[i] === bulletInstance) {
                    this.bullets.splice(i, 1); // removes the instance at the index of the array
                    i--;
                }
            }
        }
    }
    
    // if bullet hits plane -> Remove Plane
    detectBulletHitsPlane(bulletInstance) {
        this.planes.forEach((planeInstance) => {
            
            if (
                planeInstance.positionX < bulletInstance.positionX + bulletInstance.width &&
                planeInstance.positionX + planeInstance.width > bulletInstance.positionX &&
                planeInstance.positionY < bulletInstance.positionY + bulletInstance.height &&
                planeInstance.height + planeInstance.positionY > bulletInstance.positionY
            ) {
                planeInstance.planeElement.remove(); // remove dom element
                for (let i=0; i < this.planes.length; i++) {
                    if (this.planes[i] === planeInstance) {
                        this.planes.splice(i, 1); // removes the instance at the index of the array
                        i--;
                    }
                }
                bulletInstance.bulletElement.remove(); // remove dom bullet element
                for (let i=0; i <this.bullets.length; i++) {
                    if (this.bullets[i] === bulletInstance) {
                        this.bullets.splice(i, 1); // removes instance from array
                        i--;
                    }
                }
            }
        });
        
    }

    // if bomb hits player -> Game Over
    detectBombHitsPlayer(bombInstance) {
        if (
            this.player.positionX < bombInstance.positionX + bombInstance.width &&
            this.player.positionX + this.player.width > bombInstance.positionX &&
            this.player.positionY < bombInstance.positionY + bombInstance.height &&
            this.player.height + this.player.positionY > bombInstance.positionY
        ) {
            // remove all planes, bullets and bombs
            this.planes = [];
            this.bullets = [];
            this.bombs = [];
            // clear all intervals
            clearInterval(this.intervalPlaneId);
            clearInterval(this.intervalPlaneMoveId);
            clearInterval(this.intervalBombId);
            clearInterval(this.intervalBombMoveId);
            clearInterval(this.intervalBulletId);
            this.gameOver();
        }
    }
    
    // Game Over
    gameOver() {
        // show the Game Over div
        this.restartElement.style.display = "block";
        // Remove all bombs, planes, bullets and player
        Array.from(document.querySelectorAll(".bomb")).forEach((el) => el.parentNode.removeChild(el));
        Array.from(document.querySelectorAll(".plane")).forEach((el) => el.parentNode.removeChild(el));
        Array.from(document.querySelectorAll(".bullet")).forEach((el) => el.parentNode.removeChild(el));
        document.getElementById("player").parentNode.removeChild(document.getElementById("player"));
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
        this.movementAmount = 5;
        this.duration = 80;
        this.frameDistance = this.movementAmount / (this.duration / 100);

        this.playerElement = null;
        this.createPlayerElement();
    }

    createPlayerElement() {
        this.playerElement = document.createElement('div');
        this.playerElement.id = "player";
        this.playerElement.style.width = this.width + "px";
        this.playerElement.style.height = this.height + "px";
        this.playerElement.style.left = this.positionX + "px";
        this.playerElement.style.bottom = this.positionY + "px";
        this.gameElm.appendChild(this.playerElement);
    }

    moveLeft() {
        if (this.positionX > 0) {
            this.positionX = this.positionX - (this.movementAmount + this.frameDistance);
            this.playerElement.style.left = this.positionX + "px";
        }
    }

    moveRight() {
        if (this.positionX < (this.gameElmWidth - this.width)) {
            this.positionX = this.positionX + (this.movementAmount + this.frameDistance);
            this.playerElement.style.left = this.positionX + "px";
        }
    }
}

class Bullet {
    constructor(player) {
        // target element + width and height of this element
        this.gameElm = document.getElementById("game");
        this.gameElmWidth = this.gameElm.offsetWidth;
        this.gameElmHeight = this.gameElm.offsetHeight;
        // player element
        this.playerElm = document.getElementById("player");
        this.playerElmWidth = this.playerElm.offsetWidth;
        this.playerElmHeight = this.playerElm.offsetHeight;
        this.playerElmPositionX = this.playerElm.offsetLeft;
        
        // bullet styles / positioning
        this.width = 6;
        this.height = 6;
        this.positionX = this.playerElmPositionX + (this.playerElmWidth / 2); // position where player is
        this.positionY = this.playerElmHeight / 2; // position where player is
        this.movementAmount = 10;
        this.maxMovementAmount = 15;

        this.bulletElement = null;
        this.createBulletElement();
    }

    createBulletElement() {
        // create bullets
        this.bulletElement = document.createElement('div');
        this.bulletElement.className = "bullet";
        this.bulletElement.style.width = this.width + "px";
        this.bulletElement.style.height = this.height + "px";
        this.bulletElement.style.bottom = this.positionY + "px";
        this.bulletElement.style.left = this.positionX + "px";
        this.gameElm.appendChild(this.bulletElement);
    }

    shoot() {
        if (this.movementAmount < this.maxMovementAmount) {
            this.movementAmount++;
        }
        this.positionY = this.positionY + this.movementAmount;
        this.bulletElement.style.bottom = this.positionY + "px";
    }
}

class Plane {
    constructor() {
        this.gameElm = document.getElementById("game");
        this.gameElmWidth = this.gameElm.offsetWidth;
        this.gameElmHeight = this.gameElm.offsetHeight;
        this.width = 180;
        this.height = 150;
        this.positionX = -190;
        this.positionY = Math.floor(Math.random() * ((this.gameElmHeight - this.height) - (this.gameElmHeight / 2) + 1) + (this.gameElmHeight / 2));
        this.movementAmount = Math.floor(Math.random() * (5 - 1 + 1) + 1);

        this.planeElement = null;
        this.createPlaneElement();        
    }
    createPlaneElement() {
        this.planeElement = document.createElement('div');
        this.planeElement.className = "plane";
        this.planeElement.style.width = this.width + "px";
        this.planeElement.style.height = this.height + "px";
        this.planeElement.style.bottom = this.positionY + "px";
        this.planeElement.style.left = this.positionX - this.width + "px";
        this.gameElm.appendChild(this.planeElement);
    }
    moveLeft() {
        this.positionX = this.positionX + this.movementAmount;
        this.planeElement.style.left = this.positionX + "px";
    }
}

class Bomb {
    constructor(plane) {
        this.gameElm = document.getElementById("game");
        this.gameElmWidth = this.gameElm.offsetWidth;
        this.gameElmHeight = this.gameElm.offsetHeight;
        // get a Plane Position X and Y
        this.plane = plane;
        this.planePositionX = plane.positionX;
        this.planePositionY = plane.positionY;

        this.width = 13;
        this.height = 40;
        this.positionX = this.planePositionX; // plane position X
        this.positionY = this.planePositionY; // plane position y
        this.movementAmount = Math.floor(Math.random() * (9 - 3 + 1) + 3);

        this.bombElement = null;
        this.createBombElement();
    }
    createBombElement() {
        this.bombElement = document.createElement('div');
        this.bombElement.className = "bomb";
        this.bombElement.style.width = this.width + "px";
        this.bombElement.style.height = this.height + "px";
        this.bombElement.style.bottom = this.positionY + "vh";
        this.bombElement.style.left = this.positionX + "px";
        this.gameElm.appendChild(this.bombElement);
    }
    moveDown() {
        this.positionY = this.positionY - this.movementAmount;
        this.bombElement.style.bottom = this.positionY + "px";
    }
}

const game = new Game();

const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");

startButton.addEventListener("click", () => {
    game.start();
});
restartButton.addEventListener("click", () => {
    game.start();
});