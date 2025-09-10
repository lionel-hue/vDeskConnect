import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    GraduationCap,
    Users,
    Eye,
    EyeOff
} from 'lucide-react';
import Login from './auth/Login';
import SignupSelection from './auth/SignupSelection';
import SignupTeacher from './auth/SignupTeacher';
import SignupStudent from './auth/SignupStudent';
import VerifyAccount from './auth/VerifyAccount';
import MessagePopup from './MessagePopup'; // Add this import
import '../style/auth.css';

function App() {
    const [formMessage, setFormMessage] = useState(null);

    // Function to show success/error messages
    const showMessage = (type, text, duration = 5000) => {
        setFormMessage({ type, text });
        // Auto-hide after duration
        setTimeout(() => setFormMessage(null), duration);
    };

    const handleCloseMessage = () => {
        setFormMessage(null);
    };

    return (
        <Router>
            <div className="app">
                {/* Add MessagePopup here */}
                <MessagePopup
                    message={formMessage}
                    onClose={handleCloseMessage}
                />

                <Routes>
                    <Route
                        path="/"
                        element={<LoginWrapper formMessage={formMessage} showMessage={showMessage} />}
                    />
                    <Route
                        path="/signup-selection"
                        element={<SignupSelectionWrapper formMessage={formMessage} showMessage={showMessage} />}
                    />
                    <Route
                        path="/signup-teacher"
                        element={<SignupTeacherWrapper showMessage={showMessage} />}
                    />
                    <Route
                        path="/signup-student"
                        element={<SignupStudentWrapper showMessage={showMessage} />}
                    />
                    <Route
                        path="/verify-account"
                        element={<VerifyAccountWrapper />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

// Wrapper components to use useNavigate
function LoginWrapper({ formMessage, showMessage }) {
    const navigate = useNavigate();
    return (
        <Login
            onSignupClick={() => navigate('/signup-selection')}
            formMessage={formMessage}
            showMessage={showMessage}
        />
    );
}

function SignupSelectionWrapper({ formMessage, showMessage }) {
    const navigate = useNavigate();
    return (
        <SignupSelection
            onTeacherSignup={() => navigate('/signup-teacher')}
            onStudentSignup={() => navigate('/signup-student')}
            onLoginClick={() => navigate('/')}
            formMessage={formMessage}
            showMessage={showMessage}
        />
    );
}

function SignupTeacherWrapper({ showMessage }) {
    const navigate = useNavigate();
    return (
        <SignupTeacher
            onBackClick={() => navigate('/signup-selection')}
            onSuccess={() => {
                showMessage('success', 'Teacher account created successfully!');
                setTimeout(() => navigate('/'), 2000);
            }}
            showMessage={showMessage}
        />
    );
}

function SignupStudentWrapper({ showMessage }) {
    const navigate = useNavigate();
    return (
        <SignupStudent
            onBackClick={() => navigate('/signup-selection')}
            onSuccess={() => {
                showMessage('success', 'Student account created successfully!');
                setTimeout(() => navigate('/'), 2000);
            }}
            showMessage={showMessage}
        />
    );
}

function VerifyAccountWrapper() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get user data from navigation state including verificationCode
    const { 
        userType = 'student', 
        email = '', 
        phone = '', 
        verificationCode = '' 
    } = location.state || {};

    return (
        <VerifyAccount
            userType={userType}
            email={email}
            phone={phone}
            verificationCode={verificationCode} // Pass the actual code
            onBackClick={() => navigate('/signup-selection')}
        />
    );
}

export default App;