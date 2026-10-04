/* MYRVEX articulated ant model. One anatomy model is shared by world and portrait views. */
(()=>{const T=THREE,sphere=new T.SphereGeometry(1,32,24),templates={};
const palettes={Worker:{shell:0x52291b,highlight:0xb46b35,belly:0x251713,leg:0x49291d},Scout:{shell:0x244e4a,highlight:0x76b8a4,belly:0x18362f,leg:0x264039},Soldier:{shell:0x73392d,highlight:0xca7953,belly:0x3d2323,leg:0x392624},Queen:{shell:0x302238,highlight:0xe7bc73,belly:0x17121f,leg:0x604629}};
function material(color,roughness=.23,metalness=.28){return new T.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:.8,clearcoatRoughness:.22});}
function ell(parent,mat,pos,scale,name){const m=new T.Mesh(sphere,mat);m.position.set(...pos);m.scale.set(...scale);m.name=name||'';m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
function rod(parent,mat,a,b,r1,r2=r1){const p=new T.Vector3(...a),q=new T.Vector3(...b),v=q.clone().sub(p);const m=new T.Mesh(new T.CylinderGeometry(r2,r1,v.length(),8),mat);m.position.copy(p.add(q).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());m.castShadow=true;parent.add(m);return m;}
function curve(parent,mat,points,r){const mesh=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),16,r,7,false),mat);mesh.castShadow=true;parent.add(mesh);return mesh;}
function template(role){const p=palettes[role],g=new T.Group(),shell=material(p.shell),trim=material(p.highlight,.25,.35),belly=material(p.belly,.26,.15),legs=material(p.leg,.45,.08),black=material(0x09110f,.12,.05),shine=new T.MeshBasicMaterial({color:0xefeee4});const queen=role==='Queen',soldier=role==='Soldier',scout=role==='Scout';
const abdomen=new T.Group();abdomen.name='abdomen';g.add(abdomen);const size=queen?1.65:scout?.9:1;
ell(abdomen,belly,[-1.05,.67,0],[.65*size,.48*size,.43*size]);
// Overlapping tergite plates taper into the waist, leaving dark articulating seams.
for(let i=0;i<4;i++){const x=-1.43+i*.25,edge=Math.sqrt(Math.max(.16,1-Math.pow((x+1.05)/.69,2)));const ring=new T.Mesh(new T.TorusGeometry(1,.024,6,40),i===0&&queen?trim:shell);ring.position.set(x,.67,0);ring.rotation.y=Math.PI/2;ring.scale.set(.44*edge*size,.48*edge*size,1);abdomen.add(ring);}
ell(g,shell,[-.38,.59,0],[.14,.19,.145]);ell(g,trim,[-.23,.61,0],[.11,.14,.12]);
ell(g,shell,[.05,.64,0],[queen?.47:.39,.30,queen?.35:.27]);ell(g,trim,[.13,.84,0],[.24,.045,.19]);
const head=new T.Group();head.name='head';head.position.set(.62,.71,0);g.add(head);const hs=soldier?1.38:queen?1.13:scout?.86:1;head.scale.setScalar(hs);
ell(head,shell,[.12,0,0],[.37,.33,.34]);ell(head,trim,[.27,.13,0],[.24,.15,.29]);
for(const s of[-1,1]){
// Glossy compound eyes and a small readable highlight.
ell(head,black,[.23,.08,s*.291],[.105,.13,.061]);ell(head,shine,[.28,.15,s*.352],[.025,.032,.012]);
// Separate curved mandibles, not a single cone.
curve(head,legs,[[.39,-.11,s*.15],[.54,-.18,s*.21],[soldier?.80:.66,-.20,s*.12],[soldier?.76:.62,-.17,s*.05]],soldier?.065:.043);
const antenna=new T.Group();antenna.name='antenna'+s;head.add(antenna);const length=scout?1.26:1;
curve(antenna,legs,[[.24,.25,s*.17],[.36,.43,s*.25],[.63,.51,s*.41]],.024);
curve(antenna,trim,[[.63,.51,s*.41],[.81*length,.49,s*.56],[.94*length,.40,s*.68]],.02);
ell(antenna,trim,[.94*length,.40,s*.68],[.038,.045,.038]);
}
// Six two-link articulated legs with distinct hip/knee/ankle shapes.
for(let i=0;i<6;i++){const side=i<3?1:-1,j=i%3,pivot=new T.Group();pivot.name='leg'+i;pivot.position.set(.22-j*.20,.57,side*.17);g.add(pivot);const reach=(j-1)*-.38,span=scout?1.18:1;ell(pivot,shell,[0,0,0],[.095,.10,.09]);const knee=[reach,.01,side*.62*span],ankle=[reach*1.6,-.45,side*.96*span];rod(pivot,legs,[0,0,0],knee,.065,.042);ell(pivot,trim,knee,[.066,.07,.066]);rod(pivot,legs,knee,ankle,.04,.016);curve(pivot,legs,[ankle,[ankle[0]+.10,-.50,side*1.04*span],[ankle[0]+.16,-.49,side*1.10*span]],.013);}
if(queen){
// Low crested thorax and small ocelli distinguish the queen without a floating crown.
for(const z of[-.12,0,.12])ell(head,trim,[.1,.32,z],[.046,.046,.046]);
const wingMat=new T.MeshPhysicalMaterial({color:0xb5ddda,roughness:.12,metalness:.22,transparent:true,opacity:.36,side:T.DoubleSide,depthWrite:false});
for(const side of[-1,1]){const wing=new T.Group();wing.position.set(-.05,1.02,side*.22);wing.rotation.y=side*-.28;g.add(wing);
ell(wing,wingMat,[-.75,.08,side*.25],[1.02,.018,.35]);
for(let j=0;j<3;j++)curve(wing,trim,[[0,.10,0],[-.55,.10,side*(.08+j*.12)],[-1.55,.08,side*(.15+j*.10)]],.008);
curve(g,trim,[[-.10,.90,side*.27],[-.35,1.07,side*.4],[-.58,1.05,side*.37]],.025);}
// Fine gold abdominal sutures emphasize the queen's elongated silhouette.
for(let i=0;i<4;i++){const band=new T.Mesh(new T.TorusGeometry(1,.012,6,56),trim);band.position.set(-1.72+i*.38,.67,0);band.rotation.y=Math.PI/2;const k=Math.sqrt(1-Math.pow((band.position.x+1.05)/1.08,2));band.scale.set(.71*k,.79*k,1);abdomen.add(band);}

}
if(soldier){ell(g,shell,[.03,.84,0],[.38,.15,.31]);for(const side of[-1,1])curve(g,trim,[[-.1,.85,side*.22],[-.22,1.04,side*.35],[-.30,1.02,side*.38]],.042);}
return g;}
function create(role='Worker',scale=1){if(!palettes[role])role='Worker';if(!templates[role])templates[role]=template(role);const g=templates[role].clone(true);g.scale.setScalar(scale);g.userData.role=role;return g;}
function animate(g,t,moving=true){const legs=[0,1,2,3,4,5];for(const i of legs){const l=g.getObjectByName('leg'+i),phase=t*8+(i%3+(i<3?0:1))*Math.PI;const side=i<3?1:-1;l.rotation.y=moving?Math.sin(phase)*.24:Math.sin(t*.9+i)*.015;l.rotation.x=moving?side*Math.max(0,Math.cos(phase))*.16:0;}const head=g.getObjectByName('head');head.rotation.y=Math.sin(t*1.8)*.035;for(const side of[-1,1]){const a=g.getObjectByName('antenna'+side);a.rotation.y=Math.sin(t*2.1+side)*.07;a.rotation.z=Math.sin(t*1.5+side)*.035;}const ab=g.getObjectByName('abdomen');ab.rotation.z=Math.sin(t*1.3)*.013;}
const coinTemplates={};
function coin(scale=1,variant=0){variant=variant%4;const tint=[0xb478ff,0x43efb0,0x57bfff,0xffc85b][variant],base=[0x41265e,0x184e38,0x183e64,0x68461b][variant];if(!coinTemplates[variant]){const c=new T.Group(),rim=material(tint,.20,.65),face=material(base,.26,.45);const disk=new T.Mesh(new T.CylinderGeometry(.52,.52,.11,48),rim);disk.rotation.x=Math.PI/2;c.add(disk);for(const side of[-1,1]){const plate=new T.Mesh(new T.CircleGeometry(.465,48),face);plate.position.z=side*.061;plate.rotation.y=side<0?Math.PI:0;c.add(plate);const ring=new T.Mesh(new T.TorusGeometry(.465,.016,8,48),material(tint,.19,.5));ring.position.z=side*.065;c.add(ring);for(let i=0;i<3;i++){const sh=new T.Shape(),flip=i===1?-1:1;sh.moveTo(-.29,-.07);sh.lineTo(.19,-.07);sh.lineTo(.29,.07);sh.lineTo(-.19,.07);sh.closePath();const logo=new T.Mesh(new T.ShapeGeometry(sh),new T.MeshStandardMaterial({color:tint,emissive:tint,emissiveIntensity:.35,metalness:.45,roughness:.24,side:T.DoubleSide}));logo.position.set(0,.23-i*.23,side*.074);logo.scale.x=flip;c.add(logo);}}coinTemplates[variant]=c;}const c=coinTemplates[variant].clone(true);c.scale.setScalar(scale);return c;}
window.FormixAnt={create,animate,coin};})();
