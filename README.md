# CollabDocs Gamified

CollabDocs Gamified is a hosted productivity application that turns task management into a progression loop. It combines a Kanban board, XP, levels, streaks, daily quests, badges, focus sessions, analytics, leaderboards, calendar scheduling, and AI-generated weekly reports into one experience designed to make consistent work feel visible and rewarding.

The application is built around a simple idea: productivity tools should not only store tasks, they should help users build momentum. Every completed task contributes to a broader system of progress, reflection, and accountability.

## Core Experience

Users begin from a personalized dashboard that summarizes the state of their day: current streak, longest streak, tasks completed today, available streak shields, streak tokens, today's tasks, and the major modules of the application. The dashboard acts as a command center rather than a static landing page. It gives users enough context to choose the next useful action without forcing them to dig through separate views.

The main modules are:

- Board & Tasks
- Pomodoro focus sessions
- Analytics
- Weekly leaderboard
- AI weekly reports
- Profile, quests, badges, and progression
- Settings and localization

Authentication is handled through traditional username/email login and Google OAuth. Sessions are backed by Redis tokens, which keeps the frontend simple while allowing the backend to validate requests quickly.

## Task Management

The Kanban board is the center of the product. Users can create tasks with:

- Title
- Description
- Priority
- Due date
- XP reward
- Status

Tasks move through three workflow states:

- `todo`
- `in-progress`
- `done`

The board supports drag-and-drop ordering through `@hello-pangea/dnd`. Reordering is persisted on the backend with a batch update so the visual board and stored task order remain aligned. This makes the board feel like a real workspace rather than a temporary UI projection.

Completing a task is also the main progression trigger. When a task moves into `done`, the backend records an XP event, updates the user's total XP, recalculates their level, refreshes daily quest progress, updates leaderboard state, records daily completion data, and evaluates badge unlocks.

This design keeps task completion as the single source of truth for progress. Instead of scattering gamification updates across the frontend, the backend owns the rules and returns the results.

## XP, Levels, and Progression

Each task can carry an XP reward. When completed, that XP is added to the user's total, recorded in `xp_events`, and mirrored into `xp_history` for analytics.

Levels are calculated from a `levels` table using XP thresholds. This makes level progression data-driven: the application can change or expand level rules without rewriting task logic.

The frontend makes progression tangible with:

- XP totals
- Level display
- Next-level progress bars
- Toast feedback for XP gains
- A level-up overlay when a user crosses a threshold

The result is a tight feedback loop: plan work, complete work, see progress, and return with more motivation.

## Streaks and Streak Shields

Streaks reward consistency. Completing the first task of a day records a daily completion and increments the user's current streak. The longest streak is updated when the current streak passes the previous record.

A scheduled streak job runs daily and checks whether users completed work on the previous day. If a user missed a day, the backend either:

- Consumes one streak shield and preserves the streak
- Resets the streak to zero if no shield is available

Streak shields are purchased with streak tokens. Tokens are earned through positive XP events, which means users can protect their long-term consistency by staying active over time. This is a forgiving design choice: it keeps streaks motivating without making the product feel punitive after a single missed day.

Timezone support is included so streak evaluation can match the user's local day rather than relying only on the server's default clock.

## Daily Quests

Daily quests provide short-term challenges on top of regular task completion. The quest generator creates personalized quests based on recent activity and current state.

Quest examples include:

- Completing a target number of tasks
- Earning a level-scaled amount of XP
- Completing a pending high-priority task

The quest engine uses recent completion averages, user level, and pending high-priority tasks to decide what to generate. This avoids one-size-fits-all goals. A lighter user gets a reachable warm-up, while a more active user gets a stronger push.

Quest progress is refreshed after task completion and again when quests are fetched. When a quest objective is met, the user can claim bonus XP. Quest rewards also update total XP, streak tokens, levels, and the weekly leaderboard.

## Badges and Achievements

Badges represent milestone achievements. They are stored as rule-driven records in the database, with criteria such as:

- Complete the first task
- Complete 50 tasks
- Reach level 5
- Maintain 10, 50, or 100 day streaks

The badge evaluator checks the user's current level, total completed tasks, and streak state after meaningful progress events. Newly unlocked badges are attached to the user and surfaced in the profile view.

Badges include rarity tiers:

- Common
- Rare
- Epic
- Legendary

This gives the profile page a collectible quality without making the core workflow dependent on badges. The badge system rewards long-term behavior while staying secondary to real task completion.

## Profile

The profile page brings together the user's identity and progression state. It shows:

- Username
- Generated avatar
- Current level
- XP progress
- Earned badges
- Daily quests
- Claimable quest rewards

This view functions as the user's progress inventory. It is intentionally separate from the dashboard so the dashboard can remain action-oriented while the profile can focus on identity, status, and achievements.

## Pomodoro Focus Mode

The Pomodoro module provides a focused work timer with configurable focus and break lengths. Tasks can send users directly into focus mode, carrying the selected task title into the timer view.

The timer supports:

- Start and pause
- Reset
- Focus and break phases
- Custom focus duration
- Custom break duration
- Task-specific focus context

A lofi music player is also included. It fetches lofi tracks through the backend using the Jamendo API and provides playback controls for play, pause, skip, mute, and track display.

The design choice here is to make focus mode feel like part of the task system instead of a disconnected timer. A task can move from planning into execution with one click.

## Analytics

Analytics turns user activity into visible trends. The analytics view includes:

- Total tasks completed
- Total XP earned
- Most active day
- Tasks completed per day
- XP growth over time
- Most productive hours

Charts are rendered with Chart.js and adapt to light and dark themes. The backend aggregates data from daily completions, XP history, and completed task timestamps.

The analytics design focuses on practical reflection. Rather than showing vanity metrics only, it highlights patterns users can act on: which days they complete the most work, how their XP grows over time, and which hours are most productive.

## Weekly Leaderboard

The weekly leaderboard ranks users by XP. Redis sorted sets power the ranking so updates can be fast and reads can return top users efficiently.

The leaderboard displays:

- Top weekly performers
- Current leader
- Current user's rank
- Weekly XP totals

The product design uses competition as optional motivation. The leaderboard is available as a module, but it does not dominate the dashboard or interrupt personal workflows.

## AI Weekly Reports

AI weekly reports summarize the user's recent productivity. A scheduled report job runs every Monday at 08:00 and generates reports for all users. Users can also refresh reports manually from the weekly reports page.

Reports are generated from the last 7 days of activity, including:

- Completed task count
- Weekly XP
- Current streak
- Report window

The backend builds a prompt from these metrics and sends it to Gemini 2.5 Flash through `@google/generative-ai`. If the AI call fails or returns an empty response, the system falls back to a structured default report so the feature remains resilient.

Reports are stored in `weekly_reports` and displayed as a history, with the newest report shown first.

This design gives users a weekly coaching layer without making the core app dependent on external AI availability.

## Google Integrations

The app supports two Google-powered workflows.

Google sign-in allows users to authenticate with OAuth. If a Google account matches an existing email, the backend links that account. Otherwise, it creates a new user with a generated unique username.

Google Calendar integration allows users to connect calendar access and schedule newly created tasks. After creating a task, the app can prompt the user to add it to their primary Google Calendar.

Calendar tokens are stored on the user record, and the backend refreshes token details when Google provides updated credentials.

## Settings

Settings include:

- Light and dark mode
- Notification preference stored locally
- Timezone selection persisted to the backend

Theme state is managed with Zustand and applied across the interface. Timezone support is especially important because deadlines and streaks are day-based features; the user should not lose streak accuracy because of server-local time.

## Design Choices

### Backend-Owned Gamification

The backend owns XP, levels, streaks, quests, badges, and leaderboard updates. This is the right boundary because these are trust-sensitive systems. The frontend can provide immediate visual feedback, but the source of truth remains server-side.

### Event-Based Progress Tracking

XP changes are recorded as events rather than only as a total. This makes analytics, weekly reports, and future audit/debugging work much easier. The app can answer not only "how much XP does this user have?" but also "when did they earn it?"

### Redis for Fast Session and Ranking Data

Redis is used for session tokens and the weekly leaderboard. These are high-read, short-lived or fast-changing data types, which makes Redis a natural fit. Postgres remains the durable source for users, tasks, reports, badges, and historical records.

### Postgres for Durable Product State

Postgres stores the durable business data: users, tasks, completions, XP history, badges, quests, OAuth tokens, and reports. The schema is migration-based, which supports incremental feature growth without relying on one large initialization script.

### Scheduled Jobs for Time-Based Behavior

The app uses `node-cron` for time-based systems:

- Daily streak evaluation at midnight
- Daily quest generation at 06:00
- Weekly AI report generation Monday at 08:00

This keeps time-based work out of request handlers. Users should not need to load a page for background maintenance to happen.

### Resilient AI Layer

AI reports are useful, but they should not become a single point of failure. The report generator includes a fallback response if Gemini is unavailable. That means the product can still provide weekly reflection even during external API failures.

### Hosted-First Frontend

The frontend is a Vite + React application using React Router for page navigation, Tailwind CSS for styling, Framer Motion for transitions, Chart.js for data visualization, and lucide-react for icons.

The UI is designed around clear modules rather than a marketing-style homepage. Users land in the product experience: dashboard, board, focus, analytics, profile, and reports.

### Light/Dark Visual System

The interface supports light and dark themes throughout. Color is used semantically:

- Indigo for primary productivity actions
- Emerald for completion and growth
- Amber for XP, rewards, and leaderboard emphasis
- Rose/red for risk or destructive states
- Cyan for shields and AI report surfaces

The goal is to make the app feel energetic without letting decoration overpower the workflow.

## Application Architecture

### Frontend

- React 19
- Vite
- TypeScript
- React Router
- Tailwind CSS
- Zustand
- Framer Motion
- Chart.js
- Axios
- React Hot Toast
- lucide-react
- `@hello-pangea/dnd`

### Backend

- Node.js
- Express 5
- TypeScript
- PostgreSQL
- Redis
- Zod validation
- bcrypt password hashing
- Google OAuth
- Google Calendar API
- Gemini API
- node-cron scheduled jobs

### Key Backend Routes

- `/register` and `/login` for password authentication
- `/auth/google` and `/auth/google/callback` for Google OAuth
- `/tasks` for task CRUD, status updates, and board ordering
- `/users/me/dashboard` for dashboard data
- `/users/me/xp` for XP and level data
- `/users/buy-shield` for streak shield purchases
- `/quests/today` and `/quests/:id/complete` for daily quest workflows
- `/badges/me` for earned badges
- `/leaderboard/weekly` for weekly XP ranking
- `/analytics/overview` for charts and productivity summaries
- `/reports/history` and `/reports/generate-test` for AI reports
- `/calendar/auth`, `/calendar/status`, and `/calendar/events` for calendar integration
- `/music/lofi` for focus music

## Data Model Highlights

The app's data model is built around a few important concepts:

- Users have XP, levels, streaks, streak tokens, streak shields, timezone, and OAuth data.
- Tasks belong to users and include status, priority, position, due date, and XP reward.
- XP events record individual gains or reversals.
- XP history stores total XP snapshots for charting.
- Daily completions track task count per user per date.
- Daily quests store generated objectives and claim status.
- Badges define achievement rules, while user badges store unlocks.
- Weekly reports store AI-generated summaries.

This structure separates current state from historical activity, which keeps dashboard queries fast while preserving enough history for analytics and reports.

## Product Philosophy

CollabDocs Gamified is designed for people who benefit from visible momentum. It does not try to replace discipline with points; it uses points, streaks, quests, and reflection to make discipline easier to return to.

The application favors:

- Small daily wins over overwhelming plans
- Progress visibility over hidden effort
- Forgiving streak mechanics over harsh resets
- Personal reflection alongside friendly competition
- Server-side rules for reliable progression
- Modular workflows that can be used independently

The result is a productivity app that feels more alive than a checklist while still respecting the seriousness of getting work done.
