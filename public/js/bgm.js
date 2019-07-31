var bgmList = ["assets/bgm/Legends Never Die.mp3", "assets/bgm/RISE.mp3"];


function initBGM() {
    document.getElementById("bgm-check").addEventListener("input", function() {
        if (this.checked) {
            window.bgm = new Howl({
                src: shuffle(bgmList),
                autoplay: true,
                loop: true
            });
        }
        else {
            window.bgm.stop();
        }
    });
}


function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
