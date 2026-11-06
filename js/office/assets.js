import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// Real-world assets layered over the procedural room. Everything here loads
// after first paint; until then the procedural stand-ins are shown.
// Sources (all CC0): Poly Haven (HDRI + models), ambientCG (textures).

const BASE = 'public/office-assets/';
const gltf = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const textures = new THREE.TextureLoader().setPath(BASE + 'textures/');

// Image-based lighting: the HDRI gives reflections and soft fill, it isn't shown as a backdrop.
export function loadEnvironment(renderer, scene) {
    new RGBELoader().load(BASE + 'lebombo_1k.hdr', (hdr) => {
        const pmrem = new THREE.PMREMGenerator(renderer);
        scene.environment = pmrem.fromEquirectangular(hdr).texture;
        hdr.dispose();
        pmrem.dispose();
    });
}

// Swap a material's procedural look for an ambientCG PBR set once all maps are in.
export function applyPBR(material, name, repeat = [1, 1], tint = '#ffffff') {
    const maps = ['color', 'normal', 'rough'].map(kind => new Promise((resolve, reject) => {
        textures.load(`${name}-${kind}.jpg`, resolve, undefined, reject);
    }));
    Promise.all(maps).then(([map, normalMap, roughnessMap]) => {
        map.colorSpace = THREE.SRGBColorSpace;
        for (const t of [map, normalMap, roughnessMap]) {
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(...repeat);
            t.anisotropy = 8;
        }
        Object.assign(material, { map, normalMap, roughnessMap, roughness: 1 });
        material.color.set(tint);
        material.needsUpdate = true;
    }).catch(() => {}); // keep the procedural texture
}

// Load a Poly Haven model into `group`, hiding the procedural stand-in meshes.
// `fit` scales the model so its height matches (in the group's local units),
// then sits it on y = 0. Objects listed in `keep` (lights etc.) stay visible.
export function swapInModel(group, file, { fit, position = [0, 0, 0], rotationY = 0, keep = [] } = {}) {
    return new Promise((resolve) => {
        gltf.load(BASE + 'models/' + file, ({ scene: model }) => {
            model.traverse(o => {
                if (o.isMesh) {
                    o.castShadow = true;
                    o.receiveShadow = true;
                }
            });
            model.rotation.y = rotationY;
            if (fit) {
                const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
                model.scale.setScalar(fit / size.y);
            }
            const box = new THREE.Box3().setFromObject(model);
            model.position.set(position[0], position[1] - box.min.y, position[2]);

            for (const child of [...group.children]) {
                if (!keep.includes(child)) child.visible = false;
            }
            // inherit whatever tags the stand-in had (hotspot ids etc.)
            model.traverse(o => { Object.assign(o.userData, group.userData); });
            group.add(model);
            resolve(model);
        }, undefined, () => resolve(null));
    });
}
