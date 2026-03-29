import * as THREE from 'three';

// 1. Scene Setup
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.03);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

// Increase near clipping slightly for good measures
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 2. Objects Creation

// Object A: A glowing floating Torus Knot
const geometry = new THREE.TorusKnotGeometry(1.2, 0.35, 128, 16);
const material = new THREE.MeshStandardMaterial({
    color: 0x8A2BE2,    // target accent color
    roughness: 0.2,
    metalness: 0.8,
    wireframe: true,
    transparent: true,
    opacity: 0.6
});
const torusKnot = new THREE.Mesh(geometry, material);
// Mobile responsive positioning
torusKnot.position.x = window.innerWidth > 768 ? 2 : 0; 
torusKnot.position.y = window.innerWidth > 768 ? 0 : 2;
scene.add(torusKnot);

// Object B: Ambient Particle System
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 4000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Generate particles in a spherical layout for better 3d immersion
    const r = 15;
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    
    posArray[i * 3] = r * Math.sin(phi) * Math.cos(theta); // x
    posArray[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); // y
    posArray[i * 3 + 2] = r * Math.cos(phi); // z
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// 3. Lighting
const pointLight = new THREE.PointLight(0xff007f, 2, 20);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0x4a00e0, 2, 20);
pointLight2.position.set(-2, -3, -4);
scene.add(pointLight2);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(-2, -2, 2);
scene.add(directionalLight);


// 4. Interactivity (Mouse and Scroll)
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

let scrollY = window.scrollY;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

// Resize Event
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Update responsive positions
    torusKnot.position.x = window.innerWidth > 768 ? 2 : 0; 
});

// 5. Animation Loop
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Base Floating rotation
    torusKnot.rotation.y = elapsedTime * 0.15;
    torusKnot.rotation.z = elapsedTime * 0.1;
    
    particlesMesh.rotation.y = elapsedTime *0.02;
    particlesMesh.rotation.z = elapsedTime *0.01;

    // Scroll Effects
    camera.position.y = -scrollY * 0.002;
    torusKnot.position.y = (-scrollY * 0.001) + (Math.sin(elapsedTime) * 0.2); // Add hovering effect
    
    // Mouse Interaction (Parallax)
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;
    
    // Mouse movement adds rotation
    particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
    particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);
    
    torusKnot.rotation.y += 0.5 * (targetX - torusKnot.rotation.y);
    torusKnot.rotation.x += 0.5 * (targetY - torusKnot.rotation.x);

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();

// 6. GSAP UI Animations
document.addEventListener('DOMContentLoaded', () => {
    // Nav entrance
    gsap.from('.navbar', { y: -50, opacity: 0, duration: 1, ease: 'power3.out' });
    
    // Hero entrance
    gsap.from('.glass-panel', { y: 20, opacity: 0, duration: 1, delay: 0.2, ease: 'power3.out' });
    gsap.from('.hero-title span', { opacity: 0, y: 10, duration: 0.8, delay: 0.6, stagger: 0.2, ease: 'power2.out' });
    
    // Animate content on scroll
    gsap.utils.toArray('.content-card').forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });
    });
});
