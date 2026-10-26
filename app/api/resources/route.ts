import {NextResponse} from 'next/server';
import {resources,kits,categories,repoUrl,readmeUrl} from '../../data/resources';
// Public, read-only catalogue. ?format=csv returns a spreadsheet-friendly export.
export async function GET(request:Request){
 const format=new URL(request.url).searchParams.get('format');
 const rows=resources.map(r=>({...r,repoUrl:repoUrl(r),readmeUrl:readmeUrl(r)}));
 if(format==='csv'){
  const cols=['name','category','level','desc','useFor','repoUrl','docs','readmeUrl','tags'] as const;
  const esc=(v:unknown)=>`"${String(Array.isArray(v)?v.join('; '):v??'').replace(/"/g,'""')}"`;
  const csv=[cols.join(','),...rows.map(r=>cols.map(c=>esc((r as Record<string,unknown>)[c])).join(','))].join('\n');
  return new NextResponse(csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="agentlens-resources.csv"'}});
 }
 return NextResponse.json({name:'AgentLens resource catalogue',count:rows.length,categories,kits,resources:rows});
}
