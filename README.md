<p align="center">
  <img src="public/logo.png" alt="Shri Lalabapa Seva Samiti Logo" width="200"/>
</p>

# 📄 Shri Lalabapa Seva Samiti – Member Information System
## (શ્રી લાલાબાપા સેવા સમિતિ – સભ્ય માહિતી સિસ્ટમ)

> [!IMPORTANT]
> **Trust Details**
> - **Trust Registration No:** A/5366/Ahmedabad
> - **Location:** વાડજ, અમદાવાદ (Vadaj, Ahmedabad)
> - **Purpose:** Dedicated to community service and member welfare.

A private, secure, and dynamic member management platform for the **Shri Lalabapa Seva Samiti** community.

---

## 🚀 Overview

This application serves as an administrative backbone for managing community member data. It features a public-facing registration form and a robust, protected administrative panel for data analysis, field configuration, and member management.

### Key Characteristics
- **Privacy First**: No public member directory; data is only accessible to authorized administrators.
- **Dynamic Architecture**: Form fields can be added, removed, or reordered by admins without code changes.
- **Gujarati-First UI**: Optimized for the community with native language support.
- **Cloud Native**: Built with a modern serverless stack for high availability and low cost.

## 🏗️ Architecture

```mermaid
graph TD
    User((Public User)) -->|Fills Form| Join[Member Registration /join]
    Join -->|Reads Schema| FieldConfig[(Field Config)]
    Join -->|Writes Data| Firestore[(Firebase Firestore)]
    
    Admin((Administrator)) -->|Authenticated| PAP[Admin Panel /pap]
    PAP -->|Manually Edits| Firestore
    PAP -->|Configures| FieldConfig
    PAP -->|Authenticates| Auth[(Firebase Auth)]
```

---

## ✨ Features

### 📝 Public Form (`/join`)
- **Multi-Step Flow**: A user-friendly 3-step process to collect Personal, Family, and Professional information.
- **Real-time Validation**: Instant feedback on required fields and 10-digit phone number validation.
- **Duplicate Prevention**: Automatically checks for existing phone numbers to prevent double entries.

#### 🔄 Registration Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (React)
    participant FS as Firestore
    U->>F: Enters Step 1 (Personal)
    F->>F: Validate Name & Phone
    F->>FS: Check Phone Uniqueness
    FS-->>F: Unique / Duplicate
    U->>F: Enters Step 2 (Family)
    U->>F: Enters Step 3 (Professional)
    F->>FS: Atomic Create (SMJ-ID)
    FS-->>F: Success
    F->>U: Show Success + ID
```

### 🔐 Admin Dashboard (`/pap`)
- **Real-time Analytics**: Quick view of total members, today's entries, and important records.
- **Advanced Filtering**: Filter data by date range, tags, status, area, and profession.
- **Recent Activity Feed**: Audit trail of all administrative actions (creates, edits, hiddens).

### 👥 Member Management
- **Dynamic Table**: Lists members with customizable columns based on active fields.
- **Detailed View**: Deep-dive into member profiles including edit history and internal notes.
- **Communication Tools**: One-click WhatsApp integration for direct member outreach.
- **Data Portability**: Powerful Excel export for offline reporting and analysis.

### 🧩 Field Manager
- **Zero-Code Configuration**: Admins can manage the data schema directly from the UI.
- **Multiple Field Types**: Supports text, number, dropdown, and date inputs.
- **Status Control**: Soft-delete or hide fields while preserving historical data.

#### ⚙️ Configuration Workflow
```mermaid
graph LR
    A[Admin] --> Add[Add Field]
    Add -->|Key, Label, Type| Update[Update Global Config]
    Update -->|Real-time| Public[Public Form Updates]
    Update -->|Real-time| Table[Admin Table Updates]
```

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

### Backend & Infrastructure
![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)
![Firestore](https://img.shields.io/badge/Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

### Utilities
![Zod](https://img.shields.io/badge/Zod-3068B7?style=for-the-badge&logo=zod&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)
![SheetJS](https://img.shields.io/badge/SheetJS-4CAF50?style=for-the-badge&logo=sheetjs&logoColor=white)

---

## ⛑️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Firebase Project

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd lalabapa
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

---

## 📦 Available Scripts

- `npm run dev` - Start development server with HMR.
- `npm run build` - Build the production bundle.
- `npm run lint` - Run ESLint to check for code quality issues.
- `npm run preview` - Locally preview the production build.

---

## 🔒 Security & Roles

- **Public**: Access to Landing Page and Member Registration only.
- **Admin**: Full access to the Dashboard, Member List, and Field Configuration.
- **Database Rules**: Firestore security rules ensure that only authenticated admins with specific email addresses can read/write data.

---

## 📄 License

Owned By **Poojan Chauhan** ([poojanchauhan.in](https://poojanchauhan.in))
All rights reserved.
