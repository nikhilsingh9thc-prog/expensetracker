# 💰 Money Management System

A full-stack **Personal Finance & Expense Tracker** web application built with **Django REST Framework** (backend) and **React + Vite** (frontend). Track your income, expenses, budgets, and analytics — all in one place.

---

## 🚀 Live Demo

> **Live Demo:** [https://expensetracker-clwy.onrender.com/](https://expensetracker-clwy.onrender.com/)  
> **Backend API:** [https://expensetracker-clwy.onrender.com/api](https://expensetracker-clwy.onrender.com/api)

---

## ✨ Features

- 🔐 **Authentication** — JWT-based Register / Login / Logout
- 💸 **Transactions** — Add, view, and filter income & expense transactions
- 📊 **Analytics** — Visual charts for spending trends and category breakdowns
- 🎯 **Budgets** — Set monthly budgets and track progress
- 🌍 **Multi-Language Support** — English, Hindi, Spanish, French
- 💱 **Multi-Currency Support** — INR, USD, EUR, GBP, JPY with real-time conversion
- 🎨 **Theme Customization** — Dark/Light mode + custom accent color picker
- 🤖 **AI Assistant** — Built-in AI financial advice widget
- 🆘 **Help Center** — In-app support and FAQ page
- 📱 **Responsive Design** — Works across desktop and mobile

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Django 6.0 | Web framework |
| Django REST Framework | REST API |
| SimpleJWT | JWT Authentication |
| PostgreSQL / SQLite | Database |
| Gunicorn | Production WSGI server |
| WhiteNoise | Static file serving |
| django-cors-headers | CORS handling |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool & dev server |
| React Router DOM 7 | Client-side routing |
| Axios | HTTP requests |
| Chart.js + react-chartjs-2 | Data visualization |

---

## 📁 Project Structure

```
money_management/
├── backend/                  # Django REST API
│   ├── accounts/             # User auth (register, login, profile)
│   ├── transactions/         # Income & expense transactions
│   ├── budgets/              # Budget management
│   ├── analytics/            # Spending analytics & reports
│   ├── helpdesk/             # Help center / support tickets
│   ├── money_mgmt/           # Django project settings & URLs
│   ├── requirements.txt      # Python dependencies
│   ├── manage.py
│   └── build.sh              # Render deployment build script
│
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── api/              # Axios instance & API calls
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth, Theme, Currency, Language contexts
│   │   ├── i18n/             # Translation strings
│   │   ├── pages/            # Route-level page components
│   │   └── data/             # Static data (AI responses, etc.)
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
├── start.ps1                 # Windows quick-start script
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

---

### 🔧 Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create a .env file (see Environment Variables below)

# 5. Run migrations
python manage.py migrate

# 6. Start the server
python manage.py runserver
```

Backend will run at: **http://localhost:8000**

---

### 🎨 Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Frontend will run at: **http://localhost:5173**

---

### 🪟 Quick Start (Windows)

You can use the included PowerShell script to start both servers:

```powershell
.\start.ps1
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3   # or your PostgreSQL URL
```

> ⚠️ Never commit your `.env` file. It's already in `.gitignore`.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/accounts/register/` | Register new user |
| POST | `/api/accounts/login/` | Login & get JWT tokens |
| POST | `/api/accounts/token/refresh/` | Refresh access token |
| GET/POST | `/api/transactions/` | List / create transactions |
| GET/POST | `/api/budgets/` | List / create budgets |
| GET | `/api/analytics/summary/` | Spending analytics |
| GET/POST | `/api/helpdesk/` | Help center tickets |

---

## 🚢 Deployment

### Backend → [Render](https://render.com)
1. Connect your GitHub repo to Render
2. Set build command: `./build.sh`
3. Set start command: `gunicorn money_mgmt.wsgi`
4. Add environment variables in the Render dashboard

### Frontend → [Vercel](https://vercel.com) / [Netlify](https://netlify.com)
```bash
npm run build   # Outputs to /dist
```
Deploy the `dist/` folder to any static hosting provider.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Nikhil Singh**  
GitHub: [@nikhilsingh9thc-prog](https://github.com/nikhilsingh9thc-prog)
