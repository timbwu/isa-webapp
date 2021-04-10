import * as THREE from '/build/three.module.js'
import { OrbitControls } from '/jsm/controls/OrbitControls.js'
import * as dat from '/dat.gui/build/dat.gui.module.js'


// THREE Setup
const gui = new dat.GUI()
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

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
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


// 3D Helpers
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


// Earth and Cloud Geo
const earthGeo = new THREE.SphereGeometry(1, 32, 32)
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthColorTexture, bumpMap: earthBumpTexture, bumpScale: 0.05 });
const earthSphere = new THREE.Mesh(earthGeo, earthMaterial)
scene.add(earthSphere)

const wireGeo = new THREE.SphereGeometry(1.01, 32, 32)
const wireMaterial = new THREE.MeshStandardMaterial({ wireframe: true, opacity: 0.15, emissiveIntensity: 5, transparent: true });
const wireSphere = new THREE.Mesh(wireGeo, wireMaterial)
scene.add(wireSphere)


const cloudGeo = new THREE.SphereGeometry(1.025, 32, 32)
const cloudMaterial = new THREE.MeshStandardMaterial({ alphaMap: earthCloudTexture, map: earthCloudTexture, transparent: true })
const cloudSphere = new THREE.Mesh(cloudGeo, cloudMaterial)
scene.add(cloudSphere)

// Star Particles
const particlesGeometry = new THREE.BufferGeometry()
const count = 3000
const positions = new Float32Array(count * 3)
const colors = new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10
}

const fog = new THREE.Fog('#000000', 0.60, 5)
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

// Update Loop
const clock = new THREE.Clock()
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    earthSphere.rotation.y = elapsedTime * -0.008
    wireSphere.rotation.y = elapsedTime * 0.01
    wireSphere.rotation.x = elapsedTime * 0.01
    cloudSphere.rotation.y = elapsedTime * 0.01


    // Sun Rotation
    directionalLight.lookAt(earthSphere);
    directionalLight.position.x = Math.sin(elapsedTime * 0.2) * 3
    directionalLight.position.y = Math.sin(elapsedTime * 0.1) * 0.5
    directionalLight.position.z = Math.cos((elapsedTime * 0.2) + Math.PI) * 2

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()