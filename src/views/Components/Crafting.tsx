'use client';

import styles from './Crafting.module.css';
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, MeshTransmissionMaterial, Torus, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type ShapeType = 'triangle' | 'torus' | 'roundedBox';
type ContentType = 'solid' | 'liquid' | 'particles';

interface MaterialProps {
    thickness: number;
    roughness: number;
    transmission: number;
    ior: number;
    chromaticAberration: number;
    metalness: number;
    clearcoat: number;
    envMapIntensity: number;
    reflectivity: number;
}

// Shader para efeito líquido
const liquidVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float time;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    // Adiciona movimento ondulante
    vec3 pos = position;
    pos.y += sin(pos.x * 10.0 + time) * 0.02;
    pos.x += cos(pos.y * 8.0 + time * 0.5) * 0.01;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const liquidFragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float time;
  uniform vec3 color;
  
  void main() {
    vec2 uv = vUv;
    
    // Cria padrões de onda
    float wave1 = sin(uv.x * 20.0 + time) * 0.5 + 0.5;
    float wave2 = sin(uv.y * 15.0 + time * 0.7) * 0.5 + 0.5;
    float wave3 = sin((uv.x + uv.y) * 10.0 + time * 0.3) * 0.5 + 0.5;
    
    // Combina as ondas
    float liquid = (wave1 + wave2 + wave3) / 3.0;
    
    // Adiciona variação de cor
    vec3 liquidColor = mix(color, color * 1.2, liquid);
    
    // Adiciona transparência baseada na posição
    float alpha = 0.8 + liquid * 0.2;
    
    gl_FragColor = vec4(liquidColor, alpha);
  }
`;

// Componente de partículas líquidas
function LiquidParticles({ count = 100, color = '#ADD8E6' }) {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = new THREE.Object3D();
    
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const time = Math.random() * 100;
            const factor = Math.random() * 20 + 10;
            const speed = Math.random() * 0.01 + 0.003;
            const x = Math.random() * 2 - 1;
            const y = Math.random() * 2 - 1;
            const z = Math.random() * 2 - 1;
            temp.push({ time, factor, speed, x, y, z });
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        if (!mesh.current) return;
        
        particles.forEach((particle, i) => {
            const { time, factor, speed, x, y, z } = particle;
            
            // Anima as partículas
            particle.time += speed;
            
            // Movimento ondulante
            const waveX = Math.sin(particle.time) * 0.1;
            const waveY = Math.cos(particle.time * 0.5) * 0.1;
            const waveZ = Math.sin(particle.time * 0.3) * 0.1;
            
            dummy.position.set(
                x + waveX,
                y + waveY,
                z + waveZ
            );
            
            // Escala baseada no movimento
            const scale = 0.02 + Math.sin(particle.time) * 0.01;
            dummy.scale.setScalar(scale);
            
            dummy.updateMatrix();
            if (mesh.current) {
                mesh.current.setMatrixAt(i, dummy.matrix);
            }
        });
        
        if (mesh.current) {
            mesh.current.instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
        </instancedMesh>
    );
}

// Shader material para líquido
function LiquidShaderMaterial({ color = '#ADD8E6', time = 0 }) {
    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            vertexShader: liquidVertexShader,
            fragmentShader: liquidFragmentShader,
            uniforms: {
                time: { value: time },
                color: { value: new THREE.Color(color) }
            },
            transparent: true,
            side: THREE.DoubleSide
        });
    }, [color, time]);

    useFrame((state) => {
        material.uniforms.time.value = state.clock.elapsedTime;
    });

    return <primitive object={material} />;
}

function TrianglePrism({ materialProps, contentType }: { materialProps: MaterialProps, contentType: ContentType }) {
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

    const renderContent = () => {
        switch (contentType) {
            case 'liquid':
                return (
                    <mesh geometry={geometry}>
                        <LiquidShaderMaterial />
                    </mesh>
                );
            case 'particles':
                return (
                    <group>
                        <mesh geometry={geometry}>
                            <MeshTransmissionMaterial
                                thickness={materialProps.thickness}
                                roughness={materialProps.roughness}
                                transmission={materialProps.transmission}
                                ior={materialProps.ior}
                                chromaticAberration={materialProps.chromaticAberration}
                                backside={true}
                                color={'#ADD8E6'}
                                metalness={materialProps.metalness}
                                clearcoat={materialProps.clearcoat}
                                envMapIntensity={materialProps.envMapIntensity}
                                reflectivity={materialProps.reflectivity}
                            />
                        </mesh>
                        <LiquidParticles count={150} />
                    </group>
                );
            default:
                return (
                    <mesh geometry={geometry}>
                        <MeshTransmissionMaterial
                            thickness={materialProps.thickness}
                            roughness={materialProps.roughness}
                            transmission={materialProps.transmission}
                            ior={materialProps.ior}
                            chromaticAberration={materialProps.chromaticAberration}
                            backside={true}
                            color={'#ADD8E6'}
                            metalness={materialProps.metalness}
                            clearcoat={materialProps.clearcoat}
                            envMapIntensity={materialProps.envMapIntensity}
                            reflectivity={materialProps.reflectivity}
                        />
                    </mesh>
                );
        }
    };

    return renderContent();
}

function TorusShape({ materialProps, contentType }: { materialProps: MaterialProps, contentType: ContentType }) {
    const renderContent = () => {
        switch (contentType) {
            case 'liquid':
                return (
                    <Torus args={[1.15, 0.3, 16, 32]} scale={[1, 1, 1]}>
                        <LiquidShaderMaterial />
                    </Torus>
                );
            case 'particles':
                return (
                    <group>
                        <Torus
                            args={[1.15, 0.3, 16, 32]}
                            scale={[1, 1, 1]}
                        >
                            <MeshTransmissionMaterial
                                thickness={materialProps.thickness}
                                roughness={materialProps.roughness}
                                transmission={materialProps.transmission}
                                ior={materialProps.ior}
                                chromaticAberration={materialProps.chromaticAberration}
                                backside={true}
                                color={'#ADD8E6'}
                                metalness={materialProps.metalness}
                                clearcoat={materialProps.clearcoat}
                                envMapIntensity={materialProps.envMapIntensity}
                                reflectivity={materialProps.reflectivity}
                            />
                        </Torus>
                        <LiquidParticles count={200} />
                    </group>
                );
            default:
                return (
                    <Torus
                        args={[1.15, 0.3, 16, 32]}
                        scale={[1, 1, 1]}
                    >
                        <MeshTransmissionMaterial
                            thickness={materialProps.thickness}
                            roughness={materialProps.roughness}
                            transmission={materialProps.transmission}
                            ior={materialProps.ior}
                            chromaticAberration={materialProps.chromaticAberration}
                            backside={true}
                            color={'#ADD8E6'}
                            metalness={materialProps.metalness}
                            clearcoat={materialProps.clearcoat}
                            envMapIntensity={materialProps.envMapIntensity}
                            reflectivity={materialProps.reflectivity}
                        />
                    </Torus>
                );
        }
    };

    return renderContent();
}

function RoundedBoxShape({ materialProps, contentType }: { materialProps: MaterialProps, contentType: ContentType }) {
    const renderContent = () => {
        switch (contentType) {
            case 'liquid':
                return (
                    <RoundedBox
                        args={[2.3, 2.3, 2.3]}
                        radius={0.2}
                        smoothness={4}
                        scale={[1, 1, 1]}
                    >
                        <LiquidShaderMaterial />
                    </RoundedBox>
                );
            case 'particles':
                return (
                    <group>
                        <RoundedBox
                            args={[2.3, 2.3, 2.3]}
                            radius={0.2}
                            smoothness={4}
                            scale={[1, 1, 1]}
                        >
                            <MeshTransmissionMaterial
                                thickness={materialProps.thickness}
                                roughness={materialProps.roughness}
                                transmission={materialProps.transmission}
                                ior={materialProps.ior}
                                chromaticAberration={materialProps.chromaticAberration}
                                backside={true}
                                color={'#ADD8E6'}
                                metalness={materialProps.metalness}
                                clearcoat={materialProps.clearcoat}
                                envMapIntensity={materialProps.envMapIntensity}
                                reflectivity={materialProps.reflectivity}
                            />
                        </RoundedBox>
                        <LiquidParticles count={300} />
                    </group>
                );
            default:
                return (
                    <RoundedBox
                        args={[2.3, 2.3, 2.3]}
                        radius={0.2}
                        smoothness={4}
                        scale={[1, 1, 1]}
                    >
                        <MeshTransmissionMaterial
                            thickness={materialProps.thickness}
                            roughness={materialProps.roughness}
                            transmission={materialProps.transmission}
                            ior={materialProps.ior}
                            chromaticAberration={materialProps.chromaticAberration}
                            backside={true}
                            color={'#ADD8E6'}
                            metalness={materialProps.metalness}
                            clearcoat={materialProps.clearcoat}
                            envMapIntensity={materialProps.envMapIntensity}
                            reflectivity={materialProps.reflectivity}
                        />
                    </RoundedBox>
                );
        }
    };

    return renderContent();
}



const Scene = ({ scrollTriggerRef, currentShape, scale, materialProps, contentType }: { 
    scrollTriggerRef: React.RefObject<HTMLDivElement | null>, 
    currentShape: ShapeType, 
    scale: number,
    materialProps: MaterialProps,
    contentType: ContentType
}) => {
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
            gsap.set(prismGroupRef.current.scale, { x: 2 * scale, y: 2 * scale, z: 2 * scale });
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
                x: 1 * scale,
                y: 1 * scale,
                z: 1 * scale,
                duration: 1,
                ease: 'power2.out'
            }, 0);
            return () => {
                tl.kill();
                stopIdleRotation();
            };
        }
    }, [scrollTriggerRef, currentShape, scale, materialProps, contentType]);

    const renderShape = () => {
        switch (currentShape) {
            case 'triangle':
                return <TrianglePrism materialProps={materialProps} contentType={contentType} />;
            case 'torus':
                return <TorusShape materialProps={materialProps} contentType={contentType} />;
            case 'roundedBox':
                return <RoundedBoxShape materialProps={materialProps} contentType={contentType} />;
            default:
                return <TrianglePrism materialProps={materialProps} contentType={contentType} />;
        }
    };

    return (
        <>
            <group ref={prismGroupRef}>
                <group ref={prismMeshRef}>
                    {renderShape()}
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
    const currentShape: ShapeType = 'triangle';
    const scale: number = 0.7;
    const contentType: ContentType = 'particles';
    const materialProps: MaterialProps = {
        thickness: 0.22,
        roughness: 0.05,
        transmission: 1.00,
        ior: 1.0,
        chromaticAberration: 5.4,
        metalness: 0.06,
        clearcoat: 0.74,
        envMapIntensity: 0.50,
        reflectivity: 1.00
    };

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
                <Scene scrollTriggerRef={sectionRef} currentShape={currentShape} scale={scale} materialProps={materialProps} contentType={contentType} />
            </Canvas>
        </div>
    );
}

export default Crafting;