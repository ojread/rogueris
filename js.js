// Constants and global vars.
var tileSize = 32;
var tileSheetWidth = 10;	// Numer of tiles across the tilesheet.
var boardWidth = 10, boardHeight = 20;


var gameTicks;
var enemyLevelUpSpeed;
var playerLevel;
var enemyLevel;
var playerCurrentXp;
var playerRequiredXp;
var playerSwords;
var playerTreasure;
var playerHealth;

var playerX;
var playerY;

// Percentage of getting each type of tile.
var enemyChance = 15;
var heartChance = 10;
var swordChance = 30;
var goldChance = 5
var wallChance = 20;

var TITLESCREEN = 0;
var INSTRUCTIONS = 1;
var MAINGAME = 2;
var GAMEOVERLOSE = 3;
var GAMEOVERWIN = 4;

var gameState;

var numHours = 8;


// 2d array of tiles.
var board;

// Milliseconds between drops.
var dropSpeed;
var dropped;

// Current and next blocks.
var currentBlock, nextBlock;

// Create the 7 shapes.
var shapes = new Array();
shapes.push(new Shape(-1,0, -1,1, 0,1));
shapes.push(new Shape(-2,0, -1,0, 1,0));
shapes.push(new Shape(-1,1, 0,1, 1,0));
shapes.push(new Shape(-1,0, 0,1, 1,1));
shapes.push(new Shape(-1,0, 0,1, -1,1));
shapes.push(new Shape(-1,0, 1,0, 1,1));
shapes.push(new Shape(-1,0, 0,1, 1,0));




// Create the canvas context;
var c=document.getElementById("canvas");
var ctx=c.getContext("2d");


var tiles = new Image();
tiles.src = 'tiles.png';

tiles.onload = function() {
	// Start game after graphics have loaded.
	document.onkeydown = keyDown;
	document.onkeyup = keyUp;
	gameState = TITLESCREEN;
	//init();
	// Start the game loop and repeat.
	var interval = setInterval(run, 1000 / 30);	// 30 FPS.
}


// Main loop.
function run() {
	switch (gameState)
	{
		case TITLESCREEN:
		
			doTitleScreen();
		
		break;
		
		case INSTRUCTIONS:
		
			doInstructions();
		
		break;
		
		case MAINGAME:
		
			update();
			draw();
		
		break;
		
		case GAMEOVERWIN:
		
			doGameOverWin();
		
		break;
		
		case GAMEOVERLOSE:
		
			doGameOverLose();
		
		break;
	}

	// To stop the game, use the following:
	//clearInterval(interval);
}


function init() {
	// Set all board tiles to null;
	board = new Array();
	for (var x=0; x<boardWidth; x++) {
		board[x] = new Array();
		for (var y=0; y<boardHeight; y++) {
			board[x][y] = null;
		}
	}
	dropSpeed = 30;
	currentBlock = null;
	nextBlock = new Block();
	startNextBlock();
	
	enemyLevel = 1;
	playerLevel = 1;
	getLevelUpInfo();
	
	gameTicks = 0;
	enemyLevelUpSpeed = 600;
	
	playerHealth = 8;
	playerSwords = 8;
	playerTreasure = 0;
	
	dropped = false;
	
	playerX = 0;
	playerY = 19;
	board[0][19] = new Tile(true);
	board[0][19].sprite = 1;
	board[0][19].content = 3;
}


function update() {
	gameTicks++;
	if (gameTicks % enemyLevelUpSpeed == 0)
	{
		enemyLevel++;
		if (enemyLevel > 20) { enemyLevel = 20;}
	
	}
	
	if (gameTicks % dropSpeed == 0) {
		if (!dropped) {
			dropBlock();
		} else {
			dropped = false;
		}
	}
	
	checkLines();
}


function draw() {
	ctx.clearRect (0, 0, ctx.canvas.width, ctx.canvas.height);
	
	ctx.fillStyle = "#000"
	ctx.fillRect(0,0,320,640)
	
	for (var x=0; x<boardWidth; x++) {
		for (var y=0; y<boardHeight; y++) {
			if(board[x][y] != null) {
				drawTile(x, y, board[x][y].sprite);
				drawTile(x, y, board[x][y].content);
				
				// Draw enemy level.
				if(board[x][y].content == 4) {
					ctx.fillStyle = "#FFFFFF"
					ctx.font = "bold 10pt Monospace";
					ctx.textAlign = "right";
					ctx.fillText(enemyLevel, x * tileSize + 31, y * tileSize + 28);
					ctx.textAlign = "left"
				}
			}
		}
	}
	drawBlock();
	drawPlayer();
	drawHud();
}


// When there is no current block, bring in the next one.
function startNextBlock() {
	// Check for end game.	
	// Place the current block's tiles onto the board.
	if (currentBlock) {
		
		if (currentBlock.pos.y < 0) {
			gameState = GAMEOVERLOSE;
		}
		
		for(var i=0; i<4; i++) {
			p = currentBlock.shape.getPoint(i, currentBlock.orientation);
			board[currentBlock.pos.x + p.x][currentBlock.pos.y + p.y] = currentBlock.tiles[i];
		}
	}
	
	currentBlock = nextBlock;
	nextBlock = new Block();
}


// x,y = pos to draw the tile  i = index of tile in tilesheet.
function drawTile(x, y, i) {
	var sx = i % tileSheetWidth * tileSize;
	var sy = Math.floor(i / tileSheetWidth)  * tileSize;
	ctx.drawImage(tiles, sx, sy, tileSize, tileSize, x*tileSize, y*tileSize, tileSize, tileSize);
}


function randUnder(i) {
	return Math.floor(Math.random() * i);
}


function getLevelUpInfo()
{
	playerCurrentXp = 0;
	playerRequiredXp = Math.floor(playerLevel * 1.2) + 5;

}

// x,y = pos to draw the tile  i = index of tile in tilesheet.
function drawXpBar(x,y) {
	ctx.font = "14pt Monospace";
	ctx.fillStyle = "#DDDDDD"
	ctx.fillText("XP", x-30, y+25);
	var xpAsPercent = (playerCurrentXp / playerRequiredXp)
	ctx.drawImage(tiles, 0, 64, 256, 32, x,y, 256, 32);
	ctx.drawImage(tiles, 0, 32, xpAsPercent * 256, 32, x,y, (xpAsPercent*256), 32);
	
	ctx.fillText("Level: " + playerLevel, x-30, y+55);
	ctx.fillText("Enemy Level: " + enemyLevel, x+98, y+55);
}

function drawSwords(x,y)
{
	ctx.fillStyle = "#DDDDDD"
	ctx.fillRect(x, y, 256,64)
	ctx.fillStyle = "#808080"
	ctx.fillRect(x+1, y+1, 254,62)
	ctx.font = "14pt Monospace";
	ctx.fillStyle = "#DDDDDD"
	ctx.fillText("Swords:", x-30, y-10);
	
	for (i = 0; i < playerSwords; i++)
	{
		ctx.drawImage(tiles, 160, 0, tileSize, tileSize, x + ((i % 8)*tileSize),y + ((Math.floor(i/8))*tileSize) , tileSize, tileSize);
	}

}


function drawTreasure(x,y)
{
	ctx.fillStyle = "#DDDDDD"
	ctx.fillRect(x, y, 256,256)
	ctx.fillStyle = "#808080"
	ctx.fillRect(x+1, y+1, 254,254)
	ctx.font = "14pt Monospace";
	ctx.fillStyle = "#DDDDDD"
	ctx.fillText("Treasure:", x-30, y-10);
	
	for (i = 0; i < playerTreasure; i++)
	{
		ctx.drawImage(tiles, 192, 0, tileSize, tileSize, x + ((i % 8)*tileSize),y + ((Math.floor(i/8))*tileSize) , tileSize, tileSize);
	}

}

function drawHealth(x,y)
{
	ctx.fillStyle = "#DDDDDD"
	ctx.fillRect(x, y, 256,64)
	ctx.fillStyle = "#808080"
	ctx.fillRect(x+1, y+1, 254,62)
	ctx.font = "14pt Monospace";
	ctx.fillStyle = "#DDDDDD"
	ctx.fillText("Health:", x-30, y-10);
	
	for (i = 0; i < playerHealth; i++)
	{
		ctx.drawImage(tiles, 224, 0, tileSize, tileSize, x + ((i % 8)*tileSize),y + ((Math.floor(i/8))*tileSize) , tileSize, tileSize);
	}
	

}

function awardXp(amount)
{
	playerCurrentXp += amount;
	if (playerCurrentXp >= playerRequiredXp)
	{
		playerCurrentXp = playerRequiredXp;
		playerLevel++;
		if (playerLevel > 100) {playerLevel = 100;}
		getLevelUpInfo()
	}

}


function drawHud()
{
	drawXpBar(360,10);
	drawSwords(360,125);
	drawHealth(360,230);
	drawTreasure(360,335);

}



function movePlayer(dx,dy)
{
	var x = playerX + dx;
	var y = playerY + dy;
	
	if ((x >= 0) && (x < boardWidth) && (y >= 0) && (y < boardHeight))
	{
		if (board[x][y] != null)
		{
			if (board[x][y].sprite != 2) {  // If not a wall, move.
				// Interact with tile.
				switch(board[x][y].content)
				{
				//4 = monster, 5 = sword, 6 = treasure, 7 = heart
					case 4:
						
						var difference =  enemyLevel - playerLevel;
						if (difference > 0)
						{
							if (playerSwords < difference)
							{
									playerHealth -= (difference - playerSwords);
									playerSwords = 0;
									if (playerHealth <= 0) { gameState = GAMEOVERLOSE};
							}
							else
							{
								playerSwords -= difference;
							}
								
							
						
						}
						
						
					
					break;
					
					case 5:
					
						playerSwords++;
						if (playerSwords > 16) {playerSwords = 16;}
					
					break;
					
					case 6:
					
						playerTreasure++;
						if (playerTreasure >= 64) {playerTreasure = 64; gameState = GAMEOVERWIN;}
					
					break;
					
					case 7:
					
						playerHealth++;
						if (playerHealth > 16) {playerHealth = 16;}				
					
					break;
					
				
				
				
				}
				
			
			
				// Clear tile.
				board[playerX][playerY].content = 0;
				playerX = x;
				playerY = y;
				// Tile content is now the player.
				board[x][y].content = 3;
			}
		}
		
	}

	

}

function drawPlayer()
{	
	//ctx.drawImage(tiles, 96, 0, tileSize, tileSize, playerX * tileSize + 1, playerY * tileSize +1, tileSize, tileSize);
	ctx.fillStyle = "#FFFFFF"
	ctx.font = "bold 10pt Monospace";
	ctx.textAlign = "right";
	ctx.fillText(playerLevel, playerX * tileSize + 31, playerY * tileSize + 28);
	ctx.textAlign = "left"
}


function checkLines() {
	// Check for empty lines.
	var lineFull, noContent;
	// Moving upwards.
	for(var y=boardHeight-1; y>=0; y--) {
		lineFull = true;
		noContent = true;
		for(var x=0; x<boardWidth; x++) {
			if(board[x][y] == null) {
				lineFull = false;
			} else {
				if(board[x][y].content > 0) noContent = false;
			}
		}
		if(lineFull && noContent) removeLine(y);
	}
}


function removeLine(i) {
	// Moving upwards.
	for(var y=i; y>=1; y--) {
		// Move the row above down one.
		for(var x=0; x<boardWidth; x++) {
			board[x][y] = board[x][y-1];
			//board[x][y].content = board[x][y-1].content;
			
			// Move player down if needed.
			if(playerY < y) playerY++;
		}
	}
	awardXp(5);
}


// Block movement functions
function moveBlock(dx, dy, rotate) {
	var p, x, y, o;
	if(rotate) {
		o = getNextOrientation();
	} else {
		o = currentBlock.orientation;
	}
	
	if(blockFits(dx, dy, o)) {
		currentBlock.pos.x += dx;
		currentBlock.pos.y += dy;
		currentBlock.orientation = o;
	}
}
function blockFits(dx, dy, o) {
	// For each tile in the block,
	for(var i=0; i<4; i++) {
		// Does it fit in the new position?
		p = currentBlock.shape.getPoint(i, o);
		x = currentBlock.pos.x + p.x + dx;
		y = currentBlock.pos.y + p.y + dy;
		if(x>=0 && x<boardWidth && y<boardHeight) {
			if(y<boardHeight) {
				if(board[x][y] != null) return false; 
			}	
		} else return false;
	}
	return true;
}
function dropBlock() {
	if(blockFits(0, 1, currentBlock.orientation)) {
		moveBlock(0,1);
	} else {
		startNextBlock();
	}
}
function getNextOrientation() {
	var o = currentBlock.orientation + 1;
	if(o > 3) o = 0;
	return o;
}

function drawBlock() {
	var p;
	// Draw this block's tiles
	for(var i=0; i<4; i++) {
		p = currentBlock.shape.getPoint(i, currentBlock.orientation);
		drawTile(currentBlock.pos.x + p.x, currentBlock.pos.y + p.y, currentBlock.tiles[i].sprite);
		drawTile(currentBlock.pos.x + p.x, currentBlock.pos.y + p.y, currentBlock.tiles[i].content);
		
		// Draw enemy level.
		/*if(currentBlock.tiles[i].content == 4) {
			ctx.fillStyle = "#FFFFFF"
			ctx.font = "bold 10pt Monospace";
			ctx.textAlign = "right";
			ctx.fillText(enemyLevel, currentBlock.pos.x + p.x * tileSize + 31, currentBlock.pos.y + p.y * tileSize + 28);
			ctx.textAlign = "left"
		}*/
		
	}
}





function doTitleScreen()
{
	ctx.clearRect (0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.font = "12pt Monospace";
	ctx.fillStyle = "#DDDDDD";
	ctx.textAlign = "center";
	ctx.fillText("Made in " + numHours + " hours!", 320, 300);
	ctx.fillText("August 2012, Ollie Read & Neil Dansey", 320, 330);
	ctx.fillText("Press 'i' for instructions", 320, 450);
	ctx.fillText("Press 'ENTER' to begin", 320, 480);
	
	ctx.drawImage(tiles, 0, 128, 256, 128, (640 / 2) - 128,100 , 256, 128);
	
	ctx.textAlign = "left";
	
	
}

function doInstructions()
{
	ctx.clearRect (0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.font = "16pt Monospace";
	ctx.fillStyle = "#DDDDDD";
	ctx.textAlign = "center";
	ctx.fillText("Instructions", 320, 70);
	
	ctx.font = "12pt Monospace";
	ctx.fillText("You need both hands to play this game.", 320, 120);
	ctx.fillText("With your right hand, use the arrow keys to move around,", 320, 160);
	ctx.fillText("and with your left hand, use WASD to play Tetris.", 320, 180);
	ctx.fillText("(W = rotate, by the way)", 320, 200);
	ctx.fillText("Complete lines and empty them of stuff to level up.", 320, 240);
	ctx.fillText("Lines will only clear if they have been completely emptied", 320, 280);
	ctx.fillText("of enemies, treasure and swords (and you).", 320, 300);
	ctx.fillText("Attacking monsters is bad if your level is lower than theirs", 320, 340);
	ctx.fillText("- You will lose hearts equal to the difference between levels.", 320, 360);
	ctx.fillText("Pick up swords to negate this damage when it happens.", 320, 380);
	ctx.fillText("Pick up hearts to get hearts.", 320, 420);
	ctx.fillText("You will lose if you run out of hearts, or if you lose Tetris.", 320, 460);
	ctx.fillText("Get 64 treasures to win the game and incite", 320, 500);
	ctx.fillText("THE ROGUE-RIS-ENING!!!1", 320, 520);
	ctx.fillText("We have no idea if this is a good or bad thing.", 320, 540);
	
	ctx.fillText("Press 'i' to go back, or 'ENTER' to start...", 320, 600);
	
	ctx.textAlign = "left";
	
}

function doGameOverWin()
{
	ctx.clearRect (0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.font = "16pt Monospace";
	ctx.fillStyle = "#DDDDDD";
	ctx.textAlign = "center";
	ctx.fillText("GAME OVER", 320, 70);
	
	ctx.font = "12pt Monospace";
	ctx.fillText("Well I never.", 320, 220);
	ctx.fillText("You won. The Rogue-Ris-ening can commence!", 320, 240);

	
	ctx.fillText("Press 'ENTER' to continue...", 320, 600);
	
	ctx.textAlign = "left";
	
}

function doGameOverLose()
{
	ctx.clearRect (0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.font = "16pt Monospace";
	ctx.fillStyle = "#DDDDDD";
	ctx.textAlign = "center";
	ctx.fillText("GAME OVER", 320, 70);
	
	ctx.font = "12pt Monospace";
	ctx.fillText("How unfortunate.", 320, 220);
	ctx.fillText("You lost. The Rogue-Ris-ening has been postponed!", 320, 240);

	
	ctx.fillText("Press 'ENTER' to continue...", 320, 600);
	
	ctx.textAlign = "left";
	
}







// Object prototypes.

// A tile on the board or in a block.
function Tile(empty) {	
	var i = randUnder(100);
	
	this.sprite = 1;		// Sprite index. null = nothing, 1 = floor, 2 = wall
	this.content = 0; 	// what is in the room: 0 = nothing, 4 = monster, 5 = sword, 6 = treasure, 7 = heart
	
	if (!empty) {
		switch (true) {
			case (i < enemyChance):
				this.content = 4;
				break;
			case (i < enemyChance + swordChance):
				this.content = 5;
				break;
			case (i < enemyChance + swordChance + goldChance):
				this.content = 6;
				break;
			case (i < enemyChance + swordChance + goldChance + heartChance):
				this.content = 7;
				break;
			case (i < enemyChance + swordChance + goldChance + heartChance + wallChance):
				this.sprite = 2;
				break;
		}
	}
}


// A tetronimo block of 4 tiles.
function Block() {
	this.pos = new Point(5,-1);
	this.orientation = 0;
	this.shape = shapes[randUnder(shapes.length)];
	this.tiles = new Array();
	for(var i=0; i<4; i++) {
		this.tiles.push(new Tile());
	}
}


// Shapes of tetronimo blocks
function Shape(x1, y1, x2, y2, x3, y3) {
	this.tiles = new Array();
	this.tiles.push(new Point(0,0));	// 0,0 filled in all shapes.
	this.tiles.push(new Point(x1,y1));
	this.tiles.push(new Point(x2,y2));
	this.tiles.push(new Point(x3,y3));
	
	this.getPoint = function(i, o) {
		// Return the given point, rotated to the given orientation.
		p = this.tiles[i];
		switch(o) {
			case 0:
				x = p.x;
				y = p.y;
				break;
			case 1:
				x = -p.y;
				y = p.x;
				break;
			case 2:
				x = -p.x;
				y = -p.y;
				break;
			case 3:
				x = p.y;
				y = -p.x;
				break;
		}
		return new Point(x,y);
	}
}


function Point(x, y) {
	this.x = x;
	this.y = y;
}


// Keyboard
function Key(code) {
	this.code = code;
	this.pressed = false;
}
keys = new Array();

keys[73] = new Key('if (gameState == TITLESCREEN) { gameState = INSTRUCTIONS; } else if (gameState == INSTRUCTIONS) { gameState = TITLESCREEN;}'); //i for instructions
keys[13] = new Key('if (gameState == TITLESCREEN || gameState == INSTRUCTIONS) { gameState = MAINGAME; init(); } else if (gameState == GAMEOVERWIN || gameState == GAMEOVERLOSE) { gameState = TITLESCREEN}'); //enter to begin


keys[37] = new Key('movePlayer(-1,0)'); // left
keys[38] = new Key('movePlayer(0,-1)'); // up
keys[39] = new Key('movePlayer(1,0)'); // right
keys[40] = new Key('movePlayer(0,1)'); // down

keys[65] = new Key('moveBlock(-1,0,false);'); 	// A
keys[68] = new Key('moveBlock(1,0,false);'); 	// D
keys[83] = new Key('dropBlock(); dropped = true;'); 				// S
keys[87] = new Key('moveBlock(0,0,true);'); 			// W

//document.onkeydown = keyDown;
//document.onkeyup = keyUp;

function keyDown(e) {
    e = e || window.event;
	
	
	
	
    if(keys[e.keyCode] != null) {
		if(keys[e.keyCode].pressed == false) {
			eval(keys[e.keyCode].code);
			if(e.keyCode != 83)
			{
				keys[e.keyCode].pressed = true;
			}
				
		}		
	}
	return false;
}

function keyUp(e) {
    e = e || window.event;
    if(keys[e.keyCode] != null) {
		keys[e.keyCode].pressed = false;
	}
	return false;
}
