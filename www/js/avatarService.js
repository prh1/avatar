console.log("AS1");
app.service("avatarService", function () {
    console.log("AS2");

    this.headLoader = function(ctx, cb) {
        var loadTexture = function (path) {
            //var texture = new THREE.ImageUtils.loadTexture('res/' + path);

            var texture = new THREE.TextureLoader().load('assets/res/' + path, function (texture) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.format = THREE.RGBFormat;
                texture.anisotropy = ctx.renderer.capabilities.getMaxAnisotropy();
                texture.repeat.set(1, -1);
            });

            return texture;
        }

        var loadTextures = function () {
            self.textures = {};
            self.textures.head = loadTexture("head.jpg");
            self.textures.headNormal = loadTexture("head_n.jpg");
            self.textures.dn = loadTexture("dn.jpg");
            self.textures.throat = loadTexture("sock.jpg");
            self.textures.eye = loadTexture("eye_3.png");

            self.textures.eyeNormal = loadTexture("eye_n.png");
            self.textures.hair = loadTexture("hair.png");
            self.textures.eyeBorder = loadTexture("eye_cont.png");
            self.textures.teethLower = loadTexture("teethLow.png");
            self.textures.teethUpper = loadTexture("teethUp.png");
            self.textures.tongue = loadTexture("tongue.jpg");


            //self.textures.envrefl = new THREE.TextureLoader().load('res/valley_refl_v01.jpg');
            //self.textures.envdiff = new THREE.TextureLoader().load('res/valley_diff_v01.jpg');
            //self.textures.envback = new THREE.TextureLoader().load('res/valley_bg_v01.jpg');


        }

        var createMaterial = function (map, options) {
            var material = new THREE.MeshPhongMaterial({
                specular: 0x909090, shininess: 5,
                skinning: true,
                morphTargets: true,
                morphNormals: false
            });
            material.map = map;
            material.bumpMap = map;
            for (key in options) {
                material[key] = options[key];
            };
            return material;
        }

        var loadMaterials = function () {

            loadTextures();
            self.materials = {};

            self.materials.none = createMaterial(self.textures.dn, { skinning: false, morphTargets: false });
            self.materials.head = createMaterial(self.textures.head, { bumpScale: 0.5, relectivity: 0.05, shininess: 1 });
            self.materials.head.normalMap = self.textures.headNormal;
            self.materials.head.normalScale = { x: 1, y: 1 };
            self.materials.eye = createMaterial(self.textures.eye, { skinning: false, morphTargets: false });


            self.materials.neck = self.materials.head;

            self.materials.teethUpper = createMaterial(self.textures.teethUpper, { skinning: false, bumpScale: 0.05, transparent: true });
            self.materials.teethLower = createMaterial(self.textures.teethLower, { skinning: false, bumpScale: 1, transparent: true });
            self.materials.tongue = createMaterial(self.textures.tongue, { skinning: false, bumpScale: 0.05 }); // To do: maybe bump map
            self.materials.eyeBorder = createMaterial(self.textures.eyeBorder, { skinning: false, transparent: true, opacity: 0.2, envMap: null, reflectivity: 0, blending: THREE.AdditiveAlphaBlending });
            self.materials.throat = createMaterial(self.textures.throat, { skinning: false });
            self.materials.hair = createMaterial(self.textures.hair, { morphTargets: false, skinning: false, bumpScale: 0.05, transparent: true, reflectivity: 0, shininess: 10, side: THREE.DoubleSide });
        }

        var initialiseAvatar = function () {
            var ToRad = Math.PI / 180;

            var loader = new THREE.SEA3D(true);
            dir = 1;
            //self.ground.scale.set(-1, 1, 1);
            var size = 0.0025;
            var head = {};

            function importMesh(name, material, options) {
                var mesh = loader.getMesh(name);
                mesh.material = material;
                if (options.scale != undefined) {
                    mesh.scale.set(options.scale[0], options.scale[1], options.scale[2])
                };
                if (options.castShadow != undefined) {
                    mesh.castShadow = options.castShadow;
                }
                if (options.receiveShadow != undefined) {
                    mesh.receiveShadow = options.receiveShadow;
                }
                if (options.visible != undefined) {
                    mesh.visible = options.visible;
                }
                return mesh;
            }

            loader.onComplete = function (e) {
                var avatar = {};

                avatar.head = importMesh("skin_hi", self.materials.head, { scale: [size, size, size * dir], castShadow: true, receiveShadow: true })
                avatar.head.setWeight("neck", 1);

                avatar.neck = importMesh("Neck", self.materials.neck, { castShadow: false, receiveShadow: false, visible: false });
                avatar.neck = loader.getMesh("Neck");

                avatar.hair = importMesh("Hair", self.materials.hair, { castShadow: true, receiveShadow: true });

                var geometry = new THREE.IcosahedronGeometry(18.5, 4);

                avatar.eyeR = importMesh("Eye_R", self.materials.none, { castShadow: false, visible: true, scale: [1, 1, -1] });
                avatar.eyeGeoR = new THREE.Mesh(geometry, self.materials.eye);
                avatar.eyeR.add(avatar.eyeGeoR);
                avatar.eyeGeoR.rotation.z = -90 * ToRad;
                avatar.eyeGeoR.rotation.x = -100 * ToRad;

                avatar.eyeL = importMesh("Eye_L", self.materials.eye, { castShadow: false, visible: true, scale: [1, 1, -1] });
                avatar.eyeGeoL = new THREE.Mesh(geometry, self.materials.eye);
                avatar.eyeL.add(avatar.eyeGeoL);
                avatar.eyeGeoL.rotation.z = -90 * ToRad;
                avatar.eyeGeoL.rotation.x = -100 * ToRad;

                avatar.eyeBorder = importMesh("eye_top", self.materials.eyeBorder, { castShadow: false, receiveShadow: false });

                avatar.teethUpper = importMesh("teethUpper", self.materials.teethUpper, { castShadow: false });
                avatar.teethLower = importMesh("teethLower", self.materials.teethLower, { castShadow: false });
                avatar.tongue = importMesh("tongue", self.materials.tongue, { castShadow: false });
                avatar.throat = importMesh("sock", self.materials.throat, { castShadow: false });

                ctx.scene.add(avatar.head);
                avatar.head.play("front");

                console.log("Added head");

                cb(avatar);
            };

            loader.load('assets/res/head.sea');

            return head;
        };

        loadMaterials();
        return initialiseAvatar();

    }

});