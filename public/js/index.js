window.onload = function() {
    window.vueApp = new Vue({
        el: "#app",
        data: {
            title: "HotPlay",
            timeline: 0,
            playerSpeed: window.replay.info.speed,
            playing: true,
            originPlayingState: true
        },
        computed: {
            timelineStr: function() {
                return makeTimerStrFromMs(this.timeline);
            },
            timelineMax: function() {
                return getLastEventTime();
            }
        },
        methods: {
            playerTemporaryPause: function() {
                this.originPlayingState = this.playing;
                this.playing = false;
            },
            playerRestore: function() {
                resetSprites();
                this.playing = this.originPlayingState;
            },
            refreshTimeline: function() {
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

    initPIXI();
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
