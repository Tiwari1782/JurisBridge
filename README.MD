<div align="center">

# ⚖️ JurisBridge

![JurisBridge Preview](./Screenshot/home.png)

**AI-Powered Legal Assistance Platform with JurisPilot AI, Real-Time Chat, Document Analysis & Lawyer Marketplace**

<a href="https://juris-bridge-my3w.vercel.app/" target="_blank">
  <img src="https://img.shields.io/badge/%20Live%20Demo-Visit%20JurisBridge-00d4ff?style=for-the-badge&labelColor=0D1B2A" alt="Live Demo" />
</a>

[![GitHub](https://img.shields.io/badge/GitHub-Tiwari1782-181717?style=for-the-badge&logo=github)](https://github.com/Tiwari1782)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/prakash-tiwari-8900bb2b2/)
[![LeetCode](https://img.shields.io/badge/LeetCode-pRaKaSh1782-FFA116?style=for-the-badge&logo=leetcode)](https://leetcode.com/u/pRaKaSh1782/)

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React_19-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real_Time-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

</div>

---

## 🎯 Project Overview

**JurisBridge** is a comprehensive full-stack legal-tech platform that bridges the gap between citizens and legal professionals using the power of AI. Built with the **MERN stack**, it provides:

- **🤖 JurisPilot AI** — Multi-provider AI legal assistant (Anthropic Claude, OpenAI, Google Gemini) with automatic fallback
- **👨‍⚖️ Lawyer Marketplace** — Browse, filter, and connect with verified lawyers by specialization, rating, fee & location
- **📂 Case Management** — Create, track, and manage legal cases with full timeline & auto lawyer matching
- **💬 Real-Time Chat** — Socket.io powered messaging between users and lawyers with file attachments
- **📄 AI Document Analysis** — Upload legal documents (PDF, DOCX, TXT) and get instant AI-powered risk analysis
- **📜 Legal Notice Generator** — AI-generated legal notices with customizable parameters
- **🎥 Video Calling** — In-app video consultations between users and lawyers
- **🗣️ Voice Input/Output** — Speech recognition & Text-to-Speech in English and Hindi
- **💳 Razorpay Payments** — Integrated payment gateway for lawyer consultations
- **🔔 Multi-Channel Notifications** — Email (Nodemailer) + SMS (Twilio) notifications

---

## ✨ Features

### 🤖 JurisPilot AI — Deep Dive

The platform's AI engine supports **3 providers with intelligent failover**:

```
User asks a legal question
         ↓
Frontend sends to /api/ai/query
         ↓
Backend tries Provider 1 (Anthropic Claude)
         ↓ (if fails)
Backend tries Provider 2 (Google Gemini)
         ↓ (if fails)
Backend tries Provider 3 (OpenAI GPT)
         ↓
AI responds with legal guidance + confidence score + category
         ↓
If confidence < threshold → Auto-escalate to matching lawyers
         ↓
Response displayed with TTS option (voice readback)
```

| Feature | Description |
|---------|-------------|
| 🧠 **Multi-Provider Fallback** | Claude → Gemini → OpenAI (never fails) |
| 📊 **Confidence Scoring** | AI rates its own confidence per response |
| 🏷️ **Auto-Categorization** | Classifies queries (Criminal, Civil, Family, etc.) |
| 🚨 **Smart Escalation** | Low-confidence queries auto-escalated to lawyers via email + SMS |
| 🌐 **Multilingual** | English & Hindi support |
| 🔊 **Voice I/O** | Speak your question + hear the AI response |
| 🛡️ **Rate Limited** | 30 requests per 15 min per IP |

### 🎨 Frontend Features

| Feature | Description |
|---------|-------------|
| 🌙 **Dark/Light Theme** | Zustand-powered toggle with system preference detection |
| 📱 **Fully Responsive** | Mobile-first design with Tailwind CSS v4 |
| 🔄 **Smooth Animations** | Framer Motion page transitions & scroll reveals |
| 📊 **Scroll Progress** | Visual progress bar at the top |
| 🎯 **Parallax Tilt** | Interactive card hover effects |
| 🔔 **Toast Notifications** | React Hot Toast with dark theme styling |
| 🔒 **Protected Routes** | Role-based access (user/lawyer) |
| 🤖 **Mini JurisPilot** | Floating AI assistant on every authenticated page |

### ⚙️ Backend Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure user & lawyer registration/login |
| 👨‍⚖️ **Lawyer Verification** | Bar Council number verification system |
| 📂 **Case Lifecycle** | Full CRUD with status tracking & timeline |
| 🤝 **Auto Lawyer Matching** | Algorithm matches best lawyer by specialization, rating & experience |
| 💬 **Socket.io Chat** | Real-time messaging with file attachment support |
| ☁️ **Cloudinary** | Cloud storage for documents, evidence & chat files |
| 📄 **Document Parsing** | PDF (pdf-parse) & DOCX (mammoth) text extraction |
| 🔐 **Evidence Integrity** | SHA-256 hashing for evidence file tamper detection |
| 📜 **AI Notice Generation** | AI-crafted legal notices with structured templates |
| 💳 **Razorpay Integration** | Payment order creation & signature verification |
| 📧 **Email Notifications** | Nodemailer with HTML email templates |
| 📱 **SMS Notifications** | Twilio integration for lawyer alerts |
| 🗣️ **Text-to-Speech API** | Google TTS + ElevenLabs (optional premium) |
| 🛡️ **Security** | Helmet, CORS, rate limiting, input validation |
| 📝 **Request Logging** | Morgan HTTP logger in development |

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat-square&logo=vite&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=flat-square&logo=react&logoColor=white)
![Socket.io Client](https://img.shields.io/badge/Socket.io_Client-010101?style=flat-square&logo=socket.io&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router_v7-CA4245?style=flat-square&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat-square&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white)

### AI & Services
![Anthropic](https://img.shields.io/badge/Anthropic_Claude-191919?style=flat-square&logo=anthropic&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI_GPT-412991?style=flat-square&logo=openai&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=google&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-0C2451?style=flat-square&logo=razorpay&logoColor=white)
![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=flat-square&logo=twilio&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-0F9DCE?style=flat-square&logo=minutemailer&logoColor=white)

---

## 🗺️ Application Routes

### 🌐 Public Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Hero page with platform overview |
| `/login` | Login | User & Lawyer authentication |
| `/register` | Register | New user registration |
| `/register/lawyer` | Register Lawyer | Lawyer registration with Bar Council verification |
| `/lawyers` | Lawyer Marketplace | Browse & filter verified lawyers |
| `/lawyers/:id` | Lawyer Profile | Detailed lawyer profile with reviews |

### 🔒 Protected Routes (User)

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard | User dashboard with stats & quick actions |
| `/jurispilot` | JurisPilot Chat | Full AI legal assistant chat interface |
| `/cases` | My Cases | View & manage all user cases |
| `/cases/new` | Create Case | File a new legal case |
| `/cases/:id` | Case Detail | Detailed case view with timeline & actions |
| `/chat/:caseId` | Chat Room | Real-time messaging with assigned lawyer |
| `/video/:caseId` | Video Call | Video consultation with lawyer |
| `/documents` | My Documents | Upload & analyze legal documents |
| `/notices` | Legal Notices | View generated legal notices |
| `/notices/new` | Create Notice | Generate AI-powered legal notice |

### 👨‍⚖️ Protected Routes (Lawyer)

| Route | Page | Description |
|-------|------|-------------|
| `/lawyer/dashboard` | Lawyer Dashboard | Lawyer-specific dashboard |
| `/lawyer/requests` | Lawyer Requests | Incoming case requests management |

---

## 🔌 API Routes

### Authentication — `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/register` | Public | Register new user |
| `POST` | `/register/lawyer` | Public | Register new lawyer |
| `POST` | `/login` | Public | Login (user/lawyer) |
| `GET` | `/me` | Private | Get current user profile |
| `PUT` | `/profile` | Private | Update profile |

### JurisPilot AI — `/api/ai`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/query` | Private | Ask JurisPilot a legal question |
| `GET` | `/history` | Private | Get AI chat history |
| `POST` | `/quick-ask` | Private | Quick ask from any page |

### Cases — `/api/cases`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/` | Private (User) | Create a new case |
| `GET` | `/` | Private | Get user's cases |
| `GET` | `/:id` | Private | Get case details |
| `PUT` | `/:id` | Private | Update case |
| `PUT` | `/:id/accept` | Private (Lawyer) | Accept a case |
| `PUT` | `/:id/resolve` | Private | Resolve/close a case |

### Lawyers — `/api/lawyers`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/` | Public | Get all verified lawyers (with filters) |
| `GET` | `/:id` | Public | Get lawyer profile |
| `POST` | `/:id/reviews` | Private | Submit a review |

### Documents — `/api/documents`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/analyze` | Private | Upload & AI-analyze a document |
| `GET` | `/` | Private | Get user's documents |
| `GET` | `/:id` | Private | Get document details |

### Legal Notices — `/api/notices`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/generate` | Private | Generate AI legal notice |
| `GET` | `/` | Private | Get user's notices |
| `GET` | `/:id` | Private | Get notice details |

### Evidence — `/api/evidence`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/upload` | Private | Upload evidence with SHA-256 hash |
| `GET` | `/case/:caseId` | Private | Get evidence for a case |

### Chat — `/api/chat`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/:caseId/messages` | Private | Send a message |
| `GET` | `/:caseId/messages` | Private | Get messages for a case |

### Payments — `/api/payments`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/create-order` | Private | Create Razorpay order |
| `POST` | `/verify` | Private | Verify payment signature |
| `GET` | `/case/:caseId` | Private | Get payments for a case |

### Text-to-Speech — `/api/tts`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/synthesize` | Private | Convert text to speech audio |

### Stats — `/api/stats`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/dashboard` | Private | Get dashboard statistics |

---

## 📁 Project Structure

```
JurisBridge/
├── .env.example                        # 🔑 Environment variables template
├── .gitignore
├── package.json                        # Root package (concurrently)
├── QandA.md                            # Project Q&A documentation
│
├── client/                             # ⚛️ React Frontend (Vite + React 19)
│   ├── .env.production                 # Production env (VITE_API_URL)
│   ├── vercel.json                     # Vercel SPA rewrite config
│   ├── index.html                      # Entry HTML
│   ├── vite.config.js                  # Vite configuration
│   ├── eslint.config.js                # ESLint config
│   ├── package.json
│   ├── public/
│   │   └── gavel.svg                   # App favicon
│   └── src/
│       ├── main.jsx                    # React entry point
│       ├── App.jsx                     # Router & route definitions
│       ├── App.css                     # Global styles
│       ├── index.css                   # Tailwind CSS + custom variables
│       ├── assets/                     # Static assets
│       ├── components/
│       │   ├── ai/
│       │   │   └── MiniJurisPilot.jsx  # 🤖 Floating AI widget
│       │   ├── common/
│       │   │   └── ScrollProgress.jsx  # 📊 Scroll progress bar
│       │   ├── layout/
│       │   │   ├── Navbar.jsx          # 🧭 Navigation bar
│       │   │   └── Footer.jsx          # 📝 Footer
│       │   └── payment/
│       │       └── PaymentButton.jsx   # 💳 Razorpay button
│       ├── pages/
│       │   ├── Landing.jsx             # 🏠 Landing page
│       │   ├── Login.jsx               # 🔐 Login
│       │   ├── Register.jsx            # 📝 User registration
│       │   ├── RegisterLawyer.jsx      # 👨‍⚖️ Lawyer registration
│       │   ├── Dashboard.jsx           # 📊 User dashboard
│       │   ├── JurisPilotChat.jsx      # 🤖 AI chat interface
│       │   ├── MyCases.jsx             # 📂 Case listing
│       │   ├── CaseDetail.jsx          # 📋 Case detail view
│       │   ├── CreateCase.jsx          # ➕ New case form
│       │   ├── ChatRoom.jsx            # 💬 Real-time chat
│       │   ├── VideoCall.jsx           # 🎥 Video consultation
│       │   ├── MyDocuments.jsx         # 📄 Document management
│       │   ├── LegalNotices.jsx        # 📜 Notice listing
│       │   ├── CreateNotice.jsx        # ✍️ Notice generator
│       │   ├── LawyerMarketplace.jsx   # 🏪 Lawyer marketplace
│       │   ├── LawyerProfile.jsx       # 👤 Lawyer profile
│       │   ├── LawyerDashboard.jsx     # 📊 Lawyer dashboard
│       │   └── LawyerRequests.jsx      # 📨 Incoming requests
│       ├── services/
│       │   ├── api.js                  # 🌐 Axios instance + interceptors
│       │   ├── socket.js              # 🔌 Socket.io client
│       │   └── voiceService.js        # 🗣️ Speech recognition & TTS
│       └── store/
│           ├── authStore.js            # 🔐 Zustand auth state
│           └── themeStore.js           # 🌙 Zustand theme state
│
└── server/                             # 🖥️ Express.js Backend
    ├── server.js                       # 🚀 App entry + middleware setup
    ├── package.json
    ├── config/
    │   ├── db.js                       # 🗄️ MongoDB connection
    │   ├── aiProviders.js              # 🤖 AI provider initialization
    │   ├── cloudinary.js               # ☁️ Cloudinary config & upload
    │   ├── email.js                    # 📧 Nodemailer transporter
    │   └── socket.js                   # 🔌 Socket.io server setup
    ├── controllers/
    │   ├── authController.js           # 🔐 Auth logic
    │   ├── aiController.js             # 🤖 JurisPilot AI logic
    │   ├── caseController.js           # 📂 Case CRUD + auto-matching
    │   ├── chatController.js           # 💬 Chat message handling
    │   ├── documentController.js       # 📄 Document upload & analysis
    │   ├── evidenceController.js       # 🔐 Evidence upload + hashing
    │   ├── lawyerController.js         # 👨‍⚖️ Lawyer management
    │   ├── noticeController.js         # 📜 Legal notice generation
    │   └── paymentController.js        # 💳 Razorpay integration
    ├── middleware/
    │   ├── authMiddleware.js           # 🔒 JWT verification + role check
    │   ├── errorHandler.js             # ❌ Global error handler
    │   └── upload.js                   # 📁 Multer file upload config
    ├── models/
    │   ├── User.js                     # 👤 User schema
    │   ├── Lawyer.js                   # 👨‍⚖️ Lawyer profile schema
    │   ├── Case.js                     # 📂 Case schema + timeline
    │   ├── ChatMessage.js              # 💬 Chat message schema
    │   ├── AIQuery.js                  # 🤖 AI query history schema
    │   ├── Document.js                 # 📄 Document schema
    │   ├── Evidence.js                 # 🔐 Evidence schema + hash
    │   ├── LegalNotice.js              # 📜 Legal notice schema
    │   ├── Payment.js                  # 💳 Payment schema
    │   └── Review.js                   # ⭐ Lawyer review schema
    ├── routes/
    │   ├── authRoutes.js               # /api/auth/*
    │   ├── aiRoutes.js                 # /api/ai/*
    │   ├── caseRoutes.js               # /api/cases/*
    │   ├── chatRoutes.js               # /api/chat/*
    │   ├── documentRoutes.js           # /api/documents/*
    │   ├── evidenceRoutes.js           # /api/evidence/*
    │   ├── lawyerRoutes.js             # /api/lawyers/*
    │   ├── noticeRoutes.js             # /api/notices/*
    │   ├── paymentRoutes.js            # /api/payments/*
    │   ├── quickAskRoutes.js           # /api/ai/quick-ask
    │   ├── statsRoutes.js              # /api/stats/*
    │   └── ttsRoutes.js                # /api/tts/*
    ├── services/
    │   ├── aiService.js                # 🤖 Multi-provider AI logic
    │   ├── documentService.js          # 📄 Text extraction & analysis
    │   ├── notificationService.js      # 🔔 Email + SMS notifications
    │   └── ttsService.js               # 🗣️ TTS synthesis
    └── utils/
        ├── constants.js                # 📋 App-wide constants
        ├── emailTemplates.js           # 📧 HTML email templates
        ├── helpers.js                  # 🔧 Utility functions
        ├── seedLawyers.js              # 🌱 Database seeder
        └── validators.js              # ✅ Input validation rules
```

---

## 🔑 Environment Variables

### Server `.env` (in `server/` directory)

Create a `.env` file inside the `server/` folder with the following variables:

```env
# ─────────────────────────────────────────────
# 🖥️  SERVER CONFIGURATION
# ─────────────────────────────────────────────
NODE_ENV=development
PORT=5000

# ─────────────────────────────────────────────
# 🗄️  DATABASE
# ─────────────────────────────────────────────
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/jurisbridge?retryWrites=true&w=majority

# ─────────────────────────────────────────────
# 🔐  AUTHENTICATION
# ─────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# ─────────────────────────────────────────────
# 🌐  CLIENT URL (for CORS)
# ───���─────────────────────────────────────────
CLIENT_URL=https://juris-bridge-my3w.vercel.app

# ─────────────────────────────────────────────
# 🤖  AI PROVIDERS (JurisPilot)
# ─────────────────────────────────────────────
# Provider 1: Anthropic Claude (Primary)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx

# Provider 2: Google Gemini (Fallback 1)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX

# Provider 3: OpenAI GPT (Fallback 2)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ─────────────────────────────────────────────
# ☁️  CLOUDINARY (File Storage)
# ─────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ─────────────────────────────────────────────
# 💳  RAZORPAY (Payments)
# ─────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# ─────────────────────────────────────────────
# 📧  EMAIL (Nodemailer - Gmail SMTP)
# ─────────────────────────────────────────────
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM="JurisBridge <noreply@jurisbridge.com>"

# ─────────────────────────────────────────────
# 📱  TWILIO (SMS Notifications)
# ─────────────────────────────────────────────
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# ─────────────────────────────────────────────
# 🗣️  TEXT-TO-SPEECH (Optional Premium)
# ─────────────────────────────────────────────
ELEVENLABS_API_KEY=your_elevenlabs_api_key
GOOGLE_TTS_API_KEY=your_google_tts_api_key
```

### Client `.env` (in `client/` directory)

Create a `.env` file inside the `client/` folder:

```env
# ─────────────────────────────────────────────
# ⚛️  VITE CLIENT CONFIGURATION
# ─────────────────────────────────────────────

# API Base URL (Backend)
VITE_API_URL=http://localhost:5000/api

# Socket.io URL (Backend)
VITE_SOCKET_URL=http://localhost:5000

# Razorpay Key (Public Key - safe to expose)
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXX
```

### Client `.env.production` (for Vercel deployment)

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-backend-url.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXX
```

> ⚠️ **Important:** Never commit `.env` files to version control. Add them to `.gitignore`.

### 📋 Environment Variables Summary

| Variable | Required | Service | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | ✅ | Server | `development` or `production` |
| `PORT` | ✅ | Server | Server port (default: 5000) |
| `MONGO_URI` | ✅ | MongoDB | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Auth | Secret key for JWT signing |
| `JWT_EXPIRE` | ✅ | Auth | Token expiration (e.g., `30d`) |
| `CLIENT_URL` | ✅ | CORS | Frontend URL for CORS whitelist |
| `ANTHROPIC_API_KEY` | ⚡ | AI | Anthropic Claude API key (Primary AI) |
| `GEMINI_API_KEY` | ⚡ | AI | Google Gemini API key (Fallback 1) |
| `OPENAI_API_KEY` | ⚡ | AI | OpenAI GPT API key (Fallback 2) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Storage | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Storage | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Storage | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | ✅ | Payments | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | ✅ | Payments | Razorpay key secret |
| `EMAIL_HOST` | ✅ | Email | SMTP host (e.g., smtp.gmail.com) |
| `EMAIL_PORT` | ✅ | Email | SMTP port (587 for TLS) |
| `EMAIL_USER` | ✅ | Email | SMTP username/email |
| `EMAIL_PASS` | ✅ | Email | SMTP password / app password |
| `EMAIL_FROM` | ✅ | Email | Sender display name & email |
| `TWILIO_ACCOUNT_SID` | 📱 | SMS | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | 📱 | SMS | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | 📱 | SMS | Twilio phone number |
| `ELEVENLABS_API_KEY` | 🔊 | TTS | ElevenLabs API key (optional premium) |
| `GOOGLE_TTS_API_KEY` | 🔊 | TTS | Google TTS API key (optional) |
| `VITE_API_URL` | ✅ | Client | Backend API base URL |
| `VITE_SOCKET_URL` | ✅ | Client | Socket.io server URL |
| `VITE_RAZORPAY_KEY_ID` | ✅ | Client | Razorpay public key |

> **Legend:** ✅ Required | ⚡ At least one AI provider required | 📱 Optional (SMS) | 🔊 Optional (Premium TTS)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MongoDB Atlas** account ([Sign up](https://www.mongodb.com/cloud/atlas))
- **Cloudinary** account ([Sign up](https://cloudinary.com/))
- At least **one AI provider** API key (Anthropic / Google / OpenAI)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Tiwari1782/JurisBridge.git
cd JurisBridge

# 2. Install server dependencies
cd server
npm install

# 3. Install client dependencies
cd ../client
npm install

# 4. Create environment files
# → Copy the .env templates from the section above
# → server/.env  (backend config)
# → client/.env  (frontend config)

# 5. Seed the database (optional - adds demo lawyers)
cd ../server
node utils/seedLawyers.js

# 6. Run both client & server concurrently
cd ..
npm run dev
```

### Running Individually

```bash
# Backend only (port 5000)
cd server
npm run dev

# Frontend only (port 5173)
cd client
npm run dev
```

### Production Build

```bash
# Build the client
cd client
npm run build

# Start the server in production
cd ../server
NODE_ENV=production node server.js
```

---

## 🚢 Deployment

### Frontend → Vercel

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set **Root Directory** to `client`
3. Set **Build Command** to `npm run build`
4. Set **Output Directory** to `dist`
5. Add environment variables:
   - `VITE_API_URL` = your backend URL + `/api`
   - `VITE_SOCKET_URL` = your backend URL
   - `VITE_RAZORPAY_KEY_ID` = your Razorpay key

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Set **Root Directory** to `server`
3. Set **Build Command** to `npm install`
4. Set **Start Command** to `node server.js`
5. Add all server environment variables from the `.env` template above

---

## 📊 Database Models

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User      │    │   Lawyer    │    │   Review    │
│─────────────│    │─────────────│    │─────────────│
│ name        │───→│ userId      │←───│ lawyerId    │
│ email       │    │ barCouncil# │    │ userId      │
│ password    │    │ specialize  │    │ rating      │
│ role        │    │ experience  │    │ comment     │
│ phone       │    │ fee         │    └─────────────┘
│ language    │    │ rating      │
└──────┬──────┘    └─────────────┘
       │
       │    ┌─────────────┐    ┌─────────────┐
       ├───→│    Case      │───→│ ChatMessage │
       │    │─────────────│    │─────────────│
       │    │ title       │    │ caseId      │
       │    │ description │    │ senderId    │
       │    │ category    │    │ message     │
       │    │ status      │    │ attachments │
       │    │ lawyerId    │    └─────────────┘
       │    │ timeline    │
       │    └──────┬──────┘
       │           │
       │    ┌──────┴──────┐    ┌─────────────┐
       │    │  Evidence   │    │  Document   │
       │    │─────────────│    │─────────────│
       │    │ caseId      │    │ userId      │
       │    │ fileUrl     │    │ caseId      │
       │    │ fileHash    │    │ analysis    │
       │    │ evidenceType│    │ fileUrl     │
       │    └─────────────┘    └─────────────┘
       │
       │    ┌─────────────┐    ┌─────────────┐
       ├───→│  AIQuery    │    │LegalNotice  ���
       │    │─────────────│    │─────────────│
       │    │ query       │    │ sender      │
       │    │ response    │    │ recipient   │
       │    │ provider    │    │ generated   │
       │    │ confidence  │    │ Notice      │
       │    │ escalated   │    │ status      │
       │    └─────────────┘    └─────────────┘
       │
       └───→┌─────────────┐
            │  Payment    │
            │─────────────│
            │ caseId      │
            │ amount      │
            │ razorpayId  │
            │ status      │
            └─────────────┘
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

<div align="center">

**Prakash Tiwari**

[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-00d4ff?style=for-the-badge&labelColor=0D1B2A)](https://github.com/Tiwari1782/PORTFOLIO)
[![GitHub](https://img.shields.io/badge/GitHub-Tiwari1782-181717?style=for-the-badge&logo=github)](https://github.com/Tiwari1782)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/prakash-tiwari-8900bb2b2/)
[![LeetCode](https://img.shields.io/badge/LeetCode-pRaKaSh1782-FFA116?style=for-the-badge&logo=leetcode)](https://leetcode.com/u/pRaKaSh1782/)

</div>

---

<div align="center">

### ⭐ Star this repository if you found it useful!

**Built with ❤️ by [Prakash Tiwari, Piyush Kumar, Harnoor Kaur, Prince Sagwal](https://github.com/Tiwari1782)**

*Bridging the gap between citizens and justice through technology*

</div>