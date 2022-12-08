class Game {
    constructor() {
        this.randomBackgroundImg = Math.floor(Math.random() * (4 - 1 + 1) + 1);
        this.gameElm = document.getElementById("game");
        this.gameElm.style.background = `url('./images/landscape${this.randomBackgroundImg}.png') no-repeat`;
        this.gameElm.style.backgroundSize = "cover";
        this.gameElm.style.backgroundPosition = "center bottom"
        this.gameElmWidth = this.gameElm.offsetWidth;
        this.gameElmHeight = this.gameElm.offsetHeight;
        // gameStatus: false = not started, true = started
        this.gameStatus = false;
        
        this.player = null;
        this.time = 0;
        // score div
        this.score = 0;
        this.scoringElement = document.createElement('div');
        this.scoringElement.id = "scoring";
        this.gameElm.appendChild(this.scoringElement);
        this.scoreMainElement = document.createElement('div');
        this.scoreMainElement.id = "score-box";
        this.scoreMainElement.innerHTML = `<span>Points: </span>`;
        this.scoringElement.appendChild(this.scoreMainElement);
        this.scoreElement = document.createElement('div');
        this.scoreElement.id = "score";
        this.scoreElement.innerText = this.score;
        this.scoreMainElement.appendChild(this.scoreElement);        

        this.planes = [];
        this.randomPlaneInterval = Math.floor(Math.random() * (200 - 100 + 1) + 100);

        this.bombs = [];
        this.randomBombInterval = Math.floor(Math.random() * (120 - 100 + 1) + 100);

        this.bullets = [];
        // start div
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
        // restart div
        this.restartElement = document.createElement('div');
        this.restartElement.id = "game-over";
        this.restartElement.style.width = (this.gameElmWidth / 3) + "px";
        this.restartElement.style.height = (this.gameElmHeight / 4) + "px";
        this.restartElement.style.left = (this.gameElmWidth / 3) + "px";
        this.restartElement.style.top = (this.gameElmHeight / 3) + "px";
        this.restartElement.innerHTML = `
            <h1>Game Over</h1>
            <button id="restart-button">Play Again</button>
        `;
        this.restartElement.style.display = "none";
        this.gameElm.appendChild(this.restartElement);
    }
    
    start() {
        if (document.getElementById("start")) {
            document.getElementById("start").parentNode.removeChild(document.getElementById("start"));
        }

        if (this.restartElement.style.display === "block") {
            this.restartElement.style.display = "none";
            this.score = 0;
            this.scoreElement.innerText = 0;
        }
        this.player = new Player();
        this.detectPlayerMovement();
        this.detectPlayerShooting();

        // Create planes
        this.intervalPlaneId = setInterval(() => {
            this.time++;
            if (this.time % 10 === 0) {
                if (this.planes.length < 3) { // adjust this to an amount of planes wanted on screen
                    const newPlane = new Plane();
                    this.planes.push(newPlane);
                }
            }
        }, this.randomPlaneInterval);

        // Move Planes
        this.intervalPlaneMoveId = setInterval(() => {
            this.planes.forEach((planeInstance) => {
                planeInstance.move();
                this.removePlaneIfOutside(planeInstance);
            });
        }, 10);

        // Create Bombs
        this.intervalBombId = setInterval(() => {
            this.time++;
            if (this.time % 10 === 0) {
                this.planes.forEach((planeInstance) => {
                    if (planeInstance.positionX > 5 && planeInstance.positionX < planeInstance.gameElmWidth) {
                        if (this.bombs.length < 30) {
                            const newBomb = new Bomb(planeInstance);
                            this.bombs.push(newBomb);
                        }
                    }
                });
            }
        }, this.randomBombInterval);

        // Move Bombs
        this.intervalBombMoveId = setInterval(() => {
            this.bombs.forEach((bombInstance, index) => {
                bombInstance.moveDown();
                this.detectBombHitsPlayer(bombInstance);
                this.removeBombIfOutside(bombInstance, index);
            });
        }, 30);
        
        // Move Bullet
        this.intervalBulletMoveId = setInterval(() => {
            this.bullets.forEach((bulletInstance) => {
                bulletInstance.moveUp();
                this.removeBulletIfOutside(bulletInstance);
                this.detectBulletHitsPlane(bulletInstance);
            });
        });

        
    }

    // Player eventlistener
    detectPlayerMovement() {
        document.addEventListener('keypress', (event) => {
            if (event.key === "ArrowRight" || event.key === "x") {
                this.player.moveRight();
            } else if (event.key === "ArrowLeft" || event.key === "z") {
                this.player.moveLeft();
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === "ArrowRight" || event.key === "x") {
                this.player.moveRight();
            } else if (event.key === "ArrowLeft" || event.key === "z") {
                this.player.moveLeft();
            }
        });
    }

    // Shooting eventlistener
    detectPlayerShooting() {
        document.addEventListener('click', () => {
            if (this.gameStatus === true && this.bullets.length < 1) {
                const newBullet = new Bullet();
                this.bullets.push(newBullet);
            }
        });
    }

    // Remove planeInstance if it's outside the game div
    removePlaneIfOutside(planeInstance) {
        this.gameElmWidth = document.getElementById("game").offsetWidth;
        if ((planeInstance.planeElement.className === "plane move-left") && (planeInstance.positionX > this.gameElmWidth) || (planeInstance.positionX < -180) && (planeInstance.planeElement.className === "plane move-right")) {
            planeInstance.planeElement.remove();
            for (let i=0; i < this.planes.length; i++) {
                if (this.planes[i] === planeInstance) {
                    this.planes.splice(i, 1);
                    i--;
                }
            }
        }
    }
    
    // Remove bombInstance if it's outside the game div
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

    // Remove bulletInstance if it's outside the game div
    removeBulletIfOutside(bulletInstance) {
        this.gameElmWidth = document.getElementById("game").offsetWidth;
        if (bulletInstance.positionY >= this.gameElmHeight + (bulletInstance.height / 2)) {
            bulletInstance.bulletElement.remove();
            for (let i=0; i < this.bullets.length; i++) {
                if (this.bullets[i] === bulletInstance) {
                    this.bullets.splice(i, 1);
                    i--;
                }
            }
        }
    }
    
    // Remove Plane if hit by bulletInstance
    detectBulletHitsPlane(bulletInstance) {
        this.planes.forEach((planeInstance) => {
            if (
                planeInstance.positionX < bulletInstance.positionX + bulletInstance.width &&
                planeInstance.positionX + planeInstance.width > bulletInstance.positionX &&
                planeInstance.positionY < bulletInstance.positionY + bulletInstance.height &&
                planeInstance.height + planeInstance.positionY > bulletInstance.positionY
            ) {
                // Add to the score DOM element
                if (typeof this.scoreElement.innerText === "string") {
                    this.score = Number(this.score);
                    this.score++;
                    this.scoreElement.innerText = this.score;
                } else {
                    this.score++;
                    this.scoreElement.innerText = this.score;
                }
                // Remove plane DOM element
                planeInstance.planeElement.remove();
                // Get Plane position and display explosion briefly
                this.planePositionX = planeInstance.positionX;
                this.planePositionY = planeInstance.positionY;
                this.planeWidth = planeInstance.width;
                this.planeHeight = planeInstance.height;
                this.explosionElement = document.createElement('div');
                this.explosionElement.id = "explosion";
                this.explosionElement.style.width = this.planeWidth + "px";
                this.explosionElement.style.height = this.planeHeight + "px";
                this.explosionElement.style.left = this.planePositionX + "px";
                this.explosionElement.style.bottom = this.planePositionY + "px";
                this.explosionElement.style.background = `url('./images/bang.png') no-repeat`;
                this.explosionElement.style.backgroundSize = "contain";
                

                
                //this.intervalExplosionId = setInterval(() => {
                this.gameElm.appendChild(this.explosionElement);
                //}, 10);
                this.explosionTimeout = setTimeout(() => {
                    this.explosionElement.remove();
                }, 500);              
                
                // Remove this planeInstance in plane Array
                for (let i=0; i < this.planes.length; i++) {
                    if (this.planes[i] === planeInstance) {
                        this.planes.splice(i, 1);
                        i--;
                    }
                }
                // Remove bullet DOM element
                bulletInstance.bulletElement.remove();
                // Remove this bulletInstance in bullet Array
                for (let i=0; i <this.bullets.length; i++) {
                    if (this.bullets[i] === bulletInstance) {
                        this.bullets.splice(i, 1);
                        i--;
                    }
                }
            }
        });
        
    }

    // Game Over if a bombInstance hits the Player
    detectBombHitsPlayer(bombInstance) {
        if (
            this.player.positionX < bombInstance.positionX + bombInstance.width &&
            this.player.positionX + this.player.width > bombInstance.positionX &&
            this.player.positionY < bombInstance.positionY + bombInstance.height &&
            this.player.height + this.player.positionY > bombInstance.positionY
        ) {
            this.gameOver();
        }
    }

    // Clears Intervals, arrays and DOM elements
    gameOver() {
        // set gameStatus
        this.gameStatus = false;
        // remove array elements
        this.planes = [];
        this.bullets = [];
        this.bombs = [];
        // clear Intervals
        clearInterval(this.intervalPlaneId);
        clearInterval(this.intervalPlaneMoveId);
        clearInterval(this.intervalBombId);
        clearInterval(this.intervalBombMoveId);
        clearInterval(this.intervalBulletId);
        clearInterval(this.intervalBulletMoveId);
        // show Play Again div
        this.restartElement.style.display = "block";
        // remove all other DOM elements
        Array.from(document.querySelectorAll(".bomb")).forEach((el) => el.parentNode.removeChild(el));
        Array.from(document.querySelectorAll(".plane")).forEach((el) => el.parentNode.removeChild(el));
        Array.from(document.querySelectorAll(".bullet")).forEach((el) => el.parentNode.removeChild(el));
        Array.from(document.querySelectorAll("#explosion")).forEach((el) => el.parentNode.removeChild(el));
        document.getElementById("player").parentNode.removeChild(document.getElementById("player"));
	}
    
}

// The main dude that is going to get the evil bunnies
class Player {
    constructor() {
        this.gameElm = document.getElementById("game");
        this.gameElmWidth = this.gameElm.offsetWidth;
        this.gameElmHeight = this.gameElm.offsetHeight;
        this.randomPlayerImg = Math.floor(Math.random() * (3 - 1 + 1) + 1);
        this.width = 50;
        this.height = 75;
        this.positionX = this.gameElmWidth - (this.gameElmWidth / 2);
        this.positionY = 0;
        this.movementAmount = 5;
        this.duration = 80;
        this.frameDistance = this.movementAmount / (this.duration / 10);

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
        this.playerElement.style.background = `url('./images/raccoon${this.randomPlayerImg}.png') no-repeat`;
        this.playerElement.style.backgroundSize = "contain";
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

// Bullets for the main dude
class Bullet {
    constructor() {
        this.gameElm = document.getElementById("game");
        this.gameElmWidth = this.gameElm.offsetWidth;
        this.gameElmHeight = this.gameElm.offsetHeight;
        this.playerElm = document.getElementById("player");
        this.playerElmWidth = this.playerElm.offsetWidth;
        this.playerElmHeight = this.playerElm.offsetHeight;
        this.playerElmPositionX = this.playerElm.offsetLeft;
        this.width = 10;
        this.height = 17;
        this.positionX = this.playerElmPositionX + (this.playerElmWidth / 2);
        this.positionY = this.playerElmHeight / 2;
        this.movementAmount = 2;

        this.bulletElement = null;
        this.createBulletElement();
    }
    createBulletElement() {
        this.bulletElement = document.createElement('div');
        this.bulletElement.className = "bullet";
        this.bulletElement.style.width = this.width + "px";
        this.bulletElement.style.height = this.height + "px";
        this.bulletElement.style.bottom = this.positionY + "px";
        this.bulletElement.style.left = this.positionX + "px";
        this.gameElm.appendChild(this.bulletElement);
    }
    moveUp() {
        this.positionY = this.positionY + this.movementAmount;
        this.bulletElement.style.bottom = this.positionY + "px";
    }
}

// Evil bunny planes
class Plane {
    constructor() {
        this.gameElm = document.getElementById("game");
        this.gameElmWidth = this.gameElm.offsetWidth;
        this.gameElmHeight = this.gameElm.offsetHeight;
        this.width = 180;
        this.height = 150;
        this.positionXLeft = 0 - this.width;
        this.positionXRight = this.gameElmWidth + this.width;
        this.positionArray = [this.positionXLeft, this.positionXRight]; // left/right position array
        this.positionX = this.positionArray[Math.floor(Math.random() * this.positionArray.length)]; // randomly select a position to start from the array
        this.positionY = Math.floor(Math.random() * ((this.gameElmHeight - this.height) - (this.gameElmHeight / 2) + 1) + (this.gameElmHeight / 2));
        this.movementAmount = Math.floor(Math.random() * (5 - 1 + 1) + 1);

        this.planeElement = null;
        this.createPlaneElement();        
    }
    createPlaneElement() {
        this.planeElement = document.createElement('div');
        if (this.positionX > this.gameElmWidth) {
            this.planeElement.className = "plane move-right";
            this.planeElement.style.background = `url('./images/plane_rl_green.png') no-repeat`;
            this.movementDirection = "right";
        } else if (this.positionX < 0) {
            this.planeElement.className = "plane move-left";
            this.planeElement.style.background = `url('./images/plane_lr_blue.png') no-repeat`;
            this.movementDirection = "left";
        }
        this.planeElement.style.width = this.width + "px";
        this.planeElement.style.height = this.height + "px";
        this.planeElement.style.bottom = this.positionY + "px";
        this.planeElement.style.left = this.positionX + "px";
        this.gameElm.appendChild(this.planeElement);
    }
    move() {
        if (this.movementDirection === "right") {
            this.positionX = this.positionX - this.movementAmount;
        } else if (this.movementDirection === "left"){
            this.positionX = this.positionX + this.movementAmount;
        }
        this.planeElement.style.left = this.positionX + "px";
    }
}

// Evil bunny plane bombs!
class Bomb {
    constructor(plane) {
        this.gameElm = document.getElementById("game");
        this.gameElmWidth = this.gameElm.offsetWidth;
        this.gameElmHeight = this.gameElm.offsetHeight;
        this.plane = plane;
        this.planePositionX = plane.positionX;
        this.planePositionY = plane.positionY;
        this.randomBombImg = Math.floor(Math.random() * (3 - 1 + 1) + 1);
        this.width = 13;
        this.height = 40;
        this.positionX = this.planePositionX;
        this.positionY = this.planePositionY;
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
        this.bombElement.style.background = `url('./images/bomb${this.randomBombImg}.png') no-repeat`;
        this.bombElement.style.backgroundSize = "contain";
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
    game.gameStatus = true;
    game.start();
});
restartButton.addEventListener("click", () => {
    game.gameStatus = true;
    game.start();
});