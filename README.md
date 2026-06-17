# LifeLink — Blood Donation Emergency Matching System

LifeLink is a real-time, automated, and secure blood matching platform designed to coordinate emergency blood requests between patients, donors, and hospitals. It bridges the critical time gap in emergencies by replacing chaotic manual messaging with a structured, verified routing pipeline.

---

## 🚨 Problem Statement
In emergency medical situations, patients and families often broadcast frantic messages containing patient names, blood groups, and phone numbers across social media and chat applications (e.g., WhatsApp, Facebook). This manual process suffers from several critical issues:
1. **Inefficient Matching:** Broadcasts reach a random audience, failing to target matching blood groups in the immediate vicinity.
2. **False Alarms & Spam:** Broadcast messages continue to circulate weeks or months after the emergency has been resolved.
3. **Privacy Risks:** Disseminating private contact details and location coordinates publicly exposes patients and donors to spam and scams.
4. **Donor Cooldown Violations:** No system exists to enforce the safe 56-day donation cooldown, putting donor health at risk.

---

## 💡 Solutions & Workflows
LifeLink solves these issues with a secure, automated matching system across five specialized user interfaces:

*   **Verified Request Pipeline:** Patients submit requests which must be verified by the specified **Hospital** before going active, preventing spam and fake requests.
*   **Automated Matching Engine:** Upon hospital verification, the engine immediately identifies compatible donors in the same city, matching them based on blood group compatibility (non-exact compatibility matrix) and availability.
*   **Enforced Donor Cooldown:** The system filters out donors who have donated blood within the last **56 days** to ensure donor safety.
*   **Privacy First (Contact Masking):** Donor contact details are fully masked (`***-hidden***`) and are only revealed to the hospital and coordinator once the donor explicitly accepts the match.
*   **Auto-Expiry Background Job:** Pending, verified, and matching requests automatically transition to an `expired` status after **72 hours** to clear the circulation queue.
*   **Fulfillment Tracking:** **Volunteer Coordinators** affiliated with the hospital track matched donors through a real-time status tracker (`contacted` ➔ `committed` ➔ `donated` ➔ `declined` / `no-show`).
*   **Interactive Analytics:** System Admins can track system-wide registration metrics, acceptance rates, and average fulfillment hours via graphs.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React with Vite
- **Styling:** Tailwind CSS & Custom CSS System (`index.css` utility layer)
- **Animations:** Framer Motion (page transitions and micro-interactions)
- **Icons:** React Icons (Feather Icons pack)
- **Charts:** Recharts (responsive vector charts)

### Backend
- **Runtime:** Node.js (Express framework)
- **Database:** MongoDB (Mongoose ODM schemas)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Validation:** Express Validator

---

## 📁 Folder Structure

```text
blood-donation-emergency-matching-system-main/
├── client/                     # React Frontend App
│   ├── public/                 # Video and image static assets (LFS)
│   ├── src/
│   │   ├── api/                # Axios API connection endpoints
│   │   ├── components/         # Reusable layouts, badges, cards, and notification badge
│   │   ├── context/            # AuthContext hooks
│   │   ├── pages/              # Routing pages
│   │   │   ├── admin/          # Admin dashboards, request detail reviews, and user management
│   │   │   ├── donor/          # Donor history, profile setup, and match requests
│   │   │   ├── hospital/       # Hospital verification page and pending coordinators list
│   │   │   ├── patient/        # Patient dashboards and request forms
│   │   │   └── LandingPage.jsx # Hero portal landing page
│   │   ├── App.jsx             # React routing setup and allowed-role protections
│   │   ├── index.css           # Global custom styled themes
│   │   └── main.jsx            # Entry mount point
│   ├── vite.config.js          # Vite config with dev proxy configuration
│   └── package.json            # Client dependency manifest
│
└── server/                     # Node.js Express Backend API
    ├── config/                 # Mongoose Database connection module
    ├── controllers/            # Request handlers (auth, matches, donors, dashboards)
    ├── middleware/             # Role authorization, auth protection, and validators
    ├── models/                 # Database Mongoose schemas (User, Donor, BloodRequest, etc.)
    ├── routes/                 # Express API endpoints
    ├── seed/                   # Seeding scripts (mock system entries & super admin creation)
    ├── utils/                  # Helper utilities (blood compatibility rules, token generators)
    ├── server.js               # Entry script & background expiry cron setup
    └── package.json            # Server dependency manifest
```

---

## ⚙️ Step-by-Step Instructions

### Prerequisites
- Node.js (v18+)
- Git & Git LFS (Git Large File Storage)
- MongoDB Connection URI

### 1. Retrieve Media Assets (Git LFS)
Because the background videos are stored using Git Large File Storage (LFS), pull the full binary files to your local repository before starting:
```bash
git lfs pull
```

### 2. Configure Environment Variables
Create `.env` configuration files in both root workspaces.

#### Server Environment (`server/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

#### Client Environment (`client/.env`)
```env
VITE_API_URL=http://localhost:5000
```

### 3. Server Installation & Run
```bash
cd server
npm install
# Seed demo data (creates admin, donor, and patient dummy files)
npm run seed
# Start the server (runs on http://localhost:5000)
npm run start
```

### 4. Client Installation & Run
```bash
cd client
npm install
# Start client dev server (runs on http://localhost:5173 with proxy configuration)
npm run dev
```

### 5. Mock Demo Logins
You can use these pre-loaded accounts to test the workflows:
- **Super Admin:** `superadmin@lifelink.com` / `SuperAdminSecure123!`
- **Demo Coordinator:** `coordinator@lifelink.com` / `CoordinatorSecure123!` (affiliated with Aga Khan Hospital)
- **Demo Admin:** `admin@demo.com` / `Admin1234`
- **Demo Donor:** `donor@demo.com` / `Donor1234` (O+ group)
- **Demo Patient:** `patient@demo.com` / `Patient1234` (O+ group)

---

## 🚀 Future Enhancements
- **Geo-Distance Calculation:** Integrate Google Maps API to match donors based on exact road distance or radius (e.g., within 5km of the hospital) instead of only matching by city name.
- **SMS & WhatsApp Integration:** Integrate Twilio to send SMS alerts or WhatsApp messages to matched donors when critical requests are verified, driving instant response rates.
- **Blood Bank Inventories:** Create dashboards for blood bank facilities to show current unit inventories and request transfers from matching banks.
- **Auto-Routing Directions:** Generate automatic routing links for committed donors directly to the verified hospital.
