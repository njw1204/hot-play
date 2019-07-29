const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const logger = require("morgan");
const httpStatus = require("http-status");
const cors = require("cors");
const router = require("./router");
const swaggerDocument = require("./swagger/hotplay.json");


const app = express();
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(logger("short"));
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.static("public"));
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({limit: "10mb", extended: false}));
app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: ".swagger-ui .topbar { display: none }"
}));
app.use("/", router);


app.use(function(err, req, res, next) {
    let msg = null;
    res.status(400);

    if (err.type === "CustomError") {
        res.status(err.statusCode);
        msg = err.msg;
    }
    else if (err.statusCode) {
        if (err.type === "entity.parse.failed") {
            msg = "Invalid JSON";
        }
        else {
            msg = err.type;
        }
    }
    else if (err.type === "entity.too.large") {
        res.status(413);
    }
    else {
        next(err);
        return;
    }

    res.render("error", {
        error_code: res.statusCode,
        error_summary: httpStatus[res.statusCode],
        error_message: msg
    });
});


app.use(function(err, req, res, next) {
    console.log(err);
    res.status(500);
    res.render("error", {
        error_code: res.statusCode,
        error_summary: httpStatus[res.statusCode],
        error_message: null
    })
});


app.use(function(req, res, next) {
    res.status(404).render("404");
});


app.listen(3000, function () {
    console.log("Listening on port 3000..");
});
