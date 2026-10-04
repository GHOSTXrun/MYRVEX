import {PublicKey} from '@solana/web3.js';
export const TEST_MINT='';
export const TEST_POOL='';
export const PUMP_PROGRAM='pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA';
export type ChainSale={id:string;signature:string;quoteAmount:number;side:'buy'|'sell';time:number;wallet:string};
// PumpSwap's published BuyEvent/SellEvent IDL. Only accept data emitted by the Pump program.
export function decodeTrades(logs:string[],signature:string,err:unknown):ChainSale[]{
 if(err||!Array.isArray(logs)||!signature)return [];const stack:string[]=[],out:ChainSale[]=[];
 for(const line of logs){const enter=line.match(/^Program (\w+) invoke \[/);if(enter){stack.push(enter[1]);continue;}if(/^Program \w+ (success|failed:)/.test(line)){stack.pop();continue;}if(stack.at(-1)!==PUMP_PROGRAM||!line.startsWith('Program data: '))continue;
 try{const b=Uint8Array.from(atob(line.slice(14)),c=>c.charCodeAt(0));if(b.length<184)continue;const isBuy=[103,244,82,31,44,245,119,119].every((n,i)=>b[i]===n),isSell=[62,47,55,10,165,3,220,42].every((n,i)=>b[i]===n);if(!isBuy&&!isSell)continue;if(new PublicKey(b.slice(120,152)).toBase58()!==TEST_POOL)continue;const d=new DataView(b.buffer),quoteAmount=Number(d.getBigUint64(112,true))/1e6,time=Number(d.getBigInt64(8,true))*1000;if(!Number.isFinite(quoteAmount)||quoteAmount<=0||!Number.isFinite(time))continue;out.push({id:signature+':'+out.length,signature,quoteAmount,side:isBuy?'buy':'sell',time,wallet:new PublicKey(b.slice(152,184)).toBase58()});}catch{/* Malformed or unrelated event. */}}
 return out;
}
export async function recentTrades(fetcher:typeof fetch=fetch,rpc='https://api.mainnet-beta.solana.com'){
 if(!TEST_MINT||!TEST_POOL)return {trades:[],checkedAt:Date.now(),partial:false,scope:'Awaiting launch',mint:''};
 async function call(method:string,params:unknown[]){const r=await fetcher(rpc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('RPC unavailable or rate limited');const j:any=await r.json();if(j.error)throw Error('RPC unavailable or rate limited');return j.result;}
 const sigs=await call('getSignaturesForAddress',[TEST_POOL,{limit:6,commitment:'confirmed'}]);const trades:ChainSale[]=[];let missing=0;
 for(const s of sigs){if(s.err)continue;try{const tx=await call('getTransaction',[s.signature,{encoding:'json',maxSupportedTransactionVersion:0,commitment:'confirmed'}]);if(!tx){missing++;continue;}trades.push(...decodeTrades(tx.meta?.logMessages,s.signature,tx.meta?.err));}catch{missing++;}}
 return {trades,checkedAt:Date.now(),partial:missing>0,scope:'PumpSwap Apu/PUMP',mint:TEST_MINT};
}
