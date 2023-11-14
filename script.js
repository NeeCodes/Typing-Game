// canvas settings
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 25;

ctx.strokeStyle = "white";
ctx.fillStyle = "white";
ctx.font = "15px Georgia";

// load assets
const gunshot = new Audio('./assets/pew.wav');
const gameOverSound = new Audio('./assets/game-over.wav');

const gameOverElement = document.getElementById("gameOver");

let startingLetters = new Array(26).fill(0);
let filledStartingLetters = new Array(26).fill(1);

let gameOver = false;

let paused = false;

document.getElementById("retry").addEventListener("keydown", e => {
    if (e.keycode == 13) {
        console.log("Hello");
    }
})

function pausePlay() {
    if (!paused) {
        paused = true;
        document.getElementById("pause-play").src = "./assets/play.png";


        document.getElementById("paused").style.visibility = "visible";


    }

    else {
        paused = false;
        document.getElementById("pause-play").src = "./assets/pause.png";

        document.getElementById("paused").style.visibility = "hidden";

    }
}



class Player {
    constructor(game) {
        this.game = game;

        // load the icons
        this.sprite = new Image();
        this.sprite.src = "./assets/spaceship.png";

        this.bullet = new Image();

        this.draw();

        console.log("Player created");
    }

    draw() {
        ctx.drawImage(this.sprite, Math.floor(canvas.width / 2) - 75, canvas.height - 150, 150, 150);
    }

    fireBullet() {
        
    }
}

class Level {
    constructor(game) {
        this.game = game;
        this.level = 1;
        this.levelElement = document.getElementById("scoreboard-level");

        this.levelElement.innerText = "Level: " + this.level;

    }

    levelUp() {
        this.level++;
        this.levelElement.innerText = "Level: " + this.level;

        this.game.reset();

        this.levelUpScreen();
    }

    levelUpScreen() {
        // ctx.strokeRect(200, 200, canvas.width - 400, canvas.height - 400);
    }
}


class Word {
    constructor(game) {
        this.game = game;

        let index = Math.floor(Math.random() * words.length);
        let firstLetterVal = words[index].charCodeAt(0) - 'a'.charCodeAt(0);

        if (startingLetters.toString() === filledStartingLetters.toString()) {
            for (let i = 0; i < 26; i++) {
                startingLetters[i] = 0;
            }
        }


        while (startingLetters[firstLetterVal] != 0) {
            index = Math.floor(Math.random() * words.length);
            firstLetterVal = words[index].charCodeAt(0) - 'a'.charCodeAt(0);
        }
        
        console.log(firstLetterVal);
        startingLetters[firstLetterVal] = 1;

        this.text = words[index];
        this.originalText = this.text;
        // this.text = words[Math.floor(Math.random() * words.length)];
        this.length = this.text.length;
        this.originalLength = this.length;

        this.x = Math.floor(Math.random() * (canvas.width - 100));
        this.y = 0;

        this.speed = Math.random() + (this.game.level.level * 0.2);
    }

    draw() {
        ctx.fillText(this.text, this.x, this.y);
    }

    update() {
        this.y += this.speed;
    }
}

class Game {
    constructor() {
        this.words = [];
        this.currentWord = null;

        this.startTime = Date.now();
        this.elapsedTime = 0;

        this.charsTyped = 0;
        this.correctCharsTyped = 0;
        this.wordsTyped = 0;
        this.wordsNotTyped = 0;

        this.score = 0;

        this.accuracy;

        this.level = new Level(this);
        this.player = new Player(this);

        this.init();
        
    }
    
    init() {
        this.newWord();

        document.addEventListener("keydown", e => {
            this.keypress(e.key);
        });
    }

    keypress(char) {
        this.charsTyped++;
        this.score += this.level.level;

        // if there is no current word selected, select the word with the letter typed as the first letter (if any)
        if (this.currentWord === null) {
            for (let i = 0; i < this.words.length; i++) {
                if (char === this.words[i].text[0]) {
                    this.currentWord = this.words[i];
                    this.correctCharsTyped++;

                    this.currentWord.text = this.currentWord.text.substring(1);
                    break;
                }
            }
        }

        else if (char === this.currentWord.text[0]){
            this.correctCharsTyped++;
            this.currentWord.text = this.currentWord.text.substring(1);

            if (this.currentWord.text === "") {
                gunshot.currentTime = 0;
                gunshot.play();
                
                startingLetters[this.currentWord.originalText.charCodeAt(0) - 'a'.charCodeAt(0)] = 0;

                let index = this.words.indexOf(this.currentWord);
                this.words.splice(index, 1);
                this.currentWord = null;

                this.wordsTyped++;
            }
        }
    }

    reset() {
        this.words = [];
        this.currentWord = null;

        this.startTime = Date.now();
        this.elapsedTime = 0;

        this.charsTyped = 0;
        this.correctCharsTyped = 0;
        this.wordsTyped = 0;
        this.wordsNotTyped = 0;

    }

    render() {
        // highlight the current word
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";

        if (this.currentWord != null) {

            console.log(ctx.measureText(this.currentWord.text));
            ctx.fillRect(this.currentWord.x, this.currentWord.y - 15, ctx.measureText(this.currentWord.text).width, 15);
        }


        ctx.restore();

        // draw each word in the words array
        this.words.forEach(word => {
            // remove the word if it reaches below the end of the canvas
            if (word.y > canvas.height) {
                this.wordsNotTyped++;


                startingLetters[word.text.charCodeAt(0) - 'a'.charCodeAt(0)] = 0;
                if (this.currentWord != null && word.text === this.currentWord.text) this.currentWord = null;

                let index = this.words.indexOf(word);
                this.words.splice(index, 1);
            }
            
            word.update();
            word.draw();
        });

    
        this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
    
    
        time.innerText = "Elapsed Time: " + game.elapsedTime;
        points.innerText = "Score: " + game.score;
 
    }

    newWord() {
        this.words.push(new Word(this));
    }

    gameOver() {

    }

}


function gameLoop() {
    if (!paused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        game.render();
    
        let random = Math.floor(Math.random() * 20);
    
        if (random == 7 && game.words.length < 5) {
            game.newWord();
        }
        
        game.player.draw();
    
        if (game.wordsTyped === (game.level.level)) {
            game.level.levelUp();
            // cancelAnimationFrame();
        }
    }

    // game over
    if (game.wordsNotTyped === 1) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.player.draw();
        document.getElementById("gameOver").style.visibility = "visible";
        gameOverSound.play();

        cancelAnimationFrame();
        
        return;

    }
    
    requestAnimationFrame(gameLoop);
}


function retry() {
    document.getElementById("gameOver").style.visibility = "hidden";

    game = new Game();
    gameLoop();


}

function pause() {

}

function resume() {
}

let game = new Game();
// const player = new Player(game);

let time = document.getElementById("elapsedTime");

let points = document.getElementById("points");

gameLoop();

