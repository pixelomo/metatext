import { Scene, Mesh } from 'three';

import Debug from './Utils/Debug.js';
import Sizes from './Utils/Sizes.js';
import Time from './Utils/Time.js';
import Camera from './Camera.js';
import Raycaster from './Raycaster.js';
import Renderer from './Renderer.js';
import World from './World/World.js';
import Resources from './Utils/Resources.js';

import sources from './sources.js';
import params from './params.js';

let instance = null;

export default class Experience {
    constructor(_canvas) {
        // Singleton
        if (instance) {
            return instance;
        }
        instance = this;

        // Global access
        window.experience = this;

        // Options
        this.canvas = _canvas;

        // Setup
        this.debug = new Debug();
        this.sizes = new Sizes();
        this.time = new Time();
        this.scene = new Scene();
        this.resources = new Resources(sources);
        this.camera = new Camera();
        this.raycaster = new Raycaster();
        this.renderer = new Renderer();
        this.world = new World(params);

        // Resize event
        this.sizes.on('resize', () => {
            this.resize();
        });

        // Time tick event
        this.time.on('tick', () => {
            this.update();
        });
    }

    resize() {
        this.camera.resize();
        this.renderer.resize();
    }

    update() {
        this.camera.update();
        this.world.update();
        this.renderer.update();
        this.raycaster.update();
    }

    destroy() {
        this.sizes.off('resize');
        this.time.off('tick');
        // Traverse the whole scene
        this.scene.traverse((child) => {
            // Test if it's a mesh
            if (child instanceof Mesh) {
                child.geometry.dispose();

                // Loop through the material properties
                for (const key in child.material) {
                    const value = child.material[key];
                    // Test if there is a dispose function
                    if (value && typeof value.dispose === 'function') {
                        value.dispose();
                    }
                }
            }
        });

        this.camera.controls.dispose();

        if (this.debug.active) {
            this.debug.ui.destroy();
        }

        this.renderer.instance.dispose();
        this.renderer.instance.renderLists.dispose();
    }

    // clean() {
    //     const meshes = [];
    //     this.scene.traverse(function (object) {
    //         if (object.isMesh) meshes.push(object);
    //     });

    //     for (let i = 0; i < meshes.length; i++) {
    //         const mesh = meshes[i];
    //         mesh.material.dispose();
    //         mesh.geometry.dispose();
    //         this.scene.remove(mesh);
    //     }
    // }
}
