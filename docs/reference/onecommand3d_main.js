import * as THREE from 'three';
import {TTFLoader} from 'three/addons/loaders/TTFLoader.js';
import {Font} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),seg=(t,a,b)=>cl((t-a)/(b-a)),lerp=(a,b,x)=>a+(b-a)*x;
const eo=x=>1-Math.pow(1-x,3),eo5=x=>1-Math.pow(1-x,5),eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,ss=x=>x*x*(3-2*x);
const eback=x=>{const c1=1.7,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
const spring=x=>x<=0?0:x>=1?1:1-Math.exp(-6*x)*Math.cos(10*x);
let _s=11;const rnd=()=>{_s|=0;_s=_s+0x6D2B79F5|0;let t=Math.imul(_s^_s>>>15,1|_s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const GOLD='#F2B544',GOLD2='#FFD27A';
// ---------- renderer ----------
const R=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});R.setPixelRatio(1);R.setSize(1280,720);
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;R.outputColorSpace=THREE.SRGBColorSpace;
document.body.prepend(R.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#05070C');scene.fog=new THREE.FogExp2('#05070C',.02);
const pm=new THREE.PMREMGenerator(R);scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.55;
const cam=new THREE.PerspectiveCamera(40,1280/720,.1,500);
const hemi=new THREE.HemisphereLight('#c9d4ff','#1a1208',.5);scene.add(hemi);
const key=new THREE.DirectionalLight('#fff1dc',1.6);key.position.set(-6,10,8);scene.add(key);scene.add(key.target);
// ---------- loaders ----------
const TL=new THREE.TextureLoader();
const tex=u=>new Promise(r=>TL.load(u,t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=R.capabilities.getMaxAnisotropy();r(t)}));
const font=await new Promise(r=>new TTFLoader().load('fonts/SG-700.ttf',j=>r(new Font(j))));
await Promise.all(['700 40px SG','600 40px SG','400 20px MO','700 20px MO','600 20px VZ','900 20px VZ','400 20px IN','500 20px IN'].map(f=>document.fonts.load(f)));
const [tP0,tP1,tP2,tC4,tA0,tA1,tA2,tP3,tYK,tSQ]=await Promise.all(['tex/page0.png','tex/page1.png','tex/page2.png','tex/comp4.png','../legacy_portfolio.png','../legacy_gym_thumb.png','../legacy_brewery.png','tex/page3.png','tex/yadaki.png','tex/sandoq.png'].map(tex));
const pImg=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='../saeed_cutout_clean.png'});
const thumbs=await Promise.all(['tex/page2.png','tex/page1.png','tex/page0.png','tex/page3.png','tex/yadaki.png'].map(u=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=u})));
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;t.userData={c,x};return t}
const basic=(map,o={})=>new THREE.MeshBasicMaterial(Object.assign({map,toneMapped:false,fog:false},o));
const plane=(w,h,mat)=>new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);
const add=(c,o={})=>new THREE.MeshBasicMaterial(Object.assign({color:c,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,fog:false},o));
function rr(x,X,Y,W,H,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()}
const radialTex=(c,soft=1)=>canvasTex(256,256,(x)=>{const g=x.createRadialGradient(128,128,0,128,128,128);g.addColorStop(0,c);g.addColorStop(.35*soft,c+'88');g.addColorStop(1,c+'00');x.fillStyle=g;x.fillRect(0,0,256,256)});
function text3d(str,size,depth,mat){const g=new TextGeometry(str,{font,size,depth,curveSegments:10,bevelEnabled:true,bevelThickness:depth*.14,bevelSize:size*.016,bevelSegments:4});g.computeBoundingBox();const b=g.boundingBox;g.translate(-b.min.x,0,-depth/2);const m=new THREE.Mesh(g,mat);m.userData.w=b.max.x-b.min.x;m.userData.h=b.max.y;return m}
// ---------- materials ----------
const mChrome=new THREE.MeshPhysicalMaterial({color:'#F2F3F7',metalness:1,roughness:.16,clearcoat:1,clearcoatRoughness:.1,envMapIntensity:2.2});
const mGoldM=new THREE.MeshPhysicalMaterial({color:'#FFC24D',metalness:1,roughness:.2,clearcoat:.8,emissive:'#B86A00',emissiveIntensity:.55,envMapIntensity:2.0});
const mObsid=new THREE.MeshPhysicalMaterial({color:'#0C0E14',metalness:.55,roughness:.22,clearcoat:1,clearcoatRoughness:.06});
const mBrushed=new THREE.MeshPhysicalMaterial({color:'#B4B8C2',metalness:1,roughness:.3,anisotropy:.75,clearcoat:.3,clearcoatRoughness:.2});const mSeam=new THREE.MeshStandardMaterial({color:'#020203',roughness:.7,metalness:.2});
const mCore=new THREE.MeshStandardMaterial({color:'#FFD27A',emissive:'#FFB020',emissiveIntensity:3,roughness:.3,flatShading:true});
const mGem=new THREE.MeshPhysicalMaterial({color:'#FFB347',roughness:.08,metalness:.1,transmission:.5,thickness:.8,ior:1.54,clearcoat:1,emissive:'#E07800',emissiveIntensity:.35,flatShading:true});
// ---------- global atmosphere: stars + nebula billboards ----------
const stars=new THREE.Points((()=>{const g=new THREE.BufferGeometry();const n=2600,p=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=rnd()*220-60;p[i*3+1]=rnd()*70-20;p[i*3+2]=-rnd()*230+30}g.setAttribute('position',new THREE.BufferAttribute(p,3));return g})(),new THREE.PointsMaterial({color:'#cfd8ff',size:.06,transparent:true,opacity:.55,depthWrite:false,fog:false}));scene.add(stars);
const nebs=[];function nebula(pos,c,s,o){const m=plane(s,s,add('#ffffff',{map:radialTex(c),opacity:o}));m.position.copy(pos);scene.add(m);nebs.push(m);return m}
const dotFloor=(w,h,col='#0A0D14')=>{const t=canvasTex(256,256,(x)=>{x.fillStyle=col;x.fillRect(0,0,256,256);x.fillStyle='rgba(255,255,255,.16)';for(let i=0;i<8;i++)for(let j=0;j<8;j++){x.beginPath();x.arc(16+i*32,16+j*32,1.6,0,7);x.fill()}});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w/1.2,h/1.2);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,color:'#383838',roughness:.5,metalness:.35,envMapIntensity:.1}));m.rotation.x=-Math.PI/2;return m};
// ---------- portrait (faces untouched; only torso bottom fades) ----------
const CW=1200,CHh=1700,cAsp=CW/CHh;
function archPath(x,W,H,inset=0){const r=W/2-inset;x.beginPath();x.moveTo(inset,H-inset-40);x.lineTo(inset,r+inset);x.arc(W/2,r+inset,r,Math.PI,0);x.lineTo(W-inset,H-inset-40);x.quadraticCurveTo(W-inset,H-inset,W-inset-40,H-inset);x.lineTo(inset+40,H-inset);x.quadraticCurveTo(inset,H-inset,inset,H-inset-40);x.closePath()}
const PS=.857,PX=(CW-1080*PS)/2,PY=190;
const portTex=canvasTex(CW,CHh,(x,W,H)=>{x.save();archPath(x,W,H);x.clip();
 const g=x.createRadialGradient(W/2,H*.42,40,W/2,H*.48,H*.75);g.addColorStop(0,'#2A2118');g.addColorStop(.45,'#14110E');g.addColorStop(1,'#06070B');x.fillStyle=g;x.fillRect(0,0,W,H);
 // soft studio light spill behind head
 const g2=x.createRadialGradient(W/2,H*.36,0,W/2,H*.36,W*.55);g2.addColorStop(0,'rgba(245,158,11,.22)');g2.addColorStop(1,'rgba(245,158,11,0)');x.fillStyle=g2;x.fillRect(0,0,W,H);
 // amber backlight silhouette (behind subject only)
 const sc=document.createElement('canvas');sc.width=W;sc.height=H;const y=sc.getContext('2d');y.filter='blur(22px)';y.drawImage(pImg,PX-8,PY-10,1080*PS+16,2003*PS+16);y.filter='none';y.globalCompositeOperation='source-in';y.fillStyle='rgba(255,170,60,.6)';y.fillRect(0,0,W,H);x.drawImage(sc,0,0);
 // subject — uniform scale only, pixels untouched
 x.drawImage(pImg,PX,PY,1080*PS,2003*PS);
 // edge vignette (outside face zone) + chest fade into obsidian
 const v=x.createRadialGradient(W/2,H*.47,H*.3,W/2,H*.5,H*.72);v.addColorStop(0,'rgba(6,7,11,0)');v.addColorStop(1,'rgba(6,7,11,.85)');x.fillStyle=v;x.fillRect(0,0,W,H);
 const b=x.createLinearGradient(0,H*.78,0,H);b.addColorStop(0,'rgba(6,7,11,0)');b.addColorStop(1,'rgba(6,7,11,.95)');x.fillStyle=b;x.fillRect(0,H*.78,W,H*.22);
 // glass reflection, lower-left only (never over the face)
 x.save();x.beginPath();x.rect(0,H*.74,W,H*.26);x.clip();const r=x.createLinearGradient(0,H*.74,W*.6,H);r.addColorStop(0,'rgba(255,255,255,0)');r.addColorStop(.5,'rgba(255,255,255,.07)');r.addColorStop(.56,'rgba(255,255,255,0)');x.fillStyle=r;x.fillRect(0,0,W,H);x.restore();
 x.restore();
 // hairline gold border + inner fine line
 x.lineWidth=5;x.strokeStyle='rgba(255,200,110,.95)';archPath(x,W,H,3);x.stroke();x.lineWidth=1.5;x.strokeStyle='rgba(255,210,122,.35)';archPath(x,W,H,22);x.stroke();
 // caption plate
 x.fillStyle='rgba(242,181,68,.9)';x.font='700 30px MO';x.textAlign='center';x.fillText('SAEED MAHJOBI · FOUNDER & CEO',W/2,H-58)});
function archShape(w,h){const S=new THREE.Shape(),r=w/2,c=.12;S.moveTo(-w/2,-h/2+c);S.lineTo(-w/2,h/2-r);S.absarc(0,h/2-r,r,Math.PI,0,true);S.lineTo(w/2,-h/2+c);S.quadraticCurveTo(w/2,-h/2,w/2-c,-h/2);S.lineTo(-w/2+c,-h/2);S.quadraticCurveTo(-w/2,-h/2,-w/2,-h/2+c);return S}
function makePortrait(h){const w=h*cAsp;const g=new THREE.Group();
 const halo=plane(h*1.5,h*1.5,add('#ffffff',{map:radialTex('#F59E0B'),opacity:.45}));halo.position.set(0,h*.1,-1.0);g.add(halo);
 const bodyM=new THREE.MeshPhysicalMaterial({color:'#0A0C12',metalness:.6,roughness:.2,clearcoat:1,clearcoatRoughness:.08,transparent:true});
 const body=new THREE.Mesh(new THREE.ExtrudeGeometry(archShape(w+.28,h+.28),{depth:.34,bevelEnabled:true,bevelThickness:.06,bevelSize:.05,bevelSegments:4,curveSegments:48}),bodyM);body.position.z=-.42;g.add(body);
 const rim=new THREE.Mesh(new THREE.ShapeGeometry(archShape(w+.4,h+.4),48),add(GOLD,{opacity:.55}));rim.position.z=-.46;g.add(rim);
 const p=plane(w,h,basic(portTex,{transparent:true,alphaTest:.01}));p.position.z=.0;g.add(p);
 const base=new THREE.Mesh(new RoundedBoxGeometry(w+.9,.22,1.3,3,.05),bodyM);base.position.set(0,-h/2-.27,-.2);g.add(base);
 const be=new THREE.Mesh(new THREE.BoxGeometry(w+.8,.015,.015),add(GOLD,{opacity:.9}));be.position.set(0,-h/2-.16,.45);g.add(be);
 g.userData={halo,rim,p,body,bodyM};return g}
// ================= ACT 1 =================
const W1=new THREE.Group();scene.add(W1);
const fl1=dotFloor(60,40);fl1.position.set(0,-3.6,-4);W1.add(fl1);
const SA=text3d('SAEED',2.2,.55,mChrome),MA=text3d('MAHJOBI',2.2,.55,mGoldM);
const tw=7.3;const s1=tw/MA.userData.w;[SA,MA].forEach(m=>m.scale.setScalar(s1));
SA.position.set(-6.9,1.35,-.4);MA.position.set(-6.9,-.7,-.4);W1.add(SA,MA);
const P1=makePortrait(6.1);P1.position.set(3.75,-.15,0);P1.rotation.y=-.1;W1.add(P1);
const story=new THREE.Group();story.position.set(.3,2.35,1.6);scene.add(story);
const gem=new THREE.Mesh(new THREE.IcosahedronGeometry(.5,0),mGem);story.add(gem);const gcore=new THREE.Mesh(new THREE.OctahedronGeometry(.2,0),mCore);story.add(gcore);
const gring=new THREE.Mesh(new THREE.TorusGeometry(.8,.012,6,96),add(GOLD2,{opacity:.8}));story.add(gring);const gring2=gring.clone();gring2.scale.setScalar(1.2);story.add(gring2);
const gglow=plane(3.2,3.2,add('#ffffff',{map:radialTex('#F59E0B'),opacity:.6}));story.add(gglow);
const gl=new THREE.PointLight('#FFB347',14,8,2);story.add(gl);
nebula(V3(-6,4,-18),'#F59E0B',30,.22);nebula(V3(10,-2,-22),'#38BDF8',34,.12);
// beam trace Act1 → Act2
const trace=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1,8),add(GOLD2,{opacity:.9}));scene.add(trace);
// ================= ACT 2 =================
const C2=V3(1,0,-46);const W2=new THREE.Group();W2.position.copy(C2);scene.add(W2);
const fl2=dotFloor(140,140,'#070B13');fl2.position.y=-2.6;W2.add(fl2);
nebula(C2.clone().add(V3(-14,6,-20)),'#38BDF8',44,.2);nebula(C2.clone().add(V3(16,2,-14)),'#F59E0B',36,.14);nebula(C2.clone().add(V3(0,-2,18)),'#10B981',40,.1);
const carousel=new THREE.Group();W2.add(carousel);
const mMono=new THREE.MeshPhysicalMaterial({color:'#0E1220',metalness:.5,roughness:.12,clearcoat:1,transparent:true,opacity:.9});
for(let i=0;i<10;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(.5,7.6,.1),mMono);const a=i/10*Math.PI*2;s.position.set(Math.sin(a)*1.5,1.2,Math.cos(a)*1.5);s.rotation.y=a;carousel.add(s);const e=new THREE.Mesh(new THREE.BoxGeometry(.02,7.6,.02),add(i%2?'#38BDF8':GOLD,{opacity:.7}));e.position.set(Math.sin(a)*1.56+.25*Math.cos(a),1.2,Math.cos(a)*1.56-.25*Math.sin(a));carousel.add(e)}
const col=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,7.6,16),mCore);col.position.y=1.2;carousel.add(col);
const pl2=new THREE.PointLight('#FFB347',36,20,2);pl2.position.y=1.2;W2.add(pl2);const pl2b=new THREE.PointLight('#38BDF8',26,30,2);pl2b.position.set(-7,5,7);W2.add(pl2b);
const atR=(th,r,y)=>V3(Math.sin(th)*r,y,Math.cos(th)*r);const tanv=th=>V3(Math.cos(th),0,-Math.sin(th));const nrm=th=>V3(Math.sin(th),0,Math.cos(th));
function yearM(s,mat,sz=1.5){const m=text3d(s,sz,.4,mat);m.geometry.translate(-m.userData.w/2,0,0);return m}
const Y16=yearM('2016',mChrome,1.7);Y16.position.copy(atR(0,4.0,.2));W2.add(Y16);
const code16=new THREE.Group();{const t=canvasTex(1024,512,(x,W,H)=>{x.fillStyle='#0A0D15';rr(x,0,0,W,H,28);x.fill();x.strokeStyle='rgba(242,181,68,.8)';x.lineWidth=3;rr(x,2,2,W-4,H-4,26);x.stroke();x.font='700 26px MO';x.fillStyle=GOLD;x.fillText('INDEX.HTML · 2016 · FIRST LINES',40,62);x.font='32px MO';['<!DOCTYPE html>','<html>','  <head><title>Hello</title></head>','  <body>','    <h1>Hello, world.</h1>','  </body>','</html>'].forEach((l,i)=>{x.fillStyle=i==4?'#FFFFFF':'#8C93A3';x.fillText(l,44,124+i*50)})});
 const f=plane(3.2,1.6,basic(t,{transparent:true}));code16.add(f)}code16.position.copy(atR(0,5.0,-1.35));W2.add(code16);
const Y20=yearM('2020',mChrome,1.1);Y20.position.copy(atR(1,3.6,2.35));Y20.rotation.y=1;W2.add(Y20);
const Y26=yearM('2026',mGoldM,1.2);Y26.position.copy(atR(2,3.4,2.75));Y26.rotation.y=2;W2.add(Y26);
function glassLabel(a,b,w=1024,h=170){return canvasTex(w,h,(x,W,H)=>{x.fillStyle='rgba(12,15,24,.92)';rr(x,0,0,W,H,24);x.fill();x.strokeStyle='rgba(255,255,255,.22)';x.lineWidth=2;rr(x,1,1,W-2,H-2,23);x.stroke();x.fillStyle='#fff';x.font=`700 ${H*.32|0}px SG`;x.fillText(a,32,H*.45);x.fillStyle=GOLD;x.font=`700 ${H*.18|0}px MO`;x.fillText(b,32,H*.78)})}
const arch=[[tA0,'PSM Web Developer'],[tA1,'Fitness Point'],[tA2,'Brewery']].map(([t,l])=>{const g=new THREE.Group();const b=new THREE.Mesh(new RoundedBoxGeometry(3.4,2.2,.14,3,.05),mObsid);g.add(b);const edge=new THREE.Mesh(new RoundedBoxGeometry(3.46,2.26,.08,3,.05),add('#38BDF8',{opacity:.55}));edge.position.z=-.04;g.add(edge);
 const img=plane(3.24,2.04,basic(t));img.position.z=.08;g.add(img);const lb=plane(2.5,.415,basic(glassLabel(l,'2020 · BOOTSTRAP 4 · SCSS · JQUERY'),{transparent:true}));lb.position.set(-.4,-1.3,.12);g.add(lb);W2.add(g);return g});
const AP=[[-3.05,.35,0,.18],[0,.25,.55,0],[3.05,.35,0,-.18]];
const monoTex=(a,b)=>canvasTex(512,1366,(x,W,H)=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#141A2A');g.addColorStop(1,'#080B12');x.fillStyle=g;rr(x,0,0,W,H,30);x.fill();x.strokeStyle=GOLD;x.lineWidth=4;rr(x,3,3,W-6,H-6,28);x.stroke();x.fillStyle=GOLD;x.font='700 28px MO';x.fillText('2026 · AI-NATIVE',36,76);x.fillStyle='#fff';x.font='700 92px SG';a.split('|').forEach((q,i)=>x.fillText(q,34,250+i*104));x.fillStyle='#8C93A3';x.font='400 28px MO';x.fillText(b,36,560);for(let i=0;i<12;i++){x.fillStyle=`rgba(${i%3?'242,181,68':'61,220,151'},${.18+.06*(i%3)})`;rr(x,36,660+i*52,(W-72)*(.35+.6*((i*37)%10)/10),18,9);x.fill()}x.fillStyle='#3DDC97';x.font='700 26px MO';x.fillText('● PASSING',36,H-56)});
const monos=[['Next.js|15','React 19 · TypeScript'],['NestJS|10','Prisma 6 · PostgreSQL'],['~50K LOC|Python','plugin architecture'],['886|CI tests','all green']].map(([a,b])=>{const g=new THREE.Group();const bx=new THREE.Mesh(new RoundedBoxGeometry(1.5,4,.3,3,.06),mObsid);g.add(bx);const f=plane(1.42,3.79,basic(monoTex(a,b)));f.position.z=.16;g.add(f);W2.add(g);return g});
const MP=[-2.55,-.85,.85,2.55];
// ================= ACT 3 =================
const STW=[0,1,2,3,4,5].map(k=>[10.15+k*1.2648,10.15+k*1.2648+1.0736]);
const S0=V3(24,0,-70),SD=V3(16,0,-5);const S=k=>S0.clone().add(SD.clone().multiplyScalar(k));
const W3=new THREE.Group();scene.add(W3);
const fl3=dotFloor(420,220,'#06080D');fl3.position.set(S(2.5).x,-3.3,S(2.5).z);W3.add(fl3);
const ACC=['#F59E0B','#38BDF8','#10B981','#F472B6','#60A5FA','#2DD4BF'],STX=[tP0,tP2,tP1,tP3,tYK,tSQ];
const CHIPS=[[['400K+','BUSINESSES MAPPED'],['MIARA AI','LIVE CHAT ASSISTANT'],['13 · 5','CATEGORIES · ONLINE SERVICES']],[['201','PULL REQUESTS'],['v0.2.0','VEHICLE-FITMENT SEARCH']],[['886 / 886','CI TESTS PASSING'],['LIVE: OFF','DISARMED BY DEFAULT'],['~50K LOC','PYTHON · PLUGINS']],[['1,450+','ACETATE MOLD DESIGNS'],['RESIN','& CANDLE SUPPLIES']],[['v0.7.0','FASTAPI + POSTGRESQL'],['80','PULL REQUESTS'],['WIN · ANDROID','ONE SHARED BACKEND']],[['OFFLINE','FIRST BARCODE POS'],['PWA','ZXING-WASM · INDEXEDDB']]];
const chipTex=(a,b,c)=>canvasTex(720,200,(x,W,H)=>{x.fillStyle='rgba(10,13,21,.94)';rr(x,4,4,W-8,H-8,30);x.fill();x.strokeStyle=c;x.lineWidth=3;rr(x,4,4,W-8,H-8,30);x.stroke();x.fillStyle=c;x.beginPath();x.arc(46,H/2,10,0,7);x.fill();x.fillStyle='#fff';let fs=74;x.font=`700 ${fs}px SG`;while(x.measureText(a).width>W-120&&fs>40){fs-=4;x.font=`700 ${fs}px SG`}x.fillText(a,78,112);x.fillStyle='#A9B0BE';x.font='700 24px MO';x.fillText(b,80,160)});
const stages=STX.map((t,k)=>{const g=new THREE.Group();g.position.copy(S(k));W3.add(g);
 nebula(S(k).clone().add(V3(1,1.5,-9)),ACC[k],26,.0).userData.stage=k;
 const halo=plane(18,11,add('#ffffff',{map:radialTex(ACC[k]),opacity:0}));halo.position.set(0,.3,-1.6);g.add(halo);
 const body=new THREE.Mesh(new RoundedBoxGeometry(8.1,5.2,.34,4,.12),mObsid);g.add(body);
 const edge=new THREE.Mesh(new RoundedBoxGeometry(8.22,5.32,.1,4,.14),add(ACC[k],{opacity:.8}));edge.position.z=-.08;g.add(edge);
 const bez=plane(7.74,4.86,new THREE.MeshBasicMaterial({color:'#000',toneMapped:false,fog:false}));bez.position.z=.18;g.add(bez);
 const tt=t.clone();tt.needsUpdate=true;tt.repeat.set(1,(1600/1.6)/3600);
 const scr=plane(7.62,4.76,basic(tt));scr.position.z=.19;g.add(scr);
 const sheen=plane(7.62,4.76,add('#ffffff',{map:canvasTex(512,256,(x,W,H)=>{const q=x.createLinearGradient(0,0,W,H);q.addColorStop(0,'rgba(255,255,255,0)');q.addColorStop(.45,'rgba(255,255,255,0)');q.addColorStop(.5,'rgba(255,255,255,.12)');q.addColorStop(.55,'rgba(255,255,255,0)');x.fillStyle=q;x.fillRect(0,0,W,H)}),opacity:.8}));sheen.position.z=.2;g.add(sheen);
 const refl=plane(7.62,4.76,basic(tt,{transparent:true,opacity:.1}));refl.scale.y=-1;refl.rotation.x=0;refl.position.set(0,-5.6,.19);g.add(refl);
 const chips=CHIPS[k].map((c,j)=>{const m=plane(2.7,.75,basic(chipTex(c[0],c[1],ACC[k]),{transparent:true}));g.add(m);return m});
 const sp=new THREE.PointLight(ACC[k],0,18,2);sp.position.set(0,3,4);g.add(sp);
 return {g,tt,halo,chips,sp,sheen}});
// guide storyteller re-used across acts
// ================= ACT 4 =================
const A=S(5).clone().add(V3(14,0,-26));const W4=new THREE.Group();W4.position.copy(A);scene.add(W4);
const fl4=dotFloor(80,80,'#07090E');fl4.position.y=-2.2;W4.add(fl4);
nebula(A.clone().add(V3(-9,4,-14)),'#F59E0B',34,.22);nebula(A.clone().add(V3(10,3,-12)),'#10B981',30,.16);nebula(A.clone().add(V3(0,8,-20)),'#38BDF8',40,.08);
const k4=new THREE.DirectionalLight('#fff3e0',2.2);k4.position.copy(A).add(V3(-3,7,9));k4.target.position.copy(A);scene.add(k4,k4.target);
const rimL=new THREE.DirectionalLight('#FFB547',2.4);rimL.position.copy(A).add(V3(4,5,-8));rimL.target.position.copy(A);scene.add(rimL,rimL.target);
const rimL2=new THREE.DirectionalLight('#38BDF8',1.4);rimL2.position.copy(A).add(V3(-6,3,-6));rimL2.target.position.copy(A);scene.add(rimL2,rimL2.target);
const ROLES=[['FRONTEND','#38BDF8','frame'],['BACKEND','#10B981','server'],['EXECUTIVE MANAGER','#F59E0B','halo'],['UI/UX','#A78BFA','prism'],['VIDEO','#FB923C','lens']];
function makeBot(color,prop){const c=new THREE.Color(color);const G=new THREE.Group();const B=new THREE.Group();G.add(B);
 const acc=new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:1.6,roughness:.3});
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.27,.26,8,24),mObsid);torso.scale.set(1.12,1,.86);B.add(torso);
 const chest=new THREE.Mesh(new THREE.CircleGeometry(.075,32),acc);chest.position.set(0,.06,.236);B.add(chest);
 const chestR=new THREE.Mesh(new THREE.TorusGeometry(.105,.015,8,32),mBrushed);chestR.position.copy(chest.position);B.add(chestR);
 const belt=new THREE.Mesh(new THREE.TorusGeometry(.27,.03,10,40),mBrushed);belt.rotation.x=Math.PI/2;belt.scale.set(1.12,.86,1);belt.position.y=-.15;B.add(belt);
 for(const yy of [.13,-.03]){const sm=new THREE.Mesh(new THREE.TorusGeometry(.27,.006,6,48),mSeam);sm.rotation.x=Math.PI/2;sm.scale.set(1.13,.87,1);sm.position.y=yy;B.add(sm)}
 const vs=new THREE.Mesh(new THREE.BoxGeometry(.006,.3,.02),mSeam);vs.position.set(0,-.02,.236);B.add(vs);
 const leds=[];for(let q=0;q<3;q++){const l=new THREE.Mesh(new THREE.SphereGeometry(.014,10,8),new THREE.MeshBasicMaterial({color:q==1?'#3DDC97':c,toneMapped:false}));l.position.set(-.1+q*.1,-.09,.228);B.add(l);leds.push(l)}
 const bp=new THREE.Mesh(new RoundedBoxGeometry(.3,.26,.06,2,.02),mBrushed);bp.position.set(0,.04,-.22);B.add(bp);
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.12,16),mBrushed);neck.position.y=.43;B.add(neck);
 const H=new THREE.Group();H.position.y=.76;B.add(H);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.36,40,28),mBrushed);head.scale.set(1.14,.96,1);H.add(head);
 const shell=new THREE.Mesh(new THREE.SphereGeometry(.365,40,28,0,Math.PI*2,0,1.05),mObsid);shell.scale.set(1.14,.96,1);H.add(shell);
 const visor=new THREE.Mesh(new THREE.SphereGeometry(.372,48,24,Math.PI/2-1.02,2.04,Math.PI/2-.5,1.0),new THREE.MeshPhysicalMaterial({color:'#05060A',metalness:.3,roughness:.04,clearcoat:1,clearcoatRoughness:.02,iridescence:.45,iridescenceIOR:1.4,emissive:c,emissiveIntensity:.18,envMapIntensity:1.6}));visor.scale.set(1.14,.96,1);H.add(visor);
 const vrim=new THREE.Mesh(new THREE.TorusGeometry(.3,.012,8,48,Math.PI*1.0),acc);vrim.rotation.set(0,0,Math.PI);vrim.position.set(0,.02,.0);vrim.scale.set(1.38,.62,1);vrim.position.z=.2;
 const eyes=[],happy=[];for(const sx of[-1,1]){const e=new THREE.Mesh(new THREE.CapsuleGeometry(.04,.07,6,16),new THREE.MeshBasicMaterial({color:c.clone().lerp(new THREE.Color('#fff'),.35),toneMapped:false}));e.position.set(sx*.13,.01,.385);e.rotation.x=-.05;H.add(e);eyes.push(e);
  const hp=new THREE.Mesh(new THREE.TorusGeometry(.06,.016,8,20,Math.PI),e.material);hp.position.set(sx*.13,-.01,.385);hp.visible=false;H.add(hp);happy.push(hp)}
 const eg=plane(.7,.32,add('#ffffff',{map:radialTex(color),opacity:.35}));eg.position.set(0,0,.39);H.add(eg);
 for(const sx of[-1,1]){const ear=new THREE.Mesh(new THREE.CylinderGeometry(.095,.095,.08,24),mObsid);ear.rotation.z=Math.PI/2;ear.position.set(sx*.41,0,0);H.add(ear);const er=new THREE.Mesh(new THREE.TorusGeometry(.07,.014,8,24),acc);er.rotation.y=Math.PI/2;er.position.set(sx*.452,0,0);H.add(er)}
 const ant=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.16,8),mBrushed);ant.position.set(.12,.4,0);H.add(ant);const antB=new THREE.Mesh(new THREE.SphereGeometry(.035,16,12),acc);antB.position.set(.12,.49,0);H.add(antB);
 const arms=[];for(const sx of[-1,1]){const sh=new THREE.Group();sh.position.set(sx*.36,.22,0);B.add(sh);const j=new THREE.Mesh(new THREE.SphereGeometry(.075,20,16),mBrushed);sh.add(j);
  const up=new THREE.Mesh(new THREE.CapsuleGeometry(.062,.2,6,16),mObsid);up.position.y=-.17;sh.add(up);const hand=new THREE.Mesh(new THREE.SphereGeometry(.085,20,16),mBrushed);hand.position.y=-.36;sh.add(hand);
  const palm=new THREE.Mesh(new THREE.SphereGeometry(.04,12,10),acc);palm.position.y=-.43;sh.add(palm);const wr=new THREE.Mesh(new THREE.TorusGeometry(.068,.014,8,28),mBrushed);wr.rotation.x=Math.PI/2;wr.position.y=-.29;sh.add(wr);const sc=new THREE.Mesh(new THREE.SphereGeometry(.095,20,14,0,Math.PI*2,0,Math.PI/2),mObsid);sc.position.y=.01;sh.add(sc);sh.userData={hand,sx};arms.push(sh)}
 const thr=[];for(const sx of[-1,1]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.075,.1,6,16),mBrushed);leg.position.set(sx*.13,-.5,0);B.add(leg);const boot=new THREE.Mesh(new THREE.CylinderGeometry(.07,.095,.07,20),mObsid);boot.position.set(sx*.13,-.62,0);B.add(boot);
  const fl=new THREE.Mesh(new THREE.ConeGeometry(.08,.42,16,1,true),add(color,{opacity:.7,side:THREE.DoubleSide}));fl.rotation.x=Math.PI;fl.position.set(sx*.13,-.86,0);B.add(fl);thr.push(fl)}
 // prop
 const P=new THREE.Group();P.position.set(.62,.95,0);B.add(P);
 if(prop==='halo'){const h=new THREE.Mesh(new THREE.TorusGeometry(.3,.035,12,60),new THREE.MeshStandardMaterial({color:GOLD2,emissive:'#F59E0B',emissiveIntensity:2.2,metalness:.6,roughness:.2}));h.rotation.x=Math.PI/2.3;P.position.set(0,1.32,0);P.add(h)}
 if(prop==='server'){const b=new THREE.Mesh(new RoundedBoxGeometry(.3,.3,.3,3,.04),mObsid);P.add(b);for(let i=0;i<3;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(.2,.025,.01),acc);s.position.set(0,-.08+i*.08,.152);P.add(s)}}
 if(prop==='frame'){const f=new THREE.Mesh(new RoundedBoxGeometry(.42,.3,.03,2,.02),mObsid);P.add(f);const s=plane(.36,.24,new THREE.MeshBasicMaterial({map:canvasTex(256,170,(x,W,H)=>{x.fillStyle='#0b1622';x.fillRect(0,0,W,H);x.fillStyle='#38BDF8';x.fillRect(16,16,90,14);x.fillStyle='rgba(56,189,248,.5)';x.fillRect(16,46,220,10);x.fillRect(16,66,180,10);x.fillStyle='#38BDF8';rr(x,16,100,100,42,10);x.fill()}),toneMapped:false}));s.position.z=.017;P.add(s)}
 if(prop==='prism'){const p=new THREE.Mesh(new THREE.OctahedronGeometry(.2,0),new THREE.MeshPhysicalMaterial({color:'#C4B5FD',transmission:.4,roughness:.05,thickness:.4,emissive:'#7C3AED',emissiveIntensity:.8,flatShading:true}));p.scale.y=1.4;P.add(p)}
 if(prop==='lens'){const b=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.16,32),mObsid);b.rotation.x=Math.PI/2;P.add(b);const r=new THREE.Mesh(new THREE.TorusGeometry(.13,.025,10,32),mBrushed);r.position.z=.09;P.add(r);const gl2=new THREE.Mesh(new THREE.CircleGeometry(.11,32),new THREE.MeshPhysicalMaterial({color:'#1a0f08',metalness:.2,roughness:.02,clearcoat:1,emissive:'#FB923C',emissiveIntensity:.5}));gl2.position.z=.085;P.add(gl2)}
 const sh=plane(1.1,1.1,new THREE.MeshBasicMaterial({map:radialTex('#000000'),transparent:true,opacity:.75,depthWrite:false,toneMapped:false}));sh.rotation.x=-Math.PI/2;G.add(sh);
 const rimP=new THREE.PointLight(color,3.5,3.2,2);rimP.position.set(0,.9,-.7);B.add(rimP);
 G.userData={B,H,arms,eyes,happy,thr,P,sh,prop,color,leds};return G}
const bots=ROLES.map(([n,c,p])=>{const b=makeBot(c,p);W4.add(b);b.visible=false;return b});
const botLabel=ROLES.map(([n,c])=>{const t=canvasTex(512,80,(x,W,H)=>{x.font='700 30px MO';const w=x.measureText(n).width+64;x.fillStyle='rgba(10,13,21,.88)';rr(x,(W-w)/2,6,w,68,34);x.fill();x.strokeStyle=c;x.lineWidth=2.5;rr(x,(W-w)/2,6,w,68,34);x.stroke();x.fillStyle=c;x.beginPath();x.arc((W-w)/2+28,40,7,0,7);x.fill();x.fillStyle='#fff';x.textAlign='left';x.fillText(n,(W-w)/2+44,51)});const m=plane(1.6,.25,basic(t,{transparent:true,depthWrite:false}));W4.add(m);return m});
const BX=[-3.7,-1.85,0,1.85,3.7];const homeP=i=>V3(BX[i],-.55,.6);
const peds=BX.map((x,i)=>{const g=new THREE.Group();const pg=plane(2.4,2.4,add('#ffffff',{map:radialTex(ROLES[i][1]),opacity:.35}));pg.rotation.x=-Math.PI/2;pg.position.y=.07;g.add(pg);const d=new THREE.Mesh(new THREE.CylinderGeometry(.62,.7,.12,48),mObsid);g.add(d);const r=new THREE.Mesh(new THREE.TorusGeometry(.64,.018,8,64),add(ROLES[i][1],{opacity:.9}));r.rotation.x=Math.PI/2;r.position.y=.065;g.add(r);g.position.set(x,-2.14,.6);W4.add(g);return g});
const T4=[['BATTERY STORE','PR #201 MERGED','#38BDF8'],['TRADER BOT','886/886 CI TESTS PASSED','#10B981'],['MIKHAM','LIVE · 400K+','#F59E0B'],['HONARMARKET','1,450+ DESIGNS','#A78BFA'],['YADAKI YAR','v0.7.0 ✓','#FB923C']];
const TXp=[-4.9,-2.45,0,2.45,4.9],TYp=1.78,TZp=-2.6;
const targets=T4.map((v,i)=>{const t=canvasTex(1024,560,()=>{});const m=plane(2.3,1.26,basic(t,{transparent:true}));m.position.set(TXp[i],TYp,TZp);W4.add(m);return {m,t,last:''}});
function drawTarget(i,prog,badge){const T=targets[i],k=`${Math.round(prog*30)}|${badge.toFixed(2)}`;if(T.last===k)return;T.last=k;const x=T.t.userData.x,W=1024,H=560,c=T4[i][2];x.clearRect(0,0,W,H);
 x.save();rr(x,4,4,W-8,H-8,36);x.clip();x.fillStyle='#0A0D15';x.fillRect(0,0,W,H);const im=thumbs[i];x.drawImage(im,0,0,im.width,im.width*300/1024,0,0,W,300);x.fillStyle='rgba(5,7,12,.35)';x.fillRect(0,0,W,300);x.restore();
 x.strokeStyle=c;x.lineWidth=5;rr(x,4,4,W-8,H-8,36);x.stroke();x.fillStyle='#fff';x.font='700 70px SG';x.fillText(T4[i][0],40,392);
 x.fillStyle='rgba(255,255,255,.12)';rr(x,40,428,W-80,18,9);x.fill();x.fillStyle=c;rr(x,40,428,Math.max(18,(W-80)*prog),18,9);x.fill();
 x.fillStyle=prog>=1?'#3DDC97':'#8C93A3';x.font='700 30px MO';x.fillText(prog>=1?'● DONE':prog>0?'● BUILDING…':'○ QUEUED',40,505);
 if(badge>0){x.save();x.translate(W-36,58);x.scale(badge,badge);x.font='700 46px MO';const bw=x.measureText(T4[i][1]).width+44;x.fillStyle=GOLD;rr(x,-bw,-42,bw,74,18);x.fill();x.fillStyle='#120d02';x.textAlign='right';x.fillText(T4[i][1],-22,10);x.restore()}
 T.t.needsUpdate=true}
const beamGeo=new THREE.CylinderGeometry(1,1,1,10,1,true);beamGeo.translate(0,.5,0);
function mkBeam(c){const g=new THREE.Group();const a=new THREE.Mesh(beamGeo,add(c,{opacity:.95}));a.scale.set(.025,1,.025);const b=new THREE.Mesh(beamGeo,add(c,{opacity:.28}));b.scale.set(.08,1,.08);g.add(a,b);W4.add(g);g.visible=false;return g}
const UP=V3(0,1,0);function setBeam(g,p0,p1,f){if(f<=0){g.visible=false;return}g.visible=true;const d=p1.clone().sub(p0);const L=d.length()*f;g.position.copy(p0);g.quaternion.setFromUnitVectors(UP,d.normalize());g.scale.set(1,L,1)}
const beamsT=ROLES.map(r=>mkBeam(r[1]));const beamsC=[];for(let i=0;i<10;i++)beamsC.push(mkBeam(i%2?'#3DDC97':GOLD2));
const cubeFront=canvasTex(512,512,(x,W,H)=>{x.fillStyle='#0B0E16';x.fillRect(0,0,W,H);x.strokeStyle=GOLD;x.lineWidth=12;x.strokeRect(6,6,W-12,H-12);x.fillStyle=GOLD;x.font='700 30px MO';x.textAlign='center';x.fillText('TASK',W/2,120);x.fillStyle='#fff';x.font='700 66px SG';x.fillText('Ship release',W/2,230);x.fillText('v0.8',W/2,310);x.fillStyle=GOLD;rr(x,60,380,W-120,64,14);x.fill();x.fillStyle='#120d02';x.font='700 26px MO';x.fillText('LIVE SIMULATION · DEMO',W/2,422)});
const cubeBack=canvasTex(512,512,(x,W,H)=>{const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#FFD27A');g.addColorStop(1,'#F2B544');x.fillStyle=g;x.fillRect(0,0,W,H);x.fillStyle='#120d02';x.font='700 84px SG';x.textAlign='center';x.fillText('SHIPPED',W/2,250);x.font='700 120px SG';x.fillText('✓',W/2,380);x.font='700 24px MO';x.fillText('LIVE SIMULATION · DEMO',W/2,460)});
const cubeSide=canvasTex(256,256,(x,W,H)=>{x.fillStyle='#0B0E16';x.fillRect(0,0,W,H);x.strokeStyle=GOLD;x.lineWidth=8;x.strokeRect(4,4,W-8,H-8);x.fillStyle='rgba(242,181,68,.7)';x.font='700 26px MO';x.textAlign='center';x.fillText('v0.8',W/2,140)});
const cube=new THREE.Mesh(new THREE.BoxGeometry(1.15,1.15,1.15),[basic(cubeSide),basic(cubeSide),basic(cubeSide),basic(cubeSide),basic(cubeFront),basic(cubeBack)]);cube.visible=false;W4.add(cube);
const cubeGlow=plane(3.6,3.6,add('#ffffff',{map:radialTex('#F59E0B'),opacity:0}));W4.add(cubeGlow);
const shock=new THREE.Mesh(new THREE.TorusGeometry(1,.04,8,96),add(GOLD2,{opacity:0}));shock.rotation.x=Math.PI/2;W4.add(shock);
const shock2=plane(1,1,add('#ffffff',{map:radialTex('#FFD27A'),opacity:0}));shock2.rotation.x=-Math.PI/2;W4.add(shock2);
const CUBEP=V3(0,-1.0,1.9);
const RING=[Math.PI/2,Math.PI*.78,Math.PI,Math.PI*1.22,Math.PI*1.5];
const ringP=i=>CUBEP.clone().add(V3(Math.sin(RING[i])*2.05,.35,Math.cos(RING[i])*1.45));
const pl4=new THREE.PointLight('#FFB347',0,12,2);pl4.position.copy(CUBEP).add(V3(0,1,1));W4.add(pl4);
// ================= ACT 5 =================
const F=A.clone().add(V3(0,18,-6));const W5=new THREE.Group();W5.position.copy(F);scene.add(W5);
const fl5=dotFloor(60,40,'#080C15');fl5.position.y=-3.4;W5.add(fl5);
nebula(F.clone().add(V3(-6,3,-14)),'#F59E0B',36,.26);nebula(F.clone().add(V3(9,-1,-12)),'#10B981',26,.12);
const P5=makePortrait(6.0);P5.position.set(-4.0,-.2,0);P5.rotation.y=.12;W5.add(P5);
const bots5=ROLES.map(([n,c,p],i)=>{const b=makeBot(c,p);b.scale.setScalar(.82);b.position.set(-.3+i*1.4,-2.0,.9);W5.add(b);return b});
const stage5=new THREE.Mesh(new RoundedBoxGeometry(7.6,.16,1.8,3,.06),mObsid);stage5.position.set(2.5,-3.0,.9);W5.add(stage5);
const stE=new THREE.Mesh(new THREE.BoxGeometry(7.5,.02,.02),add(GOLD,{opacity:.9}));stE.position.set(2.5,-2.92,1.8);W5.add(stE);
// ================= HUD =================
const $=s=>document.getElementById(s);
const CH=['01 COMMAND','02 EVOLUTION','03 VENTURES','04 AGENTS','05 DEPLOY'];$('chap').innerHTML=CH.map((c,i)=>`<span class="ch" id="ch${i}">${c}</span>`).join('');
const PL=[['01 · Mikham + Miara','Mikham','A business directory with 13 categories and 5 online services — plus Miara, its conversational AI.','DIRECTORY · MAP · AI ASSISTANT','400K+ BUSINESSES'],
['02 · Battery Store','Battery Store','Tell it the vehicle — it matches the exact battery spec.','v0.2.0 · NEXT.JS 15 · REACT 19 · NESTJS 10<br>PRISMA 6 · POSTGRESQL · REDIS','201 PULL REQUESTS'],
['03 · Trader Bot','Trader Bot','Plugin-based trading engine, proven on multi-year backtests before anything goes live.','PYTHON · ~50K LOC · PLUGIN ARCHITECTURE<br>LIVE TRADING DISARMED BY DEFAULT','886 / 886 CI TESTS'],
['04 · Honarmarket','Honarmarket','E-commerce for makers — acetate and silicone molds, resin and candle supplies.','STOREFRONT · GALLERY · COLLECTIONS','1,450+ MOLD DESIGNS'],
['05 · Yadaki Yar','Yadaki Yar','Accounting, inventory and POS for auto-parts stores — one backend for Windows and Android.','FASTAPI + POSTGRESQL · 80 PRs<br>WINDOWS · ANDROID','v0.7.0'],
['06 · Sandoq-Yar','Sandoq-Yar','Offline-first supermarket POS — scan barcodes and keep selling without internet.','ZXING-WASM · INDEXEDDB · FASTAPI · PWA','OFFLINE-FIRST PWA']];const _PLold=[
['02 · Battery Store','Battery Store','Tell it the vehicle — it matches the exact battery spec.','NEXT.JS 15 · REACT 19 · NESTJS 10<br>PRISMA 6 · POSTGRESQL · REDIS','201 PULL REQUESTS'],
['03 · Trader Bot','Trader Bot','Plugin-based trading engine, proven offline on backtests first.','PYTHON · ~50K LOC · 87 PRs / 14 DAYS<br>LIVE TRADING DISARMED BY DEFAULT','886 / 886 CI TESTS'],
['04 · Commerce suite','Yadaki Yar · Sandoq-Yar · Honarmarket','Parts ERP + POS, an offline barcode POS PWA, and a 1,450+ design mold store.','v0.7.0 · FASTAPI + POSTGRESQL<br>ZXING-WASM · INDEXEDDB · PWA','1,450+ DESIGNS']];
const LOG=[[0,'▸ awaiting command…'],[1.0,'▸ build --ventures=6 --team=5-agents --verify'],[2.6,'✓ intent received · dispatching storyteller'],[5,'▸ loading archive · 2016 → 2020'],[7.6,'▸ evolving stack → next.js 15 · nestjs 10 · python'],[9.8,'▸ mounting ventures · 6 products'],...['✓ mikham · 400K+ businesses indexed · miara online','✓ battery store v0.2.0 · vehicle fitment online','✓ trader bot · 886/886 CI tests passing','✓ honarmarket · 1,450+ mold designs','✓ yadaki yar v0.7.0 · windows + android synced','✓ sandoq-yar · offline barcode POS ready'].map((l,k)=>[STW[k][0]-.05,l]),[17.6,'▸ spawning agents 5/5 · live simulation · demo'],[20.8,'▸ task dropped: ship release v0.8 · demo'],[22.7,'✓ release v0.8 shipped · demo'],[23.6,'▸ switching locale → فارسی (RTL)'],[25,'▸ owner sign-off: approve & deploy']];
const H={};['sat','a1','cmd','cur','tl2','tl3','tl4','sub1','term','a2','a2h','a2s','pl','plk','pln','pld','pls','plb','a4','a4s','a4r','a4t','toast','a5','a5k','a5h','a5s','a5b','a5c','appr','sweep','len','lfa','batf','batp','logl','nav','chap'].forEach(k=>H[k]=$(k));
const op=(e,v)=>e.style.opacity=v;const tf=(e,v)=>e.style.transform=v;
// ================= atmosphere =================
const ATM=[[0,'#05070C',.02,.5],[4.0,'#05070C',.02,.5],[4.7,'#2a1a05',.06,.6],[5.2,'#070B14',.02,.5],[9.4,'#070B14',.02,.5],...STW.flatMap(([a,b],k)=>{const c=['#0B0905','#050A12','#04100B','#10060D','#060818','#03100F'][k];return [[a-.08,c,.016,.4],[b+.08,c,.016,.4]]}),[18.1,'#05070C',.018,.45],[23.5,'#05070C',.018,.45],[24.2,'#080C15',.016,.5],[28,'#080C15',.016,.5]];
const cA=new THREE.Color(),cB=new THREE.Color();
function atm(t){let i=0;while(i<ATM.length-2&&t>ATM[i+1][0])i++;const a=ATM[i],b=ATM[i+1],k=ss(seg(t,a[0],b[0]));cA.set(a[1]);cB.set(b[1]);cA.lerp(cB,k);scene.background.copy(cA);scene.fog.color.copy(cA);scene.fog.density=lerp(a[2],b[2],k);hemi.intensity=lerp(a[3],b[3],k)}
// ================= camera =================
const hero=V3(-.6,.15,12.4),heroT=V3(-.6,0,0);
const arcPos=a=>C2.clone().add(V3(13.5*Math.sin(a),1.5,13.5*Math.cos(a))),arcT=C2.clone().add(V3(0,.55,0));
const aOf=t=>.05*seg(t,5.0,6.1)+1.0*eio(seg(t,6.1,6.8))+1.0*eio(seg(t,7.7,8.45))+.08*seg(t,8.45,9.7);
const Vk=k=>S(k).clone().add(V3(-1.55,.25,10.6)),Tk=k=>S(k).clone().add(V3(-1.55,.05,0));

const arenaP=A.clone().add(V3(0,.9,9.6)),arenaT=A.clone().add(V3(0,.45,0));
const finP=F.clone().add(V3(0,.2,12)),finT=F.clone().add(V3(0,0,0));
const pathA=new THREE.CatmullRomCurve3([hero.clone().add(V3(0,0,-.4)),V3(.3,1.6,7),story.position.clone().add(V3(0,0,1.2)),story.position.clone().add(V3(0,0,-2)),V3(1,1.8,-16),arcPos(0)]);
const P=V3(0,0,0),T=V3(0,0,0);let roll=0;
function camRaw(t){roll=0;t=Math.max(0,t);
 if(t<4.0){const k=eo(seg(t,0,1.8));P.copy(V3(-1.8,1.4,15.5)).lerp(hero,k);P.z-=seg(t,1.8,4)*.45;P.x+=Math.sin(t*.5)*.1;T.copy(heroT);return}
 if(t<5.0){const u=eio(seg(t,4.0,5.0));pathA.getPointAt(u,P);pathA.getPointAt(Math.min(1,u+.05),T);if(u<.08)T.lerp(heroT,1-u/.08);roll=Math.sin(Math.PI*u)*.25;return}
 if(t<9.7){P.copy(arcPos(aOf(t)));T.copy(arcT);P.y+=Math.sin((t-5)*.8)*.2;return}
 if(t<10.15){const k=eio(seg(t,9.7,10.15));P.copy(arcPos(aOf(9.7))).lerp(Vk(0),k);P.y+=Math.sin(Math.PI*k)*1.4;T.copy(arcT).lerp(Tk(0),eo(seg(t,9.7,10.1)));roll=-Math.sin(Math.PI*k)*.1;return}
 for(let k=0;k<6;k++){const [a,b]=STW[k];if(t<=b){const d=seg(t,a,b);const ang=lerp(-.13,.13,eio(d));const off=V3(-1.55,.25+.25*Math.sin(Math.PI*d),10.6-.6*eio(d));off.applyAxisAngle(UP,ang);P.copy(S(k)).add(off);T.copy(Tk(k));return}
  if(k<5&&t<STW[k+1][0]){const p=eio(seg(t,b,STW[k+1][0]));const o0=V3(-1.55,.25,10.0).applyAxisAngle(UP,.13),o1=V3(-1.55,.25,10.6).applyAxisAngle(UP,-.13);const A0=S(k).add(o0),A1=S(k+1).add(o1);const mid=A0.clone().lerp(A1,.5).add(V3(0,.9,3.4));const cr=new THREE.CatmullRomCurve3([A0.clone().add(A0.clone().sub(mid).multiplyScalar(.15)),A0,mid,A1,A1.clone().add(A1.clone().sub(mid).multiplyScalar(.15))]);cr.getPoint(.25+.5*p,P);T.copy(Tk(k)).lerp(Tk(k+1),ss(p));roll=Math.sin(Math.PI*p)*.05;return}}
 if(t<18.1){const p=eio(seg(t,17.55,18.1));P.copy(S(5)).add(V3(-1.55,.25,10.0).applyAxisAngle(UP,.13)).lerp(arenaP,p);P.y+=Math.sin(Math.PI*p)*2.5;T.copy(Tk(5)).lerp(arenaT,p);roll=Math.sin(Math.PI*p)*.08;return}
 if(t<23.5){const ph=.24*Math.sin((t-18.1)*.62-.4);const push=eio(seg(t,21.2,22.0))*1.3-eio(seg(t,22.9,23.5))*.6;P.copy(arenaT).add(V3(Math.sin(ph)*(9.6-push),.45-push*.25,Math.cos(ph)*(9.6-push)));T.copy(arenaT).add(V3(0,-.1*push,push*.4));return}
 const p=eio(seg(t,23.5,24.5));P.copy(arenaP).lerp(finP,p);P.z+=Math.sin(Math.PI*p)*3;T.copy(arenaT).lerp(finT,p);T.y+=Math.sin(Math.PI*p)*1.5;P.z-=seg(t,24.5,27.5)*.6}
const _P=V3(0,0,0),_T=V3(0,0,0);
function camAt(t){const W=[1,4,9,12,9,4,1],D=.07;let ws=0,rs=0;_P.set(0,0,0);_T.set(0,0,0);
 for(let i=0;i<7;i++){const o=(i-3)*D;camRaw(t+o);_P.addScaledVector(P,W[i]);rs+=roll*W[i];camRaw(t+o-.09);_T.addScaledVector(T,W[i]);ws+=W[i]}
 P.copy(_P).multiplyScalar(1/ws);T.copy(_T).multiplyScalar(1/ws);roll=rs/ws}
function fovAt(t){let b=0;const win=[[4.0,5.0,5],[9.7,10.15,4],...STW.slice(0,5).map((w,k)=>[w[1],STW[k+1][0],4.5]),[17.55,18.1,4],[23.5,24.5,4]];for(const [a,c,m] of win){const p=seg(t,a,c);if(p>0&&p<1)b+=Math.sin(Math.PI*p)**2*m}return 40+b-1.2*seg(t,18.1,23.5)*Math.sin(Math.PI*seg(t,18.1,23.5))}
// ================= bot animation helper =================
function poseBot(b,t,o){const u=b.userData;const bob=Math.sin(t*3.2+o.ph)*.06;u.B.position.y=bob+(o.jump||0);u.B.rotation.z=Math.sin(t*2+o.ph)*.04;
 u.H.rotation.y=Math.sin(t*1.7+o.ph)*.18+(o.look||0);u.H.rotation.x=Math.sin(t*2.3+o.ph)*.06+(o.nod||0);u.H.rotation.z=Math.sin(t*1.3+o.ph)*.06;
 u.arms.forEach((a,j)=>{const sx=a.userData.sx;const sw=Math.sin(t*3+o.ph+j*Math.PI)*.18;const raise=o.raise||0,fwd=o.fwd||0;a.rotation.z=sx*(.18+sw*.3)*(1-raise)+sx*raise*2.4*(1-fwd*.6);a.rotation.x=-fwd*1.35*raise-(o.point&&j==1?1.25:0);if(o.wave&&j==1)a.rotation.z=sx*(2.5+Math.sin(t*14)*.35)});
 const blink=((t*1.1+o.ph)%3.1)<.09?.15:1;u.eyes.forEach(e=>{e.scale.y=blink;e.visible=!o.happy});u.happy.forEach(h=>h.visible=!!o.happy);
 u.leds.forEach((l,j)=>{l.visible=((t*2.2+j*.7+o.ph)%1.6)>.35});u.thr.forEach((f,j)=>{f.scale.y=.8+.35*Math.sin(t*28+j*2+o.ph);f.material.opacity=.55+.25*Math.sin(t*19+j)});
 u.P.rotation.y=t*1.4+o.ph;u.P.position.y=(u.prop==='halo'?1.32:.95)+Math.sin(t*2.6+o.ph)*.05;u.sh.position.y=(o.floor??-1.55)-b.position.y;u.sh.material.opacity=.7}
const handWorld=(b,j)=>{const v=V3(0,0,0);b.userData.arms[j].userData.hand.getWorldPosition(v);return W4.worldToLocal(v)};
// ================= frame =================
const KN=[[0,0],[5.6,4.0],[7.0,5.0],[13.7,9.7],[14.2,10.15],[33.5,17.55],[34.2,18.1],[44,23.5],[52,27.5]];
const M=x=>{for(let i=0;i<KN.length-1;i++){const [a,A0]=KN[i],[b,B0]=KN[i+1];if(x<=b)return A0+(B0-A0)*(x-a)/(b-a)}return 27.5};
window.renderFrame=tr=>{const t=M(tr);
 atm(t);
 W1.visible=t<4.75;W2.visible=t>4.4&&t<10.3;W3.visible=t>9.5&&t<18.3;W4.visible=t>17.3&&t<24.6;W5.visible=t>23.4;
 nebs.forEach(n=>{n.quaternion.copy(cam.quaternion);if(n.userData.stage!==undefined){const [a,b]=STW[n.userData.stage];n.material.opacity=.3*ss(seg(t,a-.5,a+.1))*(1-ss(seg(t,b,b+.5)))}});
 // ---- act1
 const sa=eo5(seg(t,.1,1.1));SA.position.y=lerp(-4,1.35,sa);SA.rotation.x=lerp(-1.1,0,sa);const ma=eo5(seg(t,.35,1.35));MA.position.y=lerp(-6,-.7,ma);MA.rotation.x=lerp(-1.1,0,ma);
 SA.rotation.y=MA.rotation.y=Math.sin(t*.6)*.04;
 const pi=eo(seg(t,.2,1.2));P1.userData.p.material.opacity=pi;P1.userData.bodyM.opacity=pi;P1.userData.rim.material.opacity=.55*pi*(.85+.15*Math.sin(tr*2));P1.userData.halo.material.opacity=.42*pi;P1.position.y=lerp(-.7,-.15,pi);P1.rotation.y=-.1+Math.sin(tr*.5)*.03;
 // storyteller
 let sp=story.position;const sIn=eback(seg(t,1.4,2.1));
 if(t<9.6){sp.set(.3,2.35+Math.sin(t*2)*.08,1.6)}
 if(t>=9.6&&t<18.2){let k=0;for(let i=0;i<6;i++)if(t>=STW[i][0]-.5)k=i;const off=V3(-6.4,2.0,1.6);let pos=S(k).clone().add(off);
  if(k<5&&t>STW[k][1]){const p=eio(seg(t,STW[k][1],STW[k+1][0]-.1));pos.lerp(S(k+1).clone().add(off),p);pos.y+=Math.sin(Math.PI*p)*1.4}
  if(t<10.15){pos=arcT.clone().lerp(S(0).clone().add(off),eo(seg(t,9.6,10.15)))}
  if(t>17.55){const p=eio(seg(t,17.55,18.1));pos.lerp(A.clone().add(V3(0,.3,.6)),p)}
  sp.copy(pos);sp.y+=Math.sin(t*2.2)*.08}
 if(t>=18.2)sp.copy(A).add(V3(0,.3,.6));
 const orbE=t<18.1?1:1+eo(seg(t,18.1,18.5))*1.4;const orbOut=t<18.5?1:1-seg(t,18.5,18.6);
 story.visible=(t<4.25||t>5.4)&&t<18.6&&t>1.35&&!(t>9.4&&t<9.65);story.scale.setScalar(Math.max(.001,(t<4?sIn:1)*orbE*orbOut*(t>9.6&&t<18?.6:1)));
 gem.rotation.set(t*.7,t*1.1,0);gcore.rotation.set(-t,t*.6,0);gring.rotation.set(Math.PI/2.4+Math.sin(t)*.2,t*.5,0);gring2.rotation.set(Math.PI/1.8,-t*.4,Math.sin(t*.7)*.3);gglow.quaternion.copy(cam.quaternion);gglow.material.opacity=.55+.15*Math.sin(t*3)+(t>18.1?seg(t,18.1,18.5)*.5:0);
 // beam trace from storyteller up to the next act during the fly
{const trc=seg(t,3.4,4.0)*(1-seg(t,4.6,4.9));trace.visible=trc>0;if(trc>0){const a=story.position.clone(),b=arcT.clone();const d=b.clone().sub(a);trace.position.copy(a).add(d.clone().multiplyScalar(.5*trc));trace.quaternion.setFromUnitVectors(UP,d.clone().normalize());trace.scale.set(1+2*trc,d.length()*trc,1+2*trc)}}
 // ---- act2
 const rise=eo5(seg(t,4.6,5.6));carousel.position.y=lerp(-9,0,rise);carousel.rotation.y=t*.35;pl2.intensity=36+8*Math.sin(t*3);
 Y16.position.y=lerp(-4,.2,eo5(seg(t,4.9,5.7)))-6*eio(seg(t,6.4,7.0));Y16.rotation.y=Math.sin(t*.8)*.12;code16.position.y=lerp(-6,-1.35,eo5(seg(t,5.0,5.8)))-6*eio(seg(t,6.4,7.0));
 const base=atR(1,3.6,0),n1=nrm(1),t1=tanv(1);
 arch.forEach((g,i)=>{const [u,y,o,r]=AP[i];const fin=eo5(seg(t,6.2+i*.1,6.9+i*.1));const sw=eio(seg(t,7.6+i*.07,8.3+i*.07));g.visible=t>6.1&&t<8.5;
  g.position.copy(base).add(t1.clone().multiplyScalar(u+(i==1?0:Math.sign(u))*sw*3.2)).add(n1.clone().multiplyScalar(o-sw*(i==1?3.5:1.5)));g.position.y=lerp(-4.5,y,fin)-sw*(i==1?5:2.5);g.rotation.y=1+r+(i==1?0:-Math.sign(u)*sw*1.25);g.rotation.x=(i==1?sw*.9:0)});
 Y20.visible=t>6.2&&t<8.4;Y20.position.y=lerp(-3,2.0,eo5(seg(t,6.2,6.9)))+7*eio(seg(t,7.6,8.4));
 Y26.visible=t>8.0;Y26.position.y=lerp(-3,2.75,eo5(seg(t,8.0,8.7)));
 const mb=atR(2,3.4,0),mt=tanv(2);monos.forEach((g,i)=>{const p=eo5(seg(t,8.05+i*.1,8.8+i*.1));g.visible=t>8.05;g.position.copy(mb).add(mt.clone().multiplyScalar(MP[i]));g.position.y=lerp(-7,.15,p);g.rotation.y=2+(1-p)*.8});
 // ---- act3
 stages.forEach((s,k)=>{const [a,b]=STW[k];const ig=ss(seg(t,a-.45,a+.1))*(1-ss(seg(t,b+.1,b+.5)));s.halo.material.opacity=.12+ig*.4;s.sp.intensity=ig*14;s.g.position.y=Math.sin(t*1.1+k)*.05;s.g.rotation.y=(1-ig)*.14*(k%2?1:-1);
  {const r=s.tt.repeat.y;const sc=eio(seg(t,a-.15,b+.1));s.tt.offset.y=(1-r)*(1-sc*.86)}
  s.sheen.material.map.offset.x=-1+((tr-a)*.3%2);
  s.chips.forEach((c,j)=>{const p=eback(seg(t,a+.05+j*.12,a+.45+j*.12));const q=1-seg(t,b+.15,b+.45);const pos=[V3(2.3,2.45,.75),V3(2.45,-2.15,.95),V3(2.2,.15,1.1)][j];c.position.copy(pos);c.position.y+=Math.sin(t*2+j)*.05;c.scale.setScalar(Math.max(.001,p*q));c.rotation.y=-.12})});
 // ---- act4
 const pop=i=>seg(t,18.5+i*.07,19.05+i*.07),glide=i=>eio(seg(t,19.0+i*.04,19.55+i*.04));
 const fire=i=>seg(t,19.6+i*.16,20.0+i*.16);const turn=eio(seg(t,21.15,21.4));const leap=i=>seg(t,21.3+i*.05,21.85+i*.05);const raiseC=eio(seg(t,21.8,22.0));
 const flip=eio(seg(t,22.55,22.85));const celeb=seg(t,22.85,23.5);
 bots.forEach((b,i)=>{b.visible=t>18.5+i*.07&&t<24.6;const pp=spring(pop(i));const start=V3(0,.3,.6).add(V3((i-2)*.25,0,0));
  let pos=start.clone().lerp(homeP(i),glide(i));const lp=leap(i);if(lp>0){pos=homeP(i).clone().lerp(ringP(i),eio(lp));pos.y+=Math.sin(Math.PI*lp)*1.3}
  b.position.copy(pos);b.scale.setScalar(Math.max(.001,pp));
  let ry=Math.sin(t*.8+i)*.2;const toC=Math.atan2(CUBEP.x-pos.x,CUBEP.z-pos.z);const toT=Math.atan2(TXp[i]-pos.x,TZp-pos.z);
  const f=fire(i);const aim=ss(seg(t,19.5+i*.16,19.75+i*.16))*(1-turn);ry=lerp(ry,Math.atan2(TXp[i]-pos.x,4)*.6,aim);ry=lerp(ry,toC,turn);b.rotation.y=ry;
  const jump=celeb>0?Math.abs(Math.sin(celeb*Math.PI*2.4+i*.6))*.38*(1-celeb*.3):0;
  poseBot(b,tr,{ph:i*1.3,raise:Math.max(aim*(f>0&&t<20.9?1:0)*1,raiseC*(1-celeb*.2)),fwd:turn>0?.4:.0,jump,happy:t>22.85,wave:celeb>.05&&i%2==0,floor:-2.08,look:aim*.2,nod:aim*.15});
  const lb=botLabel[i];lb.position.copy(b.position).add(V3(0,-1.9+ (lp>0?0:0),.55));lb.position.y=-1.88;lb.position.x=b.position.x;lb.position.z=b.position.z+.75;lb.quaternion.copy(cam.quaternion);lb.material.opacity=seg(t,19.3,19.6)*(1-seg(t,21.2,21.4))+seg(t,22.95,23.2)*0;lb.visible=lb.material.opacity>0.01});
 peds.forEach((p,i)=>{const k=eo5(seg(t,18.8+i*.06,19.3+i*.06));p.scale.setScalar(Math.max(.001,k));p.visible=t>18.8});
 W4.updateMatrixWorld(true);
 targets.forEach((T,i)=>{const ap=eo5(seg(t,18.9+i*.07,19.5+i*.07));T.m.position.y=lerp(TYp+3,TYp,ap);T.m.material.opacity=ap;T.m.visible=ap>0;const f=fire(i);drawTarget(i,eio(seg(t,19.75+i*.16,20.35+i*.16)),seg(t,20.15+i*.16,20.45+i*.16)>0?eback(seg(t,20.15+i*.16,20.45+i*.16)):0)});
 bots.forEach((b,i)=>{const f=fire(i);const on=t>19.6+i*.16&&t<20.95;if(on){const h=handWorld(b,1);setBeam(beamsT[i],h,V3(TXp[i],TYp-.5,TZp+.02),eo5(f))}else beamsT[i].visible=false});
 // cube
 const drop=seg(t,20.7,21.15);cube.visible=t>20.7&&t<24.6;const dy=drop<1?lerp(6,0,eo(drop)*1)+(-Math.sin(Math.PI*seg(t,21.0,21.15))*0):0;const land=eback(seg(t,20.95,21.2));
 cube.position.copy(CUBEP);cube.position.y+=lerp(6,0,eo5(drop))+(celeb>0?Math.abs(Math.sin(celeb*Math.PI*2))*.2:0)+Math.sin(t*2)*.04;cube.rotation.set(0,lerp(-.35,0,eo(drop))+flip*Math.PI+(t>22.85?Math.sin(t*2)*.08:0),lerp(.5,0,eo5(drop)));
 cube.scale.setScalar(1+.08*Math.sin(Math.PI*seg(t,22.0,22.55))*Math.sin(t*30)*.5+(flip>0&&flip<1?.1*Math.sin(Math.PI*flip):0));
 cubeGlow.position.copy(CUBEP).add(V3(0,0,-.7));cubeGlow.quaternion.copy(cam.quaternion);cubeGlow.material.opacity=seg(t,21.0,21.3)*.35+seg(t,22.0,22.55)*.4+(t>22.6?.25:0);
 pl4.intensity=seg(t,21,21.3)*6+seg(t,22,22.6)*16*(1-celeb*.5);
 bots.forEach((b,i)=>{for(let j=0;j<2;j++){const bm=beamsC[i*2+j];const on=t>22.0&&t<22.75;if(on){const h=handWorld(b,j);setBeam(bm,h,CUBEP.clone(),eo5(seg(t,22.0+i*.03,22.2+i*.03)))}else bm.visible=false}});
 const sk=seg(t,22.82,23.4);shock.position.copy(CUBEP).add(V3(0,-.55,0));shock.scale.setScalar(.6+sk*6);shock.material.opacity=sk>0?(1-sk):0;shock2.position.copy(shock.position);shock2.scale.setScalar(1+sk*12);shock2.material.opacity=sk>0?(1-sk)*.6:0;
 // ---- act5
 const f5=eo(seg(t,24.0,24.9));P5.userData.p.material.opacity=f5;P5.userData.bodyM.opacity=f5;P5.userData.rim.material.opacity=.55*f5*(.85+.15*Math.sin(tr*2));P5.userData.halo.material.opacity=.42*f5;P5.position.x=lerp(-5.0,-4.0,f5);P5.rotation.y=.12+Math.sin(tr*.5)*.03;
 bots5.forEach((b,i)=>{const p=spring(seg(t,24.5+i*.08,25.1+i*.08));b.scale.setScalar(Math.max(.001,.82*p));b.rotation.y=Math.sin(t*.9+i)*.3-.15;poseBot(b,tr,{ph:i*1.1,happy:true,wave:i==2&&t>25.6,floor:-2.9})});
 // ---- camera
 camAt(t);cam.position.copy(P);cam.up.set(0,1,0);cam.lookAt(T);cam.rotateZ(roll);cam.fov=fovAt(t);cam.updateProjectionMatrix();
 // ---- HUD
 const ci=t<4.8?0:t<9.9?1:t<17.6?2:t<23.5?3:4;CH.forEach((c,i)=>$('ch'+i).className='ch'+(i==ci?' on':''));
 const fa=t>23.9;H.len.className=fa?'':'on';H.lfa.className='fa'+(fa?' on':'');
 const bp=Math.min(1,tr/51);H.batf.style.height=(bp*242)+'px';H.batp.textContent=`${Math.round(bp*100)}%${bp>=1?' ✓':''}`;
 let lg=LOG[0][1];for(const q of LOG)if(t>=q[0])lg=q[1];H.logl.textContent=lg;
 // act1 HUD
 const a1=1-seg(t,3.7,4.1);op(H.a1,a1);const cmd='build --ventures=6 --team=5-agents --verify';const ty=Math.floor(cmd.length*seg(t,1.0,2.4));H.cmd.textContent=cmd.slice(0,ty);op(H.cur,(Math.floor(t*3)%2||t<2.4)?1:0);
 op(H.term,eo(seg(t,.6,1.0)));tf(H.term,`translateY(${(1-eo(seg(t,.6,1.0)))*20}px)`);op(H.tl2,seg(t,2.5,2.7));op(H.tl3,seg(t,2.8,3.0));op(H.tl4,seg(t,3.1,3.3));op(H.sub1,seg(t,1.1,1.6));
 // act2 HUD
 const a2=eo(seg(t,5.3,5.7))*(1-seg(t,9.4,9.7));op(H.a2,a2);tf(H.a2,`translateY(${(1-a2)*16}px)`);
 if(t<6.6){H.a2h.innerHTML='2016 · First lines of code';H.a2s.textContent='HTML · CSS · hand-written, line by line'}else if(t<8.1){H.a2h.innerHTML='2020 · Bootstrap 4 · SCSS · jQuery';H.a2s.textContent='PSM WEB DEVELOPER · FITNESS POINT · BREWERY'}else{H.a2h.innerHTML='<span style="color:#F2B544">2026</span> · AI-native stack';H.a2s.textContent='NEXT.JS 15 · NESTJS · ~50K LOC PYTHON · 886 CI TESTS'}
 // act3 placard
 let pk=-1;for(let k=0;k<6;k++)if(t>STW[k][0]+.02&&t<STW[k][1]+.1)pk=k;
 if(pk>=0){const [a,b]=STW[pk];const k=eo5(seg(t,a+.02,a+.3))*(1-seg(t,b-.12,b+.1));op(H.pl,k);tf(H.pl,`translateX(${(1-k)*-30}px)`);const q=PL[pk];H.plk.textContent=q[0];H.plk.style.color=ACC[pk];H.pln.textContent=q[1];H.pln.style.fontSize='38px';H.pld.textContent=q[2];H.pls.innerHTML=q[3];H.plb.textContent=q[4];H.pl.style.borderColor=ACC[pk]+'66';H.pl.style.top=(pk==5?250:280)+'px';op(H.sat,pk==5?k:0)}else{op(H.pl,0);op(H.sat,0)}
 // act4 HUD
 const a4=seg(t,18.6,19.0)*(1-seg(t,23.3,23.6));op(H.a4,a4);op(H.a4r,a4);
 H.a4s.textContent=t<19.6?'● agents online '+Math.min(5,Math.max(0,Math.floor((t-18.5)/.07)+1))+'/5':t<20.7?'● building ventures in parallel':t<22.6?'● converging on task: ship release v0.8':'✓ shipped · all checks green';
 const done=[0,1,2,3,4].filter(i=>t>20.15+i*.16).length;H.a4t.textContent=`${done}/5 ✓${t>22.85?' · SHIPPED':''}`;
 const ts=seg(t,22.9,23.15)*(1-seg(t,23.35,23.55));op(H.toast,ts);tf(H.toast,`translateY(${(1-eo(seg(t,22.9,23.15)))*20}px)`);
 // sweep + act5
 const sw=seg(t,23.45,24.15);op(H.sweep,sw>0&&sw<1?Math.sin(Math.PI*sw):0);H.sweep.style.left=lerp(-420,1280,sw)+'px';
 [H.a5k,H.a5h,H.a5s,H.a5b,H.a5c].forEach((e,i)=>{const p=eo(seg(t,24.1+i*.16,24.6+i*.16));op(e,p);tf(e,`translateX(${(1-p)*-28}px)`)});
 const ap=t>25.9?.5+.5*Math.sin((t-25.9)*5):0;H.appr.style.boxShadow=`0 0 ${30+20*ap}px rgba(242,181,68,${.35+.3*ap})`;
 R.render(scene,cam)};
renderFrame(0);window.ready=true;
