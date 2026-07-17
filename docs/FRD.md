# Functional Requirement Document (FRD) — SyncBoard

**Project:** SyncBoard — Real-Time Project Management System
**Version:** 1.0
**Status:** Approved for build

---

## 1. Purpose

SyncBoard is a lightweight, multi-user project management tool that lets teams organize work into **Projects**, break work down into **Tasks** on a **Kanban board**, and see changes made by teammates **instantly**, without refreshing the page.

## 2. Core Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Authentication** | Email/password registration and login. JWT access + refresh tokens. Logout revokes the refresh token (blacklisted in Redis). |
| 2 | **User Profile** | View current logged-in user's profile (name, email, role). |
| 3 | **Project Management** | Create, view, update, delete projects. Each project has a name, description, status (`planning`, `active`, `on_hold`, `completed`, `archived`), start/end date, an owner, and a list of members. |
| 4 | **Member Assignment** | Admin adds/removes members on a project so they can see and work on it. |
| 5 | **Task Management** | Create, view, update, delete tasks inside a project. Each task has a title, description, status (`todo`, `in_progress`, `done`), priority (`low`, `medium`, `high`), and an assignee. |
| 6 | **Kanban Board** | Drag-and-drop tasks across `To Do → In Progress → Done` columns. Status change is persisted immediately. |
| 7 | **My Tasks View** | A cross-project list of every task assigned to / created by the logged-in user. |
| 8 | **Real-Time Collaboration** | Task create/update/move/delete events are pushed live to every teammate currently viewing the same project board (no manual refresh). Live "who's viewing" presence indicator. |
| 9 | **Notifications (toast)** | Success/error feedback for every action (API errors, validation errors, socket reconnects). |
| 10 | **Audit Trail (lightweight)** | Every task stores `createdBy` and `lastUpdatedBy` so teams know who last touched a task. |

## 3. User Roles & Permissions

SyncBoard uses two roles, enforced both by API middleware (`authorize()`) and by hiding/disabling UI actions on the frontend.

| Capability | **Admin** | **Member (user)** |
|---|---|---|
| Register / Login / Logout | ✅ | ✅ |
| View projects they belong to | ✅ | ✅ |
| Create a project | ✅ | ❌ |
| Update / delete a project | ✅ (any project they own) | ❌ |
| Add / remove project members | ✅ | ❌ |
| View tasks in their projects | ✅ | ✅ |
| Create a task in a project they belong to | ✅ | ✅ |
| Update any task in a project they belong to (status, details) | ✅ | ✅ |
| Delete a task | ✅ (any task) | ✅ (only tasks **they created**) |
| Receive real-time updates for a project | ✅ (joined projects) | ✅ (joined projects) |

**Access rule:** a user (admin or member) can only see/act on projects where they are the `owner` or listed in `members`. This is enforced server-side on every project/task query, not just hidden in the UI.

## 4. Assumptions

- A project has **exactly one owner** (the admin who created it); ownership is not transferable in v1.
- Only users with role `admin` can create projects; there is no per-project "admin" role — role is global to the user account, seeded/assigned at the account level.
- A single user account can belong to multiple projects, and a project can have multiple members.
- Users are provisioned by self-registration (no invite-by-email flow in v1); an admin adds an existing registered user to a project by picking them from the user list.
- One MongoDB database and one Redis instance are sufficient for the target scale (small-to-mid sized teams, not a multi-tenant SaaS in v1).
- The frontend and API are trusted to run behind HTTPS in production; JWT is passed via `Authorization: Bearer` header (access token) with refresh handled transparently by an Axios interceptor.
- Real-time delivery is "best effort" — if a client is offline when an event fires, it will simply fetch the latest state next time it loads the board (no offline event queue/replay in v1).

## 5. Out-of-Scope (v1)

- File/attachment uploads on tasks.
- Comments/threaded discussion on tasks.
- Sub-tasks, dependencies, or Gantt/timeline views.
- Email or push notifications (in-app toast only).
- Third-party integrations (Slack, GitHub, calendar sync, etc.).
- Multi-tenant organizations / workspaces (billing, SSO, custom domains).
- Granular per-project custom roles or permission overrides.
- Mobile native apps (web is responsive but no dedicated iOS/Android app).
- Full audit log / activity history feed (only "last updated by" is tracked, not a full change history).
- Offline-first support / conflict resolution for concurrent edits (last write wins).
