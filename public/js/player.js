function initPIXI() {
    Application = PIXI.Application;
    Container = PIXI.Container;
    loader = PIXI.loader;
    resources = PIXI.loader.resources;
    TextureCache = PIXI.utils.TextureCache;
    Sprite = PIXI.Sprite;
    Texture = PIXI.Texture;
    Rectangle = PIXI.Rectangle;
    Graphics = PIXI.Graphics;

    window.app = new Application({
        width: 800,
        height: 800,
        antialias: true
    });
    document.getElementById("player").appendChild(app.view);
    app.stage.filters = [new PIXI.filters.AlphaFilter()];
    app.stage.filterArea = app.screen;
    app.stage.sortableChildren = true;

    var loadList = [
        {name: "tower", url: "assets/object/tower.png"},
        {name: "package", url: "assets/object/package.png"},
    ];

    if (replay.info.map) {
        loadList.push({name: "map", url: "assets/map/" + replay.info.map + ".jpg"});
    }

    var gr = new Graphics();
    gr.lineStyle(3);
    gr.beginFill(0xFFFFFF);
    gr.drawCircle(0, 0, 16);
    gr.endFill();
    window.defaultPlayer = app.renderer.generateTexture(gr);

    addLOLImageLoad(loadList, getNeededPlayerSprites());
    loader.add(loadList).load(setupReplayer);
};


function getNeededPlayerSprites() {
    var result = [];
    var players = replay.info.players;

    for (var i = 0; i < replay.info.players.length; i++) {
        if (players[i].character)
            result.push(players[i].character);
    }

    return result;
}


function setupReplayer() {
    if (replay.info.map) {
        var map = new Sprite(resources.map.texture);
        map.width = app.screen.width;
        map.height = app.screen.height;
        map.zIndex = -10000;
        app.stage.addChild(map);
    }

    window.ingameFixedObjects = {};

    if (replay.info.interpolation)
        window.interpolationMode = true;
    else
        window.interpolationMode = false;

    window.filterBlue = new PIXI.filters.OutlineFilter(1.5, 0x0000FF);
    window.filterRed = new PIXI.filters.OutlineFilter(1.5, 0xFF0000);
    makeMoveInfoCollection();
    initPlayerSprites();
    startDrawing();
}


function initPlayerSprites() {
    var i;

    for (i = 0; i < replay.info.players.length; i++) {
        var user = replay.info.players[i];
        if (user.character)
            user.sprite = new Sprite(resources[user.character].texture);
        else
            user.sprite = new Sprite(window.defaultPlayer);

        user.sprite.scale.set(replay.info.playerScale);
        user.sprite.anchor.set(0.5);
        user.sprite.position.set(-999, -999);

        if (replay.info.players.length <= 10) {
            if (user.team === 1)
                user.sprite.filters = [filterBlue];
            else if (user.team === 2)
                user.sprite.filters = [filterRed];

            var teamName = ["BLUE", "RED"];
            var playerVue = findPlayerById(user.id, window.vueApp.playerList);
            playerVue.name = "[" + teamName[user.team - 1] + "] " + playerVue.name;
        }
    }

    for (i = replay.info.players.length - 1; i >= 0; i--) {
        app.stage.addChild(replay.info.players[i].sprite);
    }
}


function findPlayerById(id, list) {
    if (list) {
        players = list;
    }
    else {
        players = replay.info.players;
    }
    for (var i = 0; i < players.length; i++) {
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

    window.moveInfo = result;
}


function startDrawing() {
    window.eventQueuePos = 0;
    app.ticker.maxFPS = 60;

    app.ticker.add(function(delta) {
        if (vueApp.playing === true)
            draw();
    });
}


function draw() {
    while (eventQueuePos < replay.timeline.length) {
        var e = replay.timeline[eventQueuePos];
        if (e.time > vueApp.timeline)
            break;

        if (e.type === "MOVE") {
            var player = findPlayerById(e.data.id);
            player.sprite.position.set(e.data.x, e.data.y);
            window.moveInfo[e.data.id].nextMoveIdx++;
            findPlayerById(e.data.id, window.vueApp.playerList).visible = true;
        }
        else if (e.type === "CREATE") {
            try {
                var data = e.data;
                ingameFixedObjects[data.id] = new Sprite(resources[data.sprite].texture);
                var sprite = ingameFixedObjects[data.id];
                sprite.zIndex = -9;

                if (data.tint !== undefined && data.tint !== null)
                    sprite.tint = parseInt(data.tint, 16);

                sprite.anchor.set(0.5);
                sprite.position.set(data.x, data.y);
                app.stage.addChild(sprite);
                window.vueApp.eventList.push({
                    time: makeTimerStrFromMs(e.time),
                    event: "<strong>" + e.data.id + "</strong> has created."
                });
            }
            catch (err) {
                console.log(err);
            }
        }
        else if (e.type === "REMOVE") {
            try {
                ingameFixedObjects[e.data.id].visible = false;
                window.vueApp.eventList.push({
                    time: makeTimerStrFromMs(e.time),
                    event: "<strong>" + e.data.id + "</strong> has destroyed."
                });
            }
            catch (err) {
                console.log(err);
            }
        }
        else if (e.type === "KILL") {
            var killer = findPlayerById(e.data.killerId);
            var killerName;
            if (killer) {
                findPlayerById(e.data.killerId, window.vueApp.playerList).kill++;
                killerName = killer.name;
            }
            else {
                killerName = "System";
            }

            var victim = findPlayerById(e.data.victimId);
            if (replay.info.canRevive === false) {
                victim.sprite.tint = 0xDD0000;
                victim.sprite.zIndex = -1;
            }

            if (window.replay.info.players.length <= 10) {
                if (!killer) {
                    killer = {team : 0};
                }
                var classes = ["black", "blue", "red"];
                window.vueApp.eventList.push({
                    time: makeTimerStrFromMs(e.time),
                    event: "<strong class='" + classes[killer.team] + "'>" + killerName +
                        "</strong> has killed <strong class='" + classes[victim.team] + "'>" + victim.name + "</strong>."
                });
            }
            else {
                window.vueApp.eventList.push({
                    time: makeTimerStrFromMs(e.time),
                    event: "<strong>" + killerName + "</strong> has killed <strong>" + victim.name + "</strong>."
                });
            }


            victim = findPlayerById(e.data.victimId, window.vueApp.playerList);
            victim.death++;

            var assist = e.data.assistIds;
            if (assist) {
                for (var i = 0; i < assist.length; i++) {
                    try {
                        findPlayerById(assist[i], window.vueApp.playerList).assist++;
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
            }
        }
        else if (e.type === "CIRCLE_ON") {
            if (ingameFixedObjects[e.data.id]) {
                ingameFixedObjects[e.data.id].clear();
            }
            else {
                ingameFixedObjects[e.data.id] = new Graphics();
            }
            ingameFixedObjects[e.data.id].zIndex = -10;
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
            var playerMoveInfo = window.moveInfo[playerId];
            if (playerMoveInfo) {
                if (playerMoveInfo.nextMoveIdx > 0 && playerMoveInfo.nextMoveIdx < playerMoveInfo.arr.length) {
                    var nextMoveIdx = playerMoveInfo.nextMoveIdx;
                    var beforeMove = playerMoveInfo.arr[nextMoveIdx - 1], afterMove = playerMoveInfo.arr[nextMoveIdx];
                    var computedMove = linearInterpolation(beforeMove, afterMove, vueApp.timeline);
                    playerSprite.position.set(computedMove.x, computedMove.y);
                }
            }
        }
    }

    var passedMsTime = getFrameIntervalFromSpeed(vueApp.playerSpeed);
    if (vueApp.playing) {
        if (eventQueuePos < replay.timeline.length && vueApp.timeline + passedMsTime <= getLastEventTime())
            vueApp.timeline += passedMsTime;
        else
            vueApp.timeline = getLastEventTime();
    }
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


function getLastEventTime() {
    return replay.timeline[replay.timeline.length - 1].time;
}


function resetSprites() {
    // remove all players spirtes
    var players = replay.info.players;
    for (var i = 0; i < players.length; i++) {
        if (players[i].sprite instanceof Sprite) {
            players[i].sprite.parent.removeChild(players[i].sprite);
            players[i].sprite.destroy();
            players[i].sprite = null;
        }
    }

    // remove all fixed objects sprites
    for (var key in window.ingameFixedObjects) {
        window.ingameFixedObjects[key].parent.removeChild(window.ingameFixedObjects[key]);
        window.ingameFixedObjects[key].destroy();
        window.ingameFixedObjects[key] = null;
    }
    window.ingameFixedObjects = {};

    // reset sprites to initial state
    makeMoveInfoCollection();
    initPlayerSprites();
    window.eventQueuePos = 0;
    draw();
}


function convertFrameIntervalToSpeed(msPerFrame) {
    var fps = 60;
    var originMsPerFrame = 1000 / fps;
    var speed = parseInt(msPerFrame / originMsPerFrame);
    return speed;
}


function getFrameIntervalFromSpeed(speed) {
    var fps = 60;
    var originMsPerFrame = 1000 / fps;
    var msPerFrame = originMsPerFrame * speed;
    return msPerFrame;
}
