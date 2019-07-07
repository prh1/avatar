var config = require('./configuration/config.js');

var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'trace';

var express = require('express');
var morgan = require('morgan');

var api = require('./routes/api')(config, logger);

var scenario = require('./scenarios/demo');
var scenarioHelper = require('./modules/scenarioHelper.js')(config, logger);

scenarioHelper.prepareScenario(scenario);

var app = express();
app.use(morgan('combined'))
app.use("/", express.static(__dirname + "/www"));

app.use("*", function (req, res, next) {
    req.scenario = scenario;
    next();
})

app.use("/api", api);

app.listen(config.port, function () {
    logger.trace("Application listening on port", config.port);
})



