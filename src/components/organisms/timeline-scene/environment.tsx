'use client';
import { Environment, Lightformer } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { Color, Group, InstancedMesh, Object3D } from 'three';
import type { ResolvedGraph } from '@/lib/timeline';
import { seeded, type QualityTier } from '@/lib/presentation';
import { noiseTexture, sharedSurfaceTexture } from '@/lib/proceduralTextures';
import { VolumeCloud } from '@/components/molecules/volume-cloud';
import { useSceneSettings } from '@/hooks/scene-settings';

function Layer({ factor, children }: { factor: number; children: ReactNode }) {
 const group=useRef<Group>(null!);
 useFrame(({camera})=>group.current.position.set(camera.position.x*factor,camera.position.y*factor,0));
 return <group ref={group}>{children}</group>;
}
/** One draw call per population, with true sphere/rock geometry at six depth strata. */
function Field({ count, rocks = false }: { count: number; rocks?: boolean }) {
 const mesh=useRef<InstancedMesh>(null!);
 useLayoutEffect(()=>{
  const random=seeded(rocks?71:17), dummy=new Object3D(),color=new Color();
  for(let i=0;i<count;i++){
   const stratum=i%6;
   dummy.position.set((random()-.5)*(rocks?240:950),(random()-.5)*(rocks?150:600),rocks?-12-stratum*22-random()*16:-140-stratum*70-random()*40);
   dummy.rotation.set(random()*6,random()*6,random()*6);
   const radius=rocks?.25+random()*1.7:.09+random()*.24;
   dummy.scale.set(radius,radius*(rocks?.55+random()*.5:1),radius);
   dummy.updateMatrix();mesh.current.setMatrixAt(i,dummy.matrix);
   color.set(rocks?['#667185','#797068','#444b61'][i%3]:['#a5c7ff','#fff0da','#d1d8ff'][i%3]);
   if(!rocks)color.multiplyScalar(1.2+random()*2);
   mesh.current.setColorAt(i,color);
  }
  mesh.current.instanceMatrix.needsUpdate=true;if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
  mesh.current.computeBoundingSphere();
 },[count,rocks]);
 return <instancedMesh ref={mesh} args={[undefined,undefined,count]}>
  {rocks?<icosahedronGeometry args={[1,1]}/>:<sphereGeometry args={[1,6,4]}/>}
  {rocks?<meshStandardMaterial roughness={.91} metalness={.12} bumpMap={sharedSurfaceTexture()} bumpScale={.18}/>:<meshBasicMaterial toneMapped={false} fog={false}/>}
 </instancedMesh>;
}
function Worlds({ count }: { count: number }) {
 const maps=useMemo(()=>Array.from({length:count},(_,i)=>noiseTexture({seed:580+i*23,palette:[['#101421','#48536b','#b6bdc6'],['#101820','#26434e','#829b92'],['#221714','#7a5741','#d3ae78']][i%3],size:256,cells:4,octaves:6,bands:i%2?6:0,contrast:1.5})),[count]);
 useEffect(()=>()=>maps.forEach(map=>map.dispose()),[maps]);
 return <>{maps.map((map,i)=><group key={i} position={[-55+i*62,(i%2?1:-1)*(24+i*3),-75-i*32]} rotation={[.4,i*.8,.45]}>
  <mesh><sphereGeometry args={[9+i*2,64,48]}/><meshPhysicalMaterial map={map} bumpMap={map} bumpScale={.35} roughness={.88} metalness={.04} clearcoat={.12}/></mesh>
  {i%2===0&&<mesh rotation={[1.05,.2,0]}><torusGeometry args={[15+i*2,.32,8,128]}/><meshStandardMaterial color="#94816a" roughness={.85} metalness={.15}/></mesh>}
 </group>)}</>;
}
export function SceneEnvironment({ tier, reducedMotion }: { graph: ResolvedGraph; tier: QualityTier; reducedMotion: boolean }) {
 const settings=useSceneSettings(), high=tier==='high';
 return <>
  <color attach="background" args={['#03060c']}/>
  <ambientLight intensity={.09}/><hemisphereLight args={['#829cc4','#070911',.35]}/>
  <directionalLight position={[-18,28,35]} intensity={3.8*settings.lighting} color="#fff0db"/>
  <directionalLight position={[20,-12,-15]} intensity={1.5*settings.lighting} color="#638ecb"/>
  <Layer factor={.96}><Field count={high?1800:650}/></Layer>
  <Layer factor={.72}><Worlds count={high?4:2}/></Layer>
  <Layer factor={.38}><Field count={high?190:70} rocks/></Layer>
  {settings.fog>0&&<Layer factor={.68}>{Array.from({length:high?4:2},(_,i)=><VolumeCloud key={i} position={[-65+i*38,(i%2?1:-1)*22,-30-i*24]} scale={[48,26,18]} color={['#446699','#715c8c','#427b85'][i%3]} density={settings.fog*(i?1.25:.7)} seed={i*13+1} steps={high?24:12} motion={!reducedMotion}/>)}</Layer>}
  <Environment resolution={128} frames={1}>
   <Lightformer form="rect" intensity={4} color="#e8efff" position={[-8,6,6]} scale={[12,4,1]}/>
   <Lightformer form="rect" intensity={2} color="#749dcb" position={[10,-4,4]} scale={[6,8,1]}/>
   <Lightformer form="rect" intensity={3} color="#ffd5a6" position={[0,10,-6]} scale={[8,3,1]}/>
  </Environment>
 </>;
}
