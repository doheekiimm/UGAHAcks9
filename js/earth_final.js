import * as THREE from "https://unpkg.com/three@0.108.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.156.1/examples/jsm/loaders/GLTFLoader.js?module";

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

let scene, camera, renderer;
let earth, moon, saturn, ring, cloud, neptune, jupiter, star, heartShape, heart,
    venus, pluto, uranus, uraRing, planet, star2, star3, star4, star5;
let controls;
let audioListener = new THREE.AudioListener();
let audioLoader = new THREE.AudioLoader();
let backgroundMusic; // Define your audio variables
let directionalLight;
let sunLight;
let rotateSpeeds = {
    moonSpeed: 0.003,
    saturnSpeed: 0.0025,
    // Add similar entries for other planets
};
let snowflakes = [];
let snowflakesFalling = false;
let sunLightColor = new THREE.Color('#F94C10');

// Create an array to hold asteroid objects
const asteroids = [];

// Add KeyController class
class KeyController {
    constructor() {
        this.keys = [];

        window.addEventListener('keydown', e => {
            console.log(e.code + ' push');
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', e => {
            console.log(e.code + ' pop ');
            delete this.keys[e.code];
        });
    }
}

// background music
function toggleBackgroundMusic() {
    if (backgroundMusic.isPlaying) {
        backgroundMusic.pause(); // Pause the music if it's playing
    } else {
        backgroundMusic.play(); // Play the music if it's paused
    }
}

// Event listener for the music button
const musicButton = document.getElementById('musicButton');
musicButton.addEventListener('click', toggleBackgroundMusic);

const init = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#000000");
    camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
    camera.position.set(240, 60, -100);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);

    // GUI controller
    const gui = new dat.GUI();
    // Object to hold the orbit speeds
    rotateSpeeds = {
        moonSpeed: 0.01,
        saturnSpeed: 0.01,
        neptuneSpeed: 0.01,
        jupiterSpeed: 0.02,
        starSpeed: 0.02,
        venusSpeed: 0.01,
        plutoSpeed: 0.01,
        uranusSpeed: 0.02,
        planetSpeed: 0.02,
    };
    // Add GUI controls


    // Add a checkbox control for snowflakes
    const snowflakeControls = gui.addFolder('Snowflakes');
    snowflakeControls.open();
    const snowflakeFallingController = snowflakeControls.add({ snowflakesFalling }, 'snowflakesFalling').name('Snowflakes Falling');
    snowflakeFallingController.onChange(function (value) {
        snowflakesFalling = value;

        // Set the visibility of all snowflakes based on the checkbox value
        snowflakes.forEach((snowflake) => {
            snowflake.visible = snowflakesFalling;
        });
    });

    // light color GUI
    // const lightFolder = gui.addFolder('Sun Light Color');
    // lightFolder.open();

    // Add a color controller for sunLight
    // lightFolder.addColor({ color: sunLightColor.getHex() }, 'color')
    //     .name('Sun Light Color')
    //     .onChange(function (value) {
    //         // Update the light's color when the GUI controller value changes
    //         sunLightColor.set(value);
    //         sunLight.color = sunLightColor;
    //     });

    // Audio Listener
    audioListener = new THREE.AudioListener();
    camera.add(audioListener);

    audioLoader.load('./bgm.mp4', function (buffer) {
        console.log('Audio loaded successfully'); // Add this line
        backgroundMusic = new THREE.Audio(audioListener);
        backgroundMusic.setBuffer(buffer);
        backgroundMusic.setLoop(true);
        backgroundMusic.setVolume(0.5);
        backgroundMusic.play();
    }, undefined, function (error) {
        console.error('Error loading audio:', error); // Add this line
    });

    // camera
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // space
    {
        const imageLoader = new THREE.TextureLoader();
        imageLoader.load("./image/universe.jpg", (data) => {
            const material_univ = new THREE.MeshBasicMaterial({
                map: data,
                side: THREE.BackSide,
            });
            const geometry_univ = new THREE.SphereGeometry(500, 32, 32);
            const universe = new THREE.Mesh(geometry_univ, material_univ);
            scene.add(universe);
        });
    }

    //earth
    const earthMap = new THREE.TextureLoader().load("./image/Albedo.jpg");
    const material_earth = new THREE.MeshPhongMaterial({
        map: earthMap,
    });
    const geometry_earth = new THREE.SphereGeometry(80, 32, 32);
    earth = new THREE.Mesh(geometry_earth, material_earth);
    earth.castShadow = true;
    earth.receiveShadow = true;
    scene.add(earth);

    // Cloud
    const cloudMap = new THREE.TextureLoader().load("./image/Clouds.png");
    const material_cloud = new THREE.MeshPhongMaterial({
        map: cloudMap,
        transparent: true,
        opacity: 0.6,
    });
    const geometry_cloud = new THREE.SphereGeometry(82, 32, 32);
    cloud = new THREE.Mesh(geometry_cloud, material_cloud);
    earth.add(cloud);

    // Moon
    const moonMap = new THREE.TextureLoader().load("./image/moon.jpg");
    const geometry_moon = new THREE.SphereGeometry(8, 32, 32);
    const material_moon = new THREE.MeshPhongMaterial({
        map: moonMap,
    });

    moon = new THREE.Mesh(geometry_moon, material_moon);
    // moon.position.set(120, 0, 80);
    moon.castShadow = true;
    moon.receiveShadow = true;
    earth.add(moon);

    // saturn
    const saturnmap = new THREE.TextureLoader().load("./image/saturn.png");
    const geometry_saturn = new THREE.SphereGeometry(15, 32, 32);
    const material_saturn = new THREE.MeshPhongMaterial({
        map: saturnmap,
        transparent: true,
        opacity: 1.0, // Adjust opacity as needed
    });
    saturn = new THREE.Mesh(geometry_saturn, material_saturn);
    earth.add(saturn);
    saturn.castShadow = true;
    saturn.receiveShadow = true;
    saturn.position.set(10, 0, 0); // Adjust position as needed

    const saturnRing = new THREE.TextureLoader().load("./image/ring.png");
    const ringGeo = new THREE.RingGeometry(16, 25, 32);
    const ringMat = new THREE.MeshBasicMaterial({
        map: saturnRing,
        side: THREE.DoubleSide,
    });
    ring = new THREE.Mesh(ringGeo, ringMat);
    earth.add(ring); // Make sure to add Saturn to the Earth
    ring.position.set(10, 0, 0); // Adjust position as needed
    ring.rotation.x = Math.PI / 2;

    // neptune
    const neptuneMap = new THREE.TextureLoader().load("./image/neptune.png");
    const neptuneGeo = new THREE.SphereGeometry(6, 32, 32);
    const neptuneMat = new THREE.MeshPhongMaterial({
        map: neptuneMap,
    });
    neptune = new THREE.Mesh(neptuneGeo, neptuneMat);
    neptune.castShadow = true;
    neptune.receiveShadow = true;
    scene.add(neptune);

    // planet
    const planetMap = new THREE.TextureLoader().load("./image/planet.png");
    const planetGeo = new THREE.SphereGeometry(7, 32, 32);
    const planetMat = new THREE.MeshPhongMaterial({
        map: planetMap,
    });
    planet = new THREE.Mesh(planetGeo, planetMat);
    planet.castShadow = true;
    planet.receiveShadow = true;
    scene.add(planet);

    // Jupiter
    const jupiterMap = new THREE.TextureLoader().load("./image/jupiter.png");
    const jupiterGeo = new THREE.SphereGeometry(10, 32, 32);
    const jupiterMat = new THREE.MeshPhongMaterial({
        map: jupiterMap,
    });

    jupiter = new THREE.Mesh(jupiterGeo, jupiterMat);
    jupiter.position.set(120, 0, -80);
    jupiter.castShadow = true;
    jupiter.receiveShadow = true;
    earth.add(jupiter);

    // Star
    const blue = new THREE.Color(0x687EFF);
    const white = new THREE.Color(0xB6FFFA);
    const uniformData = {
        u_time:         { type: 'f',  value: 0.0, },
        u_colorA:       { type: 'vec3', value: blue },
        u_colorB:       { type: 'vec3', value: white },
    };
    let vShader = document.getElementById('iridescent_vertexShader').innerHTML;
    let fShader = document.getElementById('iridescent_fragmentShader').innerHTML;

    let itemMaterial = new THREE.ShaderMaterial({
        //Optional, here you can supply uniforms and attributes
        uniforms: uniformData,
        vertexShader: vShader,
        fragmentShader: fShader,
    });
    const StarGeo = new THREE.IcosahedronGeometry(3,0);
    star = new THREE.Mesh(StarGeo, itemMaterial);
    star.position.set(50, 100, -80);
    star.castShadow = true;
    star.receiveShadow = true;
    scene.add(star);

    // Star2
    const orange = new THREE.Color('#FD8D14');
    const yellow = new THREE.Color('#FFE17B');
    const uniformData2 = {
        u_time: { type: 'f', value: 0.0 },
        u_colorA: { type: 'vec3', value: orange },
        u_colorB: { type: 'vec3', value: yellow },
    };

// Create the shader material for star2
    let itemMaterial2 = new THREE.ShaderMaterial({
        uniforms: uniformData2,
        vertexShader: vShader,
        fragmentShader: fShader,
    });

// Create star2 using the new material
    const StarGeo2 = new THREE.IcosahedronGeometry(5, 0);
    star2 = new THREE.Mesh(StarGeo2, itemMaterial2);
    star2.position.set(-60, 170, 180);
    star2.castShadow = true;
    star2.receiveShadow = true;
    scene.add(star2);

    // Star3
    const blue2 = new THREE.Color('#1A5D1A');
    const white2 = new THREE.Color('#F2BE22');
    const uniformData3 = {
        u_time: { type: 'f', value: 0.0 },
        u_colorA: { type: 'vec3', value: blue2 },
        u_colorB: { type: 'vec3', value: white2 },
    };

    let itemMaterial3 = new THREE.ShaderMaterial({
        uniforms: uniformData3,
        vertexShader: vShader,
        fragmentShader: fShader,
    });

    const StarGeo3 = new THREE.IcosahedronGeometry(8, 0);
    star3 = new THREE.Mesh(StarGeo3, itemMaterial3);
    star3.position.set(-10, -200, 90);
    star3.castShadow = true;
    star3.receiveShadow = true;
    scene.add(star3);

    // Star4
    const blue4 = new THREE.Color('#FF6666');
    const white4 = new THREE.Color('#DFD7BF');
    const uniformData4 = {
        u_time: { type: 'f', value: 0.0 },
        u_colorA: { type: 'vec3', value: blue4 },
        u_colorB: { type: 'vec3', value: white4 },
    };

    let itemMaterial4 = new THREE.ShaderMaterial({
        uniforms: uniformData4,
        vertexShader: vShader,
        fragmentShader: fShader,
    });

    const StarGeo4 = new THREE.IcosahedronGeometry(7, 0);
    star4 = new THREE.Mesh(StarGeo4, itemMaterial4);
    star4.position.set(-170, -90, -180);
    star4.castShadow = true;
    star4.receiveShadow = true;
    scene.add(star4);

    // Star5
    const blue5 = new THREE.Color('#A459D1');
    const white5 = new THREE.Color('#F5F0BB');
    const uniformData5 = {
        u_time: { type: 'f', value: 0.0 },
        u_colorA: { type: 'vec3', value: blue5 },
        u_colorB: { type: 'vec3', value: white5 },
    };

    let itemMaterial5 = new THREE.ShaderMaterial({
        uniforms: uniformData5,
        vertexShader: vShader,
        fragmentShader: fShader,
    });

    const StarGeo5 = new THREE.IcosahedronGeometry(9, 0);
    star5 = new THREE.Mesh(StarGeo5, itemMaterial5);
    star5.position.set(-50, 90, 450);
    star5.castShadow = true;
    star5.receiveShadow = true;
    scene.add(star5);

    // Venus
    const venusMap = new THREE.TextureLoader().load("./image/venus.png");
    const venusGeo = new THREE.SphereGeometry(7, 32, 32);
    const venusMat = new THREE.MeshPhongMaterial({
        map: venusMap,
    });
    venus = new THREE.Mesh(venusGeo, venusMat);
    //venus.position.set(120, 0, -140);
    venus.castShadow = true;
    venus.receiveShadow = true;
    earth.add(venus);

    // Pluto
    const plutoMap = new THREE.TextureLoader().load("./image/pluto.png");
    const plutoGeo = new THREE.SphereGeometry(8, 32, 32);
    const plutoMat = new THREE.MeshPhongMaterial({
        map: plutoMap,
    });
    pluto = new THREE.Mesh(plutoGeo, plutoMat);
    pluto.castShadow = true;
    pluto.receiveShadow = true;
    earth.add(pluto);

    // Uranus
    const Uranusmap = new THREE.TextureLoader().load("./image/uranus.png");
    const uranusGeo = new THREE.SphereGeometry(12, 32, 32);
    const uranusMat = new THREE.MeshPhongMaterial({
        map: Uranusmap,
        transparent: true,
        opacity: 1.0, // Adjust opacity as needed
    });
    uranus = new THREE.Mesh(uranusGeo, uranusMat);
    uranus.castShadow = true;
    uranus.receiveShadow = true;
    earth.add(uranus);
    //saturn.position.set(10, 0, 0); // Adjust position as needed

    const uranusRing = new THREE.TextureLoader().load("./image/uranus ring.png");
    const UranusringGeo = new THREE.RingGeometry(13, 22, 27);
    const UranusringMat = new THREE.MeshBasicMaterial({
        map: uranusRing,
        side: THREE.DoubleSide,
    });
    uraRing = new THREE.Mesh(UranusringGeo, UranusringMat);
    earth.add(uraRing); // Make sure to add Saturn to the Earth
    uraRing.position.set(-10, 0, 0); // Adjust position as needed
    uraRing.rotation.x = Math.PI / 2;

    // light
    var light = new THREE.HemisphereLight(0xffffff, 0x080820, 1.3);
    light.position.set(100, 100, 0);
    scene.add(light);

    directionalLight = new THREE.DirectionalLight(0xffffff, 0.0001);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    scene.add(directionalLight);

    // Sunlight as a Point Light
    sunLight = new THREE.PointLight('#F94C10', 3, 500);
    sunLight.position.set(200, 0, 100);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // KeyBoard Controller
    const keyController = new KeyController();
    if (keyController.keys['ArrowUp']) {
        controls.moveForward(0.2);
    }
    if (keyController.keys['ArrowDown']) {
        controls.moveForward(-0.2);
    }
    if (keyController.keys['ArrowLeft']) {
        controls.moveRight(-0.2);
    }
    if (keyController.keys['ArrowRight']) {
        controls.moveRight(0.2);
    }

    // Create a snowflake geometry and material
    const snowflakeGeometry = new THREE.SphereGeometry(1, 6, 6);
    const snowflakeMaterial = new THREE.MeshPhongMaterial({ color: '#F8F0E5' });

    // Generate and add snowflakes to the scene
    for (let i = 0; i < 500; i++) {
        const snowflake = new THREE.Mesh(snowflakeGeometry, snowflakeMaterial);
        const startX = Math.random() * WIDTH - WIDTH / 2; // Random X position
        const startY = Math.random() * 200 + 100; // Random Y position at the top
        const startZ = Math.random() * WIDTH - WIDTH / 2; // Random Z position

        snowflake.position.set(startX, startY, startZ);
        snowflakes.push(snowflake);
        scene.add(snowflake);
    }

    // Create Asteroid Geometry and Material
    const asteroidGeometry = new THREE.SphereGeometry(0.17, 16, 16);
    const asteroidMaterial = new THREE.MeshPhongMaterial({ color: '#867070' });

// // Define Parameters for Elliptical Orbits
//     const asteroidBeltRadiusX = 200; // Major axis radius (X-axis)
//     const asteroidBeltRadiusZ = 50;  // Minor axis radius (Z-axis)
//     const asteroidOrbitSpeed = 0.001; // Adjust the orbit speed as needed
//
// // Generate and Position Asteroids in Elliptical Orbits
//     const asteroidCount = 500;
//
//     for (let i = 0; i < asteroidCount; i++) {
//         const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
//
//         // Calculate the position along the elliptical orbit
//         const angle = Math.random() * Math.PI * 2;
//         const x = asteroidBeltRadiusX * Math.cos(angle);
//         const z = asteroidBeltRadiusZ * Math.sin(angle);
//
//         asteroid.position.set(x, 0, z);
//
//         // Randomly rotate the asteroids
//         asteroid.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
//
//         // Add the asteroid to the scene
//         scene.add(asteroid);
//
//         // Store the asteroid in the array for future reference
//         asteroids.push(asteroid);
//     }
    const asteroidBelts = [
        {
            radiusX: 200, // Major axis radius for first layer
            radiusZ: 50,  // Minor axis radius for first layer
            orbitSpeed: 0.001, // Orbit speed for first layer
            asteroidCount: 1000, // Number of asteroids in the first layer
        },
        {
            radiusX: 210, // Major axis radius for second layer
            radiusZ: 60,  // Minor axis radius for second layer
            orbitSpeed: 0.0015, // Orbit speed for second layer
            asteroidCount: 1000, // Number of asteroids in the second layer
        },
        // Add more layers as needed
    ];

    for (const belt of asteroidBelts) {
        const { radiusX, radiusZ, orbitSpeed, asteroidCount } = belt;

        for (let i = 0; i < asteroidCount; i++) {
            const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

            // Calculate the position along the elliptical orbit for the current layer
            const angle = Math.random() * Math.PI * 2;
            const x = radiusX * Math.cos(angle);
            const z = radiusZ * Math.sin(angle);

            asteroid.position.set(x, 0, z);

            // Randomly rotate the asteroids
            asteroid.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);

            // Add the asteroid to the scene
            scene.add(asteroid);

            // Store the asteroid in the array for future reference
            asteroids.push(asteroid);
        }
    }

    animate();
}; // init

let time = 0;
let time2 = 0;
let time3 = 0;
const d = 120;

const animate = () => {
    //earth.rotation.y += 0.0005; // earth rotating
    cloud.rotation.y += 0.0002; // cloud rotating
    moon.rotation.y += rotateSpeeds.moonSpeed;
    saturn.rotation.y += rotateSpeeds.saturnSpeed;
    neptune.rotation.y += rotateSpeeds.neptuneSpeed;
    jupiter.rotation.y += rotateSpeeds.jupiterSpeed;
    star.rotation.y += rotateSpeeds.starSpeed;
    venus.rotation.y += rotateSpeeds.venusSpeed;
    pluto.rotation.y += rotateSpeeds.plutoSpeed;
    uranus.rotation.y += rotateSpeeds.uranusSpeed;
    planet.rotation.y += rotateSpeeds.planetSpeed;
    star2.rotation.y += 0.015;
    star3.rotation.y += 0.015;
    star4.rotation.y += 0.015;
    star5.rotation.y += 0.015;


    time = time + 0.0025;
    moon.position.x = Math.sin(time) * d; // -120 ~ 120 repeat
    moon.position.z = Math.cos(time) * d; // -120 ~ 120 repeat

    time2 = time2 + 0.0025;
    time3 = time3 + 0.004;
    jupiter.position.x = -Math.sin(time2) * d; // -120 ~ 120 repeat
    jupiter.position.z = -Math.cos(time2) * d; // -120 ~ 120 repeat

    const saturnOrbitRadius = 170;
    saturn.position.x = earth.position.x + saturnOrbitRadius * Math.sin(time);
    saturn.position.z = earth.position.z + saturnOrbitRadius * Math.cos(time);
    ring.position.x = saturn.position.x;
    ring.position.z = saturn.position.z;

    const planetOrbitRadius = 60; // adjust as needed
    const planetAngle = time; // Adjust this angle as needed
    planet.position.x = saturn.position.x + planetOrbitRadius * Math.sin(planetAngle);
    planet.position.z = saturn.position.z + planetOrbitRadius * Math.cos(planetAngle);

    const neptuneOrbitRadius = 100; // adjust as needed
    const neptuneAngle = time; // Adjust this angle as needed
    neptune.position.x = saturn.position.x + neptuneOrbitRadius * Math.sin(neptuneAngle);
    neptune.position.z = saturn.position.z + neptuneOrbitRadius * Math.cos(neptuneAngle);

    // Calculate the position of Jupiter based on its orbit
    const jupiterOrbitRadius = -120;
    jupiter.position.x = earth.position.x + jupiterOrbitRadius * Math.sin(time2);
    jupiter.position.z = earth.position.z + jupiterOrbitRadius * Math.cos(time2);

    const venusOrbitRadius = -50;
    venus.position.x = jupiter.position.x + venusOrbitRadius * Math.sin(time2);
    venus.position.z = jupiter.position.z + venusOrbitRadius * Math.cos(time2);

    uranus.position.x = venus.position.x + -50;
    uranus.position.z = venus.position.z + -50;
    uraRing.position.x = uranus.position.x;
    uraRing.position.z = uranus.position.z;

    pluto.position.x = uranus.position.x + -50;
    pluto.position.z = uranus.position.z + -50;

    // Rotate the Earth to simulate a day/night cycle
    earth.rotation.y += 0.001; // Adjust this value for speed

    // Optionally, animate the position of the sun (Point Light)
    sunLight.position.set(
        200 * Math.cos(time),
        0,
        200 * Math.sin(time)
    );

    // Snow Flake
    if (snowflakesFalling) {
        for (let i = 0; i < snowflakes.length; i++) {
            const snowflake = snowflakes[i];
            snowflake.position.y -= 0.7; // falling speed

            // Reset snowflake's position when it goes below the scene
            if (snowflake.position.y < -100) {
                snowflake.position.y = 200;
                snowflake.position.x = Math.random() * WIDTH - WIDTH / 2;
                snowflake.position.z = Math.random() * WIDTH - WIDTH / 2;
            }
        }
    }

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

const stageResize = () => {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    camera.updateProjectionMatrix();
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
};

Math.radians = (degrees) => {
    return (degrees * Math.PI) / 180;
};

init();
// animate();
window.addEventListener("resize", stageResize);
