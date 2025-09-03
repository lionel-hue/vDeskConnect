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
import '../style/auth.css';

function App() {
    const [formMessage, setFormMessage] = useState(null);

    // Function to show success/error messages
    const showMessage = (type, text) => {
        setFormMessage({ type, text });
        setTimeout(() => setFormMessage(null), 5000);
    };

    return (
        <Router>
            <div className="app">
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
    // In a real app, you would get these values from your state management or context
    const userType = 'student'; // or 'teacher'
    const email = 'user@example.com';
    const phone = '+1234567890';

    return (
        <VerifyAccount
            userType={userType}
            email={email}
            phone={phone}
            onBackClick={() => navigate('/signup-selection')}
        />
    );
}

export default App;