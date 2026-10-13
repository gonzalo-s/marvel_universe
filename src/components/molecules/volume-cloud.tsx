'use client';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { BackSide, Color, Mesh, ShaderMaterial, Vector3 } from 'three';
const vertex = `varying vec3 vPosition; void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
// Integrate extinction/scattering inside a bounded ellipsoid, not a billboard.
const fragment = `
varying vec3 vPosition; uniform vec3 eye; uniform vec3 tint; uniform float density; uniform float time; uniform float seed;
float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float field(vec3 p){p=p*3.6+vec3(seed,time*.035,0.);return noise(p)*.57+noise(p*2.03)*.28+noise(p*4.11)*.15;}
void main(){vec3 ray=normalize(vPosition-eye);float b=dot(eye,ray),c=dot(eye,eye)-1.,disc=b*b-c;if(disc<0.)discard;float a=max(0.,-b-sqrt(disc)),end=-b+sqrt(disc);float stepSize=(end-a)/float(STEPS);float transmission=1.;vec3 light=vec3(0.);float jitter=hash(vec3(gl_FragCoord.xy,seed));
for(int i=0;i<STEPS;i++){vec3 p=eye+ray*(a+(float(i)+jitter)*stepSize);float falloff=pow(max(0.,1.-dot(p,p)),1.8);float d=max(0.,field(p)-.28)*falloff*density;float extinction=1.-exp(-d*stepSize*3.);float shadow=exp(-noise(p*3.6+vec3(seed-.18,.28,.15))*density*.65);vec3 scatter=tint*(.22+shadow*.9)+vec3(.16,.22,.32)*pow(max(0.,dot(ray,normalize(vec3(-.4,.5,-1.)))),5.);light+=transmission*extinction*scatter;transmission*=1.-extinction;if(transmission<.02)break;}
gl_FragColor=vec4(light/max(1.-transmission,.001),1.-transmission);}`;
export function VolumeCloud({ position, scale, color = '#6786bc', density = 1, seed = 1, steps = 32, motion = true }: {
 position: [number, number, number]; scale: [number, number, number]; color?: string; density?: number; seed?: number; steps?: number; motion?: boolean;
}) {
 const mesh = useRef<Mesh>(null!);
 const material = useRef<ShaderMaterial>(null!);
 const uniforms = useMemo(() => ({ eye: { value: new Vector3() }, tint: { value: new Color(color) }, density: { value: density }, time: { value: 0 }, seed: { value: seed } }), [color, density, seed]);
 useFrame(({ camera, clock }) => { mesh.current.updateWorldMatrix(true, false); const u = material.current.uniforms; u.eye.value.copy(camera.position); mesh.current.worldToLocal(u.eye.value); u.time.value = motion ? clock.elapsedTime : 0; });
 return <mesh ref={mesh} position={position} scale={scale}>
  <sphereGeometry args={[1, 24, 16]} /><shaderMaterial key={steps} ref={material} defines={{ STEPS: steps }} uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} side={BackSide} transparent depthWrite={false} />
 </mesh>;
}
