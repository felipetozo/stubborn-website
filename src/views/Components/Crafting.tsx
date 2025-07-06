'use client';

import styles from './Crafting.module.css';
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Text, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function TrianglePrism() {
    const geometry = useMemo(() => {
        const triangleGeometry = new THREE.BufferGeometry();

        const depth = 0.10;
        const height = 1.15;
        const width = 1.15;

        // Vértices suavizados (pode ajustar se quiser)
        const topSmooth = { x: 0, y: height };
        const leftSmooth = { x: -width, y: -height };
        const rightSmooth = { x: width, y: -height };

        const vertices = new Float32Array([
            topSmooth.x, topSmooth.y, depth,      // Top front (0)
            leftSmooth.x, leftSmooth.y, depth,    // Left front (1)
            rightSmooth.x, rightSmooth.y, depth,  // Right front (2)

            topSmooth.x, topSmooth.y, -depth,     // Top back (3)
            leftSmooth.x, leftSmooth.y, -depth,   // Left back (4)
            rightSmooth.x, rightSmooth.y, -depth  // Right back (5)
        ]);

        const indices = [
            0, 1, 2,    // Front face
            3, 5, 4,    // Back face
            0, 3, 1, 1, 3, 4,  // Left side
            2, 5, 0, 0, 5, 3,  // Right side
            1, 4, 2, 2, 4, 5   // Bottom side
        ];

        triangleGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        triangleGeometry.setIndex(indices);
        triangleGeometry.computeVertexNormals();

        return triangleGeometry;
    }, []);

    return (
        <mesh geometry={geometry}>
            <MeshTransmissionMaterial
                thickness={0.15}
                roughness={0.1}
                transmission={1}
                ior={1.2}
                chromaticAberration={5}
                backside={true}
                color={'#ADD8E6'}
                metalness={0.0}
                clearcoat={0.25}
                envMapIntensity={0.0}
                reflectivity={0.25}
            />
        </mesh>
    );
}

const Scene = ({ scrollTriggerRef }: { scrollTriggerRef: React.RefObject<HTMLDivElement | null> }) => {
    const prismGroupRef = useRef<THREE.Group>(null);
    const prismMeshRef = useRef<THREE.Mesh>(null);
    const idleRotationTween = useRef<gsap.core.Tween | null>(null);

    const startIdleRotation = () => {
        if (prismMeshRef.current && !idleRotationTween.current) {
            idleRotationTween.current = gsap.to(prismMeshRef.current.rotation, {
                x: `+=${Math.PI * 2}`,
                y: `+=${Math.PI * 2}`,
                z: `+=${Math.PI * 2}`,
                duration: 10 + Math.random() * 5,
                ease: 'none',
                repeat: -1,
                yoyo: true,
                overwrite: 'auto',
            });
        }
    };

    const stopIdleRotation = () => {
        if (idleRotationTween.current) {
            idleRotationTween.current.pause();
            idleRotationTween.current = null;
        }
    };

    useEffect(() => {
        if (scrollTriggerRef.current && prismGroupRef.current && prismMeshRef.current) {
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.trigger === scrollTriggerRef.current) {
                    trigger.kill();
                }
            });
            gsap.set(prismGroupRef.current.position, { z: 0, x: 0, y: 0 });
            gsap.set(prismGroupRef.current.rotation, { x: 0, y: 0, z: 0 });
            gsap.set(prismGroupRef.current.scale, { x: 2, y: 2, z: 2 });
            startIdleRotation();
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: scrollTriggerRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.8,
                    onEnter: () => {
                        stopIdleRotation();
                        if (prismMeshRef.current) {
                            gsap.set(prismMeshRef.current.rotation, { x: 0, y: 0, z: 0 });
                        }
                    },
                    onLeaveBack: () => {
                        startIdleRotation();
                    },
                    onLeave: () => {
                        startIdleRotation();
                    },
                    onEnterBack: () => {
                        stopIdleRotation();
                        if (prismMeshRef.current) {
                            gsap.set(prismMeshRef.current.rotation, { x: 0, y: 0, z: 0 });
                        }
                    }
                },
            });
            tl.to(prismGroupRef.current.rotation, {
                x: Math.PI * 4,
                y: Math.PI * 6,
                z: Math.PI * 2,
                duration: 1,
                ease: 'none'
            }, 0);
            tl.to(prismGroupRef.current.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 1,
                ease: 'power2.out'
            }, 0);
            return () => {
                tl.kill();
                stopIdleRotation();
            };
        }
    }, [scrollTriggerRef]);

    return (
        <>
            <group ref={prismGroupRef}>
                <group ref={prismMeshRef}>
                    <TrianglePrism />
                </group>
            </group>
            <Text
                position={[0, 0, -2]}
                fontSize={0.8}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                Crafting long lasting experiences
            </Text>
            <ambientLight intensity={0.6} color="#404040" />
            <directionalLight
                position={[5, 5, 5]}
                intensity={1.3}
                color="white"
                castShadow
            />
            <pointLight position={[-3, 3, 3]} intensity={1.2} distance={100} />
            <pointLight position={[3, -2, 2]} intensity={0.8} distance={100} />
        </>
    );
};

function Crafting() {
    const sectionRef = useRef<HTMLDivElement>(null);
    return (
        <div ref={sectionRef} className={styles.CraftingSection}>
            <Canvas
                camera={{ position: [0, 0, 4], fov: 50 }}
                gl={{
                    antialias: true,
                    outputColorSpace: THREE.SRGBColorSpace,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.2,
                    alpha: true
                }}
                style={{ width: '100%', height: '30rem' }}
            >
                <Scene scrollTriggerRef={sectionRef} />
            </Canvas>
        </div>
    );
}

export default Crafting;