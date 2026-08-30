import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { IFCBEAM, IFCCOLUMN, IFCPIPESEGMENT, IFCSLAB, IFCWALL, IfcAPI } from "web-ifc";

function vectorItems(vector) {
  const items = [];
  for (let index = 0; index < vector.size(); index += 1) items.push(vector.get(index));
  return items;
}

function geometryFromPlacedGeometry(ifcApi, modelId, placedGeometry) {
  const source = ifcApi.GetGeometry(modelId, placedGeometry.geometryExpressID);
  try {
    const vertexData = ifcApi.GetVertexArray(source.GetVertexData(), source.GetVertexDataSize());
    const indexData = ifcApi.GetIndexArray(source.GetIndexData(), source.GetIndexDataSize());
    const positions = new Float32Array((vertexData.length / 6) * 3);
    const normals = new Float32Array((vertexData.length / 6) * 3);
    for (let sourceIndex = 0, targetIndex = 0; sourceIndex < vertexData.length; sourceIndex += 6, targetIndex += 3) {
      positions[targetIndex] = vertexData[sourceIndex];
      positions[targetIndex + 1] = vertexData[sourceIndex + 1];
      positions[targetIndex + 2] = vertexData[sourceIndex + 2];
      normals[targetIndex] = vertexData[sourceIndex + 3];
      normals[targetIndex + 1] = vertexData[sourceIndex + 4];
      normals[targetIndex + 2] = vertexData[sourceIndex + 5];
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setIndex(Array.from(indexData));
    geometry.applyMatrix4(new THREE.Matrix4().fromArray(placedGeometry.flatTransformation));
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return geometry;
  } finally {
    source.delete();
  }
}

export class ClashViewer {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x11120f);
    this.camera = new THREE.PerspectiveCamera(48, 1, 0.01, 5000);
    this.camera.position.set(5.5, 4.5, 6.5);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.setAttribute("aria-label", "3D model viewport; deterministic text equivalent is available in the evidence panel");
    this.renderer.domElement.tabIndex = 0;
    this.container.append(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.screenSpacePanning = true;
    this.controls.addEventListener("change", () => this.render());
    this.scene.add(new THREE.HemisphereLight(0xf5efe4, 0x30342e, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.8);
    key.position.set(7, 9, 6);
    this.scene.add(key);
    this.grid = new THREE.GridHelper(18, 18, 0x5c5a51, 0x32342e);
    this.grid.position.y = -0.02;
    this.scene.add(this.grid);
    this.modelGroup = new THREE.Group();
    this.markerGroup = new THREE.Group();
    this.scene.add(this.modelGroup, this.markerGroup);
    this.meshes = [];
    this.byGuid = new Map();
    this.selectedRecord = null;
    this.isolated = false;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.animate = this.animate.bind(this);
    this.animationFrame = requestAnimationFrame(this.animate);
  }

  async initIfc() {
    if (this.ifcApi) return this.ifcApi;
    this.ifcApi = new IfcAPI();
    this.ifcApi.SetWasmPath("/node_modules/web-ifc/", true);
    await this.ifcApi.Init();
    return this.ifcApi;
  }

  clear() {
    for (const mesh of this.meshes) {
      mesh.geometry.dispose();
      mesh.material.dispose();
      this.modelGroup.remove(mesh);
    }
    this.meshes = [];
    this.byGuid.clear();
    this.markerGroup.clear();
  }

  collectModel(ifcApi, modelId, role, typeCodes) {
    ifcApi.StreamAllMeshesWithTypes(modelId, typeCodes, flatMesh => {
      const line = ifcApi.GetLine(modelId, flatMesh.expressID);
      const guid = line?.GlobalId?.value || `express-${flatMesh.expressID}`;
      const typeCode = line?.type;
      const color = role === "mep"
        ? 0x64b8aa
        : typeCode === IFCBEAM
          ? 0xb98b5f
          : typeCode === IFCCOLUMN
            ? 0x9a8d7e
            : typeCode === IFCSLAB
              ? 0x6f7772
              : 0xd3c5ad;
      const baseOpacity = typeCode === IFCSLAB ? .38 : typeCode === IFCWALL ? .76 : .92;
      for (const placed of vectorItems(flatMesh.geometries)) {
        const geometry = geometryFromPlacedGeometry(ifcApi, modelId, placed);
        const material = new THREE.MeshStandardMaterial({ color, roughness: .66, metalness: .06, transparent: true, opacity: baseOpacity, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { guid, role, typeCode, baseColor: color, baseOpacity };
        this.modelGroup.add(mesh);
        this.meshes.push(mesh);
        const entry = this.byGuid.get(guid) || [];
        entry.push(mesh);
        this.byGuid.set(guid, entry);
      }
    });
  }

  async loadPair(mepBytes, structureBytes) {
    const ifcApi = await this.initIfc();
    this.clear();
    let mepId = null;
    let structureId = null;
    try {
      mepId = ifcApi.OpenModel(mepBytes);
      structureId = ifcApi.OpenModel(structureBytes);
      if (mepId < 0 || structureId < 0) throw new Error("Viewer could not open both IFC models");
      this.collectModel(ifcApi, mepId, "mep", [IFCPIPESEGMENT]);
      this.collectModel(ifcApi, structureId, "structure", [IFCWALL, IFCBEAM]);
      this.fitModels();
    } finally {
      if (mepId !== null && mepId >= 0) ifcApi.CloseModel(mepId);
      if (structureId !== null && structureId >= 0) ifcApi.CloseModel(structureId);
    }
  }

  resetMaterials() {
    for (const mesh of this.meshes) {
      mesh.visible = true;
      mesh.material.color.setHex(mesh.userData.baseColor);
      mesh.material.emissive.setHex(0x000000);
      mesh.material.opacity = mesh.userData.typeCode === IFCSLAB ? .14 : .34;
    }
  }

  focusRecord(record) {
    this.selectedRecord = record;
    this.isolated = false;
    this.resetMaterials();
    const selected = [...(this.byGuid.get(record.element_a.global_id) || []), ...(this.byGuid.get(record.element_b.global_id) || [])];
    for (const mesh of selected) {
      mesh.material.opacity = 1;
      mesh.material.emissive.setHex(mesh.userData.role === "mep" ? 0x17362e : 0x362d22);
    }
    this.markerGroup.clear();
    const location = record.location?.point_a_m || record.location?.point_b_m;
    if (Array.isArray(location) && location.length === 3 && location.every(Number.isFinite)) {
      const marker = new THREE.Mesh(new THREE.SphereGeometry(.095, 24, 16), new THREE.MeshStandardMaterial({ color: 0xe05237, emissive: 0x6a160d }));
      marker.position.set(location[0], location[2], -location[1]);
      this.markerGroup.add(marker);
    }
    this.fitObjects(selected.length ? selected : this.meshes);
  }

  fitObjects(objects) {
    if (!objects.length) return;
    const box = new THREE.Box3();
    objects.forEach(object => box.expandByObject(object));
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const distance = Math.max(size.length() * .92, 2.5);
    const direction = new THREE.Vector3(1, .72, 1).normalize();
    this.camera.position.copy(center).addScaledVector(direction, distance);
    this.camera.near = Math.max(distance / 1000, .01);
    this.camera.far = Math.max(distance * 20, 100);
    this.camera.updateProjectionMatrix();
    this.controls.target.copy(center);
    this.controls.update();
    this.render();
  }

  fitModels() {
    this.resetMaterials();
    for (const mesh of this.meshes) mesh.material.opacity = mesh.userData.baseOpacity;
    this.fitObjects(this.meshes);
  }

  resetFocus() {
    if (this.selectedRecord) this.focusRecord(this.selectedRecord);
    else this.fitModels();
  }

  toggleIsolate() {
    if (!this.selectedRecord) return false;
    this.isolated = !this.isolated;
    const guids = new Set([this.selectedRecord.element_a.global_id, this.selectedRecord.element_b.global_id]);
    for (const mesh of this.meshes) mesh.visible = !this.isolated || guids.has(mesh.userData.guid);
    this.render();
    return this.isolated;
  }

  resize() {
    const width = Math.max(this.container.clientWidth, 1);
    const height = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    this.controls.update();
    this.render();
    this.animationFrame = requestAnimationFrame(this.animate);
  }
}
