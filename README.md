# ⚖️ NyayaSetu — India's Bridge Between Law and Citizens

> **NyayaSetu** (नयायसेतु) is an AI-powered legal document analysis platform designed to make Indian laws, bills, and legal documents understandable for everyday citizens.

[![GitHub](https://img.shields.io/badge/GitHub-PriyanshuKr--2027-blue)](https://github.com/PriyanshuKr-2027/NyayaSetu)
[![License](https://img.shields.io/badge/License-MIT-green)]()
[![Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React%20%7C%20Supabase-orange)]()

---

## 🎯 Overview

NyayaSetu bridges the gap between complex legal language and ordinary Indian citizens. Upload any legal document (bills, acts, policies), and our AI-powered system will:

✅ **Summarize** complex legal text in simple, understandable language  
✅ **Explain** key points and how they affect you  
✅ **Support Multiple Languages** — English, Hindi, Tamil, Bengali, and Hinglish  
✅ **Answer Questions** about the document using AI  
✅ **Share Analysis** with others via secure links  
✅ **Generate Reports** in PDF format  

---

## ✨ Key Features

### For Citizens
- 📄 **Upload & Analyze** — Upload PDF documents and get instant AI analysis
- 🎯 **Smart Summaries** — AI breaks down complex legal text into digestible points
- 🌐 **Multi-Language Support** — Read summaries in English, Hindi, Tamil, Bengali, or Hinglish
- ❓ **Ask Questions** — Have conversational Q&A with an AI about the document
- 📊 **Visual Analysis** — Processing pipeline visualization and analytics dashboard
- 🔗 **Share Results** — Create shareable links to send analyses to friends/colleagues
- 📥 **Export as PDF** — Download analysis reports for offline access

### For Developers
- 🔐 **OTP-Based Authentication** — Secure email OTP signin via Supabase
- 💾 **Cloud Database** — All data persisted in Supabase PostgreSQL
- 🚀 **Scalable Backend** — FastAPI with support for multiple Groq API keys
- 🎨 **Modern UI** — React with Tailwind CSS and shadcn components
- 📱 **Responsive Design** — Works seamlessly on desktop and mobile
- 🔌 **API-First Architecture** — RESTful APIs for all operations

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                |
│  Dashboard | Papers | Analyze | Analysis | Profile | Shared │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────────────────────────┐
│                  Backend (FastAPI)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Routes: /api/analyze, /api/health, /api/history     │  │
│  │ Services:                                            │  │
│  │  • PDF Parser (PyMuPDF) — Extract text from PDFs    │  │
│  │  • Groq Summarizer — AI analysis & Q&A             │  │
│  │  • Supabase Service — User data & analysis storage │  │
│  │  • ScaleDown Service — Text compression            │  │
│  └──────────────────────────────────────────────────────┘  │
└────────┬──────────────────────────────┬────────────────────┘
         │                              │
    ┌────▼────────┐          ┌──────────▼──────────┐
    │ Groq API    │          │ Supabase            │
    │ (LLaMA 3.3) │          │ • Auth              │
    └─────────────┘          │ • Database          │
                             │ • Real-time         │
                             └─────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19.2.4 with Vite
- **Styling:** Tailwind CSS + shadcn/ui components
- **Routing:** React Router DOM 7.13.1
- **State Management:** React Context + Custom Hooks
- **HTTP Client:** Axios
- **Database Client:** Supabase SDK
- **UI Components:** Radix UI, Framer Motion, Magic UI
- **Export:** jsPDF + html2canvas

### Backend
- **Framework:** FastAPI (async Python web framework)
- **Server:** Uvicorn
- **PDF Processing:** PyMuPDF (fitz)
- **AI/LLM:** Groq API (LLaMA 3.3-70b-versatile)
- **Database:** Supabase (PostgreSQL)
- **File Handling:** python-multipart, httpx
- **Email:** Resend API
- **ORM:** Supabase Python client
- **Environment:** python-dotenv

### Infrastructure
- **Database:** Supabase (PostgreSQL + Auth)
- **LLM Inference:** Groq Cloud API
- **Frontend Hosting:** Netlify
- **Backend Hosting:** Railway.app
- **Authentication:** Supabase Auth (OTP via Email)

---

## 📋 Project Structure

```
NyayaSetu/
├── frontend/                          # React + Vite frontend
│   ├── src/
│   │   ├── pages/                     # Route pages
│   │   │   ├── Analyze/               # File upload & analysis
│   │   │   ├── Auth/                  # OTP login
│   │   │   ├── Dashboard/             # Home page + analytics
│   │   │   ├── Papers/                # User's uploaded documents
│   │   │   ├── Profile/               # User settings
│   │   │   └── Shared/                # Public shared analysis view
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn UI primitives
│   │   │   ├── magicui/               # Magic UI components
│   │   │   ├── layout/                # App layout (Sidebar, Header)
│   │   │   ├── UploadZone.jsx         # Drag-drop file upload
│   │   │   ├── MetricsBento.jsx       # Analysis metrics display
│   │   │   ├── SummaryPanel.jsx       # AI summary display
│   │   │   ├── PipelineBeam.jsx       # Processing visualization
│   │   │   └── LoadingOrbit.jsx       # Loading animation
│   │   ├── lib/
│   │   │   ├── api.js                 # Backend API calls
│   │   │   ├── supabase.js            # Supabase client
│   │   │   └── utils.js               # Utility functions
│   │   ├── App.jsx                    # Main app + routing
│   │   └── main.jsx                   # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                           # FastAPI backend
│   ├── main.py                        # FastAPI app setup
│   ├── services/
│   │   ├── groq_summarizer.py         # AI analysis & Q&A
│   │   ├── pdf_parser.py              # PDF text extraction
│   │   ├── supabase_service.py        # Database operations
│   │   └── scaledown_service.py       # Text compression
│   ├── tests/
│   │   ├── test_groq_summarizer.py
│   │   └── test_supabase_service.py
│   ├── requirements.txt               # Python dependencies
│   ├── Procfile                       # Railway deployment config
│   └── railway.json                   # Railway environment config
│
├── nyayasetu_screens.json             # Stitch design exports
├── assets/
│   ├── stitch/                        # Pre-rendered HTML screens
│   └── ...
│
└── README.md                          # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ (for frontend)
- **Python** 3.8+ (for backend)
- **Git** for version control
- Accounts for: Supabase, Groq API, and Resend (email)

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file with:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8000  # or your backend URL

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with:
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GROQ_API_KEY_1=your_groq_api_key
# Optional: GROQ_API_KEY_2, GROQ_API_KEY_3, etc.
SCALEDOWN_API_KEY=your_scaledown_api_key
RESEND_API_KEY=your_resend_api_key

# Start development server
uvicorn main:app --reload --port 8000
```

### Full Stack Development

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev

# App available at: http://localhost:5173 (or shown in terminal)
# API available at: http://localhost:8000
# API Docs available at: http://localhost:8000/docs
```

---

## 📚 API Endpoints

All API endpoints are prefixed with `/api`:

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/analyze` | Upload PDF and analyze |
| `GET` | `/history/:userId` | Get user's analysis history |
| `GET` | `/analysis/:shareId` | Get shared analysis |
| `GET` | `/stats` | Get global statistics |

### Request: POST /analyze
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@document.pdf" \
  -F "language=english" \
  -F "user_id=user123"
```

### Response
```json
{
  "analysis_id": "abc123xyz",
  "summary": "📋 WHAT THIS IS ABOUT\n...",
  "pages": 45,
  "tokens": 12340,
  "language": "english"
}
```

---

## 🌍 Supported Languages

| Language | Code | Example |
|----------|------|---------|
| English | `english` | "This law requires..." |
| Hindi | `hindi` | "यह कानून कहता है..." |
| Tamil | `tamil` | "இந்த சட்டம்..." |
| Bengali | `bengali` | "এই আইন..." |
| Hinglish | `hinglish` | "Iska matlab yeh hota hai..." |

---

## 🔐 Authentication Flow

1. User enters email on Auth page
2. System sends OTP via Resend email service
3. User enters OTP code
4. Supabase Auth verifies and creates session
5. User session stored in localStorage
6. Frontend redirects to Dashboard
7. All API calls include session token in headers

---

## 📊 Data Model

### Core Tables (Supabase)

**users** (auto-managed by Supabase Auth)
```
id (UUID)
email (text, unique)
created_at (timestamp)
```

**profiles**
```
id (UUID, references users.id)
full_name (text)
preferred_language (text)
created_at (timestamp)
updated_at (timestamp)
```

**analyses**
```
id (UUID)
user_id (UUID)
file_name (text)
original_text (text)
summary (text)
language (text)
pages (integer)
tokens (integer)
share_id (text, unique, nullable)
created_at (timestamp)
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/

# Run specific test
pytest tests/test_groq_summarizer.py -v

# Run with coverage
pytest tests/ --cov=services
```

### Frontend Tests
```bash
cd frontend
npm run test

# Watch mode
npm run test -- --watch
```

---

## 🚢 Deployment

### Frontend (Netlify)

```bash
# Build
npm run build

# Deploy via Netlify CLI
netlify deploy --prod --dir=dist
```

**Environment Variables (Netlify .env):**
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=https://api.nyayasetu.com
```

### Backend (Railway)

```bash
# Railway auto-detects from Procfile
# Procfile:
# web: uvicorn main:app --host 0.0.0.0 --port $PORT

# Environment variables in Railway dashboard:
SUPABASE_URL=...
SUPABASE_KEY=...
GROQ_API_KEY_1=...
```

---

## 🐛 Troubleshooting

### Issue: "Module not found" error in backend
```bash
# Ensure you're in the virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Issue: CORS errors in frontend
- Ensure backend CORS middleware is configured correctly
- Check `VITE_API_URL` environment variable
- Backend and frontend should be on different ports

### Issue: Supabase connection fails
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Ensure Supabase project is active
- Check network connectivity

### Issue: PDF parsing fails
- Ensure uploaded file is a valid PDF
- Check file size (should be < 25MB recommended)
- Verify PyMuPDF is properly installed

---

## 📈 Performance & Optimization

### Frontend Optimizations
- Code splitting via React Router
- Lazy loading of pages
- Image optimization
- CSS purging with Tailwind
- Vite build optimization

### Backend Optimizations
- Text compression via ScaleDown API to reduce token usage
- Multiple Groq API keys for rate limiting resilience
- Async/await for I/O operations
- Efficient PDF text extraction

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and test thoroughly
4. **Commit with clear messages:**
   ```bash
   git commit -m "feat: add specific feature description"
   ```
5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request** against `main`

### Development Standards
- Use descriptive commit messages
- Test all changes before submitting PR
- Follow existing code styles
- Update documentation for new features
- Ensure no console errors or warnings

---

## 📝 Development Roadmap

- [ ] **Phase 1** ✅ Core API & PDF parsing
- [ ] **Phase 2** ✅ Frontend UI implementation
- [ ] **Phase 3** ✅ Authentication & database
- [ ] **Phase 4** → Advanced Q&A system
- [ ] **Phase 5** → Document comparison
- [ ] **Phase 6** → Export to multiple formats
- [ ] **Phase 7** → Mobile app (React Native/Expo)
- [ ] **Phase 8** → Integration with IndiaStack APIs

---

## 📄 License

This project is open source and available under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Priyanshu Kumar** — Creator & Full Stack Developer

---

## 🙏 Acknowledgments

- [Groq](https://groq.com) — Lightning-fast LLM inference
- [Supabase](https://supabase.com) — Open-source Firebase alternative
- [Railway](https://railway.app) — Modern cloud deployment
- [Netlify](https://netlify.com) — Frontend hosting
- [shadcn/ui](https://ui.shadcn.com) — Beautiful React components

---

## 📞 Support & Contact

- **GitHub Issues:** [Report bugs](https://github.com/PriyanshuKr-2027/NyayaSetu/issues)
- **Email:** [Your contact email]
- **Twitter:** [@yourhandle]

---

## 🔄 Version History

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | March 2026 | Initial release with core features |
| 0.5 | Jan 2026 | Beta testing phase |
| 0.1 | Dec 2025 | MVP with basic functionality |

---

**Created with ❤️ to make Indian laws accessible to everyone.**

⚖️ _"NyayaSetu — Your bridge to understanding the law"_
