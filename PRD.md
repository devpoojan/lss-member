# 📄 Product Requirements Document (PRD)

## શ્રી લાલાબાપા સેવા સમિતિ – સભ્ય માહિતી સિસ્ટમ
### Shri Lalabapa Seva Samiti – Member Information System

---

**Document Version:** 2.0  
**Date:** April 2026  
**Status:** Final – Ready for Development  
**Tech Stack:** React.js (Vite) · Firebase Auth · Firestore · Netlify / Cloudflare Pages  
**Changelog v2.0:** Added Dashboard Filters, Design System & Color Theme

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals & Non-Goals](#2-goals--non-goals)
3. [User Roles](#3-user-roles)
4. [Application Routes](#4-application-routes)
5. [Landing Page – `/`](#5-landing-page--)
6. [Public Form – `/join`](#6-public-form--join)
7. [Admin Authentication – `/pap/login`](#7-admin-authentication--paplogin)
8. [Admin Dashboard – `/pap`](#8-admin-dashboard--pap)
9. [Members List – `/pap/members`](#9-members-list--papmembers)
10. [Member Detail – `/pap/members/:id`](#10-member-detail--papmembersid)
11. [Field Manager – `/pap/fields`](#11-field-manager--papfields)
12. [Data Model (Firestore)](#12-data-model-firestore)
13. [Core Business Logic](#13-core-business-logic)
14. [Security & Access Control](#14-security--access-control)
15. [Performance Strategy](#15-performance-strategy)
16. [Error Handling & Edge Cases](#16-error-handling--edge-cases)
17. [Tech Stack & Architecture](#17-tech-stack--architecture)
18. [Cost Estimation](#18-cost-estimation)
19. [Excluded Features](#19-excluded-features)
20. [Development Phases](#20-development-phases)
21. [Design System & Color Theme](#21-design-system--color-theme)
22. [Open Questions](#22-open-questions)

---

## 1. Project Overview

**शी लालाबापा सेवा समिति** is a registered trust based in Vadaj, Ahmedabad.

This system is a **private, admin-controlled web application** designed to collect, store, and manage member data from the samaj community. The public can submit their information through a form; only the admin can view, manage, and export that data.

### Key Characteristics

- **Private by design** — no public member directory
- **Dynamic** — form fields are fully configurable by admin without code changes
- **Low-cost** — optimized for minimal Firestore usage
- **Gujarati-first UI** — public-facing content in Gujarati

---

## 2. Goals & Non-Goals

### ✅ Goals

| Goal | Description |
|------|-------------|
| Collect member data | Public form with multi-step flow |
| Store securely | Firestore with strict security rules |
| Admin management | View, edit, hide, tag, and export members |
| Dynamic fields | Admin can add/remove/reorder form fields |
| Audit trail | Log all admin actions |
| Notes system | Admin can annotate member records |

### ❌ Non-Goals

| Non-Goal | Reason |
|----------|--------|
| Public member directory | Privacy requirement |
| Photo / avatar upload | Out of scope |
| Member self-login portal | Not required |
| SMS / email notifications | Future scope |
| Multi-language toggle | Gujarati-first is sufficient |
| Payment / donation module | Out of scope |

---

## 3. User Roles

| Role | Access | Auth Required |
|------|--------|---------------|
| **Public User** | Landing page, `/join` form only | ❌ No |
| **Admin** | All `/pap/*` routes, full data access | ✅ Yes (Firebase Auth) |

> **Note:** There is no "editor" or "viewer" role in v1.0. All admin users have full access.

---

## 4. Application Routes

### Public Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing Page | Trust info + CTA button |
| `/join` | Public Form | Multi-step member submission form |

### Admin Routes (Protected)

| Route | Page | Auth Guard |
|-------|------|------------|
| `/pap/login` | Admin Login | Redirect to `/pap` if already logged in |
| `/pap` | Dashboard | ✅ Required |
| `/pap/members` | Members List | ✅ Required |
| `/pap/members/:id` | Member Detail | ✅ Required |
| `/pap/fields` | Field Manager | ✅ Required |

> All `/pap/*` routes must redirect unauthenticated users to `/pap/login`.

---

## 5. Landing Page – `/`

### Purpose
Establish trust identity and direct users to the form.

### Layout

```
┌─────────────────────────────────────┐
│           [TRUST LOGO]              │
│                                     │
│   શ્રી લાલાબાપા સેવા સમિતિ          │
│   (Shri Lalabapa Seva Samiti)       │
│                                     │
│   Trust Reg. No.: A/5366/Ahmedabad  │
│   વાડજ, અમદાવાદ                    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  માહિતી સર્વે ફોર્મ ભરવા   │    │
│  │     અહીં ક્લિક કરો         │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Requirements

- Fully responsive (mobile-first)
- CTA button navigates to `/join`
- No admin link visible on this page
- Lightweight — no heavy assets

---

## 6. Public Form – `/join`

### Purpose
Allow any community member to submit their information.

### Form Structure – Multi-Step (3 Steps)

---

#### Step 1 – Personal Information (મૂળ માહિતી)

| Field Key | Label (Gujarati) | Type | Required | Notes |
|-----------|-----------------|------|----------|-------|
| `name` | પૂરું નામ | Text | ✅ Yes | Min 2 chars |
| `phone` | મોબાઇલ નંબર | Number | ✅ Yes | 10-digit validation + duplicate check |
| `area` | વિસ્તાર / એરિયા | Text | ❌ No | |
| `dob` | જન્મ તારીખ | Date | ❌ No | |

#### Step 2 – Family Information (પારિવારિક માહિતી)

| Field Key | Label (Gujarati) | Type | Required | Notes |
|-----------|-----------------|------|----------|-------|
| `family_name` | કુટુંબ / અટક | Text | ❌ No | |
| `member_count` | પરિવારના સભ્ય | Number | ❌ No | Min 1 |
| `native` | વતન | Text | ❌ No | |

#### Step 3 – Professional & Address (વ્યવસાય અને સરનામું)

| Field Key | Label (Gujarati) | Type | Required | Notes |
|-----------|-----------------|------|----------|-------|
| `profession` | વ્યવસાય / ધંધો | Dropdown | ❌ No | Configurable options |
| `business_name` | ધંધાનું નામ | Text | ❌ No | |
| `address` | સંપૂર્ણ સરનામું | Text | ❌ No | Multiline |
| `notes` | અન્ય માહિતી | Text | ❌ No | Free text |

> **Note:** All fields except `name` and `phone` are dynamically managed through the Field Manager. The admin can add, remove, or reorder them without code changes.

---

### Form Behavior

#### Validation Rules

| Rule | Detail |
|------|--------|
| Required fields | Cannot submit without Name and Phone |
| Phone format | Must be exactly 10 digits, numeric only |
| Duplicate phone | Check Firestore before submission; show error if found |
| Step navigation | Cannot advance to next step if required fields in current step are empty |

#### Submission Flow

```
User fills form
  → Validate all fields
  → Check phone uniqueness in Firestore
  → If duplicate: show "આ નંબર પહેલેથી નોંધાયેલ છે" error
  → If unique:
      → Generate Member ID (e.g., SMJ-0001)
      → Write to `members` collection
      → Write to `logs` collection (action: "CREATE")
      → Show success screen
```

#### Success Screen

- Show Member ID to user
- Message: "તમારી માહિتી સફળતાપૂર્વક નોંધાઈ છે 🙏"
- No redirect back to form (prevents duplicate submissions)
- Option to go back to home `/`

#### UI/UX Requirements

- Progress bar showing step (1/3, 2/3, 3/3)
- Back and Next buttons on each step
- Mobile-friendly large tap targets
- Gujarati labels throughout
- Auto-scroll to top on step change

---

## 7. Admin Authentication – `/pap/login`

### Provider
Firebase Authentication — Email/Password

### Flow

```
Admin visits /pap/login
  → Enter email + password
  → Firebase Auth validates
  → If success: redirect to /pap (dashboard)
  → If failure: show "ખોટો ઇ-મેઇલ અથવા પાસવર્ડ" error
```

### Requirements

- Only pre-approved emails can access (enforced via Firestore rules, not just frontend)
- Session persists via Firebase Auth token (`setPersistence(LOCAL)`)
- "Logout" button available in all admin pages
- No "Register" or "Forgot Password" UI exposed publicly (admin manages this directly in Firebase Console)

---

## 8. Admin Dashboard – `/pap`

### Purpose
Quick overview of system activity with real-time filterable widgets.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ SIDEBAR          │  MAIN CONTENT AREA                   │
│                  │                                       │
│ 🏠 Dashboard     │  [ Stats Cards Row ]                 │
│ 👥 Members       │                                       │
│ 🧩 Fields        │  [ Dashboard Filters Bar ]           │
│                  │                                       │
│ ─────────────    │  [ Recent Activity Feed ]            │
│ 👤 admin@...     │                                       │
│ 🚪 Logout        │  [ Quick Entry List ]                │
└─────────────────────────────────────────────────────────┘
```

---

### Stats Cards

| Card | Metric | Source | Color Accent |
|------|--------|--------|--------------|
| 📋 Total Members | Count of `isActive: true` | `members` collection | Gold `#D4AF37` |
| 📅 Today's Entries | `createdAt` = today | `members` collection | Green `#16A34A` |
| ⭐ Important Members | Count of `isImportant: true` | `members` collection | Gold `#D4AF37` |
| 🙈 Hidden Members | Count of `isActive: false` | `members` collection | Red `#DC2626` |

---

### Dashboard Filters Bar

A persistent filter bar sits between the stats cards and the activity feed. It allows the admin to instantly narrow the recent entries and quick-view data without navigating to the Members page.

#### Filter Controls

| Filter | UI Element | Options / Behavior |
|--------|-----------|-------------------|
| **Date Range** | Date picker (From → To) | Filters by `createdAt`. Presets: Today, This Week, This Month, Custom |
| **Status** | Toggle buttons | All · Active · Hidden |
| **Important** | Toggle switch | Off = show all · On = show only `isImportant: true` |
| **Tag** | Multi-select dropdown | Lists all existing tags from the database |
| **Area** | Text search / dropdown | Filter by `data.area` field |
| **Profession** | Dropdown | Lists all distinct values from `data.profession` |

#### Filter Presets (Quick Access)

Clickable preset chips displayed above the filter controls:

| Preset Label | Behavior |
|--------------|----------|
| 🗓 આજ (Today) | Date = today |
| 📆 આ અઠવાડિયે (This Week) | Date = last 7 days |
| 📅 આ મહિને (This Month) | Date = current calendar month |
| ⭐ Important | `isImportant: true` |
| 🙈 Hidden | `isActive: false` |

#### Filter Behavior Rules

- All filters are **combinable** (AND logic)
- Active filters shown as dismissible chips below the filter bar
- "ક્લિયર કરો" (Clear All) button resets all filters instantly
- Filter state is stored in URL query params (`?status=active&tag=committee`) so it can be shared/bookmarked
- Filters apply to both the **Recent Activity Feed** and the **Quick Entry List** on the dashboard

---

### Recent Activity Feed

- Last 10 log entries from `logs` collection (respecting active filters)
- Shows: action type badge, member name, phone, timestamp, admin who acted
- Action type badges:

| Action | Badge Color |
|--------|-------------|
| CREATE | Green `#16A34A` |
| EDIT | Blue `#2563EB` |
| HIDE | Red `#DC2626` |
| RESTORE | Amber `#D97706` |
| NOTE | Grey `#6B7280` |

- Clickable rows → navigate to `/pap/members/:id`

---

### Quick Entry List

- Last 20 member submissions (newest first), filtered by active filters
- Columns: Member ID · Name · Phone · Area · Date Joined
- Each row has a "જુઓ" (View) button → `/pap/members/:id`
- "બધા જુઓ" (View All) button at bottom → `/pap/members` (carrying over current filters)

---

### Navigation

- Dark sidebar (`#1A1A1A`) with gold active state (`#D4AF37`)
- Links: Dashboard, Members, Fields
- Bottom: logged-in admin email + Logout button
- On mobile: collapsible hamburger sidebar

---

## 9. Members List – `/pap/members`

### Purpose
Browse, search, filter, and act on all member records.

### Table

- Columns are **dynamic** — rendered based on active fields from `fields` collection
- Always-present columns: Member ID, Name, Phone, Date Joined, Status, Actions
- No image column

### Pagination

- 20 records per page
- Firestore `startAfter` cursor-based pagination
- "Load More" or numbered pages

### Search

- Search bar at top
- Searches across: name, phone, Member ID, area
- Client-side filtering on loaded data (for simplicity in v1)
- Future: Algolia or Firestore composite index for full-text search

### Filters

| Filter | Options |
|--------|---------|
| Date range | From date → To date (based on `createdAt`) |
| Tags | Multi-select from existing tags |
| Status | Active / Hidden / All |
| Important | Toggle to show only important members |

### Row Actions

| Action | Behavior |
|--------|----------|
| 👁 View | Navigate to `/pap/members/:id` |
| ✏️ Edit | Open inline edit modal or navigate to detail page edit mode |
| 🙈 Hide | Soft delete — set `isActive: false`, log action |
| 📱 WhatsApp | Open `https://wa.me/91XXXXXXXXXX` in new tab |

### Export

- "Export to Excel" button
- Exports all **currently filtered** records (not just current page)
- Format: `.xlsx` using `SheetJS` or `exceljs`
- Columns match visible table columns
- Filename: `members_export_YYYY-MM-DD.xlsx`

---

## 10. Member Detail – `/pap/members/:id`

### Purpose
Full view of a single member's record with all actions.

### Layout

---

#### Section A – Header

| Element | Detail |
|---------|--------|
| Name | Large heading |
| Member ID | e.g., `SMJ-0042` — displayed as badge |
| Phone | Clickable → opens WhatsApp |
| Tags | Editable tag badges |
| Important toggle | ⭐ star toggle — sets `isImportant: true/false` |
| Date joined | Formatted timestamp |

**Header Actions:**

| Action | Behavior |
|--------|----------|
| Edit | Switch page to edit mode |
| Hide Member | Soft delete with confirmation dialog |
| Print | Browser print — formatted print layout |

---

#### Section B – Member Details

- Display all dynamic field values
- Label: Value pairs in a clean two-column grid
- Empty fields shown as "—"
- In edit mode: fields become editable inputs

---

#### Section C – Notes

| Feature | Detail |
|---------|--------|
| Add note | Textarea + "સેવ કરો" button |
| Note list | Reverse chronological order |
| Each note shows | Text, admin email, timestamp |
| Delete note | Trash icon with confirmation |
| Storage | Sub-collection: `members/{id}/notes` |

---

#### Section D – Edit History

| Field | Detail |
|-------|--------|
| Display | Table of changes |
| Columns | Field name, Old Value, New Value, Changed By, Changed At |
| Source | Sub-collection: `members/{id}/history` |
| Trigger | Every admin edit writes a history record |

---

## 11. Field Manager – `/pap/fields`

### Purpose
Allow admin to configure the form fields without touching code.

### Field Properties

| Property | Type | Description |
|----------|------|-------------|
| `key` | String | Unique identifier (snake_case, auto-generated) |
| `label` | String | Gujarati display label |
| `type` | Enum | `text`, `number`, `dropdown`, `date` |
| `required` | Boolean | Whether field is required on public form |
| `options` | Array | For `dropdown` type only — list of choices |
| `order` | Number | Display order on form and table |
| `active` | Boolean | Whether field is currently shown |

### Field Types

| Type | UI Input | Notes |
|------|----------|-------|
| `text` | `<input type="text">` | Default |
| `number` | `<input type="number">` | |
| `dropdown` | `<select>` | Requires `options` array |
| `date` | `<input type="date">` | |

### Operations

| Action | Behavior |
|--------|----------|
| Add field | Opens modal → enter label, type, required, options → saves |
| Edit label | Inline edit or modal |
| Toggle active | Show/hide field without deleting |
| Delete field | Permanently removes field + confirmation warning |
| Reorder | Drag-and-drop (or up/down arrows) |

### Constraints

- `name` and `phone` are **system fields** — cannot be deleted or reordered out of Step 1
- Maximum 25 fields recommended (UI limit, not enforced at DB level)
- Dropdown options: admin enters comma-separated values

---

## 12. Data Model (Firestore)

### Collection: `members`

```json
{
  "memberId": "SMJ-0001",
  "data": {
    "name": "રાજેશ પટેલ",
    "phone": "9876543210",
    "area": "Vadaj",
    "family_name": "પટેલ",
    "profession": "Business"
  },
  "tags": ["committee", "donor"],
  "isActive": true,
  "isImportant": false,
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### Sub-collection: `members/{id}/notes`

```json
{
  "noteId": "auto-id",
  "text": "Called on 12 Jan, interested in committee",
  "createdAt": "Timestamp",
  "createdBy": "admin@example.com"
}
```

### Sub-collection: `members/{id}/history`

```json
{
  "historyId": "auto-id",
  "field": "phone",
  "oldValue": "9876543210",
  "newValue": "9988776655",
  "updatedAt": "Timestamp",
  "updatedBy": "admin@example.com"
}
```

---

### Collection: `fields`

Single document `config` in the `fields` collection:

```json
{
  "fields": [
    {
      "key": "name",
      "label": "પૂરું નામ",
      "type": "text",
      "required": true,
      "order": 1,
      "active": true,
      "system": true
    },
    {
      "key": "phone",
      "label": "મોબાઇલ નંબર",
      "type": "number",
      "required": true,
      "order": 2,
      "active": true,
      "system": true
    },
    {
      "key": "profession",
      "label": "વ્યવસાય",
      "type": "dropdown",
      "required": false,
      "order": 7,
      "active": true,
      "options": ["Business", "Job", "Farming", "Other"]
    }
  ]
}
```

---

### Collection: `logs`

```json
{
  "logId": "auto-id",
  "action": "CREATE | EDIT | HIDE | RESTORE | DELETE_NOTE",
  "memberId": "SMJ-0001",
  "admin": "admin@example.com",
  "metadata": {
    "field": "phone",
    "oldValue": "9876543210",
    "newValue": "9988776655"
  },
  "createdAt": "Timestamp"
}
```

---

### Collection: `counters`

For atomic Member ID generation:

```json
{
  "lastMemberId": 42
}
```

> **Note:** Use Firestore Transactions to read and increment atomically to avoid duplicate IDs under concurrent submissions.

---

## 13. Core Business Logic

### 13.1 Member ID Generation

```
Format: SMJ-XXXX (zero-padded to 4 digits)
Example: SMJ-0001, SMJ-0042, SMJ-1000

Algorithm:
  1. Open Firestore Transaction on `counters/global`
  2. Read `lastMemberId`
  3. Increment by 1
  4. Write back incremented value
  5. Format as `SMJ-${String(newId).padStart(4, '0')}`
  6. Use as `memberId` in new member document
```

### 13.2 Duplicate Phone Check

```
On form submit:
  1. Query Firestore: members WHERE data.phone == input_phone LIMIT 1
  2. If result exists → show error, block submission
  3. If no result → proceed to create member
```

### 13.3 Soft Delete (Hide)

```
isActive: false   → Member is "hidden"
isActive: true    → Member is "active"

Hidden members:
  - Do not appear in default Members List
  - Can be restored by admin
  - Are excluded from exports by default
  - Are still accessible directly via /pap/members/:id
```

### 13.4 Edit with History Tracking

```
On admin edit:
  1. Compare old field values vs new values
  2. For each changed field:
     a. Write to members/{id}/history
     b. Write to logs collection
  3. Update members/{id} with new values + updatedAt timestamp
```

### 13.5 Tagging System

- Admin can add free-form tags to any member
- Tags stored as array in member document: `tags: ["committee", "volunteer"]`
- Members list filterable by tags
- No pre-defined tag list — admin types any tag

---

## 14. Security & Access Control

### Firestore Security Rules

```
// members collection
match /members/{memberId} {
  // Public can create (form submission)
  allow create: if request.auth == null
    && request.resource.data.keys().hasAll(["memberId", "data", "isActive", "createdAt"]);

  // Only authenticated admin can read, update, delete
  allow read, update, delete: if request.auth != null
    && request.auth.token.email in ['admin@example.com'];
}

// fields collection — admin only
match /fields/{docId} {
  allow read: if true; // Public form needs to read field config
  allow write: if request.auth != null;
}

// logs, counters — admin read; system write
match /logs/{logId} {
  allow read: if request.auth != null;
  allow write: if true; // written on form submit and admin actions
}

match /counters/{docId} {
  allow read, write: if true; // Transaction-based, safe
}
```

### Frontend Route Guards

- React Router `<PrivateRoute>` component wraps all `/pap/*` routes
- Checks `Firebase Auth` current user
- Redirects to `/pap/login` if not authenticated

### Input Validation

- Sanitize all user input before writing to Firestore
- Phone: strip non-numeric characters, validate 10-digit length
- Text fields: trim whitespace, max length 500 chars
- No HTML allowed in any field

---

## 15. Performance Strategy

| Strategy | Detail |
|----------|--------|
| Pagination | Cursor-based, 20 records per page |
| Firestore indexes | Composite index on `createdAt + isActive` |
| No real-time listeners | Use one-time `.get()` calls on list pages |
| Field config caching | Cache `fields` config in React state/context — reload only on Field Manager changes |
| Lazy loading | Load member detail data only when navigating to detail page |
| Export optimization | Stream paginated Firestore reads into XLSX on server-side if needed |

---

## 16. Error Handling & Edge Cases

| Scenario | Behavior |
|----------|----------|
| Form submission — Firestore down | Show "સર્વર ભૂલ. ફરી પ્રયાસ કરો." error |
| Duplicate phone | Show Gujarati error before submission |
| Member ID collision | Transaction rollback → retry (max 3 attempts) |
| Admin session expired | Redirect to login with message |
| Empty members list | Show "કોઈ નોંધ મળી નથી" placeholder |
| Field deleted that has data | Data in `member.data` is retained; just hidden from display |
| Concurrent edits | Last write wins (acceptable for v1; no locking) |
| WhatsApp link — no number | Button disabled if phone is empty |

---

## 17. Tech Stack & Architecture

### Frontend

| Layer | Technology |
|-------|-----------|
| Framework | React.js 18+ with Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| State Management | React Context + `useState` / `useReducer` |
| Form Handling | React Hook Form + Zod validation |
| Excel Export | SheetJS (`xlsx`) |
| Drag & Drop (Fields) | `@dnd-kit/core` |

### Backend / Infrastructure

| Layer | Technology |
|-------|-----------|
| Auth | Firebase Authentication (Email/Password) |
| Database | Cloud Firestore (Native Mode) |
| Hosting | Netlify or Cloudflare Pages |
| Build | Vite |
| CI/CD | GitHub Actions (optional) |

### Folder Structure

```
src/
├── components/
│   ├── common/          # Button, Input, Modal, Badge
│   ├── form/            # MultiStepForm, StepIndicator, FieldRenderer
│   └── admin/           # MemberTable, MemberCard, NotesList
├── pages/
│   ├── Landing.jsx
│   ├── JoinForm.jsx
│   ├── admin/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Members.jsx
│   │   ├── MemberDetail.jsx
│   │   └── FieldManager.jsx
├── hooks/
│   ├── useMembers.js
│   ├── useFields.js
│   └── useAuth.js
├── services/
│   ├── firebase.js      # Firebase init
│   ├── members.js       # Firestore CRUD for members
│   ├── fields.js        # Firestore CRUD for fields
│   └── logs.js          # Log writing
├── utils/
│   ├── generateId.js    # Member ID generation
│   ├── exportXlsx.js    # Excel export logic
│   └── validators.js    # Phone, form validation
└── routes/
    └── PrivateRoute.jsx
```

---

## 18. Cost Estimation

### Firestore Free Tier (Spark Plan)

| Operation | Free Quota | Our Daily Usage | Safe? |
|-----------|-----------|-----------------|-------|
| Reads | 50,000/day | ~3,000 | ✅ Yes |
| Writes | 20,000/day | ~6,000 | ✅ Yes |
| Deletes | 20,000/day | ~100 | ✅ Yes |
| Storage | 1 GB | <50 MB | ✅ Yes |

### If Usage Exceeds Free Tier (Blaze Plan)

| Item | Rate | Estimated Monthly Cost |
|------|------|----------------------|
| Reads (beyond 50K/day) | $0.06 / 100K | ~₹5–₹10 |
| Writes (beyond 20K/day) | $0.18 / 100K | ~₹20–₹40 |
| Storage | $0.18 / GB | ~₹5 |
| **Total** | | **₹30–₹55/month** |

### Hosting

| Platform | Cost |
|----------|------|
| Netlify (Hobby) | Free |
| Cloudflare Pages | Free |

---

## 19. Excluded Features

| Feature | Reason |
|---------|--------|
| Public member directory | Privacy policy — members not visible to public |
| Member photos / avatars | Out of scope, increases storage cost |
| Member self-login | Not required for v1 |
| SMS/WhatsApp notifications | Future feature |
| Multi-admin roles (editor/viewer) | Single admin for v1 |
| Analytics / charts | Future feature |
| Donation / payment tracking | Out of scope |
| PDF export | Only Excel required |
| Google Sheets sync | Out of scope |

---

## 20. Development Phases

### Phase 1 – Foundation (Week 1–2)

- [ ] Firebase project setup (Auth + Firestore)
- [ ] Firestore security rules
- [ ] React app scaffold (Vite + Tailwind + Router)
- [ ] Landing page (`/`)
- [ ] Admin login (`/pap/login`)
- [ ] PrivateRoute guard

### Phase 2 – Public Form (Week 2–3)

- [ ] Field config reader from Firestore
- [ ] Multi-step form UI with Gujarati labels
- [ ] Validation (required fields, phone format)
- [ ] Duplicate phone check
- [ ] Member ID generation (transaction-based)
- [ ] Form submission + log entry
- [ ] Success screen

### Phase 3 – Admin Core (Week 3–5)

- [ ] Dashboard with stats
- [ ] Members list with pagination
- [ ] Search and filters (date, tag, status)
- [ ] Member detail page
- [ ] Edit member + history tracking
- [ ] Notes sub-system
- [ ] Hide / restore member

### Phase 4 – Admin Tools (Week 5–6)

- [ ] Field Manager (add, edit, delete, reorder)
- [ ] Tags system
- [ ] Excel export
- [ ] WhatsApp click integration
- [ ] Print layout for member detail

### Phase 5 – Polish & Launch (Week 6–7)

- [ ] Gujarati UI review / proofreading
- [ ] Mobile responsiveness QA
- [ ] Firestore index optimization
- [ ] Deploy to Netlify / Cloudflare
- [ ] Admin onboarding / walkthrough

---

## 21. Design System & Color Theme

### 21.1 Brand Identity

The visual theme is derived from the trust's logo — **Gold and Deep Red** — conveying royalty, tradition, and trustworthiness. The palette is deliberately restrained: gold is used sparingly as a premium accent, not as a background fill.

**Design Pillars:** Royal · Traditional · Clean · Trustworthy

---

### 21.2 Core Color Palette

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| **Primary** | Gold | `#D4AF37` | CTA buttons, highlights, active nav, important badges |
| **Primary Hover** | Dark Gold | `#C19A2B` | Button hover state |
| **Accent** | Deep Red | `#8B0000` | Page headers, section headings, hover states |
| **Background** | Cream | `#FFFDF7` | App background (public pages) |
| **Surface** | White | `#FFFFFF` | Cards, modals, table rows |
| **Text Primary** | Near Black | `#1A1A1A` | Body text, headings |
| **Text Secondary** | Cool Grey | `#6B7280` | Labels, timestamps, placeholders |
| **Sidebar** | Dark Charcoal | `#1A1A1A` | Admin sidebar background |
| **Sidebar Active** | Gold | `#D4AF37` | Active nav item text/icon |
| **Status: Active** | Green | `#16A34A` | Active member badge |
| **Status: Hidden** | Red | `#DC2626` | Hidden member badge |
| **Status: Important** | Gold | `#D4AF37` | Important star icon |
| **Info / Edit** | Blue | `#2563EB` | Edit actions, info badges |

---

### 21.3 CSS Custom Properties (Design Tokens)

Add to your global CSS / Tailwind config:

```css
:root {
  /* Brand */
  --color-primary:        #D4AF37;
  --color-primary-hover:  #C19A2B;
  --color-accent:         #8B0000;

  /* Backgrounds */
  --color-bg:             #FFFDF7;
  --color-surface:        #FFFFFF;
  --color-sidebar:        #1A1A1A;

  /* Text */
  --color-text:           #1A1A1A;
  --color-text-secondary: #6B7280;

  /* Status */
  --color-active:         #16A34A;
  --color-hidden:         #DC2626;
  --color-important:      #D4AF37;
  --color-edit:           #2563EB;
  --color-warn:           #D97706;

  /* Radius & Shadow */
  --radius-card:          12px;
  --radius-btn:           8px;
  --shadow-card:          0 1px 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);
}
```

---

### 21.4 Typography

| Use | Font | Weight | Size |
|-----|------|--------|------|
| Gujarati + English body | Noto Sans Gujarati | 400 | 14–16px |
| Headings | Noto Sans Gujarati | 700 | 20–32px |
| Admin UI labels | Noto Sans | 500 | 13–14px |
| Member ID badge | Monospace (JetBrains Mono) | 600 | 13px |

**Google Fonts import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@600&display=swap');

body {
  font-family: 'Noto Sans Gujarati', 'Noto Sans', sans-serif;
}
```

---

### 21.5 Component Styles

#### Primary Button (Gold)
```css
.btn-primary {
  background:    #D4AF37;
  color:         #1A1A1A;
  font-weight:   600;
  border-radius: 8px;
  padding:       10px 24px;
  border:        none;
  transition:    background 0.2s ease;
}
.btn-primary:hover {
  background: #C19A2B;
}
```

#### Danger / Accent Button (Deep Red)
```css
.btn-danger {
  background:    #8B0000;
  color:         #FFFFFF;
  border-radius: 8px;
  padding:       10px 24px;
}
.btn-danger:hover {
  background: #700000;
}
```

#### Ghost Button
```css
.btn-ghost {
  background:    transparent;
  color:         #D4AF37;
  border:        1.5px solid #D4AF37;
  border-radius: 8px;
  padding:       10px 24px;
}
.btn-ghost:hover {
  background: rgba(212,175,55,0.08);
}
```

#### Card
```css
.card {
  background:    #FFFFFF;
  border-radius: 12px;
  box-shadow:    0 1px 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);
  padding:       20px 24px;
}
```

#### Admin Sidebar
```css
.sidebar {
  background: #1A1A1A;
  color:      #FFFFFF;
  width:      240px;
}
.sidebar-nav-item {
  color:         rgba(255,255,255,0.65);
  padding:       10px 16px;
  border-radius: 8px;
  transition:    all 0.15s ease;
}
.sidebar-nav-item:hover {
  color:      #FFFFFF;
  background: rgba(212,175,55,0.12);
}
.sidebar-nav-item.active {
  color:      #D4AF37;
  background: rgba(212,175,55,0.15);
  font-weight: 600;
}
```

#### Status Badges
```css
.badge-active    { background: #DCFCE7; color: #16A34A; }
.badge-hidden    { background: #FEE2E2; color: #DC2626; }
.badge-important { background: #FEF9C3; color: #92700A; }
.badge-create    { background: #DCFCE7; color: #16A34A; }
.badge-edit      { background: #DBEAFE; color: #2563EB; }
.badge-hide      { background: #FEE2E2; color: #DC2626; }
.badge-restore   { background: #FEF3C7; color: #D97706; }

/* Shared badge base */
[class^="badge-"] {
  font-size:     12px;
  font-weight:   600;
  padding:       2px 10px;
  border-radius: 999px;
  display:       inline-block;
}
```

#### Form Input
```css
.form-input {
  border:        1.5px solid #E5E7EB;
  border-radius: 8px;
  padding:       10px 14px;
  font-size:     15px;
  color:         #1A1A1A;
  background:    #FFFFFF;
  transition:    border-color 0.2s;
  width:         100%;
}
.form-input:focus {
  outline:       none;
  border-color:  #D4AF37;
  box-shadow:    0 0 0 3px rgba(212,175,55,0.15);
}
```

#### Progress Bar (Multi-step form)
```css
.progress-track {
  background:    #E5E7EB;
  border-radius: 999px;
  height:        4px;
}
.progress-fill {
  background:    linear-gradient(90deg, #D4AF37, #C19A2B);
  border-radius: 999px;
  height:        4px;
  transition:    width 0.3s ease;
}
```

---

### 21.6 Gradient Usage (Premium Accents — Use Sparingly)

```css
/* Hero / Landing page header banner */
.hero-gradient {
  background: linear-gradient(135deg, #D4AF37 0%, #8B0000 100%);
}

/* Stats card top accent line */
.card-accent-line {
  height:     3px;
  background: linear-gradient(90deg, #D4AF37, #C19A2B);
  border-radius: 3px 3px 0 0;
}
```

> ⚠️ **Rule:** Use the gradient **only** for the landing page hero banner and dashboard stat card accents. Do not use it for buttons, backgrounds, or sidebar — it will look heavy.

---

### 21.7 Public Form Theme

The `/join` form uses the cream background with gold accents:

| Element | Style |
|---------|-------|
| Page background | `#FFFDF7` (cream) |
| Form card | `#FFFFFF` with soft shadow |
| Step indicator active | Gold `#D4AF37` |
| Step indicator inactive | Grey `#E5E7EB` |
| Next / Submit button | Gold `#D4AF37` with `#1A1A1A` text |
| Input focus ring | Gold `rgba(212,175,55,0.15)` |
| Error text | Deep Red `#8B0000` |
| Success screen icon | Gold checkmark |
| Trust name heading | Deep Red `#8B0000` |

---

### 21.8 Admin Panel Theme Summary

| Zone | Background | Text | Accent |
|------|-----------|------|--------|
| Sidebar | `#1A1A1A` | `#FFFFFF` | `#D4AF37` (active items) |
| Main content | `#F9FAFB` (light grey) | `#1A1A1A` | — |
| Page heading | — | `#8B0000` | — |
| Cards | `#FFFFFF` | `#1A1A1A` | Gold top-border accent |
| Table header row | `#F3F4F6` | `#6B7280` | — |
| Table row hover | `rgba(212,175,55,0.06)` | — | — |
| Filter bar background | `#FFFFFF` | `#1A1A1A` | Gold focus rings |

---

### 21.9 Tailwind Config Extension

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        gold:    { DEFAULT: '#D4AF37', hover: '#C19A2B', light: '#FEF9C3' },
        crimson: { DEFAULT: '#8B0000', hover: '#700000' },
        cream:   '#FFFDF7',
        sidebar: '#1A1A1A',
      },
      fontFamily: {
        sans: ['Noto Sans Gujarati', 'Noto Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        btn:  '8px',
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
      },
    },
  },
};
```

---

## 22. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Should hidden members appear in Excel export (with a flag)? | Admin | ❓ Open |
| 2 | How many admin email addresses need access? | Trust committee | ❓ Open |
| 3 | Should the form support Gujarati text input or only English? | Trust committee | ❓ Open |
| 4 | Is Member ID format `SMJ-0001` final, or should it change? | Admin | ❓ Open |
| 5 | Should duplicate phone show who the existing member is, or just an error? | UX decision | ❓ Open |
| 6 | Should notes be editable after creation, or immutable? | Admin | ❓ Open |
| 7 | Should the public form have a CAPTCHA to prevent spam? | Dev | ❓ Open |

---

*Document prepared for Shri Lalabapa Seva Samiti – April 2026*  
*Version 2.0 | Ready for Development*