const AWS = require('aws-sdk');


const q = require('q');
const crypto = require('crypto');
const fs = require('fs');

var TTS = function (defaultVoice, config, logger) {

    const Polly = new AWS.Polly({
        signatureVersion: 'v4',
        region: config.region, 
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
    });
    

    logger.trace("Building TTS helper");

    var self = this;
    self.defaultVoice = defaultVoice;

    self.getSpeech = function(text) {
        var deferred = q.defer();

        voice = self.defaultVoice;

        var fileId = crypto.createHash("md5").update(text).digest("hex");
        var path = config.speechPath;

        var fileName = path + voice + fileId;

        if (fs.existsSync(fileName + ".txt")) {
            logger.trace("Speech already exists: ", text);
            deferred.resolve(true); // Already have the speech file
            return deferred.promise;
        }
        logger.trace("Synthesizing speech for: ", text);

        var params = {
            'Text': text,
            'OutputFormat': 'mp3',
            'VoiceId': voice
        }


        Polly.synthesizeSpeech(params, (err, data) => {
            if (err) {
                console.log(err.code);
            } else if (data) {
                if (data.AudioStream instanceof Buffer) {
                    fs.writeFile(fileName + ".mp3", data.AudioStream, function (err) {
                        logger.trace("The mp3 file was saved");
                        if (err) {
                            return console.log(err)
                        };
                        params.OutputFormat = "json";
                        params.SpeechMarkTypes = ['word', 'viseme'];
                        Polly.synthesizeSpeech(params, (err, data) => {
                            if (err) {
                                console.log(err.code)
                            } else {
                                fs.writeFile(fileName + ".json", data.AudioStream, function () { });
                                fs.writeFileSync(fileName + ".txt", text);
                           }
                            deferred.resolve(true);
                        });
                    })
                }
            }
        });

        return deferred.promise;
    }
}

module.exports = TTS;