// Explicit, bounded round-trip runner. Never starts without live acknowledgement.
// Run on your own server; keys stay on that server, outside the website.
import {readFile} from 'node:fs/promises';
import {Keypair,VersionedTransaction} from '@solana/web3.js';
const {COLONY_URL,EXECUTOR_TOKEN,SOLANA_KEYPAIR_FILE,ALLOW_LIVE_TRADING,SITES_ACCESS_TOKEN}=process.env;
if(ALLOW_LIVE_TRADING!=='YES'||!COLONY_URL||!EXECUTOR_TOKEN||!SOLANA_KEYPAIR_FILE)throw Error('Set COLONY_URL, EXECUTOR_TOKEN, SOLANA_KEYPAIR_FILE and ALLOW_LIVE_TRADING=YES.');
const origin=new URL(COLONY_URL);if(origin.protocol!=='https:')throw Error('HTTPS required.');
const wallet=Keypair.fromSecretKey(Uint8Array.from(JSON.parse(await readFile(SOLANA_KEYPAIR_FILE,'utf8'))));
const headers={'content-type':'application/json',authorization:`Bearer ${EXECUTOR_TOKEN}`,...(SITES_ACCESS_TOKEN?{'OAI-Sites-Authorization':`Bearer ${SITES_ACCESS_TOKEN}`}:{})};
async function api(path,body){const r=await fetch(new URL(path,origin),{headers,method:body?'POST':'GET',body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(40000)});const j=await r.json();if(!r.ok)throw Error(j.error||`HTTP ${r.status}`);return j;}
const state=await api('/api/colony');if(!state.config.automation||!state.config.live||state.config.paused)throw Error('Enable automation and live mode in the owner settings.');
async function swap(positionId){const q=await api('/api/trade',{action:'order',wallet:wallet.publicKey.toBase58(),positionId});const tx=VersionedTransaction.deserialize(Buffer.from(q.transaction,'base64'));tx.sign([wallet]);const result=await api('/api/trade',{action:'execute',id:q.id,signedTransaction:Buffer.from(tx.serialize()).toString('base64')});if(result.status!=='Success')throw Error('Execution not confirmed; inspect the ledger before restarting.');console.log('Confirmed:',result.signature);return q.id;}
// One buy and one exit only. No infinite loop, wash trading, or automatic restart.
const id=await swap();console.log('Holding position for configured duration:',state.config.holdSeconds,'seconds.');
await new Promise(r=>setTimeout(r,state.config.holdSeconds*1000));
await swap(id);console.log('Round trip finished. Start another only after reviewing the ledger.');
