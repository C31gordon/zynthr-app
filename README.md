# Milliebot Command Center

**Enterprise AI Agent Orchestration Platform**
Built by Ardexa | Powered by RKBAC™

## What This Is

A multi-tenant AI agent management platform with:
- **RKBAC™** — Roles & Knowledge-Based Access Control (4-tier hierarchy)
- **9 Views** — Dashboard, Agents, Chat, Tickets, Suggestions, Workflows, Policies, Audit, Settings
- **Smart Chat** — "I wish..." → suggestion, "I need..." → ticket, "Build me..." → planning mode
- **Ticket Bubbling** — Similar tickets auto-grouped as patterns
- **Exception Waivers** — Time-limited policy overrides with expiration tracking
- **Full Audit Trail** — Every action logged with severity, actor, IP, resource
- **Dark Glassmorphism UI** — Polished design system

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript, Tailwind CSS)
- **Database:** Supabase (PostgreSQL + RLS + Real-time)
- **Auth:** Microsoft SSO, Google SSO, Email/Password
- **Deploy:** Vercel

## Deploy to Vercel (One Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/C31gordon/milliebot-app&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20project%20credentials&project-name=milliebot-command-center)

### Manual Deploy

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub (`C31gordon`)
2. Click **"Add New Project"** → Import `milliebot-app`
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://nqheduewmpomsvnzjtlc.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_gpQOatHBxFiW4uaFT8E5_A_0cze2Lla`
4. Click **Deploy**

That's it. Every push to `main` auto-deploys.

## Database

Schema: `supabase-schema.sql` (22 tables, RLS, seed data for RISE)

### Seed Data
- **Tenant:** RISE Real Estate (enterprise plan)
- **Departments:** Operations, Marketing, HR, Finance, IT, Training, Maintenance
- **Roles:** 12 (COO/Owner → Department Heads → Regional VP → Specialists)
- **Data Categories:** 8 sensitivity levels
- **RKBAC Policies:** 4 default access rules

## Architecture

```
Owner (Immutable Rules)
  └── Department Head (Sandboxed Policies)
       └── Manager (Team Scope)
            └── Specialist (Task Scope)

Memory: Flows UP freely, DOWN with permission
Access: Source system permissions = floor, RKBAC = ceiling
```

### Shared Agents (Template + Instance Pattern)

```
Owner configures TEMPLATES (tenant-level)
  ├── Research Agent ─────► Instance per department (RKBAC-scoped)
  ├── Compliance Agent ──► Single interpretation, all departments query
  ├── Security Agent ────► Owner + IT only
  └── Reporting Agent ───► Standardized KPIs, all departments query

Each instance:
  • Inherits template config (prompt, model, capabilities)
  • Has department-scoped memory partition
  • Respects RKBAC for data access
  • Can override settings per department need
  • Auto-spawns on first query at scale
```

**Shared agents** (Research, Compliance, Security, Reporting) serve the whole org from tenant-level. **Department agents** handle specialized workflows (leasing, maintenance, HR onboarding). Owner configures once, departments benefit without setup.

## License

Proprietary — Ardexa © 2026
