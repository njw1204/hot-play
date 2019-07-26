window.onload = function() {
    Application = PIXI.Application;
    Container = PIXI.Container;
    loader = PIXI.loader;
    resources = PIXI.loader.resources;
    TextureCache = PIXI.utils.TextureCache;
    Sprite = PIXI.Sprite;
    Rectangle = PIXI.Rectangle;

    window.app = new Application(800, 800);
    document.body.appendChild(app.view);
    app.stage.filters = [new PIXI.filters.AlphaFilter()];
    app.stage.filterArea = app.screen;

    var loadList = [
        {name: "map", url: "assets/map/" + replay.info.map + ".jpg"},
        {name: "tower", url: "assets/object/tower.png"},
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

    for (var i = 0; i < replay.info.players.length; i++) {
        var user = replay.info.players[i];
        user.sprite = new Sprite(resources[user.character].texture);
        user.sprite.scale.set(replay.info.playerScale);
        user.sprite.anchor.set(0.5);
        user.sprite.position.set(180 + i * 50, 65);

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
            }
            else if (e.type === "CREATE") {
                var data = e.data;
                ingameFixedObjects[data.id] = new Sprite(resources[data.sprite].texture);
                var sprite = ingameFixedObjects[data.id];

                if (data.tint !== undefined && data.tint !== null)
                    sprite.tint = parseInt(data.tint, 16);

                sprite.anchor.set(0.5);
                sprite.position.set(data.x, data.y);
                app.stage.addChild(sprite);
            }
            else if (e.type === "REMOVE") {
                ingameFixedObjects[e.data.id].visible = false;
            }
            eventQueuePos++;
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
