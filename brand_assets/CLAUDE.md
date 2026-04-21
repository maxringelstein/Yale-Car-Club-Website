# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Project
Building a website for **Yale Car Club (YCAR)** — Yale's premier student-run automotive community.

## Brand
- Primary Color: #00356B (Yale Blue)
- Secondary: #FFFFFF (White)
- Accent: #1a1a1a (Near Black)
- Logo: brand_assets/Logo.png (circular badge, Yale blue, Ferrari F40 illustration, "Student Run")
- Tone: Prestigious, sleek, automotive — but inclusive and student-energy
- Instagram: @yalecarclub

## About YCAR
YCAR is Yale's premier automotive community for enthusiasts of all kinds. Mission: bring together students, alumni, and industry leaders who share a passion for the art, design, and engineering of automobiles. Inclusive — no prior automotive experience required.

## Leadership
- President: Max Ringelstein
- Vice President: Ezra Zbar
- Treasurer: Henry Wykoff
- Co-Head of Media: Wyatt Lake
- Co-Head of Media: Aiden Tumminello

## Membership
- ~40-50 interested members
- Join by attending an event and joining the Slack
- Open to all Yale students

## Pages Needed
1. **Homepage** — hero, mission statement, highlights
2. **Events** — upcoming and past events
3. **About** — mission, team/leadership
4. **Join** — how to become a member, contact

## Key Events
**Upcoming 2026-27:**
- Cars & Coffee at Yale — Sep 6, 2026, 11am-2pm, Hillhouse Ave (30 cars, Red Bull, local coffee)
- Greenwich Cars & Coffee — Sep 28, 2026
- Larz Anderson Auto Museum — Oct 2026
- F1 Watch Parties — Silliflicks, throughout the year
- New York Cars & Coffee — Feb 2027
- Moda Miami — Feb 2027
- Yale Car Show — April 2027 (major event, awards, merch, magazines)

**Past Events:**
- NYC Cars & Coffee Opener — Feb 8, 2026
- Moda Miami — Feb 26-29, 2026 (connected with Head of Collectible Cars at RM Sotheby's)

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- If the server is already running, do not start a second instance.

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN
- Mobile-first responsive

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette. Use Yale Blue (#00356B) and derive from it.
- **Shadows:** Use layered, color-tinted shadows with low opacity.
- **Typography:** Pair a display/serif with a clean sans. Tight tracking on headings, generous line-height on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter.
- **Animations:** Only animate transform and opacity. Never transition-all.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states.
- **Spacing:** Intentional, consistent spacing tokens.

## Hard Rules
- Do not use transition-all
- Do not use default Tailwind blue/indigo as primary color
- Always use #00356B as brand primary

## Photo Organization
- brand_assets/events/moda_miami/ — photos from Moda Miami, Feb 26-29 2026
- brand_assets/events/nyc_cars_coffee/ — photos from NYC Cars & Coffee, Feb 8 2026
- brand_assets/events/cars_coffee_yale/ — photos for upcoming Cars & Coffee at Yale
- brand_assets/ (root) — general/misc car photos