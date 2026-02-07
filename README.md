# 🎯 Interview Buddy - AI-Powered Interview Assistant

A comprehensive, AI-driven interview preparation platform that simulates real interview experiences with intelligent conversation flow, professional speech processing, and detailed performance analytics.

![Interview Buddy](https://img.shields.io/badge/Status-Complete-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-green)

## 🌟 Key Features

### 🤖 **AI-Powered Interview Engine**
- **Dynamic Question Generation**: Context-aware questions using OpenAI GPT-4.1-mini
- **Intelligent Follow-ups**: Questions adapt based on your responses and resume
- **10-Question Interview**: Structured interview flow with professional pacing
- **Resume Analysis**: AI analyzes your uploaded resume to generate relevant questions

### 🎤 **Professional Audio Processing**
- **Advanced Speech-to-Text**: Deepgram Nova-3 for enterprise-grade transcription
- **High-Quality AI Voice**: Murf TTS for natural, professional interviewer voice
- **Real-time Audio Capture**: MediaRecorder API for seamless voice interaction
- **Smart Audio Controls**: Mic disabled during AI processing for optimal experience

### ⏱️ **Smart Session Management**
- **5-Minute Timer**: Color-coded countdown with automatic submission
- **Session Persistence**: Resume interrupted interviews
- **Auto-save Progress**: Conversation history saved in real-time
- **Completion Tracking**: Mark sessions as completed with timestamps

### 📊 **Comprehensive Analytics & Dashboard**
- **Performance Scores**: Technical, Communication, and Confidence ratings (0-10)
- **Detailed Feedback**: AI-generated strengths and weaknesses analysis
- **Dashboard Overview**: Performance metrics and analytics across all sessions
- **Interview History**: Paginated view of all past interviews with scores
- **Progress Tracking**: Historical performance visualization and improvement trends
- **Session Reports**: Complete transcript and detailed analysis for each interview

### 🔐 **Secure Authentication**
- **Multiple Login Options**: Email/password and Google OAuth
- **JWT Authentication**: Secure session management
- **User Profiles**: Personalized experience with saved data
- **Protected Routes**: Secure access to interview features

### 🎨 **Modern UI/UX**
- **Terminal-Themed Design**: Unique, developer-friendly interface
- **Responsive Layout**: Works perfectly on desktop and mobile
- **Real-time Feedback**: Loading states, animations, and visual cues
- **Accessible Design**: WCAG-compliant interface elements

## 🛠️ Technology Stack

### **Backend**
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt encryption
- **File Processing**: Multer for resume uploads, PDF parsing
- **AI Integration**: OpenAI GPT-4.1-mini (via AI Pipe), Deepgram, Murf APIs

### **Frontend**
- **Framework**: React 18 with Vite build tool
- **Styling**: Tailwind CSS with custom components
- **State Management**: Zustand for global state
- **Routing**: React Router for navigation
- **Audio**: MediaRecorder API for voice capture
- **UI Components**: Custom terminal-themed component library

### **AI Services**
- **🧠 OpenAI GPT-4.1-mini**: Dynamic question generation and analysis (via AI Pipe proxy)
- **🎤 Deepgram Nova-3**: Professional speech-to-text transcription
- **🗣️ Murf TTS**: High-quality text-to-speech synthesis

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB database
- API keys for AI Pipe (OpenAI proxy), Deepgram, and Murf

### 1. Clone the Repository
```bash
git clone https://github.com/meetbatra/interview-buddy.git
cd interview-buddy
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
touch .env
```

Configure your `.env` file:
```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
AI_PIPE_KEY=your_ai_pipe_api_key
AI_PIPE_URL=https://aipipe.org/openai/v1
DEEPGRAM_API_KEY=your_deepgram_api_key
MURF_API_KEY=your_murf_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

**Note**: This project uses [AI Pipe](https://aipipe.org) as a proxy service to access OpenAI GPT-4.1-mini. You'll need to obtain an API key from AI Pipe instead of directly from OpenAI.

```bash
# Start backend server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create .env file
touch .env
```

Configure your frontend `.env` file:
```env
VITE_API_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

```bash
# Start frontend development server
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080

## 📖 How to Use

### 1. **Create Account**
- Sign up with email/password or Google OAuth
- Secure authentication with JWT tokens

### 2. **Upload Resume**
- Drag & drop or click to upload PDF resume
- AI analyzes your background for personalized questions

### 3. **Provide Bio**
- Enter a brief bio about yourself
- Helps AI understand your career goals and experience

### 4. **Start Interview**
- 5-minute timed interview session
- Speak naturally - AI transcribes your responses
- Answer 10 contextual questions based on your background

### 5. **Review Results**
- Get detailed performance analysis
- View scores for technical skills, communication, and confidence
- Read AI-generated feedback on strengths and areas for improvement
- Access complete conversation transcript

### 6. **Track Progress**
- View dashboard with performance analytics
- Browse interview history with pagination
- Monitor improvement trends over time
- Compare scores across multiple sessions

## 🏗️ Project Structure

```
interview-buddy/
├── backend/                 # Node.js backend application
│   ├── controllers/         # Route handlers and business logic
│   │   ├── auth.js         # Authentication (signup, login, Google OAuth)
│   │   ├── dashboard.js    # Dashboard analytics and interview history
│   │   └── interview.js    # Interview management and processing
│   ├── models/             # MongoDB schemas and models
│   │   ├── user.js         # User model with authentication fields
│   │   └── interviewSession.js # Interview session with conversation history
│   ├── routes/             # API route definitions
│   │   ├── auth.js         # Authentication routes
│   │   ├── dashboard.js    # Dashboard and analytics routes
│   │   └── interview.js    # Interview management routes
│   ├── services/           # External API integrations
│   │   ├── aiService.js    # AI integration
│   │   ├── speechToTextService.js # Deepgram speech-to-text
│   │   ├── murffService.js     # Murf text-to-speech
│   │   └── pdfService.js       # PDF resume parsing
│   ├── middleware/         # Authentication and validation middleware
│   ├── config/            # Database and app configuration
│   ├── utils/             # Utility functions (JWT, etc.)
│   └── uploads/           # Temporary file storage (resumes, audio)
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── dashboard/ # Dashboard and analytics components
│   │   │   ├── home/      # Home page components
│   │   │   ├── interview/ # Interview session components
│   │   │   ├── report/    # Report and results components
│   │   │   ├── shared/    # Shared UI components
│   │   │   └── ui/        # Base UI components (buttons, inputs, etc.)
│   │   ├── pages/         # Main application pages
│   │   │   ├── HomePage.jsx       # Landing page with resume upload
│   │   │   ├── LoginPage.jsx      # User authentication
│   │   │   ├── SignupPage.jsx     # User registration
│   │   │   ├── DashboardPage.jsx  # Analytics dashboard
│   │   │   ├── InterviewPage.jsx  # Interview session
│   │   │   └── ReportPage.jsx     # Interview results
│   │   ├── hooks/         # Custom React hooks
│   │   │   └── useInterviewLogic.js # Interview session management
│   │   ├── stores/        # Zustand state management
│   │   │   ├── authStore.js       # Authentication state
│   │   │   └── interviewStore.js  # Interview session state
│   │   ├── api/          # API service functions
│   │   │   ├── userApi.js         # Authentication API calls
│   │   │   ├── interviewApi.js    # Interview management API
│   │   │   └── dashboardApi.js    # Dashboard and analytics API
│   │   └── assets/       # Static assets and images
│   └── public/           # Public static files
└── README.md             # Project documentation
```

## 🔧 API Endpoints

### **Authentication (`/api/auth`)**
- `POST /api/auth/signup` - User registration with username, email, password
- `POST /api/auth/login` - User login with email/password
- `POST /api/auth/google` - Google OAuth authentication

### **Interview Management (`/api/interview`)**
- `POST /api/interview/start` - Start new interview session (with resume upload)
- `POST /api/interview/:sessionId/transcribe` - Transcribe audio response to text
- `POST /api/interview/:sessionId/next` - Get next question based on previous answer
- `POST /api/interview/:sessionId/end` - End interview and get final completion message
- `GET /api/interview/:sessionId/report` - Get detailed interview performance report

### **Dashboard & Analytics (`/api/dashboard`)**
- `GET /api/dashboard/overview` - Get dashboard analytics and performance metrics
- `GET /api/dashboard/history` - Get paginated interview history with scores

## 🎯 Key Features in Detail

### **Intelligent Question Flow**
The AI interviewer generates questions that:
- Build upon your previous answers
- Explore different aspects of your experience
- Progress from general to specific topics
- Adapt difficulty based on your responses

### **Professional Audio Experience**
- **Crystal Clear Transcription**: Deepgram's Nova-3 model ensures accurate speech recognition
- **Natural AI Voice**: Murf's premium TTS creates a realistic interviewer experience
- **Optimized Audio Flow**: Smart mic management prevents feedback and ensures smooth conversation

### **Multi-Dimensional Performance Analysis**
Your interview is evaluated across multiple dimensions:
- **Technical Skills**: Knowledge depth and problem-solving approach
- **Communication**: Clarity, structure, and articulation
- **Confidence**: Delivery, poise, and presence
- **Overall Performance**: Comprehensive scoring with detailed feedback

### **Smart Session Management**
- Sessions auto-save progress every response
- Resume interrupted interviews seamlessly
- Timer management with visual countdown
- Automatic submission prevents incomplete sessions
- Dashboard analytics for progress tracking
- Historical performance comparison

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: Bcrypt hashing for user passwords
- **Input Validation**: Comprehensive request validation
- **File Upload Security**: Type and size validation for resumes
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Secure cross-origin requests

### **Environment Variables for Production**
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `AI_PIPE_KEY` - AI Pipe API key for OpenAI GPT-4.1-mini access
- `AI_PIPE_URL` - AI Pipe proxy URL (https://aipipe.org/openai/v1)
- `DEEPGRAM_API_KEY` - Deepgram speech-to-text API key
- `MURF_API_KEY` - Murf text-to-speech API key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `PORT` - Server port (default: 8080)
- `VITE_API_URL` - Backend API URL for frontend
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID for frontend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📞 Support

For support, questions, or feature requests:
- Create an issue on GitHub
- Email: [meetbatra56@example.com]

## 🏆 Acknowledgments

- **OpenAI GPT-4.1-mini** for intelligent conversation generation
- **Deepgram** for professional speech-to-text processing
- **Murf** for high-quality text-to-speech synthesis
- **MongoDB** for robust data storage
- **React & Node.js** communities for excellent frameworks

---

**Built with ❤️ by [Meet Batra](https://github.com/meetbatra)**

*Interview Buddy - Your AI-powered career companion* 🚀