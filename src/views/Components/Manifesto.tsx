// src/views/Components/Manifesto.tsx
"use client";

import React, { useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Text, MeshTransmissionMaterial, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from '@/views/Components/Manifesto.module.css';

gsap.registerPlugin(ScrollTrigger);

// --- COMPONENTES 3D ---

// Pré-carrega o modelo para otimizar o carregamento
useGLTF.preload('/3d-elements/cone.glb');


const ConeModel = ({ modelRef }: { modelRef: React.RefObject<THREE.Mesh | null> }) => {
    // Carrega os nós do arquivo GLB do cone
    const { nodes } = useGLTF('/3d-elements/cone.glb');

    // Assumimos que o cone é o primeiro e único objeto no arquivo glb.
    // Se o seu objeto tiver um nome específico, substitua 'Scene' pelo nome correto.
    const coneNode = nodes.Scene?.children[0] || nodes.Cone; // Adapte conforme o nome do objeto no seu .glb

    if (!coneNode) {
        console.error("O modelo do cone não foi encontrado no arquivo .glb. Verifique o nome do nó.");
        return null;
    }

    return (
        <mesh ref={modelRef} geometry={(coneNode as THREE.Mesh).geometry}>
            {/* Material de vidro com transmissão, replicando o efeito do exemplo.
              Estes valores podem ser ajustados para obter o visual desejado.
            */}
            <MeshTransmissionMaterial
                thickness={0.2}          // Espessura moderada para refração controlada
                roughness={0}            // Totalmente liso como vidro
                transmission={1}         // Transmissão máxima para transparência total
                ior={1.5}                // Índice de refração como vidro real
                chromaticAberration={0.06} // Dispersão cromática visível mas sutil
                backside={true}          // Renderiza ambos os lados
                color={'#ffffff'}        // Branco para não interferir na cor
                metalness={0}            // Zero metalness para vidro puro
                clearcoat={1.0}          // Clearcoat máximo para brilho
                envMapIntensity={1.0}    // Intensidade ambiente normal
                reflectivity={0.1}       // Refletividade muito baixa
                transparent={true}       // Transparência ativa
                opacity={1.0}            // Opacidade máxima (controlada por transmission)
                attenuationDistance={0.5} // Distância de atenuação
                attenuationColor={'#ffffff'} // Cor de atenuação branca
            />
        </mesh>
    );
};

const GlassScene = () => {
    const modelGroupRef = useRef<THREE.Group>(null);
    const modelMeshRef = useRef<THREE.Mesh>(null);
    const idleTween = useRef<gsap.core.Tween | null>(null);

    useEffect(() => {
        const manifestoSection = document.getElementById('manifesto');
        const footerSection = document.getElementById('Contato');

        if (manifestoSection && footerSection && modelGroupRef.current) {
            const container = document.querySelector(`.${styles.canvasContainer}`);
            if (!container) return;

            gsap.set(container, { opacity: 0, zIndex: -1 });
            gsap.set(modelGroupRef.current.position, { z: -10 });

            if (idleTween.current) idleTween.current.kill();
            // Animação de rotação contínua (idle)
            idleTween.current = gsap.to(modelGroupRef.current.rotation, {
                y: `+=${Math.PI * 2}`,
                x: `+=${Math.PI / 4}`,
                duration: 25,
                repeat: -1,
                ease: 'none',
                yoyo: true,
            });

            // Timeline principal controlada pelo ScrollTrigger
            const masterTl = gsap.timeline({
                scrollTrigger: {
                    trigger: manifestoSection,
                    endTrigger: footerSection,
                    start: 'top center',
                    end: 'bottom bottom',
                    scrub: 1,
                    onToggle: (self) => {
                        if (self.isActive) {
                            idleTween.current?.pause(); // Pausa a animação idle durante o scroll
                        } else {
                            idleTween.current?.play(); // Retoma a animação idle
                        }
                        // Alterna a visibilidade e a sobreposição do canvas
                        gsap.set(container, { zIndex: self.isActive ? 3 : -1, opacity: self.isActive ? 1 : 0 });
                    },
                },
            });

            // Animações do cone durante o scroll
            masterTl.to(modelGroupRef.current.position, { z: 0, duration: 0.1 }, 0);
            masterTl.to(modelGroupRef.current.rotation, { x: Math.PI * 4, y: Math.PI * 6, z: Math.PI * 2, ease: 'none', duration: 0.8 }, 0.1);
            masterTl.to(modelGroupRef.current.position, { z: 10, duration: 0.1 }, 0.9);

            return () => {
                masterTl.kill();
                idleTween.current?.kill();
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            };
        }
    }, []);

    return (
        <>
            <group ref={modelGroupRef}>
                {/* Suspense é usado para mostrar um fallback enquanto o modelo 3D está sendo carregado,
                   evitando erros.
                 */}
                <Suspense fallback={null}>
                    <ConeModel modelRef={modelMeshRef} />
                </Suspense>
            </group>

            {/* Luzes otimizadas para efeito de vidro cristalino */}
            <ambientLight intensity={0.4} color="#ffffff" />
            <directionalLight
                position={[10, 10, 5]}
                intensity={1.0}
                color="#ffffff"
                castShadow
            />
            <pointLight position={[-5, 5, 5]} intensity={0.8} distance={100} color="#ffffff" />
            <pointLight position={[5, -3, 3]} intensity={0.6} distance={100} color="#ffffff" />
        </>
    );
};

// --- COMPONENTE PRINCIPAL (MANIFESTO) ---

function Manifesto() {
    const manifestoContentText = [
        "Para os que chamam de teimosos. Os que persistem mesmo quando a lógica os desafia, e encontram coragem onde muitos veem barreiras.",
        "Que enxergam na base digital o primeiro tijolo para algo maior, e seguem firmes, construindo cada camada com propósito e precisão, guiados por uma visão que só se revela com o tempo.",
        "Porque grandes conquistas não se erguem com pressa - elas crescem com insistência, se consolidam na constância e florescem na evolução contínua.",
        "Para quem entende que maturidade digital não é aparência, é estrutura. É ter alicerces sólidos antes de erguer sonhos grandiosos.",
    ];

    return (
        <section className={styles.ManifestoSection} id="manifesto">
            <div className={styles.canvasContainer}>
                <Canvas
                    camera={{ position: [0, 0, 4], fov: 75 }}
                    gl={{
                        antialias: true,
                        alpha: true,
                        outputColorSpace: THREE.SRGBColorSpace,
                        toneMapping: THREE.ACESFilmicToneMapping,
                        toneMappingExposure: 1.2
                    }}
                    onCreated={({ gl }) => {
                        gl.setClearAlpha(0); // Fundo transparente
                    }}
                >
                    <GlassScene />
                </Canvas>
            </div>

            <div className={styles.ManifestoWrapper}>
                <div className={styles.ManifestoContent}>
                    {manifestoContentText.map((line, index) => (
                        <p key={index} className={styles.ManifestoContentSpan}>
                            {line}
                        </p>
                    ))}
                </div>
                <div className={styles.CraftingMotto}>
                    <p>
                        Crafting long
                        <span className={styles.CraftingMottoLine}></span>
                        lasting experiences
                    </p>
                </div>
            </div>
        </section>
    );
}

export default Manifesto;