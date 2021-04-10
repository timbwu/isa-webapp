import * as THREE from '/build/three.module.js'
import { OrbitControls } from '/jsm/controls/OrbitControls.js'
import * as dat from '/dat.gui/build/dat.gui.module.js'


// THREE Setup
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

// Screen Resizing 
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

window.addEventListener('load', (event) => {
    updatePillars()
})

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
// gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7)
directionalLight.position.set(3, 0, -2)
// gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001)
// gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
// gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
// gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(directionalLight)


//3D Helpers
// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// directionalLight.shadow.camera.near = 2
// directionalLight.shadow.camera.far = 4
// scene.add(directionalLightCameraHelper)

// Texture Loading
const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)
loadingManager.onstart = () => { }
loadingManager.onLoaded = () => { }

const earthColorTexture = textureLoader.load('/frontend/textures/earth/Albedo.jpg')
const earthBumpTexture = textureLoader.load('/frontend/textures/earth/Bump.jpg')
const earthCloudTexture = textureLoader.load('/frontend/textures/earth/Clouds.png')
const earthLightsTexture = textureLoader.load('/frontend/textures/earth/Night_Lights.png')
const earthNormalTexture = textureLoader.load('/frontend/textures/earth/Normal.png')

const circleParticle = textureLoader.load('/frontend/textures/particles/circle.png')
const flareParticle = textureLoader.load('/frontend/textures/particles/flare.png')

const emo1 = textureLoader.load('/frontend/textures/emojis/1.png')
const emo2 = textureLoader.load('/frontend/textures/emojis/2.png')
const emo3 = textureLoader.load('/frontend/textures/emojis/3.png')
const emo4 = textureLoader.load('/frontend/textures/emojis/4.png')
const heart = textureLoader.load('/frontend/textures/emojis/heart.png')

let emojis = [];
emojis.push(emo1)
emojis.push(emo2)
emojis.push(emo3)
emojis.push(emo4);


const fontLoader = new THREE.FontLoader()

// GEO
const earthGroup = new THREE.Group();

// Earth and Cloud Geo
const earthGeo = new THREE.SphereGeometry(1, 32, 32)
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthColorTexture, bumpMap: earthBumpTexture, bumpScale: 0.05 });
let earthSphere = new THREE.Mesh(earthGeo, earthMaterial)
earthGroup.add(earthSphere)
earthSphere.rotation.y = Math.PI

const wireGeo = new THREE.SphereGeometry(1.01, 32, 32)
const wireMaterial = new THREE.MeshStandardMaterial({ wireframe: true, opacity: 0.15, emissiveIntensity: 5, transparent: true });
const wireSphere = new THREE.Mesh(wireGeo, wireMaterial)
earthGroup.add(wireSphere)


const cloudGeo = new THREE.SphereGeometry(1.025, 32, 32)
const cloudMaterial = new THREE.MeshStandardMaterial({ alphaMap: earthCloudTexture, map: earthCloudTexture, transparent: true })
const cloudSphere = new THREE.Mesh(cloudGeo, cloudMaterial)
earthGroup.add(cloudSphere)

scene.add(earthGroup)



// Star Particles
const particlesGeometry = new THREE.BufferGeometry()
const count = 3000
const positions = new Float32Array(count * 3)
const colors = new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10
}

const fog = new THREE.Fog('#000000', 0.75, 5)
scene.fog = fog

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
const particlesMaterial = new THREE.PointsMaterial()
particlesMaterial.size = 0.15
particlesMaterial.depthWrite = false
particlesMaterial.blending = THREE.AdditiveBlending
particlesMaterial.map = flareParticle
particlesMaterial.sizeAttenuation = true
particlesMaterial.transprent = true
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)


// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.z = -3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.enableZoom = false;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x0, 0);
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

directionalLight.castShadow = true
earthSphere.receiveShadow = true
cloudSphere.castShadow = true

let pinEndObjects = [];
let pinLines = [];

// Update Loop
const clock = new THREE.Clock()
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    //earthSphere.rotation.y = elapsedTime * -0.008
    particles.rotation.y = elapsedTime * -0.01
    wireSphere.rotation.y = elapsedTime * 0.01
    wireSphere.rotation.x = elapsedTime * 0.01
    cloudSphere.rotation.y = elapsedTime * 0.01


    // Sun Rotation
    directionalLight.lookAt(earthSphere);
    directionalLight.position.x = Math.sin(elapsedTime * 0.2) * 3
    directionalLight.position.y = Math.sin(elapsedTime * 0.1) * 0.5
    directionalLight.position.z = Math.cos((elapsedTime * 0.2) + Math.PI) * 2

    pinEndObjects.forEach(element => {
        element.lookAt(camera.position);
    })

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

window.updatePillars = function updatePillars() {
    fetch('https://pillar.timbwu.com/pins', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if (res.status === 200) {

            return res.json();
        } else {
            alert("Something went wrong")
        }
    }).then(function (data) {
        pinEndObjects.forEach(element => scene.remove(element))
        pinLines.forEach(element => scene.remove(element))

        while (pinEndObjects.length > 0) {
            console.log(pinEndObjects);
            pinEndObjects.pop()
            pinLines.pop()
        }
        data.forEach(element => createPillar(element.id, element.lat, element.lon, element.type, element.content));

    });
}

function createPillar(id, lat, lon, type, content) {
    var latitude = Math.PI * lat / 180;
    var longitude = Math.PI * lon / 180

    latitude -= 1.570795765134 // Subtract 90 degrees in radians

    const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
    });


    const points = [];
    points.push(new THREE.Vector3(
        1.01 * Math.sin(latitude) * Math.cos(longitude),
        1.01 * Math.cos(latitude),
        1.01 * Math.sin(latitude) * Math.sin(longitude),
    ))
    points.push(new THREE.Vector3(
        1.2 * Math.sin(latitude) * Math.cos(longitude),
        1.2 * Math.cos(latitude),
        1.2 * Math.sin(latitude) * Math.sin(longitude),
    ))

    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeo, material);
    pinLines.push(line);
    scene.add(line);

    if (type == 0) {
        let emoji = emojis[Math.floor(Math.random() * emojis.length)];
        let geometry = new THREE.PlaneGeometry(0.05, 0.05)
        const material = new THREE.MeshBasicMaterial({ map: emoji, side: THREE.DoubleSide, transparent: true })
        const planeMesh = new THREE.Mesh(geometry, material);
        planeMesh.position.set(
            1.21 * Math.sin(latitude) * Math.cos(longitude),
            1.21 * Math.cos(latitude),
            1.21 * Math.sin(latitude) * Math.sin(longitude),
        )
        planeMesh.name = id.toString()
        scene.add(planeMesh);
        pinEndObjects.push(planeMesh);
    } else if (type == 1) {
        let geometry = new THREE.PlaneGeometry(0.05, 0.05)
        const material = new THREE.MeshBasicMaterial({ map: heart, side: THREE.DoubleSide, transparent: true })
        const planeMesh = new THREE.Mesh(geometry, material);
        planeMesh.position.set(
            1.21 * Math.sin(latitude) * Math.cos(longitude),
            1.21 * Math.cos(latitude),
            1.21 * Math.sin(latitude) * Math.sin(longitude),
        )
        planeMesh.name = id.toString()
        scene.add(planeMesh);
        pinEndObjects.push(planeMesh);
    } else {
        fontLoader.load('/frontend/fonts/helvetiker_regular.typeface.json', function (font) {

            const geometry = new THREE.TextGeometry(content, {
                font: font,
                size: 0.02,
                height: 0.001,
            });
            var textMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
            var textMesh = new THREE.Mesh(geometry, textMat);

            textMesh.position.set(
                1.21 * Math.sin(latitude) * Math.cos(longitude),
                1.21 * Math.cos(latitude),
                1.21 * Math.sin(latitude) * Math.sin(longitude),
            )
            textMesh.name = id.toString()
            scene.add(textMesh)
            pinEndObjects.push(textMesh);
        });
    }
}