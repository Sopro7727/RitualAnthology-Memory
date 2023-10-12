var game;

// there are 6 Objects
// you can change this to be 1 to 6
let numObjects = 4; 			// 4 is about the right size for my memory :)
let maxImageWidth = 256/2;
let maxImageHeight = 320/2;
let offsetX = 10;
let gameHeight = maxImageHeight * 3;

window.onload = function() {
	// the largest image is the cardBack 
	// 		256x320 - large enough to hold our Objects
	let w = maxImageWidth * numObjects;

	// add in the border offset for each side
	w += (offsetX * 2);

	// You can change the height value but you need to make sure 
	// 		it's at least tall enough to hold a row of cards 
	// 		above and below the mid-point
	var config = {
		width: w,
		height: gameHeight,
		backgroundColor: 0xd0d0d0,
		parent: 'gameDiv',
		scene: [BootScene, PlayGameScene],
	}

	game = new Phaser.Game(config);

	window.focus();
}

class BootScene extends Phaser.Scene {
	constructor() {
		super("BootScene");
	}

	preload() {
		// Dave O made these with photoShop
		this.load.image('header', 'assets/images/header.png');
		this.load.image('cardBack', 'assets/images/cardBack.png');

		// I got these images from:
		// 		http://opengameart.com	
		// 		CoMiGo - https://comigo.itch.io/
		this.load.image('cat', 'assets/images/cat.png');
		this.load.image('chick', 'assets/images/chick.png');
		this.load.image('fox', 'assets/images/fox.png');
		this.load.image('mouse', 'assets/images/mouse.png');
		this.load.image('pig', 'assets/images/pig.png');
		this.load.image('wallet', 'assets/images/Wallet.png');

		// I got these clips from http://opengameart.com
		this.load.audio('yay', 'assets/sounds/round_end.wav');
		this.load.audio('awe', 'assets/sounds/death.wav');
	}

	create() {
		this.scene.start("PlayGameScene");
	}
}

class PlayGameScene extends Phaser.Scene {
	constructor() {
		super("PlayGameScene");
	}

	create() {
		this.numMatches = 0;		// did we match all of the cards?
		this.canMove = true;		// not if we are doing a 'tween'
		this.chosenCards = [];		// holds the 2 cards being compared

		let x = game.config.width / 2;
		let y = 32;		// this is one half the height of the header image
		this.add.image(x, y, 'header');

		// I am only loading 4 of the Objects :)
		let ObjectArray = ['wallet', 'wallet', 'wallet', 'wallet'];

		// create a 'shuffle' array before adding sprites
		// this is a simple way to 'visualize' the board 
		// 		and the values it will hold.
		let shuffleArray = [];
		for (let row = 0; row < 2; row++) {
			shuffleArray[row] = [];

			for (let col = 0; col < numObjects; col++) {
				// the value we will use to compare later
				let ObjectValue = ObjectArray[col];

				shuffleArray[row][col] = ObjectValue;
			}
		}

		// now do a simple shuffle
		for (let n = 0; n < 100; n++) {
			let rowA = Phaser.Math.Between(0, 1);
			let colA = Phaser.Math.Between(0, numObjects-1);

			let rowB = Phaser.Math.Between(0, 1);
			let colB = Phaser.Math.Between(0, numObjects-1);

			let temp = shuffleArray[rowA][colA];
			shuffleArray[rowA][colA] = shuffleArray[rowB][colB];
			shuffleArray[rowB][colB] = temp;
		}

		// create an array that will hold our board values
		this.boardArray = [];

		// the first one will be at coordinate x:266, y:160
		x = game.config.width / 2;
		y = (game.config.height / 2) - (maxImageHeight / 2);

		for (let row = 0; row < 2; row++) {
			this.boardArray[row] = [];

			for (let col = 0; col < numObjects; col++) {
				// each Object value was assigned to a random 
				// position on the board.
				let theObjectValue = shuffleArray[row][col];

				// calculate the x offset for each image
				// 		the anchor point is at the image center
				x = offsetX + (maxImageWidth * col) + (maxImageWidth / 2);

				let cardBack = this.add.image(x, y, 'cardBack');
				cardBack.setScale(0.5);
				cardBack.alpha = 1;
				cardBack.depth = 20;

				let Object = this.add.image(x, y, theObjectValue);
				Object.setScale(0.5);
				Object.depth = 10;

				// create an anonymous object for each member of our boardArray
				// 		we are adding the cardBack sprite because we 
				// 		will be modifying values during game play.
				//
				// 		we are NOT adding the Object image 
				this.boardArray[row][col] = {
					ObjectSelected: false,
					ObjectValue: shuffleArray[row][col],
					cardBackSprite: cardBack,
				}
			}

			// now increment our y coordinate value
			y += maxImageHeight;
		}

		// create a function to handle our mouseClick or touch events
		this.input.on('pointerdown', this.handleMouseDown, this);

		this.yaySound = this.sound.add('yay', { volume: 0.5, });
		this.aweSound = this.sound.add('awe');
	}

	handleMouseDown(mousePointer) {
		// if we are still in 'tween' mode 
		if (!this.canMove) {
			return;
		}

		let w = maxImageWidth;

		// determine where the user clicked on our game canvas
		// 		the x coord will start at 0 and continue for the width of 
		// 			the game canvas
		// 		but y coord will start at the middle of the game canvas
		let row = Math.floor(mousePointer.y / (gameHeight / 2));
		let col = Math.floor((mousePointer.x - offsetX) / w);

		// make sure row selected is valid
		row = row < 0 ? row = 0 : row;
		row = row > 1 ? row = 1 : row;

		col = col < 0 ? col = 0 : col;
		col = col > 5 ? col = 5 : col;

		let obj = this.boardArray[row][col];

		// if this Object is already displayed 
		if (obj.ObjectSelected == true) {
			return;
		}

		// make the cardBackSprite of the selectd object  transparent
		obj.cardBackSprite.alpha = 0;
		obj.ObjectSelected = true;

		// save the selected object
		this.chosenCards.push(obj);

		if (this.chosenCards.length > 1) {
			this.canMove = false;

			// compare the card values
			let g1 = this.chosenCards[0].ObjectValue;
			let g2 = this.chosenCards[1].ObjectValue;

			if (g1 == g2) {
				// match
				this.yaySound.play();

				this.chosenCards.length = 0;
				this.numMatches++;
				this.canMove = true;
			} else {
				// no match
				this.aweSound.play();

				this.time.addEvent({
					delay: 2000,
					callbackScope: this,
					callback: function() {
						for (let n = 0; n < this.chosenCards.length; n++) {
							this.chosenCards[n].cardBackSprite.alpha = 1;

							this.chosenCards[n].ObjectSelected = false;
						}

						this.chosenCards.length = 0;
						this.canMove = true;
					},
				});
			}
		}

		if (this.numMatches == numObjects) {
			// game over - restart new game
			this.time.addEvent({
				delay: 2000,
				callbackScope: this,
				callback: function() {
					this.scene.start('PlayGameScene');
				},
			});
		}
	}
}