window.addEventListener("load", function() {
    onResizeFn();
});
window.addEventListener("resize", function() {
    onResizeFn();
});

function onResizeFn() {
    var app = document.getElementById("app");
    var screen_ratio = window.innerHeight / (app.offsetHeight + 30);
    document.getElementById("app").style.transform = "scale(" + screen_ratio + ")";
    return screen_ratio;
}
