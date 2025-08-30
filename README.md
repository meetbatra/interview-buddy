# 🎯 Interview Buddy - AI-Powered Interview Assistant

A comprehensive, AI-driven interview preparation platform that simulates real interview experiences with intelligent conversation flow, professional speech processing, and detailed performance analytics.

![Interview Buddy](https://img.shields.io/badge/Status-Complete-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-green)

## 🌟 Key Features

### 🤖 **AI-Powered Interview Engine**
- **Dynamic Question Generation**: Context-aware questions using Google's Gemini AI
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

### 📊 **Comprehensive Analytics**
- **Performance Scores**: Technical, Communication, and Confidence ratings (0-10)
- **Detailed Feedback**: AI-generated strengths and weaknesses analysis
- **Conversation History**: Complete transcript of your interview session
- **Progress Tracking**: Historical performance across multiple sessions

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
- **AI Integration**: Google Gemini AI, Deepgram, Murf APIs

### **Frontend**
- **Framework**: React 18 with Vite build tool
- **Styling**: Tailwind CSS with custom components
- **State Management**: Zustand for global state
- **Routing**: React Router for navigation
- **Audio**: MediaRecorder API for voice capture
- **UI Components**: Custom terminal-themed component library

### **AI Services**
- **🧠 Google Gemini**: Dynamic question generation and analysis
- **🎤 Deepgram Nova-3**: Professional speech-to-text transcription
- **🗣️ Murf TTS**: High-quality text-to-speech synthesis

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB database
- API keys for Gemini, Deepgram, and Murf

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
cp .env.example .env
```

Configure your `.env` file:
```env
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
MURF_API_KEY=your_murf_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

```bash
# Start backend server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env
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
- **API Documentation**: http://localhost:8080/api/docs

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

## 🏗️ Project Structure

```
interview-buddy/
├── backend/                 # Node.js backend application
│   ├── controllers/         # Route handlers and business logic
│   ├── models/             # MongoDB schemas and models
│   ├── routes/             # API route definitions
│   ├── services/           # External API integrations
│   ├── middleware/         # Authentication and validation
│   ├── config/            # Database and app configuration
│   └── uploads/           # Temporary file storage
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── stores/        # Zustand state management
│   │   ├── api/          # API service functions
│   │   └── assets/       # Static assets and images
│   └── public/           # Public static files
└── README.md             # Project documentation
```

## 🔧 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login

### **Interviews**
- `POST /api/interview/start` - Start new interview session
- `POST /api/interview/:id/transcribe` - Transcribe audio response
- `POST /api/interview/:id/next` - Get next question
- `POST /api/interview/:id/end` - End interview session
- `GET /api/interview/:id/report` - Get interview report

### **User Management**
- `GET /api/user/profile` - Get user profile
- `GET /api/user/history` - Get interview history

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

### **Comprehensive Performance Analysis**
Your interview is evaluated across multiple dimensions:
- **Technical Skills**: Knowledge depth and problem-solving approach
- **Communication**: Clarity, structure, and articulation
- **Confidence**: Delivery, poise, and presence

### **Smart Session Management**
- Sessions auto-save progress every response
- Resume interrupted interviews seamlessly
- Timer management with visual countdown
- Automatic submission prevents incomplete sessions

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: Bcrypt hashing for user passwords
- **Input Validation**: Comprehensive request validation
- **File Upload Security**: Type and size validation for resumes
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Secure cross-origin requests

## 🚀 Deployment

### **Backend Deployment (Recommended: Railway/Render)**
1. Set up environment variables
2. Configure MongoDB Atlas
3. Deploy backend service
4. Update CORS settings for production

### **Frontend Deployment (Recommended: Vercel/Netlify)**
1. Build production bundle: `npm run build`
2. Configure environment variables
3. Deploy static files
4. Update API URLs for production

### **Environment Variables for Production**
Update your production environment with:
- Database connection strings
- API keys for all services
- JWT secrets
- CORS origins
- File upload limits

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
- Documentation: [Link to detailed docs]

## 🏆 Acknowledgments

- **Google Gemini AI** for intelligent conversation generation
- **Deepgram** for professional speech-to-text processing
- **Murf** for high-quality text-to-speech synthesis
- **MongoDB** for robust data storage
- **React & Node.js** communities for excellent frameworks

---

**Built with ❤️ by [Meet Batra](https://github.com/meetbatra)**

*Interview Buddy - Your AI-powered career companion* 🚀
