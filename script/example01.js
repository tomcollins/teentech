var canvas;
var canvasX;
var canvasY;
var stage;
var canvasWidth = 900;
var canvasHeight = 564;
var textMargin;
var tileWidth = 64;
var tileHeight = 64;
var isStartingFirstGame;

// Player

var bmpPlayer;
var bmpPlayerWidth = 100;
var bmpPlayerHeight = 277;

var playerStartX = 0;
var playerStartY = 0;
var playerSpeedX = 5;
var playerSpeedY = 0.2;

var isJumping = false;
var isMovingLeft = false;
var isMovingRight = false;

// Monster

var bmpMonsterContainer;
var bmpMonster;
var bmpMonsterWidth = 160;
var bmpMonsterHeight = 225;

var monsterStartX = 0;
var monsterStartY = canvasHeight - tileHeight - bmpMonsterHeight;
var monsterSpeedX = 5;

var monsterIsEnabled = true;

//Background

var bmpMonster;

// Gravity

var gravity = 0.01;
var gravivityIsEnabled = true;

// Boundry

var boundryIsEnabled = false;
var playerMinX;
var playerMaxX;

// Misc

var numberOfImagesLoaded = 0;
var imgTileFloor = new Image();
var imgPlayer = new Image();
var imgMonster = new Image();
var imgBackground = new Image();
var gridGenerator;
var grid;
var lineX, lineY, playerBox;
var isShowingGraph = true;
var isShowingPlayerBox = true;


createjs.Sound.registerSound("assets/audio/exterminate.mp3", "exterminate");
createjs.Sound.registerSound("assets/audio/jump.mp3", "jump");

function init() {

    var canvasHtml = '<canvas id="mainCanvas" width="' +canvasWidth +'" height="' +canvasHeight +'" style="background-color:#607559"></canvas>';
    $('#canvasHolder').html(canvasHtml).hide();
    canvas = document.getElementById("mainCanvas");
    
    imgTileFloor.onload = handleImageLoad;
    imgTileFloor.onerror = handleImageError;
    imgTileFloor.src = "assets/tiles/dirt_grass.png";
    imgPlayer.onload = handleImageLoad;
    imgPlayer.onerror = handleImageError;
    imgPlayer.src = "assets/doctor01.png";
    imgMonster.onload = handleImageLoad;
    imgMonster.onerror = handleImageError;
    imgMonster.src = "assets/dalek.png";
    imgBackground.onload = handleImageLoad;
    imgBackground.onerror = handleImageError;
    imgBackground.src = "assets/background/blue_01.jpg";

    textMargin = 30;
    gridGenerator = new GridGenerator(canvasWidth, canvasHeight - tileHeight, textMargin);
    var dataURL = gridGenerator.toDataURL();
    gridGenerator.destroy();

    canvasX = 30;
    canvasY = 30;
    $('#canvasHolder').css({
        position: 'absolute',
        top: canvasY,
        left: canvasX
    });

    /*
    $('#formHolder').css({
        position: 'absolute',
        top: canvasY + canvasHeight,
        left: canvasX
    });
    */

    $('#wrapper').append('<img id="grid" width="' +(canvasWidth+textMargin+textMargin) +'" height="' +(canvasHeight-tileHeight+textMargin+textMargin) +'" />');
    $('#grid').attr('src', dataURL);
    $('#grid').css({
        position: 'absolute',
        top: canvasY - textMargin,
        left: canvasX - textMargin
    });
    $('#wrapper').append('<span id="playerBox"/><span id="lineX"/><span id="lineY"/>');
    lineX = $('#lineX').hide();
    lineY = $('#lineY').hide();
    playerBox = $('#playerBox').hide();
    var lineOverhang = 10;
    lineX.css({
        width: 1,
        height: canvasHeight - tileHeight + lineOverhang,
        left: canvasX,
        top: canvasY
    });
    lineY.css({
        width: canvasWidth + lineOverhang,
        height: 1,
        left: canvasX - lineOverhang,
        top: canvasY + canvasHeight - tileHeight
    });
    playerBox.css({
        width: bmpPlayerWidth,
        height: bmpPlayerHeight,
        left: canvasX,
        top: canvasY + canvasHeight - bmpPlayerHeight
    });
}

function handleImageLoad(e) {
    numberOfImagesLoaded++;
    if (numberOfImagesLoaded == 4) {
        numberOfImagesLoaded = 0;
        $('#reset').on('click', function() {
            reset();
        });
        startKeyListener();
    }
}

function handleImageError(e) {
    console.log("Error Loading Image : " + e.target.src);
}

function reset() {
    isStartingFirstGame = false;
    $('#canvasHolder').show();
    if (stage) {
        stage.removeAllChildren();
        createjs.Ticker.removeAllListeners();
        stage.update();

        isShowingGraph = true;
        isShowingPlayerBox = true;
        $('#grid').show();
        lineX.show();
        lineY.show();
        playerBox.show();
        playerBox.css('opacity', 1);
    } else {
        isStartingFirstGame = true;
    }
    startGame();

}

function startGame() {

    stage = new createjs.Stage(canvas);

    // Get game parameters

    playerStartX = Number($('#playerStartX').val());
    playerStartY = canvasHeight - tileHeight - bmpPlayerHeight - Number($('#playerStartY').val());
    playerMinX = Number($('#playerMinX').val());
    playerMaxX = Number($('#playerMaxX').val());

    monsterIsEnabled = $('#monsterIsEnabled').is(':checked');
    monsterSpeedX = Number($('#monsterSpeedX').val());

    boundryIsEnabled = $('#boundryIsEnabled').is(':checked');
    gravity = Number($('#gravity').val());
    gravityIsEnabled = $('#gravityIsEnabled').is(':checked');

    isMovingLeft = false;
    isMovingRight = false;
    isJumping = playerStartY + bmpPlayerHeight < canvasHeight - tileHeight;
    if (gravityIsEnabled) {
        isJumping = playerStartY + bmpPlayerHeight < canvasHeight - tileHeight;
    } else {
        isJumping = false;
    }

    // create background

    imgPlayer.width = canvasWidth;
    imgPlayer.height = canvasHeight;

    bmpBackground = new createjs.Bitmap(imgBackground);
    bmpBackground.name = "Background";
    var scale = imgBackground.width > imgBackground.height ? canvasWidth / imgBackground.width : canvasHeight / imgBackground.height;

    bmpBackground.scaleX = scale;
    bmpBackground.scaleY = scale;
    bmpBackground.visible = false;
    stage.addChild(bmpBackground);

    addFloorTiles();

    imgPlayer.width = bmpPlayerWidth;
    imgPlayer.height = bmpPlayerWidth;
    imgMonster.width = bmpMonsterWidth;
    imgMonster.height = bmpMonsterWidth;

    // create monster

    if (monsterIsEnabled) {
        bmpMonsterContainer = new createjs.Container();
        bmpMonsterContainer.x = monsterStartX;
        bmpMonsterContainer.y = monsterStartY;
        stage.addChild(bmpMonsterContainer);
        bmpMonster = new createjs.Bitmap(imgMonster);
        bmpMonster.name = "Monster";
        bmpMonster.direction = 'right';
        bmpMonsterContainer.addChild(bmpMonster);
        $('#info-monster').show();
    } else {
        $('#info-monster').hide();
    }

    // create player

    bmpPlayer = new createjs.Bitmap(imgPlayer);
    bmpPlayer.name = "Player";
    bmpPlayer.x = playerStartX;
    bmpPlayer.y = playerStartY;
    bmpPlayer.jumpTime = isJumping ? 11 : 0;
    bmpPlayer.isAlive = true;
    bmpPlayer.vX = 0;
    bmpPlayer.vY = isJumping ? 5 : 0;
    stage.addChild(bmpPlayer);

    createjs.Ticker.addListener(window);
    createjs.Ticker.useRAF = true;
    createjs.Ticker.setFPS(60);
}

function addFloorTiles() {
    var index, bmpTile;
    var numberOfTiles = canvasWidth / tileWidth;
    for (index = 0; index < numberOfTiles; index++) {
        bmpTile = new createjs.Bitmap(imgTileFloor);
        bmpTile.x = index * tileWidth;
        bmpTile.y = canvasHeight - tileHeight;
        stage.addChild(bmpTile);
    }
}

function startKeyListener() {
    $(document).keydown(function(e) {
        if (37 === e.keyCode) { 
            isMovingLeft = true;
            e.preventDefault();
        } else if (38 === e.keyCode) { 
            if (bmpPlayer && 0 === bmpPlayer.vY) {
                bmpPlayer.jumpTime = 1;
                isJumping = true;
                createjs.Sound.play('jump');
            }
            e.preventDefault();
        } else if (39 === e.keyCode) { 
            isMovingRight = true;
            e.preventDefault();
        } else if (40 === e.keyCode) { 
            e.preventDefault();
        } else if (84 === e.keyCode) { 
            if (isShowingGraph && isShowingPlayerBox) {
                isShowingPlayerBox = false;
                playerBox.css('opacity', 0.2);
            } else if (isShowingGraph) {
                isShowingGraph = false;
                $('#grid').hide();
                lineX.hide();
                lineY.hide();
                playerBox.hide();
            } else {
                isShowingGraph = true;
                isShowingPlayerBox = true;
                $('#grid').show();
                lineX.show();
                lineY.show();
                playerBox.show();
                playerBox.css('opacity', 1);
            }
        } else if (69 === e.keyCode) { 
            reset();
            e.preventDefault();
        }
    }).keyup(function(e) {
        if (37 === e.keyCode) { 
            isMovingLeft = false;
        } else if (38 === e.keyCode) { 
            isJumping = false;
        } else if (39 === e.keyCode) { 
            isMovingRight = false;
        } else if (40 === e.keyCode) { 
            
        }
    });
}
function tick() {

    // is left or right key down
    if (isMovingLeft && !isMovingRight) {
        bmpPlayer.vX = -playerSpeedX;
    } else if (isMovingRight && !isMovingLeft) {
        bmpPlayer.vX = playerSpeedX;
    }

    // horizontal deceleration 
    if (bmpPlayer.vX !== 0) {
        bmpPlayer.x += bmpPlayer.vX;
        bmpPlayer.vX = bmpPlayer.vX * 0.9;
        if (Math.abs(bmpPlayer.vX) < 1 ) {
            bmpPlayer.vX = 0;
        }
    }

    /**
     * Check horizontal boundries
     */

    if (boundryIsEnabled) {
        // check the left side of screen
        if (bmpPlayer.x < playerMinX) {
            bmpPlayer.x = playerMinX;
        }

        // check the right side of screen
        if (bmpPlayer.x + bmpPlayerWidth >= playerMaxX ) {
            bmpPlayer.x = playerMaxX - bmpPlayerWidth;
        }
    }

    /**
     * Vertical position
     */

    //if (gravityIsEnabled) {
        if (isJumping && 10 >= bmpPlayer.jumpTime) {
            bmpPlayer.vY -= playerSpeedY;
        }

        if (gravityIsEnabled && bmpPlayer.vY !== 0) {
            bmpPlayer.vY += gravity * bmpPlayer.jumpTime;
        }

        // Update Y position based on velocity
        if (bmpPlayer.vY !== 0) {
            var maxChangeY = 8;
            var changeY = bmpPlayer.vY * bmpPlayer.jumpTime;
            if (changeY > maxChangeY) {
                changeY = maxChangeY;
            }
            bmpPlayer.y += changeY;
            bmpPlayer.jumpTime++;
        }

        // check floor 
        var maxY = canvasHeight - tileHeight;
        if (bmpPlayer.y + bmpPlayerHeight > maxY) {
            bmpPlayer.y = maxY - bmpPlayerHeight;
            bmpPlayer.vY = 0;
        }
    //}

    // Move Monster

    if (monsterIsEnabled) {
        if ('right' == bmpMonster.direction) {
            bmpMonsterContainer.x += monsterSpeedX;
        } else {
            bmpMonsterContainer.x -= monsterSpeedX;
        }

        if (bmpMonsterContainer.x < 0) {
            bmpMonsterContainer.x = 0;
            bmpMonster.direction = 'right';
            bmpMonster.scaleX = 1;
            bmpMonster.x = 0;
        } else if (bmpMonsterContainer.x > canvasWidth - bmpMonsterWidth) {
            bmpMonsterContainer.x = canvasWidth - bmpMonsterWidth;
            bmpMonster.direction = 'left';
            bmpMonster.scaleX = -1;
            bmpMonster.x = bmpMonsterWidth;
        }

        // check collision

        var intersection = ndgmr.checkRectCollision(bmpMonsterContainer, bmpPlayer);
        if ( intersection ) {
            if (bmpPlayer.isAlive) {
                createjs.Sound.play('exterminate');
                bmpPlayer.alpha = 0;
                bmpPlayer.isAlive = false;
                setTimeout(function() {
                    bmpPlayer.x = playerStartX;
                    bmpPlayer.y = playerStartY;
                    bmpPlayer.alpha = 0.3;
                    setTimeout(function() {
                        bmpPlayer.isAlive = true;
                        bmpPlayer.alpha = 1;
                    }, 2000);
                }, 3000)
            }
        }
        
    }

    $('#playerX').text(parseInt(bmpPlayer.x));
    $('#playerY').text(canvasHeight - tileHeight - parseInt(bmpPlayer.y + bmpPlayerHeight));

    if (monsterIsEnabled) {
        $('#monsterX').text(parseInt(bmpMonsterContainer.x));
        $('#monsterY').text(canvasHeight - tileHeight - parseInt(bmpMonsterContainer.y + bmpMonsterHeight));
    }

    lineX.css({
        left: canvasX + bmpPlayer.x
    });
    lineY.css({
        top: canvasY + bmpPlayer.y + bmpPlayerHeight
    });
    playerBox.css({
        left: canvasX + bmpPlayer.x,
        top: canvasY + bmpPlayer.y
    });

    if (isStartingFirstGame) {
        lineX.show();
        lineY.show();
        playerBox.show();
        isShowingGraph = true;
        isShowingPlayerBox = true;
        isStartingFirstGame = false;
    }

    // update the stage:
    stage.update();
}
