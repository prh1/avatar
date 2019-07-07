app.service("sceneService", function () {

    var self = this;
    var ToRad = Math.PI / 180;

    var room = {
        width: 2.5,
        height: 2.1,
        depth: 3.5
    }

    var table = {
        width: 1.5,
        height: 0.8,
        depth: 1,
        thickness: 0.1
    }

    var office = {
        wall: {
            front: { position: [0, 0, 0], width: room.width, depth: 0.01, height: room.height, mat: "wall" },
            left: { position: [-0.01, 0, 0], width: 0.01, depth: room.depth, height: room.height, mat: "wall" },
            right: { position: [room.width, 0, 0], width: 0.01, depth: room.depth, height: room.height, mat: "wall" },
            skirtingL: { position: [0, 0, 0], width: 0.02, depth: room.depth, height: 0.3, mat: "skirting" },
            skirtingR: { position: [room.width - 0.02, 0, 0], width: 0.02, depth: room.depth, height: 0.3, mat: "skirting" }
        },
        doors: {
            frameL: { position: [0, 0, room.depth - 0.1], width: 0.05, depth: 0.1, height: room.height, mat: "metal" },
            frameR: { position: [room.width - 0.05, 0, room.depth - 0.1], width: 0.05, depth: 0.1, height: room.height, mat: "metal" },
            doorL: { position: [0.05, 0, room.depth], width: room.width / 2 - 0.06, depth: 0.1, height: room.height, mat: "glass" },
            doorR: { position: [room.width / 2 + 0.01, 0, room.depth], width: room.width / 2 - 0.06, depth: 0.1, height: room.height, mat: "glass" },
            handleL: {
                position: [room.width / 2 - 0.3, 1, room.depth - 0.01], width: 0.2, height: 0.4, depth: 0.01, mat: "metalplate"
            },
            handleR: {
                position: [room.width / 2 + 0.1, 1, room.depth - 0.01], width: 0.2, height: 0.4, depth: 0.01, mat: "metalplate"
            }

        },
        background: {
            position: [-0.2, -0.2, room.depth + 0.05], width: room.width + 0.2, height: room.height + 0.2, depth: 0.01, mat: "video"
        },
        floor: {
            top: { position: [0, 0, 0], width: room.width, depth: room.depth * 1.1, height: 0.05, mat: "carpet" }
        },
        ceiling: {
            top: { position: [0, room.height, 0], width: room.width, depth: room.depth, height: 0.01, mat: "ceiling" }
        },
        table: {
            top: {
                position: [(room.width / 2) - table.width, table.height, (room.depth - table.depth) / 2],
                width: table.width,
                height: table.thickness,
                depth: table.depth,
                radius: 0.05,
                mat: "wood",
                shape: "tableBase"
            }
        },
        pictures: {
            webcamFrame: {
                position: [0.001, 1.19, 1.79], width: 0.02, depth: 1.02, height: 0.52, mat: "frame"
            },
            webcam: {
                position: [0.022, 1.2, 1.8], width: 0.0001, depth: 1, height: 0.5, mat: "webcam"
            }
        }
    }

    self.room = room;
    self.table = table;
    self.office = office;

    function scaleItems(items, scale) {
        for (key in items) {
            if (items[key].position != undefined) {
                items[key].position[0] = items[key].position[0] * scale;
                items[key].position[1] = items[key].position[1] * scale;
                items[key].position[2] = items[key].position[2] * scale;
                items[key].width = items[key].width * scale;
                items[key].depth = items[key].depth * scale;
                items[key].height = items[key].height * scale;
            } else {
                scaleItems(items[key], scale);
            }
        }
    }

    function getCenter(item) {
        var center =
            [
                item.position[0] + (item.width / 2),
                item.position[1] + (item.height / 2),
                - (item.position[2] + (item.depth / 2))
            ];
        return center;
    }

    function computeCenters(items) {
        for (key in items) {
            if (items[key].position != undefined) {
                items[key].center = getCenter(items[key]);
            } else {
                computeCenters(items[key])
            }
        }
    };

    function addTexture(ctx, path, repeatX, repeatY) {
        return new THREE.TextureLoader().load(path, function (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.format = THREE.RGBFormat;
            texture.anisotropy = ctx.renderer.capabilities.getMaxAnisotropy();
            texture.repeat.set(repeatX, repeatY);
        });
    }

    function addMaterials(ctx) {
        // http://seamless-pixels.blogspot.com
        self.textures = {};
        self.textures.plaster = addTexture(ctx, 'assets/textures/stuccowall.jpg', 4, 4);
        self.textures.wood = addTexture(ctx, 'assets/textures/wood.jpg', 0.5, 2);
        self.textures.carpet = addTexture(ctx, 'assets/textures/carpetblack.jpg', 4, 4);
        self.textures.ceiling = addTexture(ctx, 'assets/textures/marbletiles.jpg', 3, 3);
        self.textures.skirting = addTexture(ctx, 'assets/textures/woodsmall.jpg', 1, 1);
        self.textures.metal = addTexture(ctx, 'assets/textures/metal.jpg', 1, 1);
        self.textures.metalplate = addTexture(ctx, 'assets/textures/metalplate.jpg', 1, 1);

        var video = document.getElementById('myVideo');
        video.play();
        self.textures.video = new THREE.VideoTexture(video);
        self.textures.video.minFilter = THREE.LinearFilter;
        self.textures.video.magFilter = THREE.LinearFilter;
        self.textures.video.format = THREE.RGBFormat;

        var webcam = document.getElementById('webcam');
        webcam.play();
        self.textures.webcam = new THREE.VideoTexture(webcam);
        self.textures.webcam.minFilter = THREE.LinearFilter;
        self.textures.webcam.magFilter = THREE.LinearFilter;
        self.textures.webcam.format = THREE.RGBFormat;


        self.materials = {};

        self.materials.transparent = new THREE.MeshBasicMaterial({ color: 0, opacity: 0.2, blending: THREE.NoBlending });

        self.materials.flat = new THREE.MeshPhongMaterial({
            color: 0x156289,
            emissive: 0x072534,
            side: THREE.DoubleSide
        });

        self.materials.silver = new THREE.MeshPhongMaterial({
            color: 0x404040,
            emissive: 0x405040,
            side: THREE.DoubleSide
        });

        self.materials.skirting = new THREE.MeshBasicMaterial({
            map: self.textures.wood,
            bumpMap: self.textures.wood,
            emissive: 0xdeb887,
            side: THREE.DoubleSide
        });

        self.materials.ceiling = new THREE.MeshPhongMaterial({ map: self.textures.ceiling });
        self.materials.wood = new THREE.MeshPhongMaterial({ map: self.textures.wood, bumpMap: self.textures.wood, side: THREE.DoubleSide });
        self.materials.carpet = new THREE.MeshBasicMaterial({ map: self.textures.carpet });
        self.materials.metal = new THREE.MeshBasicMaterial({ map: self.textures.metal });
        self.materials.metalplate = new THREE.MeshBasicMaterial({ map: self.textures.metalplate });
        self.materials.wall = new THREE.MeshBasicMaterial({ map: self.textures.plaster });

        self.materials.frame = new THREE.MeshPhongMaterial({
            map: self.textures.wood,
            bumpMap: self.textures.wood,
            emissive: 0x8b4513,
            side: THREE.DoubleSide
        });

        self.materials.video = new THREE.MeshBasicMaterial({ map: self.textures.video });
        self.materials.webcam = new THREE.MeshBasicMaterial({ map: self.textures.webcam });

        self.materials.wireframe = new THREE.MeshPhongMaterial({
            color: 0x010101,
            emissive: 0x010101,
            side: THREE.DoubleSide,
            wireframe: true
        });

        self.materials.glass = new THREE.MeshBasicMaterial({
            color: 0x223344,
            opacity: 0.5,
            combine: THREE.MixOperation,
            reflectivity: 0.25,
            transparent: true
        });

    }

    function addShapes() {
        self.shapes = {};
        self.shapes.tableBase = function (width, height, radius) {
            var shape = new THREE.Shape();
            (function roundedRect(cvctx, x, y, width, height, radius) {

                cvctx.moveTo(x, y + radius);
                cvctx.lineTo(x, y + height - radius);
                cvctx.quadraticCurveTo(x, y + height, x + radius, y + height);
                cvctx.lineTo(x + width - radius, y + height);
                cvctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
                cvctx.lineTo(x + width, y + radius);
                cvctx.quadraticCurveTo(x + width, y, x + width - radius, y);
                cvctx.lineTo(x + radius, y);
                cvctx.quadraticCurveTo(x, y, x, y + radius);

            })(shape, 0, 0, width, height, radius);

            return shape;
        }

        return;
    }

    self.addLights = function(ctx) {
        console.log("adding lights");
        self.centerLight = new THREE.Vector3(0, -36.6, 0);

        self.ambient = new THREE.AmbientLight(0x808080);
        ctx.scene.add(self.ambient);

        self.hemiLight = new THREE.HemisphereLight(0x404040, 0x606060, 1);
        self.hemiLight.position.set(0, 2, 0);
        ctx.scene.add(self.hemiLight);

        self.light = new THREE.SpotLight(0x101010, 1, 0, Math.PI / 2, 1);
        self.light.castShadow = true;
        self.light.shadow.camera.near = 50;
        self.light.shadow.camera.far = 500;
        self.light.shadow.bias = -0.005;
        self.light.shadow.mapSize.height = self.light.shadow.mapSize.height = 1024;

        ctx.scene.add(self.light);

    }

    self.addScene = function (ctx, items) {
        console.log(ctx);
        console.log(items);
        addMaterials(ctx);
        addShapes();

        for (key in items) {
            if (items[key].position != undefined) {
                var item = items[key];

                if (item.shape != undefined) {
                    var extrudeSettings = { depth: item.height, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.01, bevelThickness: 0.01 };
                    item.geometry = new THREE.ExtrudeGeometry(self.shapes[item.shape](item.width, item.depth, item.radius), extrudeSettings);
                } else {
                    item.geometry = new THREE.BoxGeometry(item.width, item.height, item.depth);
                }
                item.object = new THREE.Mesh(item.geometry, self.materials[item.mat]);
                item.object.position.x = item.center[0];
                item.object.position.y = item.center[1];
                item.object.position.z = item.center[2];
                item.objectW = new THREE.Mesh(item.geometry, self.materials.wireframe);
                item.objectW.position.x = item.center[0];
                item.objectW.position.y = item.center[1];
                item.objectW.position.z = item.center[2];

                if (item.shape != undefined) {
                    item.object.rotation.x = 90 * ToRad;
                    item.objectW.rotation.x = 90 * ToRad;
                }
                ctx.scene.add(item.object);
            } else {
                self.addScene(ctx, items[key])
            }
        }
    }

    scaleItems(office, 1);
    computeCenters(office);
       
        
});