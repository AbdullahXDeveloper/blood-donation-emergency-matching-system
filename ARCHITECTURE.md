# LifeLink — System Architecture

This document outlines the software architecture, database design, and key execution engines of the **LifeLink Blood Donation Emergency Matching System**.

---

## 🗺️ System Overview Diagram

Below is the end-to-end architecture diagram representing the client interfaces, API middleware route guards, backend controllers, and background schedulers:

```mermaid
graph TD
    %% Users
    Donor[🩸 Donor User]
    Patient[🤒 Patient User]
    Hospital[🏥 Hospital Verifier]
    Coord[🤝 Coordinator User]
    Admin[🛡️ System Admin]

    %% Frontend App
    subgraph Client ["Client App (React + Vite)"]
        UI[Vite React UI]
        Router[React Router Guarded Routes]
        API[Axios API Client]
        Video[Ambient Video Pipeline]
    end

    %% Backend Server
    subgraph Server ["Server (Node.js + Express API)"]
        Proxy[Vite Dev Server Proxy]
        AuthGuard[JWT Auth Middleware]
        RoleGuard[Role Protection Middleware]
        Validator[express-validator Schema Layer]
        
        subgraph Controllers ["Controllers Layer"]
            AuthController[Auth Controller]
            RequestController[Request Controller]
            MatchController[Match Controller]
            DonorController[Donor Controller]
            DashboardController[Dashboard Controller]
        end

        subgraph Schedulers ["Background Jobs"]
            ExpiryJob[72h Auto-Expiry Job]
        end
    end

    %% Database
    subgraph Database ["Database (MongoDB Atlas)"]
        UserCol[(Users Collection)]
        DonorCol[(Donors Collection)]
        RequestCol[(Requests Collection)]
        MatchCol[(Matches Collection)]
        HistoryCol[(History Collection)]
    end

    %% Interconnections
    Donor --> UI
    Patient --> UI
    Hospital --> UI
    Coord --> UI
    Admin --> UI

    UI --> Router
    Router --> API
    API --> Proxy
    Proxy --> AuthGuard
    
    AuthGuard --> RoleGuard
    RoleGuard --> Validator
    Validator --> Controllers
    
    %% Controller bindings
    AuthController --> UserCol
    DonorController --> DonorCol
    DonorController --> HistoryCol
    RequestController --> RequestCol
    MatchController --> MatchCol
    
    %% Engine matches
    RequestController -.->|1. Verification| MatchController
    MatchController -.->|2. Trigger Matching| DonorCol
    MatchController -.->|3. Create Links| MatchCol
    
    %% Background jobs
    ExpiryJob -->|Wipe expired requests| RequestCol
```

---

## 🎨 1. Frontend Architecture (React + Vite)

The frontend is a single-page React app bundled with Vite, styled with custom utilities on top of Tailwind CSS, and animated using Framer Motion:

*   **Guarded Routes (`App.jsx`):** Employs role-based protection using `ProtectedRoute`. If an unauthenticated user or user with an unauthorized role tries to access dashboard routing, they are immediately redirected to `/login` or `/unauthorized`.
*   **Theme and Layouts (`DashboardLayout.jsx`):** Renders dynamic sidebars using matching icons and navigation lists tailored per role. Loads the ambient background video pipeline (`Donate.mp4` for donors, `patient.mp4` for patients) to provide an immersive dark theme UI.
*   **Header Notifications (`NotificationBadge.jsx`):** Polled in the background every 30 seconds for active matching requests. Displays a pulsing indicator notifying the donor if a request matches their criteria.
*   **API Client Layer (`api/index.js`):** Modularizes endpoints into Axios resource groups (`authAPI`, `donorAPI`, `requestAPI`, `matchAPI`, `dashboardAPI`). Configured with request interceptors to auto-attach authorization JWTs, and response interceptors to handle `401 Unauthorized` logouts globally.

---

## ⚙️ 2. Backend Architecture (Express REST API)

The backend is structured around a classic layered architecture:

*   **Routing Guards (`routes/`):** Restricts access to sensitive endpoints. For instance:
    *   `/api/match/` endpoints require `authorize('admin', 'coordinator', 'hospital')`.
    *   `/api/donors/requests` endpoints require `authorize('donor')`.
*   **Validation Layer (`express-validator`):** Validates all input schemas (e.g., verifying blood group codes, email domains, password complexity constraints) before reaching controller functions.
*   **Controllers (`controllers/`):** Manages core business logic, database queries, and exception handling.

---

## 🗄️ 3. Database Schema Design (Mongoose)

MongoDB stores models with explicit relational links (`ObjectIDs`):

```mermaid
erDiagram
    USER ||--|| DONOR : "has profile"
    USER ||--o{ BLOODREQUEST : "creates"
    DONOR ||--o{ DONORMATCH : "receives"
    BLOODREQUEST ||--o{ DONORMATCH : "generates"
    DONOR ||--o{ DONATIONHISTORY : "donates"
    BLOODREQUEST ||--o{ DONATIONHISTORY : "fulfills"

    USER {
        ObjectId id PK
        string name
        string email
        string password
        string role "donor | patient | hospital | coordinator | admin"
        boolean isApproved
        string hospitalAffiliation
    }

    DONOR {
        ObjectId id PK
        ObjectId userId FK
        string bloodGroup
        string city
        string area
        string phone
        date lastDonationDate
        boolean isAvailable
        number totalDonations
    }

    BLOODREQUEST {
        ObjectId id PK
        string patientName
        string bloodGroup
        number unitsRequired
        string hospital
        string city
        string urgency "critical | urgent | normal"
        string status "pending | matching | fulfilled | cancelled | expired"
        ObjectId createdBy FK
        ObjectId verifiedBy FK
    }

    DONORMATCH {
        ObjectId id PK
        ObjectId requestId FK
        ObjectId donorId FK
        string status "contacted | committed | donated | declined | no-show"
        date contactRevealedAt
        date respondedAt
    }

    DONATIONHISTORY {
        ObjectId id PK
        ObjectId donorId FK
        ObjectId requestId FK
        number units
        string hospitalName
        date donatedAt
    }
```

---

## ⚡ 4. Core Algorithms & Automation Engines

### A. The Matching Engine
Triggered automatically when a hospital/admin verifies a request, or manually via "Re-run Matching":

```mermaid
flowchart TD
    Start([1. Trigger Match]) --> GetReq[2. Fetch BloodRequest details]
    GetReq --> GetRules[3. Get compatible blood group array]
    GetRules --> QueryDonors[4. Query eligible Donors in DB]

    QueryDonors -->|Filters| F1[Matching City]
    QueryDonors -->|Filters| F2[isAvailable == true]
    QueryDonors -->|Filters| F3[lastDonationDate < 56 days ago or Null]

    F1 & F2 & F3 --> CheckMatches[5. Filter out already-contacted donor matches]
    CheckMatches --> InsertMatches[6. Insert new DonorMatch records in 'contacted' status]
    InsertMatches --> UpdateReq[7. Update Request status to 'matching']
    UpdateReq --> End([8. Done])
```

### B. Auto-Expiry Background Job
To maintain queue hygiene and prevent false alerts, the server boots up an interval worker:
- **Frequency:** Runs every 30 minutes.
- **Action:** Queries `BloodRequest` where `status` is not completed (`'fulfilled'`, `'cancelled'`, `'expired'`) and the current timestamp exceeds `expiresAt` (default 72 hours from creation).
- **Status Shift:** Automatically marks matched requests as `expired`, removing them from circulating donor feeds.
