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
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.position.set(2, 2, - 1)
gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001)
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(directionalLight)

// Texture Loading
const loadingManager = new THREE.LoadingManager()
loadingManager.onstart = () => {

}

loadingManager.onLoaded = () => {

}
const textureLoader = new THREE.TextureLoader(loadingManager)
const earthColorTexture = textureLoader.load('/frontend/textures/earth/Albedo.jpg')
const earthBumpTexture = textureLoader.load('/frontend/textures/earth/Bump.jpg')
const earthCloudTexture = textureLoader.load('/frontend/textures/earth/Clouds.png')


const earthGeo = new THREE.SphereGeometry(1, 32, 32)
const earthMaterial = new THREE.MeshStandardMaterial( {map: earthColorTexture } );
const sphere = new THREE.Mesh(earthGeo, earthMaterial)
scene.add(sphere)

const cloudGeo = new THREE.SphereGeometry(1.01, 32, 32)
const cloudMaterial = new THREE.MeshStandardMaterial( {alphaMap: earthCloudTexture, map: earthCloudTexture, transparent: true})
const cloudSphere = new THREE.Mesh(cloudGeo, cloudMaterial)
scene.add(cloudSphere)


const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15),
    new THREE.MeshBasicMaterial({
    })
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 2.5
scene.add(plane)

// Camera
const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 100)
camera.position.z = -3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.enableZoom = false

// Renderer
 const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Update Loop
 const clock = new THREE.Clock()
 const tick = () =>
 {
     const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()
    cloudSphere.rotation.y += clock.getDelta() * 1.2;

    // Render
    renderer.render(scene, camera)
 
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
 }
 
 tick()