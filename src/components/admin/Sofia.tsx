'use client';
/*
 * Place 3D model files in /public/models/:
 *   Teacher_Sofia.glb
 *   animations_Sofia3.glb
 */
import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Group, MathUtils, MeshStandardMaterial, SkinnedMesh } from 'three';

const ANIMATION_FADE_TIME = 0.5;

export function Sofia({ teacher = 'Sofia', ...props }: { teacher?: string; [key: string]: any }) {
  const group = useRef<Group>(null!);
  const { scene } = useGLTF(`/models/Teacher_${teacher}.glb`);

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.material) {
        child.material = new MeshStandardMaterial({ map: child.material.map });
      }
    });
  }, [scene]);

  const { animations } = useGLTF(`/models/animations_${teacher}3.glb`);
  const { actions, mixer } = useAnimations(animations, group);
  const [animation, setAnimation] = useState('Idle');
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); nextBlink(); }, 100);
      }, MathUtils.randInt(1000, 5000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  useEffect(() => { setAnimation('Idle'); }, []);

  useFrame(() => {
    lerpMorphTarget('mouthSmile', 0.2, 0.5);
    lerpMorphTarget('eye_close', blink ? 1 : 0, 0.5);
  });

  useEffect(() => {
    actions[animation]?.reset().fadeIn(mixer.time > 0 ? ANIMATION_FADE_TIME : 0).play();
    return () => { actions[animation]?.fadeOut(ANIMATION_FADE_TIME); };
  }, [animation, actions]);

  const lerpMorphTarget = (target: string, value: number, speed = 0.1) => {
    scene.traverse((child: any) => {
      if (child instanceof SkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (index === undefined || child.morphTargetInfluences?.[index] === undefined) return;
        child.morphTargetInfluences[index] = MathUtils.lerp(child.morphTargetInfluences[index], value, speed);
      }
    });
  };

  return (
    <group {...props} dispose={null} ref={group}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/models/Teacher_Sofia.glb');
useGLTF.preload('/models/animations_Sofia3.glb');
