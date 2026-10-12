# Sentient — Brand Sentiment Analysis

**Sentient** is a functional frontend prototype for a SaaS platform that helps teams explore how brands are represented in search engine results. It brings brand configuration, search tasks, analysis runs, and URL-level sentiment results into one workflow.

> **Project status:** Frontend prototype with simulated data and a mock API layer. It is not connected to a production backend, and sentiment results shown in the demo are not live analyses.

## What it does

- **Brand management:** Organize analysis workflows by brand.
- **Task configuration:** Define and manage search tasks for each brand.
- **Dashboard:** Browse brand-specific tasks, processing states, and sentiment summaries.
- **Runs:** Create runs from available tasks, execute immediately or configure a scheduled run in the simulated workflow.
- **Results:** Review run status and inspect sentiment information at the task and URL level.
- **Account and access flows:** Explore login, account, and role-based navigation in the prototype.

## Technology

- **Next.js 16** with the App Router
- **React 19** and **TypeScript**
- **Tailwind CSS 4** and **shadcn/ui / Radix UI**
- **TanStack Query** for asynchronous state and cache management
- **React Hook Form**, **Zod**, and other supporting UI libraries

## Architecture

The codebase separates route definitions, feature implementation, reusable components, and data access:

```text
src/
├── app/                 # Next.js routes, layouts, providers
├── features/            # Feature-specific screens, components, API adapters
├── components/
│   ├── shared/          # Reusable product-level UI
│   └── ui/              # UI primitives
├── lib/
│   ├── api/             # Mock API and simulated data operations
│   └── mocks/           # Prototype datasets
└── types/               # Shared TypeScript models
```

Feature-level API modules (for example, `features/runs/api/runs-api.ts`) provide an interface between screens and the simulated data layer in `lib/api/mock-db.ts`. This allows frontend flows to be explored independently of backend integration.

## Run locally

**Prerequisite:** A recent Node.js version compatible with Next.js 16.

```bash
git clone https://github.com/majraL/sentient-frontend.git
cd sentient-frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

Other available scripts:

```bash
npm run build
npm run lint
```

These are the project's configured commands; a successful build or lint run is not claimed here.

## Development approach and my contribution

I worked on Sentient in collaboration with a backend engineer, focusing on **product flows, information architecture, interaction design, and iterative frontend development**.

The process began by defining core workflows and composing an initial interface from available shadcn/ui components. I then used the working application to evaluate usability, refine navigation and access to information, and specify changes to functionality and UI states.

**Codex was used extensively to generate and modify the React/TypeScript implementation.** My primary contribution was directing the implementation, testing flows in the browser, identifying issues, and iterating on the experience—not manually authoring the frontend code line by line.

## Current limitations

- API operations and analysis workflows are simulated using a local mock data layer.
- Authentication is a prototype flow, not a production identity system.
- Scheduling and sentiment processing do not represent live background jobs or live search analysis.
- Backend integration, production security, and deployment readiness remain future work.

---

*This repository documents an evolving product prototype and an AI-assisted design-to-frontend workflow.*
