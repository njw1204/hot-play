window.addEventListener("resize", function() {
    onResizeFn();
});

function onResizeFn() {
    var app = document.getElementById("app");
    var header = document.getElementsByClassName("header")[0];
    var control = document.getElementsByClassName("replay-control")[0];
    var canvas = document.getElementsByTagName("canvas")[0];

    control.style.width = "100%";
    header.style.width = "";
    canvas.style.height = "";

    canvas.style.height = (app.offsetHeight - header.offsetHeight - control.offsetHeight - 80) + "px";
    canvas.style.width = canvas.style.height;
    header.style.width = canvas.style.width;
    control.style.width = canvas.style.width
    console.log(canvas.style.height);
    return canvas.style.height;
}
