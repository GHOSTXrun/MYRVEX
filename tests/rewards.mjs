import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import ts from 'typescript';import {DatabaseSync} from 'node:sqlite';import assert from 'node:assert/strict';
const dir=new URL('../.sites-runtime/reward-tests/',import.meta.url);await mkdir(dir,{recursive:true});
for(const [file,name] of [['lib/colony.ts','colony'],['app/api/rewards/route.ts','api']]){let code=await readFile(new URL('../'+file,import.meta.url),'utf8');code=code.replaceAll("'cloudflare:workers'","'./testenv.mjs'").replaceAll("'@/lib/colony'","'./colony.mjs'");await writeFile(new URL(name+'.mjs',dir),ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);}
await writeFile(new URL('testenv.mjs',dir),'export const env={};');const {env}=await import(new URL('testenv.mjs',dir));const sql=new DatabaseSync(':memory:');for(const f of (await readdir(new URL('../drizzle/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort())sql.exec(await readFile(new URL('../drizzle/'+f,import.meta.url),'utf8'));
function prep(q,v=[]){return{bind:(...a)=>prep(q,a),run:async()=>({meta:{changes:Number(sql.prepare(q).run(...v).changes)}}),first:async()=>sql.prepare(q).get(...v)||null,all:async()=>({results:sql.prepare(q).all(...v)})}}
env.DB={prepare:prep,batch:async a=>{sql.exec('BEGIN');try{const r=[];for(const x of a)r.push(await x.run());sql.exec('COMMIT');return r}catch(e){sql.exec('ROLLBACK');throw e}}};env.REWARDS_ADMIN_EMAIL='owner@test.example';const api=await import(new URL('api.mjs',dir));
const req=(body,email='member@test.example',origin='https://colony.test')=>new Request('https://colony.test/api/rewards',{method:body?'POST':'GET',headers:{origin,...(email?{'oai-authenticated-user-email':email}:{})},body:body?JSON.stringify(body):undefined});
assert.equal((await api.GET(req(null,''))).status,401);
assert.equal((await api.POST(req({action:'task',task:'checkin'},undefined,'https://other.test'))).status,403);
let r=await api.POST(req({action:'task',task:'checkin'}));assert.equal(r.status,200);assert.equal((await r.json()).score,10);
assert.equal((await api.POST(req({action:'task',task:'checkin'}))).status,409);
assert.equal((await api.POST(req({action:'task',task:'learn',answer:'price-rumor'}))).status,400);
r=await api.POST(req({action:'task',task:'learn',answer:'confirmed-sell'}));assert.equal((await r.json()).score,30);
for(let i=0;i<3;i++)assert.equal((await api.POST(req({action:'contribute',kind:'bug',body:'A reproducible problem with the colony view '+i}))).status,200);
assert.equal((await api.POST(req({action:'contribute',kind:'bug',body:'Fourth contribution should be rate limited'}))).status,429);
let state=await(await api.GET(req())).json();assert.equal(state.score,30);assert.equal(state.submissions.length,3);const id=state.submissions[0].id;
assert.equal((await api.POST(req({action:'review',id,status:'approved'}))).status,403);
assert.equal((await api.POST(req({action:'review',id,status:'approved'},'owner@test.example'))).status,200);
await api.POST(req({action:'review',id,status:'approved'},'owner@test.example'));
state=await(await api.GET(req())).json();assert.equal(state.score,80);assert.equal(state.claimOpen,false);assert.equal(state.fundedSol,0);
const stranger=await(await api.GET(req(null,'other@test.example'))).json();assert.equal(stranger.score,0);assert.equal(stranger.submissions.length,0);assert.equal(stranger.total,80);
console.log('PASS: authentication, origin, once-per-day awards, quiz validation, durable records, submission limit, review authorization, idempotent approval, member isolation, unfunded claim gate.');
