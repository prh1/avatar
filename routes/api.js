var express = require('express');
var router = express.Router();

module.exports = function (config, logger) {
    router.use(function (req, res, next) {
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
        next();
    });

    router.get('/getnext/:id', function (req, res) {
        var scenes = req.scenario.scenes;
        var id = req.params.id || "";
        var position = req.scenario.position;
        var scene = scenes[position.scene];
        var line = scene[position.block][position.offset];
        logger.trace(req.scenario);
        if (id == "start") {
            position.scene = req.scenario.script[0];
            position.block = "start";
            position.offset = 0;
        } else {
           position.offset++; 
           if (position.offset >= scenes[position.scene][position.block].length) {
               res.end(JSON.stringify({end: true}));
           }
        }
        res.end(JSON.stringify(scenes[position.scene][position.block][position.offset]));
    })

    router.get('/speech/:id', function (req, res) {
        var id = req.params.id;
        var path = config.speechPath + config.voice + id + ".mp3";
        logger.trace("Serving speech file", path)
        res.sendFile(path);
    });
    router.get('/speechv/:id', function (req, res) {
        var id = req.params.id;
        var path = config.speechPath + config.voice + id + ".json";
        logger.trace("Serving viseme file", path)
        res.sendFile(path);
    });

    return router;
}


