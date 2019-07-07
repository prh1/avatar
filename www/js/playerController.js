app.controller("playerController", ['$scope', 'sceneService', 'avatarService', 'scriptService', function ($scope, sceneService, avatarService, scriptService) {
    console.log("Initialising PC");
    $scope.data = {};
    $scope.data.subtitles = "-";
    $scope.data.line = {};
    $scope.data.showYN = false;

    $scope.lookingAt = "default";

    var self = this;
    var webGL;
    self.tweens = [];

    function WebGL() {
        var self = this;
        var ToRad = Math.PI / 180;

        function Orbit(origin, horizontal, vertical, distance) {
            var p = new THREE.Vector3();
            var phi = vertical * ToRad;
            var theta = horizontal * ToRad;
            p.x = (distance * Math.sin(phi) * Math.cos(theta)) + origin.x;
            p.z = (distance * Math.sin(phi) * Math.sin(theta)) + origin.z;
            p.y = (distance * Math.cos(phi)) + origin.y;
            return p;
        }

        self.moveCamera = function () {
            self.camera.position.copy(Orbit(self.cameraTarget, self.camPos.horizontal, self.camPos.vertical, self.camPos.distance));
            self.camera.lookAt(self.cameraTarget);
        }

        function setup() {

            self.container = document.getElementById("scene");

            self.vsize = {};
            self.vsize.x = self.container.getBoundingClientRect().width;
            self.vsize.y = self.container.getBoundingClientRect().height;

            self.vsize.z = self.vsize.x / self.vsize.y;

            self.scene = new THREE.Scene();

            // CAMERA
            self.camera = new THREE.PerspectiveCamera(45, self.vsize.z, 1, 500);
            self.camera.scale.set(1, 1, 1);
            self.camPos = { horizontal: 90, vertical: 84, distance: sceneService.room.depth / 2, automove: false };
            self.center = new THREE.Vector3(sceneService.room.width / 2, 1.2, - sceneService.room.depth / 2);

            self.cameraTarget = self.center.clone();
            self.moveCamera();

            // RENDERER
            self.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            self.renderer.setSize(self.vsize.x, self.vsize.y);
            self.renderer.domElement.style.zIndex = 1;
            self.container.appendChild(self.renderer.domElement);

        }

        setup();

        return this;
    }

    function animate() {
        requestAnimationFrame(animate);
        webGL.camPos.horizontal = webGL.camPos.horizontal + 0.01;
        transition();
        webGL.moveCamera();
        webGL.renderer.render(webGL.scene, webGL.camera);
    }

    function initialiseWebcam() {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({ audio: true, video: { width: 320, height: 320 } },
                function (stream) {
                    var video = document.getElementById('webcam');
                    video.srcObject = stream;
                    video.onloadedmetadata = function (e) {
                        video.play();
                    };
                },
                function (err) {
                    console.log("The following error occurred: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    }

    function initialise() {
        webGL = new WebGL();
        initialiseWebcam();
        sceneService.addScene(webGL, sceneService.office);
        sceneService.addLights(webGL);
        avatarService.headLoader(webGL, function (d) {
            webGL.avatar = d;
            webGL.avatar.head.position.set(sceneService.room.width / 2, 0.9, -(sceneService.room.depth - sceneService.table.depth));
            animate();
            setTimeout(blink, 4000);
            setTimeout(eyes, 2000);
        });
        window.addEventListener("mousemove", onmousemove, false);
    }

    function eyes() {
        var ampZ = ((Math.random() * 1) - 0.5) / 20;
        var dur = Math.random() * 50 + 50;
        var animations =
            {
                current: 0,
                steps: [
                    {
                        animations: [
                            { name: "eyesZ", from: webGL.avatar.eyeGeoL.rotation.z, to: webGL.avatar.eyeGeoL.rotation.z + ampZ, duration: dur },
                        ],
                    }
                ]
            };
        var st = 0;
        for (var i = 0; i < animations.steps.length; i++) {
            animations.steps[i].animations[0].time = st;
            st = st + animations.steps[i].animations[0].duration;
        }
        self.tweens.push(animations);
        setTimeout(eyes, Math.random() * 1000 + 200);
    }


    function blink() {
        console.log("Blink");
        var animations =
            {
                current: 0,
                steps: [
                    {
                        animations: [{ name: "blinkRight", from: 0, to: 1, time: 0, duration: 100 },
                        { name: "blinkLeft", from: 0, to: 1, time: 0, duration: 100 }]
                    },
                    {
                        animations: [{ name: "blinkRight", from: 1, to: 0, time: 100, duration: 100 },
                        { name: "blinkLeft", from: 1, to: 0, time: 100, duration: 100 }]
                    }
                ]

            };
        self.tweens.push(animations);
        setTimeout(blink, Math.random() * 5000 + 2000);
    }

    function setSceneProperty(name, value) {
        if ((name != "eyesX") && (name != "eyesZ")) {
            webGL.avatar.head.setWeight(name, value);
            webGL.avatar.teethUpper.setWeight(name, value);
            webGL.avatar.teethLower.setWeight(name, value);
            webGL.avatar.tongue.setWeight(name, value);
            webGL.avatar.throat.setWeight(name, value);
        } else if (name == "eyesX") {
            webGL.avatar.eyeGeoR.rotation.x = value;
            webGL.avatar.eyeGeoL.rotation.x = value;
        } else if (name == "eyesZ") {
            webGL.avatar.eyeGeoR.rotation.z = value;
            webGL.avatar.eyeGeoL.rotation.z = value;
        }
    }

    function buildSpeechTweens(visemes) {
        var max = 0.5;
        var tweens = [];
        var lastTime = 0;
        for (var i = 0; i < visemes.length; i++) {
            var tween = {
                animations: [{ name: visemes[i].phoneme, from: 0, to: max, time: visemes[i].time, duration: visemes[i].duration }]
            };
            if (i > 0) {
                tween.animations.push({
                    name: visemes[i - 1].phoneme,
                    from: max,
                    to: 0,
                    time: visemes[i].time,
                    duration: visemes[i - 1].duration / 3
                })
            };
            tweens.push(tween);
        }
        var tween = {
            animations: [{ name: visemes[i - 1].phoneme, from: max, to: 0, time: visemes[i - 1].time + visemes[i - 1].duration, duration: visemes[i - 1].duration / 2 }]
        };
        tweens.push(tween);
        self.tweens.push({ current: -1, steps: tweens, type: "speech" });
    }

    function transition() {
        for (var i = self.tweens.length - 1; i >= 0; i--) {
            if (self.tweens[i].steps[self.tweens[i].current] != undefined) {
                transitionTween(i);
            } else {
                if ((self.tweens[i].finished)) {
                    self.tweens.splice(i, 1);
                }
            }
        }
    }

    function transitionTween(idx) {
        if (self.tweens[idx].steps[self.tweens[idx].current] == undefined) {
            return;
        }
        var tween = self.tweens[idx].steps[self.tweens[idx].current];

        if (self.tweens[idx].baseTime == undefined) {
            self.tweens[idx].baseTime = performance.now();
        }

        if (tween.start == undefined) {
            tween.start = self.tweens[idx].baseTime + tween.animations[0].time;
            for (var i = 0; i < tween.animations.length; i++) {
                tween.animations[i].delta = (tween.animations[i].to - tween.animations[i].from) / tween.animations[i].duration;
            }
        }
        var pn = performance.now();
        var dur = pn - tween.start;
        for (var i = tween.animations.length - 1; i >= 0; i--) {
            var value = tween.animations[i].from + (dur * tween.animations[i].delta);
            if (tween.animations[i].delta > 0) {
                if (value >= tween.animations[i].to) {
                    value = tween.animations[i].to;
                } else if (value <= tween.animations[i].from) {
                    value = tween.animations[i].from
                }
            }
            else {
                if (value <= tween.animations[i].to) {
                    value = tween.animations[i].to;
                } else if (value >= tween.animations[i].from) {
                    value = tween.animations[i].from
                }
            }
            setSceneProperty(tween.animations[i].name, value);
        }

        if (dur > tween.animations[0].duration) {
            self.tweens[idx].current++;
            if (self.tweens[idx].current >= self.tweens[idx].steps.length) {
                self.tweens[idx].finished = true;
                if (self.tweens[idx].type == "speech") {
                    $scope.finishedTalking();
                }
            }
        }
    }

    $scope.startScript = function () {
        $scope.moveToNextItem("start");
    }

    $scope.finishedTalking = function () {
        if ($scope.line.type == undefined) {
            setTimeout(function (d) {
                $scope.moveToNextItem();
            }, 1000)
            return;
        }

        if ($scope.line.type == "yn") {
            console.log("Setting to yn");
            $scope.$digest();
        }

    }

    $scope.gotResponse = function (text) {
        console.log("Sending response", text);
        $scope.moveToNextItem(text);

    }

    $scope.moveToNextItem = function(id) {
        scriptService.getNextLine(id).then(function (d) {
            line = d;
            console.log("Got", line);
            if (line.end) {
                $scope.data.subtitles = "";
                return;
            }
            $scope.data.line = {};
            return scriptService.getVisemes(line.speechid)
        }).then(function (visemes) {
            console.log("Got visemes", visemes);
            $scope.data.subtitles = line.sub || line.text;
            $scope.line = line;
            $scope.audio = new Audio('api/speech/' + line.speechid);
            $scope.audio.load();
            buildSpeechTweens(visemes);
            $scope.audio.play();
            self.tweens[self.tweens.length - 1].current = 0;
        });
    }

    setTimeout(initialise, 100);

}]);


