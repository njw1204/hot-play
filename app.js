const express = require("express");
const helmet = require("helmet");
const validate = require("./replay-validate");
const fs = require("fs");
const app = express();


app.use(express.static("public"));
app.use(helmet());
app.set("view engine", "ejs");
app.set("views", "./views");


app.get("/sample", function(req, res) {
    fs.readFile("./sample_dataset/sample3.json", "utf8", function(err, data) {
        if (err) throw err;
        res.render("index", {
            replay: data
        });
    });
});


app.get("/replay", function(req, res) {
    validate(req.body, function(err) {
        if (err) throw err;
        res.render("index", {
            replay: req.body
        });
    });
});


app.listen(3000, function () {
    console.log("Listening on port 3000..");
});
