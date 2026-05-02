/**
 * 3D Product Viewer
 * Interactive Three.js-based 3D product visualization
 */

class ThreeDViewer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container #${containerId} not found`);
            return;
        }

        this.options = {
            autoRotate: options.autoRotate !== false,
            autoRotateSpeed: options.autoRotateSpeed || 2,
            modelColor: options.modelColor || '#7c3aed',
            scale: options.scale || 1,
            cameraDistance: options.cameraDistance || 5,
            ...options
        };

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.model = null;
        this.controls = null;

        this.init();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0e1a);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xa855f7, 0.8);
        pointLight.position.set(-5, 5, 5);
        this.scene.add(pointLight);

        // Camera
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.z = this.options.cameraDistance;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Create default model (cube)
        this.createDefaultModel();

        // Mouse controls
        this.setupControls();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation loop
        this.animate();
    }

    createDefaultModel() {
        // Create a glossy cube as default model
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({
            color: this.options.modelColor,
            metalness: 0.7,
            roughness: 0.2,
            envMapIntensity: 1
        });

        this.model = new THREE.Mesh(geometry, material);
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        this.model.scale.set(this.options.scale, this.options.scale, this.options.scale);
        this.scene.add(this.model);
    }

    createSphere(color = null) {
        // Create glossy sphere for products
        this.removeModel();

        const geometry = new THREE.SphereGeometry(1.5, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            color: color || this.options.modelColor,
            metalness: 0.6,
            roughness: 0.3,
            envMapIntensity: 1
        });

        this.model = new THREE.Mesh(geometry, material);
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        this.model.scale.set(this.options.scale, this.options.scale, this.options.scale);
        this.scene.add(this.model);
    }

    createCylinder(color = null) {
        // Create cylinder for headphones, speakers, etc
        this.removeModel();

        const geometry = new THREE.CylinderGeometry(1, 1.2, 2.5, 32);
        const material = new THREE.MeshStandardMaterial({
            color: color || this.options.modelColor,
            metalness: 0.5,
            roughness: 0.4
        });

        this.model = new THREE.Mesh(geometry, material);
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        this.model.scale.set(this.options.scale, this.options.scale, this.options.scale);
        this.scene.add(this.model);
    }

    createBox(width = 2, height = 1.5, depth = 3, color = null) {
        // Create box for laptops, tablets, etc
        this.removeModel();

        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: color || this.options.modelColor,
            metalness: 0.8,
            roughness: 0.1
        });

        this.model = new THREE.Mesh(geometry, material);
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        this.model.scale.set(this.options.scale, this.options.scale, this.options.scale);
        this.scene.add(this.model);
    }

    removeModel() {
        if (this.model) {
            this.scene.remove(this.model);
            if (this.model.geometry) this.model.geometry.dispose();
            if (this.model.material) this.model.material.dispose();
        }
    }

    setupControls() {
        // Simple mouse controls
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (isDragging && this.model) {
                const deltaX = e.clientX - previousMousePosition.x;
                const deltaY = e.clientY - previousMousePosition.y;

                this.model.rotation.y += deltaX * 0.005;
                this.model.rotation.x += deltaY * 0.005;
            }
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.renderer.domElement.addEventListener('mouseup', () => {
            isDragging = false;
        });

        this.renderer.domElement.addEventListener('mouseleave', () => {
            isDragging = false;
        });

        // Touch controls for mobile
        this.renderer.domElement.addEventListener('touchstart', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        });

        this.renderer.domElement.addEventListener('touchmove', (e) => {
            if (isDragging && this.model) {
                const deltaX = e.touches[0].clientX - previousMousePosition.x;
                const deltaY = e.touches[0].clientY - previousMousePosition.y;

                this.model.rotation.y += deltaX * 0.005;
                this.model.rotation.x += deltaY * 0.005;
            }
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        });

        this.renderer.domElement.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.model && this.options.autoRotate) {
            this.model.rotation.y += (Math.PI / 180) * this.options.autoRotateSpeed;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.domElement.remove();
        }
    }
}

// Product-specific viewer factories
const ProductViewers = {
    // Headphones - cylindrical shape
    headphones: (containerId, options = {}) => {
        const viewer = new ThreeDViewer(containerId, {
            modelColor: '#1f2937',
            autoRotateSpeed: 1.5,
            cameraDistance: 4.5,
            ...options
        });
        viewer.createCylinder('#2d3748');
        return viewer;
    },

    // Laptop/Tablet - flat box
    laptop: (containerId, options = {}) => {
        const viewer = new ThreeDViewer(containerId, {
            modelColor: '#e5e7eb',
            autoRotateSpeed: 0.8,
            cameraDistance: 6,
            ...options
        });
        viewer.createBox(2.5, 0.3, 1.8, '#f3f4f6');
        return viewer;
    },

    // Phone - thin box
    phone: (containerId, options = {}) => {
        const viewer = new ThreeDViewer(containerId, {
            modelColor: '#1f2937',
            autoRotateSpeed: 1.2,
            cameraDistance: 4,
            ...options
        });
        viewer.createBox(1, 2.2, 0.2, '#111827');
        return viewer;
    },

    // Generic product - sphere
    product: (containerId, options = {}) => {
        const viewer = new ThreeDViewer(containerId, {
            modelColor: '#a855f7',
            autoRotateSpeed: 1.5,
            cameraDistance: 5,
            ...options
        });
        viewer.createSphere();
        return viewer;
    }
};

// Initialize viewers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Auto-initialize any element with data-3d-viewer attribute
    document.querySelectorAll('[data-3d-viewer]').forEach(el => {
        const type = el.dataset.threeDViewer || 'product';
        const productId = el.id;
        ProductViewers[type](productId);
    });
});
