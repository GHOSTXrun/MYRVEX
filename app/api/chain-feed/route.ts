import {recentTrades} from '@/lib/chain-feed';
import {runtime} from '@/lib/colony';
export const dynamic='force-dynamic';
let cache:any=null,pending:Promise<any>|null=null;
export async function GET(){try{if(!cache||Date.now()-cache.checkedAt>20000){if(!pending)pending=recentTrades(fetch,runtime().SOLANA_RPC_URL||undefined).then(v=>{cache=v;return v}).finally(()=>pending=null);await pending;}return Response.json(cache,{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Transaction feed unavailable. Retrying; no simulated trades are substituted.',trades:[]},{status:503});}}
