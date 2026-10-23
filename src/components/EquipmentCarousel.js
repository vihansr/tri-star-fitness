/**
 * 3D EQUIPMENT LAB CAROUSEL — Three.js Procedural PBR Models
 * (Port of the original src/equipment3d.ts to plain JS; mounted by the React
 * <EquipmentLab /> component which owns its lifecycle via destroy().)
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EQUIPMENT_LIST, getNextCarouselIndex, clamp } from '../lib/logic.js';
import { XP_RULES } from '../lib/brand.js';

export class EquipmentCarousel {
    constructor({ container, onXPBonus } = {}) {
        this.container = container || null;
        this.onXPBonus = onXPBonus;

        // Detect software WebGL from renderer string
        this.isSoftwareGl = (() => {
            try {
                const gl = document.createElement('canvas').getContext('webgl2');
                if (!gl) return true;
                const ext = gl.getExtension('WEBGL_debug_renderer_info');
                const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
                const gpu = String(gl.getParameter(param));
                gl.getExtension('WEBGL_lose_context')?.loseContext();
                return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
            } catch {
                return true;
            }
        })();

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.modelsGroup = null;
        this.contactShadow = null;
        this.items = [];
        this.currentIndex = 0;
        this.targetTransition = 0;
        this.currentTransition = 0;
        this.animFrameId = null;
        this.isInteracting = false;
        this.pointerStartX = 0;
        this.pointerStartY = 0;
        this.userRotationY = 0;
        this.userRotationX = 0;
        this.targetUserRotationY = 0;
        this.targetUserRotationX = 0;
        this.autoRotateSpeed = 0.5;
        this.hasAwardedBonus = false;
        this.resizeObserver = null;

        if (this.container) {
            this.init();
        }
    }

    init() {
        this.renderDOM();
        this.setupThree();
        this.buildModels();
        this.bindEvents();
        this.updateUI(0);
        this.startLoop();
    }

    renderDOM() {
        if (!this.container) return;

        this.container.innerHTML = `
      <div class="equipment-3d-card">
        <!-- Header bar -->
        <div class="eq-header">
          <div>
            <div class="eq-badge-row">
              <span class="badge-tag" style="background: var(--plate-yellow); color: #14161b;">3D Interactive Lab</span>
              <span class="eq-live-spec" id="eq-category-tag">Hypertrophy & Strength</span>
            </div>
            <h3 class="eq-title" id="eq-main-title">Pro Olympic Dumbbell</h3>
          </div>

          <div class="eq-nav-controls">
            <button type="button" class="btn-eq-nav" id="btn-eq-prev" aria-label="Previous 3D equipment model">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <span class="eq-counter-badge" id="eq-counter-badge">1 / 5</span>
            <button type="button" class="btn-eq-nav" id="btn-eq-next" aria-label="Next 3D equipment model">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <!-- 3D Canvas Stage -->
        <div class="eq-canvas-wrapper" id="eq-canvas-wrapper">
          <canvas id="eq-three-canvas" class="eq-three-canvas" aria-label="Interactive 3D model of gym equipment"></canvas>

          <div class="eq-drag-hint" id="eq-drag-hint" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            <span>Drag to rotate 360°</span>
          </div>

          <div class="eq-watermark" aria-hidden="true">TRI-STAR 3D</div>
        </div>

        <!-- Equipment selection tabs -->
        <div class="eq-tabs-strip" role="tablist" aria-label="Gym equipment models">
          ${EQUIPMENT_LIST.map((item, idx) => `
            <button type="button" class="eq-tab-btn ${idx === 0 ? 'active' : ''}" data-index="${idx}" role="tab" aria-selected="${idx === 0 ? 'true' : 'false'}">
              <span class="eq-tab-dot" style="background: ${item.accent};"></span>
              <span>${item.name}</span>
            </button>
          `).join('')}
        </div>

        <!-- Spec detail footer -->
        <div class="eq-specs-panel">
          <div class="eq-spec-col">
            <span class="eq-spec-label">Weight & Dimensions</span>
            <span class="eq-spec-val" id="eq-weight-val">25 kg (Adjustable)</span>
            <span class="eq-spec-sub" id="eq-spec-sub">32mm diamond knurl handle • Urethane bumper heads</span>
          </div>
          <div class="eq-spec-col">
            <span class="eq-spec-label">Material Composition</span>
            <span class="eq-spec-val" id="eq-material-val">Hard chrome alloy steel & polyurethane</span>
            <span class="eq-spec-sub" id="eq-desc-sub">Competition-grade dumbbell balanced for heavy presses and unilateral hypertrophy drills.</span>
          </div>
        </div>
      </div>
    `;
    }

    setupThree() {
        const canvas = document.getElementById('eq-three-canvas');
        const wrapper = document.getElementById('eq-canvas-wrapper');
        if (!canvas || !wrapper) return;

        const width = Math.max(wrapper.clientWidth || 0, 600);
        const height = Math.max(wrapper.clientHeight || 0, 420);

        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        this.camera.position.set(0, 1.4, 4.6);
        this.camera.lookAt(0, 0.2, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: !this.isSoftwareGl,
            alpha: true,
            powerPreference: 'high-performance',
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.25;
        this.renderer.shadowMap.enabled = !this.isSoftwareGl;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Studio Environment Reflections
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
        pmremGenerator.dispose();

        // Balanced 3-Point Studio Lighting
        const keyLight = new THREE.DirectionalLight(0xfff7ee, 2.2);
        keyLight.position.set(4, 6, 4);
        keyLight.castShadow = !this.isSoftwareGl;
        if (keyLight.castShadow) {
            keyLight.shadow.mapSize.width = 1024;
            keyLight.shadow.mapSize.height = 1024;
            keyLight.shadow.camera.near = 1;
            keyLight.shadow.camera.far = 14;
            keyLight.shadow.camera.left = -3;
            keyLight.shadow.camera.right = 3;
            keyLight.shadow.camera.top = 3;
            keyLight.shadow.camera.bottom = -3;
            keyLight.shadow.bias = -0.0005;
            keyLight.shadow.normalBias = 0.02;
        }
        this.scene.add(keyLight);

        const fillLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.9);
        this.scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffffff, 1.4);
        rimLight.position.set(-4, 3, -3);
        this.scene.add(rimLight);

        // Contact Shadow Plane (Grounding)
        const shadowTex = this.createContactShadowTexture();
        const shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTex,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
        });
        this.contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), shadowMat);
        this.contactShadow.rotation.x = -Math.PI / 2;
        this.contactShadow.position.y = -0.85;
        this.scene.add(this.contactShadow);

        // Master models container
        this.modelsGroup = new THREE.Group();
        this.scene.add(this.modelsGroup);
    }

    /* ---------------------------------------------------------
       Procedural Canvas Texture Generators
       --------------------------------------------------------- */
    createContactShadowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
        grad.addColorStop(0, 'rgba(10, 12, 16, 0.85)');
        grad.addColorStop(0.35, 'rgba(10, 12, 16, 0.45)');
        grad.addColorStop(0.7, 'rgba(10, 12, 16, 0.15)');
        grad.addColorStop(1, 'rgba(10, 12, 16, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        return new THREE.CanvasTexture(canvas);
    }

    createPlateTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base dark green competition finish
        ctx.fillStyle = '#14a05a';
        ctx.fillRect(0, 0, 512, 512);

        // Concentric grooving
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#108048';
        for (let r = 140; r <= 230; r += 20) {
            ctx.beginPath();
            ctx.arc(256, 256, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Outer rim border
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#0d6338';
        ctx.beginPath();
        ctx.arc(256, 256, 246, 0, Math.PI * 2);
        ctx.stroke();

        // Center stainless ring guide
        ctx.fillStyle = '#b0b7c3';
        ctx.beginPath();
        ctx.arc(256, 256, 68, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#14161b';
        ctx.stroke();

        // Bold typography: "TRI-STAR" on top, "10 KG" on bottom
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 36px "Big Shoulders Display", "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TRI-STAR ★ FITNESS', 256, 105);

        ctx.font = '900 52px "Big Shoulders Display", "Arial Black", sans-serif';
        ctx.fillText('10 KG', 256, 405);

        ctx.font = '600 18px "Archivo", sans-serif';
        ctx.fillText('IWF COMPETITION SPEC', 256, 442);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        return tex;
    }

    createProteinTubTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Matte graphite background with technical carbon diagonal hatching
        ctx.fillStyle = '#1a1d24';
        ctx.fillRect(0, 0, 512, 512);

        // Dynamic diagonal red & gold racing stripes
        ctx.fillStyle = '#e63027';
        ctx.beginPath();
        ctx.moveTo(0, 80);
        ctx.lineTo(512, 20);
        ctx.lineTo(512, 45);
        ctx.lineTo(0, 105);
        ctx.fill();

        ctx.fillStyle = '#ffd21f';
        ctx.beginPath();
        ctx.moveTo(0, 115);
        ctx.lineTo(512, 55);
        ctx.lineTo(512, 70);
        ctx.lineTo(0, 130);
        ctx.fill();

        // Label Typography
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 42px "Big Shoulders Display", "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TRI-STAR ★ NUTRITION', 256, 195);

        ctx.fillStyle = '#ffd21f';
        ctx.font = '900 54px "Big Shoulders Display", "Arial Black", sans-serif';
        ctx.fillText('100% WHEY ISOLATE', 256, 255);

        // Spec pills
        ctx.fillStyle = '#e63027';
        ctx.fillRect(70, 310, 110, 42);
        ctx.fillRect(200, 310, 110, 42);
        ctx.fillRect(330, 310, 110, 42);

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 16px "Archivo", sans-serif';
        ctx.fillText('27G PROTEIN', 125, 335);
        ctx.fillText('5.5G BCAA', 255, 335);
        ctx.fillText('0G SUGAR', 385, 335);

        ctx.font = '400 15px "Archivo", sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('INDORE HIGH-PERFORMANCE LABS • 66 SERVINGS', 256, 420);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        return tex;
    }

    createProteinBarTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Matte red sport wrapper
        ctx.fillStyle = '#e63027';
        ctx.fillRect(0, 0, 512, 256);

        // Yellow accent banner
        ctx.fillStyle = '#ffd21f';
        ctx.fillRect(0, 30, 512, 24);

        ctx.fillStyle = '#14161b';
        ctx.font = '900 15px "Big Shoulders Display", "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MAXIMUM RECOVERY & FUEL • 20G PROTEIN', 256, 46);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 44px "Big Shoulders Display", "Arial Black", sans-serif';
        ctx.fillText('TRI-STAR CRUNCH', 256, 120);

        ctx.font = '700 20px "Archivo", sans-serif';
        ctx.fillStyle = '#ffd21f';
        ctx.fillText('CHOCOLATE PEANUT CRISP', 256, 160);

        ctx.fillStyle = '#ffffff';
        ctx.font = '400 14px "Archivo", sans-serif';
        ctx.fillText('NET WT. 64G • GLUTEN FREE', 256, 210);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        return tex;
    }

    createKnurlNormalMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgb(128, 128, 255)'; // Flat normal base
        ctx.fillRect(0, 0, 128, 128);

        ctx.strokeStyle = 'rgb(180, 128, 220)';
        ctx.lineWidth = 2;
        for (let i = -128; i < 256; i += 8) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 128, 128);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(i, 128);
            ctx.lineTo(i + 128, 0);
            ctx.stroke();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(8, 2);
        return tex;
    }

    /* ---------------------------------------------------------
       Composite 3-12 Part Procedural 3D Models
       --------------------------------------------------------- */
    buildModels() {
        const knurlMap = this.createKnurlNormalMap();

        // 1. DUMBBELL (7 distinct parts)
        const dumbbellGroup = new THREE.Group();
        {
            const steelMat = new THREE.MeshStandardMaterial({
                color: 0xd4d8df,
                metalness: 0.95,
                roughness: 0.18,
            });

            const knurlMat = new THREE.MeshStandardMaterial({
                color: 0xb5bcc7,
                metalness: 0.92,
                roughness: 0.42,
                normalMap: knurlMap,
            });

            const rubberMat = new THREE.MeshStandardMaterial({
                color: 0x1f232b,
                metalness: 0.15,
                roughness: 0.75,
            });

            const redAccentMat = new THREE.MeshStandardMaterial({
                color: 0xe63027,
                metalness: 0.35,
                roughness: 0.5,
            });

            // Handle shaft
            const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 32), steelMat);
            handle.rotation.z = Math.PI / 2;
            handle.castShadow = true;
            dumbbellGroup.add(handle);

            // Knurl grip sleeve
            const gripSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.125, 1.4, 32), knurlMat);
            gripSleeve.rotation.z = Math.PI / 2;
            dumbbellGroup.add(gripSleeve);

            // Left & Right Inner Collars
            const collarGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.12, 32);
            const collarL = new THREE.Mesh(collarGeo, steelMat);
            collarL.rotation.z = Math.PI / 2;
            collarL.position.x = -0.76;
            collarL.castShadow = true;
            dumbbellGroup.add(collarL);

            const collarR = collarL.clone();
            collarR.position.x = 0.76;
            dumbbellGroup.add(collarR);

            // Left & Right Inner Weight Bumper Plates (Hexagonal/Chunky)
            const plateInnerGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.38, 8);
            const plateInnerL = new THREE.Mesh(plateInnerGeo, rubberMat);
            plateInnerL.rotation.z = Math.PI / 2;
            plateInnerL.position.x = -1.02;
            plateInnerL.castShadow = true;
            dumbbellGroup.add(plateInnerL);

            const plateInnerR = plateInnerL.clone();
            plateInnerR.position.x = 1.02;
            dumbbellGroup.add(plateInnerR);

            // Left & Right Outer Plates with Red Accent Rim
            const plateOuterGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.35, 8);
            const plateOuterL = new THREE.Mesh(plateOuterGeo, redAccentMat);
            plateOuterL.rotation.z = Math.PI / 2;
            plateOuterL.position.x = -1.38;
            plateOuterL.castShadow = true;
            dumbbellGroup.add(plateOuterL);

            const plateOuterR = plateOuterL.clone();
            plateOuterR.position.x = 1.38;
            dumbbellGroup.add(plateOuterR);

            // End Cap Retaining Bolts
            const boltGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16);
            const boltL = new THREE.Mesh(boltGeo, steelMat);
            boltL.rotation.z = Math.PI / 2;
            boltL.position.x = -1.58;
            dumbbellGroup.add(boltL);

            const boltR = boltL.clone();
            boltR.position.x = 1.58;
            dumbbellGroup.add(boltR);

            dumbbellGroup.scale.setScalar(0.95);
        }

        // 2. OLYMPIC BARBELL / BAR ROD (11 distinct parts)
        const barbellGroup = new THREE.Group();
        {
            const shaftMat = new THREE.MeshStandardMaterial({
                color: 0x374151, // Blued steel finish
                metalness: 0.95,
                roughness: 0.25,
            });

            const sleeveMat = new THREE.MeshStandardMaterial({
                color: 0xe5e7eb, // Bright chrome rotating sleeves
                metalness: 0.98,
                roughness: 0.12,
            });

            const knurlMat = new THREE.MeshStandardMaterial({
                color: 0x4b5563,
                metalness: 0.9,
                roughness: 0.5,
                normalMap: knurlMap,
            });

            const brassMat = new THREE.MeshStandardMaterial({
                color: 0xd4af37,
                metalness: 0.85,
                roughness: 0.3,
            });

            // Main central bar
            const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.2, 32), shaftMat);
            shaft.rotation.z = Math.PI / 2;
            shaft.castShadow = true;
            barbellGroup.add(shaft);

            // 4 Knurl Grip bands
            const knurlBandGeo = new THREE.CylinderGeometry(0.083, 0.083, 0.45, 32);
            const k1 = new THREE.Mesh(knurlBandGeo, knurlMat);
            k1.rotation.z = Math.PI / 2;
            k1.position.x = -0.7;
            barbellGroup.add(k1);

            const k2 = k1.clone();
            k2.position.x = -1.35;
            barbellGroup.add(k2);

            const k3 = k1.clone();
            k3.position.x = 0.7;
            barbellGroup.add(k3);

            const k4 = k1.clone();
            k4.position.x = 1.35;
            barbellGroup.add(k4);

            // Left & Right Rotating Sleeves (50mm standard Olympic sleeves)
            const sleeveGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.25, 32);
            const sleeveL = new THREE.Mesh(sleeveGeo, sleeveMat);
            sleeveL.rotation.z = Math.PI / 2;
            sleeveL.position.x = -2.3;
            sleeveL.castShadow = true;
            barbellGroup.add(sleeveL);

            const sleeveR = sleeveL.clone();
            sleeveR.position.x = 2.3;
            barbellGroup.add(sleeveR);

            // Collar Flanges (Inner stops)
            const flangeGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 32);
            const flangeL = new THREE.Mesh(flangeGeo, sleeveMat);
            flangeL.rotation.z = Math.PI / 2;
            flangeL.position.x = -1.68;
            barbellGroup.add(flangeL);

            const flangeR = flangeL.clone();
            flangeR.position.x = 1.68;
            barbellGroup.add(flangeR);

            // End Bushing Caps
            const capGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 32);
            const capL = new THREE.Mesh(capGeo, brassMat);
            capL.rotation.z = Math.PI / 2;
            capL.position.x = -2.93;
            barbellGroup.add(capL);

            const capR = capL.clone();
            capR.position.x = 2.93;
            barbellGroup.add(capR);

            barbellGroup.scale.setScalar(0.72);
            barbellGroup.rotation.y = 0.25;
            barbellGroup.rotation.x = 0.15;
        }

        // 3. 10KG BUMPER PLATE (7 distinct parts)
        const plateGroup = new THREE.Group();
        {
            const plateTex = this.createPlateTexture();

            const rubberMat = new THREE.MeshStandardMaterial({
                color: 0x14a05a, // Green 10kg IWF standard
                metalness: 0.1,
                roughness: 0.65,
            });

            const texturedFaceMat = new THREE.MeshStandardMaterial({
                map: plateTex,
                metalness: 0.15,
                roughness: 0.55,
            });

            const hubMat = new THREE.MeshStandardMaterial({
                color: 0xe5e7eb,
                metalness: 0.96,
                roughness: 0.14,
            });

            // Outer thick rim
            const outerRim = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.32, 64), rubberMat);
            outerRim.castShadow = true;
            plateGroup.add(outerRim);

            // Raised lip bevels on edge
            const torusGeo = new THREE.TorusGeometry(1.56, 0.04, 16, 64);
            const lipTop = new THREE.Mesh(torusGeo, rubberMat);
            lipTop.rotation.x = Math.PI / 2;
            lipTop.position.y = 0.16;
            plateGroup.add(lipTop);

            const lipBottom = lipTop.clone();
            lipBottom.position.y = -0.16;
            plateGroup.add(lipBottom);

            // Front & Rear branded face discs
            const faceGeo = new THREE.CircleGeometry(1.5, 64);
            const frontFace = new THREE.Mesh(faceGeo, texturedFaceMat);
            frontFace.position.y = 0.162;
            frontFace.rotation.x = -Math.PI / 2;
            plateGroup.add(frontFace);

            const rearFace = new THREE.Mesh(faceGeo, texturedFaceMat);
            rearFace.position.y = -0.162;
            rearFace.rotation.x = Math.PI / 2;
            plateGroup.add(rearFace);

            // Center Stainless Steel Insert Hub (50.4mm bore sleeve)
            const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.34, 32), hubMat);
            hub.castShadow = true;
            plateGroup.add(hub);

            // Center hole void
            const innerBore = new THREE.Mesh(
                new THREE.CylinderGeometry(0.24, 0.24, 0.35, 32),
                new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.9 })
            );
            plateGroup.add(innerBore);

            plateGroup.rotation.x = Math.PI / 2.3;
            plateGroup.scale.setScalar(0.92);
        }

        // 4. WHEY PROTEIN TUB (6 distinct parts)
        const tubGroup = new THREE.Group();
        {
            const tubTex = this.createProteinTubTexture();

            const blackPlasticMat = new THREE.MeshStandardMaterial({
                color: 0x181a20,
                metalness: 0.2,
                roughness: 0.5,
            });

            const capMat = new THREE.MeshStandardMaterial({
                color: 0x14161b,
                metalness: 0.25,
                roughness: 0.38,
            });

            const labelMat = new THREE.MeshStandardMaterial({
                map: tubTex,
                metalness: 0.35,
                roughness: 0.35,
            });

            const goldMat = new THREE.MeshStandardMaterial({
                color: 0xffd21f,
                metalness: 0.9,
                roughness: 0.2,
            });

            // Main canister jar body
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.88, 1.7, 36), blackPlasticMat);
            body.castShadow = true;
            tubGroup.add(body);

            // Label wrap cylinder
            const label = new THREE.Mesh(new THREE.CylinderGeometry(0.925, 0.885, 1.35, 36), labelMat);
            label.position.y = -0.05;
            tubGroup.add(label);

            // Tapered shoulder
            const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.92, 0.28, 36), blackPlasticMat);
            shoulder.position.y = 0.99;
            tubGroup.add(shoulder);

            // Neck ring
            const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.12, 36), blackPlasticMat);
            neck.position.y = 1.18;
            tubGroup.add(neck);

            // Ribbed screw cap
            const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.35, 36), capMat);
            cap.position.y = 1.38;
            cap.castShadow = true;
            tubGroup.add(cap);

            // Gold seal ring
            const sealRing = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.02, 16, 36), goldMat);
            sealRing.rotation.x = Math.PI / 2;
            sealRing.position.y = 1.22;
            tubGroup.add(sealRing);

            tubGroup.scale.setScalar(0.9);
            tubGroup.position.y = -0.15;
        }

        // 5. PROTEIN BAR (8 distinct parts)
        const barGroup = new THREE.Group();
        {
            const barTex = this.createProteinBarTexture();

            const chocolateMat = new THREE.MeshStandardMaterial({
                color: 0x361c12, // Rich dark chocolate
                metalness: 0.08,
                roughness: 0.48,
            });

            const foilMat = new THREE.MeshStandardMaterial({
                color: 0xd8dde6,
                metalness: 0.95,
                roughness: 0.18,
            });

            const wrapperMat = new THREE.MeshStandardMaterial({
                map: barTex,
                metalness: 0.25,
                roughness: 0.45,
            });

            // Main core bar
            const core = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.34, 2.3), chocolateMat);
            core.castShadow = true;
            barGroup.add(core);

            // 4 Segmented chocolate snap blocks on top
            const segmentGeo = new THREE.BoxGeometry(0.96, 0.12, 0.42);
            for (let i = 0; i < 4; i++) {
                const seg = new THREE.Mesh(segmentGeo, chocolateMat);
                seg.position.set(0, 0.21, -0.75 + i * 0.5);
                seg.castShadow = true;
                barGroup.add(seg);
            }

            // Partially peeled crinkled foil wrapper around lower half
            const foil = new THREE.Mesh(new THREE.BoxGeometry(1.23, 0.37, 1.4), foilMat);
            foil.position.set(0, -0.01, 0.48);
            barGroup.add(foil);

            // Outer branded wrapper sleeve
            const sleeve = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.38, 1.15), wrapperMat);
            sleeve.position.set(0, -0.01, 0.62);
            sleeve.castShadow = true;
            barGroup.add(sleeve);

            // Chocolate drizzle stripes
            const drizzleMat = new THREE.MeshStandardMaterial({ color: 0x241109, roughness: 0.3 });
            const drizzle = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.02, 8, 24), drizzleMat);
            drizzle.rotation.y = Math.PI / 4;
            drizzle.position.set(0, 0.24, -0.6);
            barGroup.add(drizzle);

            barGroup.rotation.x = Math.PI / 3.8;
            barGroup.rotation.y = -Math.PI / 6;
            barGroup.scale.setScalar(1.05);
        }

        // Assemble list of model groups
        this.items = [
            { group: dumbbellGroup, item: EQUIPMENT_LIST[0] },
            { group: barbellGroup, item: EQUIPMENT_LIST[1] },
            { group: plateGroup, item: EQUIPMENT_LIST[2] },
            { group: tubGroup, item: EQUIPMENT_LIST[3] },
            { group: barGroup, item: EQUIPMENT_LIST[4] },
        ];

        // Position items horizontally along carousel ring
        this.items.forEach(({ group }, idx) => {
            group.visible = idx === 0;
            this.modelsGroup.add(group);
        });
    }

    bindEvents() {
        if (!this.container) return;

        // Previous / Next buttons
        const prevBtn = document.getElementById('btn-eq-prev');
        const nextBtn = document.getElementById('btn-eq-next');

        this.onPrevClick = () => this.goToIndex(getNextCarouselIndex(this.currentIndex, -1, this.items.length));
        this.onNextClick = () => this.goToIndex(getNextCarouselIndex(this.currentIndex, 1, this.items.length));
        if (prevBtn) prevBtn.addEventListener('click', this.onPrevClick);
        if (nextBtn) nextBtn.addEventListener('click', this.onNextClick);

        // Equipment tab buttons
        const tabBtns = this.container.querySelectorAll('.eq-tab-btn');
        this.onTabClick = (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-index') || '0', 10);
            this.goToIndex(idx);
        };
        tabBtns.forEach((btn) => btn.addEventListener('click', this.onTabClick));

        // Pointer Drag to Rotate
        const canvasWrapper = document.getElementById('eq-canvas-wrapper');

        this.onPointerDown = (e) => {
            this.isInteracting = true;
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            this.pointerStartX = clientX;
            this.pointerStartY = clientY;
        };

        this.onPointerMove = (e) => {
            if (!this.isInteracting) return;
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            const deltaX = clientX - this.pointerStartX;
            const deltaY = clientY - this.pointerStartY;
            this.pointerStartX = clientX;
            this.pointerStartY = clientY;

            this.targetUserRotationY += deltaX * 0.012;
            this.targetUserRotationX = clamp(this.targetUserRotationX + deltaY * 0.008, -0.6, 0.6);

            // Hide drag hint on interaction
            const hint = document.getElementById('eq-drag-hint');
            if (hint) hint.style.opacity = '0';
        };

        this.onPointerUp = () => {
            this.isInteracting = false;
        };

        if (canvasWrapper) {
            canvasWrapper.addEventListener('mousedown', this.onPointerDown);
            window.addEventListener('mousemove', this.onPointerMove);
            window.addEventListener('mouseup', this.onPointerUp);

            canvasWrapper.addEventListener('touchstart', this.onPointerDown, { passive: true });
            window.addEventListener('touchmove', this.onPointerMove, { passive: true });
            window.addEventListener('touchend', this.onPointerUp);
        }

        // Resize Observer for dynamic responsive canvas
        if (canvasWrapper) {
            this.resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    if (width > 0 && height > 0) {
                        this.camera.aspect = width / height;
                        this.camera.updateProjectionMatrix();
                        this.renderer.setSize(width, height);
                    }
                }
            });
            this.resizeObserver.observe(canvasWrapper);
        }
    }

    goToIndex(idx) {
        if (idx === this.currentIndex) return;

        this.currentIndex = idx;
        this.targetTransition = 1.0;
        this.currentTransition = 0.0;
        this.targetUserRotationY = 0;
        this.targetUserRotationX = 0;
        this.userRotationY = 0;
        this.userRotationX = 0;

        this.updateUI(idx);

        // Award bonus XP on exploring the 3D lab
        if (!this.hasAwardedBonus && this.onXPBonus) {
            this.hasAwardedBonus = true;
            const card = this.container.querySelector('.equipment-3d-card');
            if (card) {
                this.onXPBonus(XP_RULES.EQUIPMENT_VIEW, card);
            }
        }
    }

    updateUI(idx) {
        if (!this.container) return;
        const item = this.items[idx]?.item;
        if (!item) return;

        // Tabs state
        const tabs = this.container.querySelectorAll('.eq-tab-btn');
        tabs.forEach((tab, i) => {
            if (i === idx) {
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
            } else {
                tab.classList.remove('active');
                tab.setAttribute('aria-selected', 'false');
            }
        });

        // Content updates
        const titleEl = document.getElementById('eq-main-title');
        const catEl = document.getElementById('eq-category-tag');
        const counterEl = document.getElementById('eq-counter-badge');
        const weightEl = document.getElementById('eq-weight-val');
        const specEl = document.getElementById('eq-spec-sub');
        const matEl = document.getElementById('eq-material-val');
        const descEl = document.getElementById('eq-desc-sub');

        if (titleEl) titleEl.textContent = item.name;
        if (catEl) catEl.textContent = `${item.tag} • ${item.category}`;
        if (counterEl) counterEl.textContent = `${idx + 1} / ${this.items.length}`;
        if (weightEl) weightEl.textContent = item.weight;
        if (specEl) specEl.textContent = item.spec;
        if (matEl) matEl.textContent = item.material;
        if (descEl) descEl.textContent = item.description;
    }

    afterDraw(cb) {
        try {
            const gl = this.renderer.getContext();
            const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
            gl.flush();
            const poll = () => {
                const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
                if (state === gl.UNSIGNALED) {
                    this.animFrameId = window.setTimeout(poll, 5);
                } else {
                    if (sync) gl.deleteSync(sync);
                    this.animFrameId = window.setTimeout(cb, 60);
                }
            };
            this.animFrameId = window.setTimeout(poll, 5);
        } catch {
            this.animFrameId = window.setTimeout(cb, 60);
        }
    }

    startLoop() {
        let lastTime = performance.now();

        const tick = () => {
            const now = performance.now();
            const dt = Math.min((now - lastTime) / 1000, 0.08) || 0.016;
            lastTime = now;

            // Smooth exponential damping for user interaction
            this.userRotationY += (this.targetUserRotationY - this.userRotationY) * (1 - Math.exp(-12 * dt));
            this.userRotationX += (this.targetUserRotationX - this.userRotationX) * (1 - Math.exp(-12 * dt));

            // Constant gentle ambient auto-spin (slows down when user drags)
            if (!this.isInteracting) {
                this.targetUserRotationY += this.autoRotateSpeed * dt;
            }

            // Smooth transition easing between models
            this.currentTransition += (this.targetTransition - this.currentTransition) * 0.15;

            // Update visible items
            this.items.forEach(({ group }, idx) => {
                if (idx === this.currentIndex) {
                    group.visible = true;
                    // Apply rotations and hover float
                    group.rotation.y = this.userRotationY;
                    group.rotation.x = this.userRotationX + (idx === 1 ? 0.15 : idx === 2 ? Math.PI / 2.3 : idx === 4 ? Math.PI / 3.8 : 0);

                    // Subtle levitation breath
                    const breath = Math.sin(now * 0.002) * 0.04;
                    group.position.y = (idx === 3 ? -0.15 : 0) + breath;
                    group.scale.setScalar(0.95 + breath * 0.1);
                } else {
                    group.visible = false;
                }
            });

            // Render Three.js scene
            this.renderer.render(this.scene, this.camera);

            if (this.isSoftwareGl) {
                this.afterDraw(tick);
            } else {
                this.animFrameId = requestAnimationFrame(tick);
            }
        };

        if (this.isSoftwareGl) {
            this.afterDraw(tick);
        } else {
            this.animFrameId = requestAnimationFrame(tick);
        }
    }

    destroy() {
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            clearTimeout(this.animFrameId);
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        // Remove window-level listeners
        window.removeEventListener('mousemove', this.onPointerMove);
        window.removeEventListener('mouseup', this.onPointerUp);
        window.removeEventListener('touchmove', this.onPointerMove);
        window.removeEventListener('touchend', this.onPointerUp);

        const prevBtn = document.getElementById('btn-eq-prev');
        const nextBtn = document.getElementById('btn-eq-next');
        if (prevBtn && this.onPrevClick) prevBtn.removeEventListener('click', this.onPrevClick);
        if (nextBtn && this.onNextClick) nextBtn.removeEventListener('click', this.onNextClick);

        try {
            if (this.renderer) this.renderer.dispose();
        } catch {
            /* renderer already gone */
        }
    }
}
