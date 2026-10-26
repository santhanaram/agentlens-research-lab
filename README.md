# AgentLens Research Lab

Independent educational AI agent research dashboard built with Next.js. Not affiliated with RamDash or the referenced repositories.

## Features
- Curated agent concept directory with source repository links
- Five learning paths with practice activities
- Six illustrative business use cases with workflows, deliverables, metrics and risks
- Motion tool links and research resources
- Deployment guide
- Responsive black/red interface

## Start locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Deploy
1. Create a new GitHub repository called `agentlens-research-lab`.
2. Upload the contents of this folder (not the enclosing ZIP).
3. Import the repository at https://vercel.com/new.
4. Select Next.js and deploy. No API keys are required for this static educational dashboard.

## Important limitations
- Agent listings are educational categories and do not execute agents.
- Use cases are hypothetical designs, not tested implementations.
- Repository statistics from social media screenshots are deliberately omitted.
- External sources, project licenses and documentation must be checked before adoption.
- This project does not automatically fetch or verify live repository metadata.

## Research Intelligence Engine (v1.1)
The **Research Intelligence** tab fetches live public repository metadata through a Next.js server-side API route (`/api/repositories`). Features:
- Server-side GitHub REST API integration with a fixed allowlist and 1-hour cache
- Stars, forks, issue counts, reported license identifier, archived state and last push date
- Compare up to three repositories side by side
- Browser-local research notes (not synced across devices)
- Explicit source attribution, data timestamp and graceful API failure handling

For higher GitHub API limits, optionally configure `GITHUB_TOKEN` in Vercel's server-side environment variables. Never use `NEXT_PUBLIC_GITHUB_TOKEN` or commit tokens. No token is required for public repositories, but unauthenticated GitHub rate limits apply.

### Evidence limitations
Stars and forks are descriptive metadata, not evidence of safety or reliability. License identifiers are API-reported metadata, not legal review. No vulnerability scanning, automated security review, verified learning claims, or background monitoring is provided. The list is curated, not a comprehensive search index. The application does not store notes on a server.


## v1.2 Research Learning Studio

A new **Research Learning Studio** navigation tab provides a guided four-stage learning workflow: choose an open-source repository, select a corporate use case, manually complete a verification checklist, record findings, and download a Markdown research evaluation report. The report is generated locally in the browser and contains only user-entered research notes and clearly labelled illustrative use-case content. No external AI API is called for report generation.

The checklist percentage is a self-reported completion measure, not a repository trust score. A checked license item does not constitute legal advice or a license compliance audit.
