class Game {
    constructor() {
        this.randomBackgroundImg = Math.floor(Math.random() * (3 - 1 + 1) + 1);
        this.gameElm = document.getElementById("game");
        this.gameElm.style.background = `url('./images/landscape${this.randomBackgroundImg}.png') no-repeat`;
        this.gameElm.style.backgroundSize = "cover";
        this.gameElm.style.backgroundPosition = "center bottom"
        this.gameElmWidth = this.gameElm.offsetWidth;
        this.gameElmHeight = this.gameElm.offsetHeight;
        
        this.player = null;
        this.time = 0;

        this.score = 0;
        this.scoreMainElement = document.createElement('div');
        this.scoreMainElement.id = "score-box";
        this.scoreMainElement.innerHTML = `<span>Points: </span>`;
        this.gameElm.appendChild(this.scoreMainElement);
        this.scoreElement = document.createElement('div');
        this.scoreElement.id = "score";
        this.scoreElement.innerText = this.score;
        this.scoreMainElement.appendChild(this.scoreElement);

        this.planes = [];
        this.randomPlaneInterval = Math.floor(Math.random() * (200 - 100 + 1) + 100);

        this.bombs = [];
        this.randomBombInterval = Math.floor(Math.random() * (120 - 100 + 1) + 100);

        this.bullets = [];

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

        this.intervalPlaneId = setInterval(() => {
            this.time++;
            if (this.time % 10 === 0) {
                if (this.planes.length < 3) {
                    const newPlane = new Plane();
                    this.planes.push(newPlane);
                }
            }
        }, this.randomPlaneInterval);

        this.intervalPlaneMoveId = setInterval(() => {
            this.planes.forEach((planeInstance) => {
                planeInstance.moveLeft();
                this.removePlaneIfOutside(planeInstance);
            });
        }, 10);

        this.intervalBombId = setInterval(() => {
            this.time++;
            if (this.time % 10 === 0) {
                this.planes.forEach((planeInstance) => {
                    if (planeInstance.positionX > 5 && planeInstance.positionX < (planeInstance.gameElmWidth - 20)) {
                        if (this.bombs.length < 15) {
                            const newBomb = new Bomb(planeInstance);
                            this.bombs.push(newBomb);
                        }
                    }
                });
            }
        }, this.randomBombInterval);

        this.intervalBombMoveId = setInterval(() => {
            this.bombs.forEach((bombInstance) => {
                bombInstance.moveDown();
                this.detectBombHitsPlayer(bombInstance);
                this.removeBombIfOutside(bombInstance);
            });
        }, 30);

        this.intervalBulletMoveId = setInterval(() => {
            this.bullets.forEach((bulletInstance) => {
                bulletInstance.shoot();
                this.removeBulletIfOutside(bulletInstance);
                this.detectBulletHitsPlane(bulletInstance);
            });
        }, 0);

    }

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

    detectPlayerShooting() {
        document.addEventListener('click', () => {
            if (this.bullets.length < 1) {
                const newBullet = new Bullet();
                this.bullets.push(newBullet);
            }
        });
    }

    removePlaneIfOutside(planeInstance) {
        this.gameElmWidth = document.getElementById("game").offsetWidth;
        if (planeInstance.positionX >= this.gameElmWidth + (planeInstance.width / 2)) {
            planeInstance.planeElement.remove();
            for (let i=0; i < this.planes.length; i++) {
                if (this.planes[i] === planeInstance) {
                    this.planes.splice(i, 1);
                    i--;
                }
            }
        }
    }

    removeBombIfOutside(bombInstance) {
        if (bombInstance.positionY <= -5) {
            bombInstance.bombElement.remove();
            for (let i=0; i < this.bombs.length; i++) {
                if (this.bombs[i] === bombInstance) {
                    this.bombs.splice(i, 1);
                    i--;
                }
            }
        }
    }

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
    
    detectBulletHitsPlane(bulletInstance) {
        this.planes.forEach((planeInstance) => {
            if (
                planeInstance.positionX < bulletInstance.positionX + bulletInstance.width &&
                planeInstance.positionX + planeInstance.width > bulletInstance.positionX &&
                planeInstance.positionY < bulletInstance.positionY + bulletInstance.height &&
                planeInstance.height + planeInstance.positionY > bulletInstance.positionY
            ) {
                if (typeof this.scoreElement.innerText === "string") {
                    this.score = Number(this.score);
                    this.score++;
                    this.scoreElement.innerText = this.score;
                } else {
                    this.score++;
                    this.scoreElement.innerText = this.score;
                }
                planeInstance.planeElement.remove();
                for (let i=0; i < this.planes.length; i++) {
                    if (this.planes[i] === planeInstance) {
                        this.planes.splice(i, 1);
                        i--;
                    }
                }
                bulletInstance.bulletElement.remove();
                for (let i=0; i <this.bullets.length; i++) {
                    if (this.bullets[i] === bulletInstance) {
                        this.bullets.splice(i, 1);
                        i--;
                    }
                }
            }
        });
        
    }

    detectBombHitsPlayer(bombInstance) {
        if (
            this.player.positionX < bombInstance.positionX + bombInstance.width &&
            this.player.positionX + this.player.width > bombInstance.positionX &&
            this.player.positionY < bombInstance.positionY + bombInstance.height &&
            this.player.height + this.player.positionY > bombInstance.positionY
        ) {
            this.planes = [];
            this.bullets = [];
            this.bombs = [];
            clearInterval(this.intervalPlaneId);
            clearInterval(this.intervalPlaneMoveId);
            clearInterval(this.intervalBombId);
            clearInterval(this.intervalBombMoveId);
            clearInterval(this.intervalBulletId);
            this.gameOver();
        }
    }

    gameOver() {
        this.restartElement.style.display = "block";
        Array.from(document.querySelectorAll(".bomb")).forEach((el) => el.parentNode.removeChild(el));
        Array.from(document.querySelectorAll(".plane")).forEach((el) => el.parentNode.removeChild(el));
        Array.from(document.querySelectorAll(".bullet")).forEach((el) => el.parentNode.removeChild(el));
        document.getElementById("player").parentNode.removeChild(document.getElementById("player"));
	}
    
}

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

class Bullet {
    constructor() {
        this.gameElm = document.getElementById("game");
        this.gameElmWidth = this.gameElm.offsetWidth;
        this.gameElmHeight = this.gameElm.offsetHeight;
        this.playerElm = document.getElementById("player");
        this.playerElmWidth = this.playerElm.offsetWidth;
        this.playerElmHeight = this.playerElm.offsetHeight;
        this.playerElmPositionX = this.playerElm.offsetLeft;
        this.width = 6;
        this.height = 15;
        this.positionX = this.playerElmPositionX + (this.playerElmWidth / 2);
        this.positionY = this.playerElmHeight / 2;
        this.movementAmount = 10;
        this.maxMovementAmount = 15;

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
    game.start();
});
restartButton.addEventListener("click", () => {
    game.start();
});