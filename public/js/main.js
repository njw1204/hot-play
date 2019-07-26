window.onload = function() {
    Application = PIXI.Application;
    Container = PIXI.Container;
    loader = PIXI.loader;
    resources = PIXI.loader.resources;
    TextureCache = PIXI.utils.TextureCache;
    Sprite = PIXI.Sprite;
    Rectangle = PIXI.Rectangle;
    Graphics = PIXI.Graphics;

    window.app = new Application({
        width: 800,
        height: 800
    });
    document.body.appendChild(app.view);
    app.stage.filters = [new PIXI.filters.AlphaFilter()];
    app.stage.filterArea = app.screen;

    var loadList = [
        {name: "map", url: "assets/map/" + replay.info.map + ".jpg"},
        {name: "tower", url: "assets/object/tower.png"},
        {name: "package", url: "assets/object/package.png"},
        {name: "defaultPlayer", url: "assets/character/normal.png"},
    ]
    addLOLImageLoad(loadList);
    loader.add(loadList).load(setup);
};


function setup() {
    var filterBlue = new PIXI.filters.OutlineFilter(2, 0x0000ff);
    var filterRed = new PIXI.filters.OutlineFilter(2, 0xff0000);

    var map = new Sprite(resources.map.texture);
    map.width = app.screen.width;
    map.height = app.screen.height;
    app.stage.addChild(map);

    window.ingameFixedObjects = {};
    makeMoveInfoCollection();

    if (replay.info.interpolation) {
        window.interpolationMode = true;
    }

    for (var i = 0; i < replay.info.players.length; i++) {
        var user = replay.info.players[i];
        if (user.character)
            user.sprite = new Sprite(resources[user.character].texture);
        else
            user.sprite = new Sprite(resources.defaultPlayer.texture);

        user.sprite.scale.set(replay.info.playerScale);
        user.sprite.anchor.set(0.5);
        user.sprite.position.set(-999, -999);

        if (user.team === 1)
            user.sprite.filters = [filterBlue];
        else if (user.team === 2)
            user.sprite.filters = [filterRed];
    }

    for (var i = replay.info.players.length - 1; i >= 0; i--) {
        app.stage.addChild(replay.info.players[i].sprite);
    }

    startDraw();
}


function findPlayerById(id) {
    var players = replay.info.players;
    for (var i = 0; players.length; i++) {
        if (players[i].id === id) {
            return players[i];
        }
    }
}


function makeMoveInfoCollection() {
    var events = replay.timeline;
    var result = {};

    for (var i = 0; i < events.length; i++) {
        var e = events[i];
        if (e.type === "MOVE") {
            var data = e.data;

            if (result[data.id] === undefined) {
                result[data.id] = {
                    nextMoveIdx: 0,
                    arr: []
                };
            }

            result[data.id].arr.push({
                x: data.x,
                y: data.y,
                time: e.time
            });
        }
    }

    console.log(result);
    window.moveInfo = result;
}


function startDraw() {
    window.timeline = 0;
    window.eventQueuePos = 0;
    app.ticker.add(function(delta) {
        while (eventQueuePos < replay.timeline.length) {
            var e = replay.timeline[eventQueuePos];
            if (e.time > timeline)
                break;

            if (e.type === "MOVE") {
                var player = findPlayerById(e.data.id);
                player.sprite.position.set(e.data.x, e.data.y);
                window.moveInfo[e.data.id].nextMoveIdx++;
            }
            else if (e.type === "CREATE") {
                try {
                    var data = e.data;
                    ingameFixedObjects[data.id] = new Sprite(resources[data.sprite].texture);
                    var sprite = ingameFixedObjects[data.id];

                    if (data.tint !== undefined && data.tint !== null)
                        sprite.tint = parseInt(data.tint, 16);

                    sprite.anchor.set(0.5);
                    sprite.position.set(data.x, data.y);
                    app.stage.addChild(sprite);
                }
                catch (err) {
                    console.log(err);
                }
            }
            else if (e.type === "REMOVE") {
                try {
                    ingameFixedObjects[e.data.id].visible = false;
                }
                catch (err) {
                    console.log(err);
                }
            }
            else if (e.type === "KILL") {
                if (replay.info.canRevive === false) {
                    var victim = findPlayerById(e.data.victimId);
                    victim.sprite.tint = 0xDD0000;
                }
            }
            else if (e.type === "CIRCLE_ON") {
                if (ingameFixedObjects[e.data.id])
                    ingameFixedObjects[e.data.id].visible = false;
                ingameFixedObjects[e.data.id] = new Graphics();
                ingameFixedObjects[e.data.id].lineStyle(2, e.data.color, 1);
                ingameFixedObjects[e.data.id].drawCircle(e.data.x, e.data.y, e.data.radius);
                app.stage.addChild(ingameFixedObjects[e.data.id]);
            }

            eventQueuePos++;
        }

        if (interpolationMode) {
            var players = replay.info.players;
            for (var i = 0; i < players.length; i++) {
                var playerId = players[i].id, playerSprite = players[i].sprite;
                var playerMoveInfo = moveInfo[playerId];
                if (playerMoveInfo) {
                    if (playerMoveInfo.nextMoveIdx > 0 && playerMoveInfo.nextMoveIdx < playerMoveInfo.arr.length) {
                        var nextMoveIdx = playerMoveInfo.nextMoveIdx;
                        var beforeMove = playerMoveInfo.arr[nextMoveIdx - 1], afterMove = playerMoveInfo.arr[nextMoveIdx];
                        var computedMove = linearInterpolation(beforeMove, afterMove, timeline);
                        playerSprite.position.set(computedMove.x, computedMove.y);
                    }
                }
            }
        }

        if (eventQueuePos < replay.timeline.length)
            timeline += replay.info.msPerFrame;
    });
}


function GetMouseTouchScreenXY() {
	var mouse = app.renderer.plugins.interaction.mouse.global;
	MouseX = mouse.x;
	MouseY = mouse.y;
}


function linearInterpolation(beforeMove, afterMove, nowTime) {
    var leftDist = nowTime - beforeMove.time, rightDist = afterMove.time - nowTime;
    var totalDist = leftDist + rightDist;
    var computedMove = {
        x: rightDist / totalDist * beforeMove.x + leftDist / totalDist * afterMove.x,
        y: rightDist / totalDist * beforeMove.y + leftDist / totalDist * afterMove.y,
        time: nowTime
    }
    return computedMove;
}
