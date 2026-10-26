import {NextResponse} from 'next/server';
export const revalidate = 3600;
const allowlist = ['Shubhamsaboo/awesome-llm-apps','google-ai-edge/mediapipe','CMU-Perceptual-Computing-Lab/openpose','open-mmlab/mmpose','facebookresearch/VideoPose3D','wham-wham/WHAM','shubham-goel/4D-Humans','zju3dv/EasyMocap'];
type Repo = {full_name:string;html_url:string;description:string|null;stargazers_count:number;forks_count:number;open_issues_count:number;updated_at:string;pushed_at:string;license:{spdx_id:string}|null;archived:boolean;default_branch:string};
export async function GET(){
 const headers:Record<string,string>={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
 if(process.env.GITHUB_TOKEN) headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;
 const results=await Promise.all(allowlist.map(async name=>{
  try {const response=await fetch(`https://api.github.com/repos/${name}`,{headers,next:{revalidate:3600}});
   if(!response.ok) return {name,error:response.status===403?'GitHub rate limit or access restriction':`GitHub HTTP ${response.status}`};
   const data=await response.json() as Repo;
   return {name:data.full_name,url:data.html_url,description:data.description,stars:data.stargazers_count,forks:data.forks_count,issues:data.open_issues_count,updatedAt:data.updated_at,pushedAt:data.pushed_at,license:data.license?.spdx_id??'Not declared',archived:data.archived,branch:data.default_branch};
  } catch {return {name,error:'GitHub request unavailable'};}
 }));
 return NextResponse.json({source:'GitHub REST API',retrievedAt:new Date().toISOString(),repositories:results},{headers:{'Cache-Control':'public, s-maxage=3600, stale-while-revalidate=3600'}});
}
