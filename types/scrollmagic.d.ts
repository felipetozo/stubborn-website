declare module 'scrollmagic/scrollmagic/uncompressed/ScrollMagic' {
    import { ControllerOptions, SceneOptions } from 'scrollmagic';

    export class Controller {
        constructor(options?: ControllerOptions);
        addScene(scene: Scene): void;
    }

    export class Scene {
        constructor(options?: SceneOptions);
        setPin(element: string | HTMLElement): Scene;
        setTween(tween: any): Scene;
        addTo(controller: Controller): Scene;
    }

    export interface ControllerOptions {
        globalSceneOptions?: SceneOptions;
        loglevel?: number;
        // Add other options as needed based on ScrollMagic documentation
    }

    export interface SceneOptions {
        triggerElement?: string | HTMLElement;
        triggerHook?: number;
        duration?: string | number;
        offset?: number;
        // Add other options as needed
    }
}

declare module 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap' {
    // This module doesn't need to export anything specific, just declare it exists
    export { };
}