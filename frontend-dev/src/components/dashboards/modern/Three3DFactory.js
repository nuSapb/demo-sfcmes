import * as THREE from 'three';

class Factory3DScene {
  constructor(canvas, theme) {
    this.canvas = canvas;
    this.theme = theme;
    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = null;
    this.components = [];
    this.conveyorBelts = [];
    this.frameId = null;

    this.initScene();
    this.createLighting();
    this.createFactory();
    this.createConveyorBelts();
    this.createMovingComponents();
    this.animate();
  }

  initScene() {
    // Camera setup
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 8, 15);
    this.camera.lookAt(0, 0, 0);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0.1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;

    // Scene fog
    this.scene.fog = new THREE.Fog(0x000000, 100, 200);

    // Handle window resize
    this.onWindowResize = () => {
      const newWidth = this.canvas.clientWidth;
      const newHeight = this.canvas.clientHeight;
      this.camera.aspect = newWidth / newHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', this.onWindowResize);
  }

  createLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    this.scene.add(directionalLight);

    // Spotlights for factory atmosphere
    const spotlight1 = new THREE.SpotLight(0xffd700, 0.5);
    spotlight1.position.set(-15, 15, 0);
    spotlight1.castShadow = true;
    this.scene.add(spotlight1);

    const spotlight2 = new THREE.SpotLight(0x87ceeb, 0.3);
    spotlight2.position.set(15, 15, 0);
    this.scene.add(spotlight2);
  }

  createFactory() {
    // Factory floor
    const floorGeometry = new THREE.PlaneGeometry(40, 60);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.7,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.position.y = -2;
    this.scene.add(floor);

    // Factory walls (back wall)
    const wallGeometry = new THREE.PlaneGeometry(40, 20);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.5,
    });
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(0, 8, -30);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // Factory pillars
    for (let i = -15; i < 30; i += 15) {
      const pillarGeometry = new THREE.CylinderGeometry(1, 1, 20, 32);
      const pillarMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.3,
        metalness: 0.5,
      });
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
      pillar.position.set(i, 0, 0);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.scene.add(pillar);
    }
  }

  createConveyorBelts() {
    // Create multiple conveyor belts
    const positions = [-8, 0, 8];

    positions.forEach((yPos) => {
      // Conveyor structure
      const beltGeometry = new THREE.BoxGeometry(35, 0.5, 2);
      const beltMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.8,
      });
      const belt = new THREE.Mesh(beltGeometry, beltMaterial);
      belt.position.y = yPos;
      belt.castShadow = true;
      belt.receiveShadow = true;
      this.scene.add(belt);

      // Belt frame
      const frameGeometry = new THREE.BoxGeometry(35, 1, 3);
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.6,
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.y = yPos - 1;
      frame.receiveShadow = true;
      this.scene.add(frame);

      this.conveyorBelts.push({ belt, yPos });
    });
  }

  createMovingComponents() {
    const beltYPositions = [-8, 0, 8];
    let componentId = 0;

    // Create components for each belt
    beltYPositions.forEach((beltY) => {
      for (let i = 0; i < 6; i++) {
        const component = this.createComponentBox(componentId);
        component.position.x = -15 + i * 5;
        component.position.y = beltY;
        component.position.z = 0;
        component.userData = {
          beltY,
          baseX: -15 + i * 5,
          speed: 0.03 + Math.random() * 0.02,
          offset: i * 2,
        };
        this.components.push(component);
        this.scene.add(component);
        componentId++;
      }
    });
  }

  createComponentBox(id) {
    // Component geometry - simulating precast concrete blocks
    const width = 3 + Math.random() * 2;
    const height = 2 + Math.random() * 1;
    const depth = 1 + Math.random() * 0.5;

    const geometry = new THREE.BoxGeometry(width, height, depth);

    // Multiple materials for visual interest
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.7 }), // concrete
      new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5 }),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ color: 0xbbbbbb, roughness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.4 }),
    ];

    const mesh = new THREE.Mesh(geometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.rotation.z = Math.random() * 0.3;

    return mesh;
  }

  animate = () => {
    this.frameId = requestAnimationFrame(this.animate);

    // Update component positions (conveyor belt movement)
    this.components.forEach((component) => {
      const { beltY, speed, offset } = component.userData;

      // Move along conveyor belt
      component.position.x += speed;

      // Reset position when component reaches the end
      if (component.position.x > 20) {
        component.position.x = -20;
      }

      // Slight floating animation
      component.position.z = Math.sin(Date.now() * 0.001 + offset) * 0.2;

      // Gentle rotation
      component.rotation.x += 0.005;
      component.rotation.y += 0.003;
    });

    // Gentle camera rotation
    const time = Date.now() * 0.0001;
    const radius = 20;
    this.camera.position.x = Math.cos(time) * radius;
    this.camera.position.z = Math.sin(time) * radius + 15;
    this.camera.lookAt(0, 4, 0);

    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    window.removeEventListener('resize', this.onWindowResize);

    // Clean up Three.js resources
    this.components.forEach((comp) => {
      comp.geometry.dispose();
      if (Array.isArray(comp.material)) {
        comp.material.forEach((mat) => mat.dispose());
      } else {
        comp.material.dispose();
      }
    });

    this.scene.clear();
    this.renderer.dispose();
  }
}

export default Factory3DScene;
