const express = require("express");
const validate = require("./replay-validate");
const httpStatus = require("http-status");
const router = express.Router();


router.get("/replay", function(req, res) {
    res.status(405).render("error", {
        error_code: res.statusCode,
        error_summary: httpStatus[res.statusCode],
        error_message: null
    });
});


router.post("/replay", function(req, res) {
    if (req.body.json === undefined) {
        replay = req.body;
    }
    else {
        replay = toJsonOrNull(req.body.json);
    }

    if (!(replay instanceof Object) || Object.keys(replay).length === 0) {
        throw {
            "type": "CustomError",
            "statusCode": 400,
            "msg": "Invalid JSON"
        };
    }
    else {
        validate(replay, function(err) {
            if (err) {
                throw {
                    "type": "CustomError",
                    "statusCode": 400,
                    "msg": err
                }
            }
            else {
                res.render("index", {
                    replay: JSON.stringify(replay, null, 0)
                });
            }
        });
    }
});


router.get("/", function(req, res) {
    res.render("main");
});


function toJsonOrNull(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
}


module.exports = router;
