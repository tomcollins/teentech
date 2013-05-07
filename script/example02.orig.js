var WIDTH = 900,
    HEIGHT = 540;

var $container;

var playerStartX = 0;
var playerStartY = 0;
var playerStartZ = 0;
var playerSpeedZ = 0;

var lights, tardis, pointLight1, pointLight2, directionalLight, directionalLightMesh, earth, composer, dotShader, isDoingEffect = false, starsWhite, starsYellow;
var effectSound, isWaitingForEffectReset, effectDuration, effectRollEasing, effectStaticEasing, shaderTime, renderPass, badTVPass, rgbPass, filmPass, staticPass, copyPass;

//createjs.Sound.registerSound("assets/audio/static.mp3", "static");
//createjs.Sound.play("assets/audio/static.mp3", createjs.Sound.INTERRUPT_ANY, 0, 0, -1, 1, 0);

function init() {
    $container = $('#threeHolder');
    makeScene();
}

function makeScene() {

    var renderer = new THREE.WebGLRenderer();
    var camera = new THREE.PerspectiveCamera(45, WIDTH/HEIGHT, 0.1, 10000);
    var scene = new THREE.Scene();

    camera.position.z = 550;
    scene.add(camera);
    renderer.setSize(WIDTH, HEIGHT);
    $container.append(renderer.domElement);

    addTardis(scene);
    addLights(scene);
    addEarth(scene);
    addStars(scene);
    addPostProcessing();

    // add additional effects if desir

    var updatePositions = function() {
        playerStartX = Number($('#playerStartX').val());
        if (!playerStartX) playerStartX = 0;
        playerStartY = Number($('#playerStartY').val());
        if (!playerStartY) playerStartY = 0;
        playerStartZ = Number($('#playerStartZ').val());
        if (!playerStartZ) playerStartZ = 0;

        playerSpeedZ = Number($('#playerSpeedZ').val());
        if (!playerSpeedZ) playerSpeedZ = 0;

        tardis.position.x = playerStartX;
        tardis.position.y = playerStartY;
        tardis.position.z = playerStartZ;
    }
    

    var render = function () {
        requestAnimationFrame(render);

        var time;
        lights.forEach(function(light){
            time = Date.now() * light.timeMultiplier;
            light.light.position.set(
                light.x + (Math.sin( time * 0.7 ) * light.rangeX),
                light.y + (Math.cos( time * 0.5 ) * light.rangeY),
                light.z + (Math.cos( time * 0.3 ) * light.rangeZ)
            );
            light.mesh.position.set(light.light.position.x, light.light.position.y, light.light.position.z);
        });

        tardis.rotation.y += 0.01;
        earth.rotation.y += 0.003;
        starsWhite.rotation.x += 0.0001;
        starsWhite.rotation.y -= 0.001;
        starsYellow.rotation.x += 0.0001;
        starsYellow.rotation.y -= 0.001;

        if (playerSpeedZ) {
            tardis.position.z += playerSpeedZ;
        }

        $('#playerX').text(parseInt(tardis.position.x));
        $('#playerY').text(parseInt(tardis.position.y));
        $('#playerZ').text(parseInt(tardis.position.z));

        $('#cameraX').text(parseInt(camera.position.x));
        $('#cameraY').text(parseInt(camera.position.y));
        $('#cameraZ').text(parseInt(camera.position.z));

        if (isDoingEffect) {
            updateComposerParams();
            composer.render();
            effectCounter++;

            function doEasing(param, easing, min) {
                var value = param.value;
                if (min < value) {
                    param.value = value * easing;
                } else {
                    param.value = 0;
                }

            }

            if (15 < effectCounter) {
                
                if (25 < effectCounter) {
                    doEasing(badTVPass.uniforms[ "distortion" ], 0.9999999, 0.000001);
                    doEasing(badTVPass.uniforms[ "distortion2" ], 0.9999999, 0.000001);
                }
                doEasing(staticPass.uniforms[ "amount" ], effectStaticEasing, 0.00001);
            }
            doEasing(badTVPass.uniforms[ "rollSpeed" ], effectRollEasing, 0.01);
            
            
            if (effectDuration < effectCounter) {
            //if (0.01 > badTVPass.uniforms[ "rollSpeed" ].value) {
                isDoingEffect = false;
                isWaitingForEffectReset = true;
                effectSound.stop();
                effectSound = null;
                setTimeout(function() {
                    isWaitingForEffectReset = false;
                }, 3500);
            }
            /*
            //tardis.scale.x -= 0.02;
            //tardis.scale.z -= 0.02;
            if (effectCounter == 2) {
                effectCounter = 0;
                dotShader.uniforms[ 'scale' ].value--;
                console.log(dotShader.uniforms[ 'scale' ].value);
                if (0 == dotShader.uniforms[ 'scale' ].value) {
                    isDoingEffect = false;
                    tardis.scale.x = 1;
                    tardis.scale.z = 1;
                }
            }
            */
        } else {
            renderer.render(scene, camera);

            if (!isDoingEffect && !isWaitingForEffectReset && Math.random() > 0.95) {
                isDoingEffect = true;
                shaderTime = 0;
                effectCounter = 0;
                resetComposerParams();

                composerTweenIn();

                effectSound = createjs.Sound.play(
                    "assets/audio/static.mp3", 
                    createjs.Sound.INTERRUPT_ANY, 
                    0, 
                    Math.random() * 5000
                );
            }
        }
        
        
    };

    function composerTweenIn() {
        Tween.get(target).wait(500).to({alpha:0, visible:false}, 1000);//.call(onComplete);
    };

    function updateComposerParams() {
        shaderTime += 0.1;
        badTVPass.uniforms[ 'time' ].value =  shaderTime;
        filmPass.uniforms[ 'time' ].value =  shaderTime;
        staticPass.uniforms[ 'time' ].value =  shaderTime;
    };

    function addTardis(scene) {
        var geometry = new THREE.CubeGeometry(100,180,100);
        var material = new THREE.MeshLambertMaterial({
           map:THREE.ImageUtils.loadTexture('assets/textures/tardis.png')
        });
        var materialTop = new THREE.MeshLambertMaterial({
           map:THREE.ImageUtils.loadTexture('assets/textures/tardis-top.png')
        });
        var materials = [material, material, materialTop, materialTop, material, material];
        tardis = new THREE.Mesh( 
            new THREE.CubeGeometry(100, 180, 100, 1, 1, 1), 
            new THREE.MeshFaceMaterial(materials) 
        );
        scene.add(tardis);
    };

    function addLights(scene) {
        lights = [];
        function addLight(intensity, x, y, z, rangeX, rangeY, rangeZ, timeMultiplier) {
            var light = new THREE.PointLight(0xFFFFFF, intensity, 0);
            light.position.set(x, y, z);
            scene.add(light);
            lightMesh = new THREE.Mesh(
                new THREE.SphereGeometry(4, 4, 4), 
                new THREE.MeshLambertMaterial({color: 0xffffff})
            );
            lightMesh.overdraw = true;
            scene.add(lightMesh);
            lights.push({
                light: light,
                mesh: lightMesh,
                timeMultiplier: timeMultiplier,
                rangeX: rangeX, rangeY: rangeY, rangeZ: rangeZ,
                x: x, y: y, z: z
            });
        }
        addLight(1.2, 0, 0, 0, 1600, 400, 1600, 0.001);
        addLight(0.8, 0, 0, 300, 0, 600, 0, 0.003);
        //addLight(0.8, -800, 0, 800, 200, 200, 0, 0.001);
        //addLight(1.2, 800, 0, -800, 0, 200, 1000, 0.001);
        
        // ambient lighting
        var ambientLight = new THREE.AmbientLight(0x333333);
        ambientLight.position.x = 1000;
        ambientLight.position.y = 80;
        ambientLight.position.z = 5700;
        scene.add(ambientLight);
    }

    function addPostProcessing() {

        renderPass = new THREE.RenderPass( scene, camera );
        badTVPass = new THREE.ShaderPass( THREE.BadTVShader );
        rgbPass = new THREE.ShaderPass( THREE.RGBShiftShader );
        filmPass = new THREE.ShaderPass( THREE.FilmShader );
        staticPass = new THREE.ShaderPass( THREE.StaticShader );
        copyPass = new THREE.ShaderPass( THREE.CopyShader );
        resetComposerParams();

        composer = new THREE.EffectComposer( renderer);
        composer.addPass( renderPass );
        composer.addPass( filmPass );
        composer.addPass( badTVPass );
        //composer.addPass( rgbPass );
        composer.addPass( staticPass );
        composer.addPass( copyPass );
        copyPass.renderToScreen = true;

    };
    function resetComposerParams() {
        shaderTime = 0;
        effectDuration = 80;//Math.random() * 200;
        effectRollEasing = 0.99 - Math.random() * 0.1;
        effectStaticEasing = 0.99 - Math.random() * 0.1;
        //if (1 < effectStaticEasing) effectStaticEasing = 0.99;

        badTVPass.uniforms[ "distortion" ].value = 0.4 + Math.random() * 4;
        badTVPass.uniforms[ "distortion2" ].value = 0.2 + Math.random() * 3;
        badTVPass.uniforms[ "speed" ].value = 0.01 + Math.random()*0.1;
        badTVPass.uniforms[ "rollSpeed" ].value = 0.3 < Math.random() ? 0.1 + Math.random() * 2 : 0;
        
        staticPass.uniforms[ "amount" ].value = 0.1 + Math.random() * 0.7;
        staticPass.uniforms[ "size" ].value = 1 + Math.random() * 4;

        rgbPass.uniforms[ "angle" ].value = 0;
        rgbPass.uniforms[ "amount" ].value = 0.005;

        filmPass.uniforms[ "grayscale" ].value = 0;
        filmPass.uniforms[ "sCount" ].value = 800;
        filmPass.uniforms[ "sIntensity" ].value = 0.9;
        filmPass.uniforms[ "nIntensity" ].value = 0.4;
    };

    function addEarth(scene) {
        earth = new THREE.Mesh(
            new THREE.SphereGeometry(256, 32, 16 ), 
            new THREE.MeshLambertMaterial({
                map:THREE.ImageUtils.loadTexture('assets/textures/earth-day.jpg')
            })
        );
        earth.position.set(1400, -500, -3900);
        earth.rotation.x = -0.25;
        earth.rotation.y = 4.5;
        earth.rotation.z = -0.45;
        scene.add(earth);
    }

    function addStars(scene) {
        function addStars(number, range, size, path) {
            var stars = new THREE.Geometry();
            var halfRange = range / 2;
            for (var i=0; i<number; i++) {
              stars.vertices.push(new THREE.Vector3(
                range * Math.random() - halfRange,
                range * Math.random() - halfRange,
                range * Math.random() - halfRange
              ));
            }
            var star_stuff = new THREE.ParticleBasicMaterial({
                color: 0xffffff,
                size: size,
                sizeAttenuation: true,
                map:THREE.ImageUtils.loadTexture(path),
                blending: THREE.AdditiveBlending,
                transparent: true
            });
            var particles = new THREE.ParticleSystem(stars, star_stuff);
            scene.add(particles);
            return particles;
        }
        starsWhite = addStars(1500, 6000, 24, 'assets/textures/particle3.png');
        starsYellow = addStars(120, 3000, 36, 'assets/textures/particle2.png');
    };


    function startKeyListener() {
        var cameraMovement = 10;
        $(document).keydown(function(e) {
            //console.log('e.keyCode', e.keyCode);
            if (69 === e.keyCode) { 
                updatePositions();
                e.preventDefault();
            } else if (37 === e.keyCode) { 
                camera.position.x -= cameraMovement;
                camera.rotation.y -= 0.01;
                e.preventDefault();
            } else if (38 === e.keyCode) { 
                camera.position.y += cameraMovement;
                camera.rotation.x -= 0.01;
                e.preventDefault();
            } else if (39 === e.keyCode) { 
                camera.position.x += cameraMovement;
                camera.rotation.y += 0.01;
                e.preventDefault();
            } else if (40 === e.keyCode) { 
                camera.position.y -= cameraMovement;
                camera.rotation.x += 0.01;
                e.preventDefault();
            } else if (65 === e.keyCode) { 
                camera.position.z += cameraMovement;
                e.preventDefault();
            } else if (90 === e.keyCode) { 
                camera.position.z -= cameraMovement;
                e.preventDefault();
            }

        });
    }

    isWaitingForEffectReset = true;
    setTimeout(function() {
        isWaitingForEffectReset = false;
    }, 3500);

    updatePositions();
    render();
    startKeyListener();
}
