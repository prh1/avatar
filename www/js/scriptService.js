app.service("scriptService", function ($http, $q) {

    function getPhonemeFromViseme(v) {
        var ph = 0;
        switch (v) {
            case "sil": ph = ""; break;
            case "k": ph = "k"; break;
            case "@": ph = "bigaah"; break;
            case "s": ph = "d.s.t"; break;
            case "t": ph = "d.s.t"; break;
            case "o": ph = "oh"; break;
            case "T": ph = "th"; break;
            case "S": ph = "d.s.t"; break;
            case "a": ph = "aah"; break;
            case "i": ph = "i"; break;
            case "u": ph = "w"; break;
            case "O": ph = "ooh.q"; break;
            case "r": ph = "r"; break;
            case "E": ph = "ee"; break;
            case "f": ph = "f.v"; break;
            case "p": ph = "b.m.p"; break;
        }
        return ph;
    }


    this.getNextLine = function (id) {
        var deferred = $q.defer();

        $http.get('/api/getnext/' + id).then(function (d) {
            deferred.resolve(d.data);
        })

        return deferred.promise;
    }

    this.getVisemes = function (id) {
        var deferred = $q.defer();

        $http.get('/api/speechv/' + id, {
            transformResponse: function (data) {
                var lines = data.split("\n");
                var visemes = [];
                var lastTime = 0;
                for (var i = 0; i < lines.length - 1; i++) {
                    var line = JSON.parse(lines[i]);
                    if (line.type == "viseme") {
                        var item = {
                            phoneme: getPhonemeFromViseme(line.value),
                            duration: line.time - lastTime,
                            time: line.time
                        };
                        var lastTime = line.time;
                        visemes.push(item);
                    }
                };
                deferred.resolve(visemes);
            }
        });

        return deferred.promise;
    }

});