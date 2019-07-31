window.onload = function() {
    setDefaultReplayValue();

    window.vueApp = new Vue({
        el: "#app",
        data: {
            title: "HotPlay",
            timeline: 0,
            canRevive: window.replay.info.canRevive,
            sortPlayerList: window.replay.info.sortPlayerList,
            playerSpeed: window.replay.info.speed,
            playing: true,
            originPlayingState: true,
            playerList: [],
            eventList: []
        },
        computed: {
            sortedPlayerList: function() {
                if (!this.sortPlayerList) {
                    return this.playerList;
                }
                else {
                    return this.playerList.slice().sort(function(a, b) {
                        var apt = 0, bpt = 0;
                        if (a.death) apt -= 10000000;
                        if (b.death) bpt -= 10000000;
                        apt += a.kill * 1000 + a.assist;
                        bpt += b.kill * 1000 + b.assist;
                        return -(apt - bpt);
                    });
                }
            },
            reversedEventList: function() {
                return this.eventList.slice().reverse();
            },
            timelineStr: function() {
                return makeTimerStrFromMs(this.timeline);
            },
            timelineMax: function() {
                return getLastEventTime();
            },
            pauseCaption : function() {
                if (this.playing === true) {
                    return "fa fa-pause";
                }
                else {
                    return "fa fa-play";
                }
            }
        },
        methods: {
            playerTemporaryPause: function() {
                this.originPlayingState = this.playing;
                this.playing = false;
            },
            playerRestore: function() {
                this.eventList = [];
                loadPlayerList();
                resetSprites();
                this.playing = this.originPlayingState;
            },
            refreshTimeline: function() {
                this.eventList = [];
                loadPlayerList();
                resetSprites();
            }
        },
        components: {
            VueSlider: window["vue-slider-component"]
        }
    });

    document.getElementById("replay-pause").addEventListener("click", function() {
        turnPause();
    });

    loadPlayerList();
    initPIXI();
    onResizeFn();
};


function makeTimerStrFromMs(ms) {
    var sec = parseInt(ms / 1000);
    var min = parseInt(sec / 60);
    sec %= 60;

    var timeline_min = (min < 10 ? "0" : "") + min.toString();
    var timeline_sec = (sec < 10 ? "0" : "") + sec.toString();
    return timeline_min + ":" + timeline_sec;
}


function turnPause() {
    if (!vueApp.playing)
        vueApp.playing = true;
    else
        vueApp.playing = false;
}


function setDefaultReplayValue() {
    var info = window.replay.info;

    var defaultList = [
        ["speed", 10],
        ["playerScale", 1],
        ["interpolation", true]
    ];

    for (var i = 0; i < defaultList.length; i++) {
        var j = defaultList[i];
        if (info[j[0]] === undefined) {
            info[j[0]] = j[1];
        }
    }
}


function loadPlayerList() {
    var players = window.replay.info.players;
    window.vueApp.playerList = [];
    for (var i = 0; i < players.length; i++) {
        var p = players[i];
        window.vueApp.playerList.push({
            id: p.id,
            name: p.name,
            kill: 0,
            death: 0,
            assist: 0,
            visible: false
        });
    }
}
