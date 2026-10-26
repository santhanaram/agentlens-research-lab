'use client';
import {useEffect,useMemo,useState} from 'react';
import {Search,Copy,Download,ExternalLink,FileText,Link2,Sparkles,Package,Check,BookOpen} from 'lucide-react';
import {resources,kits,categories,repoUrl,readmeUrl,type Resource} from './data/resources';

type UrlMode='repo'|'docs'|'readme'|'all';
const urlModes:[UrlMode,string][]=[['repo','GitHub repository pages'],['docs','Official documentation sites'],['readme','Raw README files'],['all','Repository + documentation']];
const STORE='agentlens-notebooklm';

function urlsFor(r:Resource,mode:UrlMode){
 if(mode==='repo') return [repoUrl(r)||r.docs||''];
 if(mode==='docs') return [r.docs||repoUrl(r)];
 if(mode==='readme') return [readmeUrl(r)||r.docs||''];
 return [repoUrl(r),r.docs||''];
}
function download(name:string,text:string,type='text/markdown'){
 const url=URL.createObjectURL(new Blob([text],{type:`${type};charset=utf-8`}));
 const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);
}
function sourceBrief(title:string,goal:string,items:Resource[]){
 const date=new Date().toISOString().slice(0,10);
 const byCat=categories.map(c=>[c,items.filter(r=>r.category===c)] as const).filter(([,l])=>l.length);
 return `# ${title}\n\nPrepared with AgentLens Research Lab on ${date}.\n\n## Research goal\n${goal}\n\n## How to use this source\nThis brief is a curated index for NotebookLM. It summarises ${items.length} open-source resources in AgentLens's own words and links to the original sources. Treat summaries as starting points, and check each project's README, licence and documentation (add them as separate sources) before drawing conclusions.\n\n## Resources at a glance\n\n| Resource | Category | Level | Best used for |\n| --- | --- | --- | --- |\n${items.map(r=>`| ${r.name} | ${r.category} | ${r.level} | ${r.useFor} |`).join('\n')}\n${byCat.map(([c,list])=>`\n## ${c}\n${list.map(r=>`\n### ${r.name}\n${r.desc}\n\n- Best used for: ${r.useFor}\n- Level: ${r.level}\n- Tags: ${r.tags.join(', ')}\n${r.repo?`- Repository: ${repoUrl(r)}\n`:''}${r.docs?`- Documentation: ${r.docs}\n`:''}`).join('')}`).join('')}\n## Evaluation criteria to apply\n- Capabilities: what can it do out of the box?\n- Maturity: release history, maintenance activity, community.\n- Usability: setup effort, documentation quality, learning curve.\n- Cost: licence terms, hosting and model costs.\n- Security: data handling, permissions, sandboxing, human approval.\n- Implementation complexity: skills and infrastructure needed.\n\n## Questions for this notebook\n${items.slice(0,6).map(r=>`- What problem does ${r.name} solve, and what are its stated limitations?`).join('\n')}\n- Which of these resources best fits the research goal, and why?\n- What would a two-week pilot look like, and how would success be measured?\n\n_Disclaimer: educational research index. No security audit, licence determination or performance testing was performed by AgentLens._\n`;
}
function promptsFor(title:string,goal:string,items:Resource[]){
 const names=items.map(r=>r.name).join(', ');
 return [
  ['Briefing doc','Chat',`Using only these sources, write a briefing on "${title}". Goal: ${goal} For each of ${names}, cover purpose, key capabilities, setup requirements and stated limitations. Cite the source for every claim.`],
  ['Comparison table','Chat',`Create a comparison table of ${names} across: primary use case, programming language, licence (as stated in the source), deployment options, documentation quality and learning curve. Mark anything the sources do not state as "Not stated".`],
  ['Pick a pilot','Chat',`Based on the sources, which one or two options best fit this goal: ${goal} Explain the trade-offs, list what still needs verification, and outline a two-week pilot with success measures.`],
  ['Beginner explainer','Chat',`Explain the core concepts behind these resources to a non-technical professional, using one workplace example. Define every technical term the first time it appears.`],
  ['Audio Overview focus','Audio Overview → Customize',`Focus on practical adoption for a corporate learning audience. Contrast ${items.slice(0,3).map(r=>r.name).join(', ')}${items.length>3?' and the others':''}, discuss risks and human oversight, and end with three concrete next steps.`],
  ['Study guide & quiz','Chat',`Create a study guide for "${title}" with key terms, five short-answer questions and five multiple-choice questions with an answer key, all grounded in the sources.`],
  ['Gaps & red flags','Chat',`What important questions about security, data privacy, licensing or maintenance are NOT answered by these sources? List them as a verification checklist.`]
 ] as const;
}

export default function NotebookLMHub(){
 const [selected,setSelected]=useState<string[]>(kits[0].ids);
 const [title,setTitle]=useState(kits[0].title);
 const [goal,setGoal]=useState(kits[0].goal);
 const [mode,setMode]=useState<UrlMode>('repo');
 const [q,setQ]=useState('');const [cat,setCat]=useState('All');const [level,setLevel]=useState('All');
 const [onlySel,setOnlySel]=useState(false);const [copied,setCopied]=useState('');const [ready,setReady]=useState(false);
 useEffect(()=>{try{const s=JSON.parse(localStorage.getItem(STORE)||'null');if(s){setSelected(s.selected||[]);setTitle(s.title||'');setGoal(s.goal||'');setMode(s.mode||'repo')}}catch{};setReady(true)},[]);
 useEffect(()=>{if(!ready)return;try{localStorage.setItem(STORE,JSON.stringify({selected,title,goal,mode}))}catch{}},[ready,selected,title,goal,mode]);

 const items=useMemo(()=>resources.filter(r=>selected.includes(r.id)),[selected]);
 const shown=resources.filter(r=>(!onlySel||selected.includes(r.id))&&(cat==='All'||r.category===cat)&&(level==='All'||r.level===level)&&(r.name+' '+r.desc+' '+r.tags.join(' ')).toLowerCase().includes(q.toLowerCase()));
 const urls=[...new Set(items.flatMap(r=>urlsFor(r,mode)).filter(Boolean))];
 const notebookTitle=title||'My AgentLens notebook';const notebookGoal=goal||'Explore and evaluate these resources.';
 const prompts=promptsFor(notebookTitle,notebookGoal,items);
 const repoIds=items.filter(r=>r.repo).map(r=>r.id);

 function toggle(id:string){setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id])}
 function loadKit(id:string){const k=kits.find(k=>k.id===id);if(k){setSelected(k.ids);setTitle(k.title);setGoal(k.goal)}}
 async function copy(key:string,text:string){
  try{await navigator.clipboard.writeText(text)}catch{const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}
  setCopied(key);setTimeout(()=>setCopied(c=>c===key?'':c),1800);
 }
 const slug=notebookTitle.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'notebook';

 return <>
  <p className="intro">Turn AgentLens research into a NotebookLM notebook. Pick a ready-made kit or build your own source list, then copy the URLs, download a source brief or README pack, and use the prompt pack to get grounded answers, study guides and Audio Overviews.</p>

  <div className="nlm-flow">{[['01','Choose sources','Start from a kit or tick resources in the catalogue.'],['02','Export a pack','Copy URLs or download Markdown files.'],['03','Add to NotebookLM','Create a notebook, then Add source → Website or Upload.'],['04','Ask & verify','Use the prompts and check every citation.']].map(([n,t,d])=><div key={n}><b>{n}</b><strong>{t}</strong><span>{d}</span></div>)}</div>

  <div className="sectiontitle"><h3>Notebook kits</h3><span className="nlm-muted">{kits.length} themed bundles, each sized for one notebook</span></div>
  <div className="nlm-kits">{kits.map(k=><button key={k.id} className={title===k.title?'active':''} onClick={()=>loadKit(k.id)}><Package size={18}/><strong>{k.title}</strong><span>{k.goal}</span><small>{k.ids.length} sources</small></button>)}</div>

  <div className="nlm-layout">
   <section>
    <div className="sectiontitle"><h3>Resource catalogue</h3><span className="nlm-muted">{selected.length} of {resources.length} selected</span></div>
    <div className="toolbar"><div className="search"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search tools, frameworks, tags"/></div><select value={cat} onChange={e=>setCat(e.target.value)}>{['All',...categories].map(c=><option key={c}>{c}</option>)}</select><select value={level} onChange={e=>setLevel(e.target.value)}>{['All','Beginner','Intermediate','Advanced'].map(c=><option key={c}>{c}</option>)}</select></div>
    <div className="nlm-bulk"><button onClick={()=>setSelected(s=>[...new Set([...s,...shown.map(r=>r.id)])])}>Select all shown</button><button onClick={()=>setSelected([])}>Clear selection</button><button className={onlySel?'on':''} onClick={()=>setOnlySel(v=>!v)}>{onlySel?'Show all':'Show selected only'}</button></div>
    <div className="nlm-list">{shown.map(r=><label key={r.id} className={selected.includes(r.id)?'on':''}>
     <input type="checkbox" checked={selected.includes(r.id)} onChange={()=>toggle(r.id)}/>
     <div><small>{r.category} · {r.level}</small><strong>{r.name}</strong><p>{r.desc}</p><p className="nlm-use"><b>Use for:</b> {r.useFor}</p>
      <div className="nlm-links">{r.repo&&<a href={repoUrl(r)} target="_blank" rel="noreferrer">GitHub <ExternalLink size={12}/></a>}{r.docs&&<a href={r.docs} target="_blank" rel="noreferrer">Docs <ExternalLink size={12}/></a>}{r.tags.map(t=><span key={t}>#{t}</span>)}</div></div>
    </label>)}{!shown.length&&<p className="nlm-muted">No resources match these filters.</p>}</div>
   </section>

   <section className="nlm-pack">
    <span className="eyebrow">NOTEBOOK PACK</span>
    <label>Notebook title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Agent Frameworks 101"/></label>
    <label>Research goal<textarea rows={3} value={goal} onChange={e=>setGoal(e.target.value)} placeholder="What should this notebook help you decide or learn?"/></label>
    <div className="nlm-chips">{items.map(r=><button key={r.id} onClick={()=>toggle(r.id)} title="Remove from pack">{r.name} ×</button>)}</div>
    {!items.length?<p className="nlm-muted">Select at least one resource to build a pack.</p>:<>
     <div className="nlm-block"><h4><Link2 size={16}/> Website sources</h4>
      <label>URL type<select value={mode} onChange={e=>setMode(e.target.value as UrlMode)}>{urlModes.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
      <textarea readOnly rows={Math.min(8,urls.length+1)} value={urls.join('\n')}/>
      <button className="primary" onClick={()=>copy('urls',urls.join('\n'))}>{copied==='urls'?<Check size={16}/>:<Copy size={16}/>} {copied==='urls'?'Copied':'Copy'} {urls.length} URLs</button>
      <p className="nlm-hint">In NotebookLM choose Add source → Website and paste the links. If your version accepts one link at a time, add them individually. Raw README links give NotebookLM clean text without GitHub page navigation.</p>
     </div>
     <div className="nlm-block"><h4><FileText size={16}/> Upload-ready documents</h4>
      <button className="studio-download" onClick={()=>download(`${slug}-source-brief.md`,sourceBrief(notebookTitle,notebookGoal,items))}><Download size={15}/> Source brief (.md)</button>
      <p className="nlm-hint">An index of the selected resources with summaries, links, evaluation criteria and research questions.</p>
      {repoIds.length>0&&<><a className="studio-download" href={`/api/notebooklm/readme-pack?ids=${repoIds.join(',')}`}><Download size={15}/> README pack (.md, {repoIds.length} repos)</a>
      <p className="nlm-hint">Fetches the current README of each repository from GitHub and combines them into one file, so one upload covers every project.</p></>}
     </div>
     <div className="nlm-block"><h4><Sparkles size={16}/> Prompt pack</h4>
      {prompts.map(([name,where,text])=><div className="nlm-prompt" key={name}><div><strong>{name}</strong><small>{where}</small></div><p>{text}</p><button onClick={()=>copy(name,text)}>{copied===name?<Check size={14}/>:<Copy size={14}/>} {copied===name?'Copied':'Copy'}</button></div>)}
      <button className="studio-download" onClick={()=>download(`${slug}-prompts.md`,`# NotebookLM prompts: ${notebookTitle}\n\n${prompts.map(([n,w,t])=>`## ${n} (${w})\n\n${t}\n`).join('\n')}`)}><Download size={15}/> Download all prompts</button>
     </div>
     <a className="primary nlm-open" href="https://notebooklm.google.com/" target="_blank" rel="noreferrer"><BookOpen size={16}/> Open NotebookLM <ExternalLink size={14}/></a>
    </>}
   </section>
  </div>

  <section className="repository"><Download/><div><h3>Full catalogue exports</h3><p>The whole catalogue as CSV (for Google Sheets, which NotebookLM can use via Google Drive) or JSON (for other tools and integrations).</p></div><div className="nlm-exports"><a href="/api/resources?format=csv">CSV ↓</a><a href="/api/resources" target="_blank" rel="noreferrer">JSON ↗</a></div></section>
 </>;
}
