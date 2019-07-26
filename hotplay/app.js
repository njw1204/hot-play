const express = require("express");
const app = express();

app.get("/", function(req, res) {
    res.send("Hello, world!");
});

app.listen(3000, function () {
    console.log("Listening on port 3000..");
});
