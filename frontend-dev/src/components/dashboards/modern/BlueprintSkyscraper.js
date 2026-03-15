import * as THREE from 'three';

class BlueprintSkyscraper {
  constructor(canvas, theme) {
    this.canvas = canvas;
    this.theme = theme;
    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = null;
    this.buildings = [];
    this.grid = null;
    this.frameId = null;
    this.time = 0;

    this.initScene();
    this.createBackground();
    this.createGrid();
    this.createBuildings();
    this.animate();
  }

  initScene() {
    let width = this.canvas.clientWidth;
    let height = this.canvas.clientHeight;

    // Fallback to parent container if canvas hasn't been sized yet
    if (width === 0 || height === 0) {
      width = this.canvas.parentElement?.clientWidth || window.innerWidth;
      height = this.canvas.parentElement?.clientHeight || window.innerHeight;
    }

    // Ensure minimum size
    width = Math.max(width, 100);
    height = Math.max(height, 100);

    // Set canvas resolution attributes explicitly
    this.canvas.width = width;
    this.canvas.height = height;

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 5, 20);
    this.camera.lookAt(0, 5, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x0a1628, 1); // Dark navy blueprint color

    // Handle window resize
    this.onWindowResize = () => {
      const newWidth = this.canvas.clientWidth;
      const newHeight = this.canvas.clientHeight;
      if (newWidth > 0 && newHeight > 0) {
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.camera.aspect = newWidth / newHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(newWidth, newHeight);
      }
    };

    window.addEventListener('resize', this.onWindowResize);
  }

  createBackground() {
    // Enhanced lighting for better visibility
    const ambientLight = new THREE.AmbientLight(0x00d4ff, 0.3);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00d4ff, 0.7);
    pointLight.position.set(0, 15, 10);
    this.scene.add(pointLight);

    // Add a brighter second light for depth
    const backLight = new THREE.PointLight(0x0066ff, 0.2);
    backLight.position.set(-10, 8, -20);
    this.scene.add(backLight);
  }

  createGrid() {
    // Create minimal grid pattern for blueprint effect
    const gridSize = 60;
    const gridDivisions = 20;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x00d4ff, 0x00d4ff);
    gridHelper.position.y = -0.5;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.15; // Slightly more visible grid
    this.scene.add(gridHelper);

    // Add horizontal lines at different heights
    const lineGeometry = new THREE.BufferGeometry();
    const positions = [];

    for (let i = -30; i <= 30; i += 5) {
      positions.push(-30, i, 0);
      positions.push(30, i, 0);
    }

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.12,
    });

    this.grid = new THREE.LineSegments(lineGeometry, lineMaterial);
    this.scene.add(this.grid);
  }

  createBuildings() {
    // Create futuristic skyscraper wireframes
    const buildingConfigs = [
      { x: -12, height: 18, width: 3, depth: 3 },
      { x: -6, height: 22, width: 2.5, depth: 2.5 },
      { x: 0, height: 25, width: 3.5, depth: 3.5 },
      { x: 6, height: 20, width: 2.8, depth: 2.8 },
      { x: 12, height: 16, width: 3, depth: 3 },
    ];

    buildingConfigs.forEach((config, index) => {
      const building = this.createBuilding(
        config.x,
        config.height,
        config.width,
        config.depth,
        index
      );
      this.buildings.push({
        mesh: building,
        startHeight: 0,
        targetHeight: config.height,
        currentHeight: 0,
        animationDelay: index * 0.15,
      });
      this.scene.add(building);
    });
  }

  createBuilding(x, height, width, depth, index) {
    const group = new THREE.Group();

    // Create wireframe building using lines
    const verticesArray = [
      // Bottom vertices
      -width / 2,
      0,
      -depth / 2,
      width / 2,
      0,
      -depth / 2,
      width / 2,
      0,
      depth / 2,
      -width / 2,
      0,
      depth / 2,
      // Top vertices
      -width / 2,
      height,
      -depth / 2,
      width / 2,
      height,
      -depth / 2,
      width / 2,
      height,
      depth / 2,
      -width / 2,
      height,
      depth / 2,
    ];

    const edgesArray = [
      // Bottom edges
      0, 1, 1, 2, 2, 3, 3, 0,
      // Top edges
      4, 5, 5, 6, 6, 7, 7, 4,
      // Vertical edges
      0, 4, 1, 5, 2, 6, 3, 7,
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verticesArray), 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 1.0,
      linewidth: 2,
    });

    // Create wireframe building
    const lines = new THREE.LineSegments(geometry, lineMaterial);

    // Add glowing effect with additional bright lines
    const glowMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
      linewidth: 4,
    });
    const glowLines = new THREE.LineSegments(geometry, glowMaterial);

    group.add(lines);
    group.add(glowLines);
    group.position.x = x;

    // Add subtle floating windows effect
    this.addWindowDetails(group, width, depth, height);

    return group;
  }

  addWindowDetails(buildingGroup, width, depth, height) {
    // Add minimal window indicator lines
    const windowSize = 0.6;
    const spacing = 2;

    const windowGeometry = new THREE.BufferGeometry();
    const windowPositions = [];

    // Front face windows
    for (let y = 2; y < height; y += spacing) {
      for (let x = -width / 2 + 0.5; x < width / 2; x += spacing) {
        windowPositions.push(x, y, depth / 2);
        windowPositions.push(x + windowSize * 0.5, y, depth / 2);
      }
    }

    if (windowPositions.length > 0) {
      windowGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(windowPositions), 3)
      );

      const windowMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.7,
      });

      const windowLines = new THREE.LineSegments(windowGeometry, windowMaterial);
      buildingGroup.add(windowLines);
    }
  }

  animate = () => {
    this.frameId = requestAnimationFrame(this.animate);
    this.time += 0.01;

    // Animate building growth from bottom to top
    this.buildings.forEach((building, index) => {
      const delayedTime = Math.max(0, this.time - building.animationDelay);

      if (delayedTime < 1.5) {
        // Growth animation
        building.currentHeight = building.targetHeight * (delayedTime / 1.5);
      } else {
        // After growth, subtle floating animation
        const floatTime = this.time - building.animationDelay - 1.5;
        building.currentHeight = building.targetHeight + Math.sin(floatTime * 0.5) * 0.3;
      }

      // Update building position to create growth effect
      const scaleFactor = building.currentHeight / building.targetHeight;
      building.mesh.scale.y = Math.max(0, scaleFactor);

      // Add subtle glow pulsing
      const pulse = Math.sin(this.time * 2 + index) * 0.15 + 0.9;
      building.mesh.children.forEach((child) => {
        if (child.material) {
          child.material.opacity = pulse * (child.material.transparent ? 1.0 : 1);
        }
      });
    });

    // Subtle camera movement for cinematic feel
    const cameraOffsetX = Math.sin(this.time * 0.3) * 3;
    const cameraOffsetY = Math.sin(this.time * 0.25) * 1.5;
    this.camera.position.x = cameraOffsetX;
    this.camera.position.y = 5 + cameraOffsetY;
    this.camera.lookAt(0, 8, 0);

    // Subtle grid animation
    if (this.grid) {
      this.grid.material.opacity = 0.05 + Math.sin(this.time * 0.5) * 0.02;
    }

    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    window.removeEventListener('resize', this.onWindowResize);

    // Clean up Three.js resources
    this.buildings.forEach((building) => {
      building.mesh.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });

    if (this.grid) {
      this.grid.geometry.dispose();
      this.grid.material.dispose();
    }

    this.scene.clear();
    this.renderer.dispose();
  }
}

export default BlueprintSkyscraper;
