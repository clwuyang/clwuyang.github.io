import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import type { RigidBody as RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import './Lanyard.css';

type GLTFResult = {
  nodes: {
    card: THREE.Mesh;
    clip: THREE.Mesh;
    clamp: THREE.Mesh;
  };
  materials: {
    base: THREE.MeshStandardMaterial & { map: THREE.Texture };
    metal: THREE.MeshStandardMaterial;
  };
};

function Band({ maxSpeed = 50, minSpeed = 0 }) {
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);
  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isFrontSide, setIsFrontSide] = useState(true);
  const startRotationRef = useRef(0);
  const flipProgressRef = useRef(0);

  const MAX_ANGULAR_VELOCITY = 15;
  const ROTATION_DECAY = 0.995;

  const segmentProps = { 
    type: 'dynamic' as const, 
    colliders: 'hull' as const, 
    angularDamping: 3,
    linearDamping: 4,
    enabledRotations: [false, true, false] as [boolean, boolean, boolean]
  };
  const { nodes, materials } = useGLTF('/models/card.glb') as unknown as GLTFResult;

  useRopeJoint(fixed as any, j1 as any, [[0, 0, 0], [0, 0, 0], 1.2]);
  useRopeJoint(j1 as any, j2 as any, [[0, 0, 0], [0, 0, 0], 1.2]);
  useRopeJoint(j2 as any, j3 as any, [[0, 0, 0], [0, 0, 0], 1.2]);
  useSphericalJoint(j3 as any, card as any, [
    [0, 0, 0],
    [0, 1.45, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useEffect(() => {
    const handleFlip = () => {
      if (!dragged && !isFlipping) {
        setIsFlipping(true);
        setIsFrontSide(!isFrontSide);
        if (card.current) {
          startRotationRef.current = (card.current.rotation() as THREE.Vector3).y;
          flipProgressRef.current = 0;
        }
      }
    };

    document.addEventListener('flip-card', handleFlip);
    return () => document.removeEventListener('flip-card', handleFlip);
  }, [dragged, isFlipping]);

  useFrame((state, delta) => {
    if (dragged && card.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp?.());
      if (dragged instanceof THREE.Vector3) {
        card.current.setNextKinematicTranslation(vec.sub(dragged));
      }
    }
    if (fixed.current && card.current) {
      [j1, j2].forEach((ref) => {
        if (ref.current) {
          const current = ref.current as any;
          if (!current.lerped) {
            current.lerped = new THREE.Vector3();
            current.lerped.copy(current.translation());
          }
          const translation = current.translation();
          const clampedDistance = Math.max(0.1, Math.min(1, current.lerped.distanceTo(translation)));
          current.lerped.lerp(translation, delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
        }
      });
      
      ang.copy(card.current.angvel() as THREE.Vector3);
      rot.copy(card.current.rotation() as THREE.Vector3);
      
      if (isFlipping) {
        flipProgressRef.current += delta * 5;
        const progress = Math.min(flipProgressRef.current, 1);
        
        if (progress >= 1) {
          setIsFlipping(false);
          card.current.setAngvel({ x: 0, y: 0, z: 0 });
          card.current.setRotation({ 
            x: 0, 
            y: startRotationRef.current + Math.PI, 
            z: 0 
          });
        } else {
          const targetRotation = startRotationRef.current + (Math.PI * progress);
          card.current.setRotation({ 
            x: 0, 
            y: targetRotation, 
            z: 0 
          });
        }
      } else {
        card.current.setAngvel({ x: 0, y: 0, z: 0 });
      }
    }
  });

  return (
    <>
      <group position={[0, 3, 0]} rotation={[0, 0, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0, -0.5, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0, -1, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0, -1.5, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody 
          position={[0, -2, 0]} 
          ref={card} 
          {...segmentProps} 
          type={dragged ? 'kinematicPosition' : 'dynamic'}
          enabledRotations={[false, true, false] as [boolean, boolean, boolean]}
          rotation={[0, 0, 0]}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={7}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: any) => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e: any) => {
              e.target.setPointerCapture(e.pointerId);
              if (card.current) {
                drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation() as THREE.Vector3)));
              }
            }}>
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial 
                map={materials.base.map}
                map-anisotropy={16} 
                clearcoat={1} 
                clearcoatRoughness={0.15} 
                roughness={0.9} 
                metalness={0.8} 
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
    </>
  );
}

export function Lanyard({ 
  position = [0, 0, 70] as [number, number, number],
  gravity = [0, -40, 0] as [number, number, number],
  fov = 9,
  transparent = true 
}) {
  return (
    <div className="w-[600px] h-[500px] relative pointer-events-none">
      <div className="absolute inset-0 pointer-events-auto">
        <Canvas
          camera={{ position, fov }}
          gl={{ alpha: transparent }}
          onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
        >
          <ambientLight intensity={Math.PI} />
          <Physics gravity={gravity} timeStep={1 / 60}>
            <Band maxSpeed={40} minSpeed={0} />
          </Physics>
          <Environment blur={0.75}>
            <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          </Environment>
        </Canvas>
      </div>
    </div>
  );
}