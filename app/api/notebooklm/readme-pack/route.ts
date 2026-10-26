import {NextResponse} from 'next/server';
import {resources,readmeUrl,repoUrl} from '../../../data/resources';
export const revalidate=86400;
const MAX_IDS=25, MAX_CHARS=80000;
// Builds one Markdown document from the README files of selected catalogue repositories,
// ready to upload to NotebookLM as a single source. Only catalogue entries can be requested.
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;
 const ids=(params.get('ids')||'').split(',').filter(Boolean).slice(0,MAX_IDS);
 const chosen=resources.filter(r=>r.repo&&ids.includes(r.id));
 if(!chosen.length) return NextResponse.json({error:'Choose at least one catalogue resource with a GitHub repository.'},{status:400});
 const parts=await Promise.all(chosen.map(async r=>{
  let body='';
  try{const res=await fetch(readmeUrl(r),{next:{revalidate}});body=res.ok?await res.text():`_README unavailable (HTTP ${res.status}). Open the repository directly._`}
  catch{body='_README request failed. Open the repository directly._'}
  const cut=body.length>MAX_CHARS;
  return `\n\n---\n\n# ${r.name}\n\n- Repository: ${repoUrl(r)}\n- Category: ${r.category} · Level: ${r.level}\n${r.docs?`- Documentation: ${r.docs}\n`:''}- AgentLens summary: ${r.desc}\n\n## README (retrieved ${new Date().toISOString().slice(0,10)})\n\n${cut?body.slice(0,MAX_CHARS)+'\n\n_[Truncated by AgentLens. See the repository for the full README.]_':body}`;
 }));
 const doc=`# AgentLens README Pack\n\nSource documents for NotebookLM. Each section reproduces a public README from GitHub, unedited apart from truncation. Licences, claims and setup steps belong to the original projects; verify before adoption.\n\nIncluded: ${chosen.map(r=>r.name).join(', ')}${parts.join('')}\n`;
 return new NextResponse(doc,{headers:{'Content-Type':'text/markdown; charset=utf-8','Content-Disposition':'attachment; filename="agentlens-readme-pack.md"','Cache-Control':'public, s-maxage=86400, stale-while-revalidate=86400'}});
}
