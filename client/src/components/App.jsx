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
    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route
                        path="/"
                        element={<LoginWrapper />}
                    />
                    <Route
                        path="/signup-selection"
                        element={<SignupSelectionWrapper />}
                    />
                    <Route
                        path="/signup-teacher"
                        element={<SignupTeacherWrapper />}
                    />
                    <Route
                        path="/signup-student"
                        element={<SignupStudentWrapper />}
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
function LoginWrapper() {
    const navigate = useNavigate();
    return (
        <Login
            onSignupClick={() => navigate('/signup-selection')}
        />
    );
}

function SignupSelectionWrapper() {
    const navigate = useNavigate();
    return (
        <SignupSelection
            onTeacherSignup={() => navigate('/signup-teacher')}
            onStudentSignup={() => navigate('/signup-student')}
            onLoginClick={() => navigate('/')}
        />
    );
}

function SignupTeacherWrapper() {
    const navigate = useNavigate();
    return (
        <SignupTeacher
            onBackClick={() => navigate('/signup-selection')}
            onSuccess={() => {
                setTimeout(() => navigate('/'), 2000);
            }}
        />
    );
}

function SignupStudentWrapper() {
    const navigate = useNavigate();
    return (
        <SignupStudent
            onBackClick={() => navigate('/signup-selection')}
            onSuccess={() => {
                setTimeout(() => navigate('/'), 2000);
            }}
        />
    );
}

function VerifyAccountWrapper() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get user data from navigation state including verificationCode and fromLogin flag
    const {
        userType = 'student',
        email = '',
        phone = '',
        verificationCode = '',
        fromLogin = false // Default to false
    } = location.state || {};

    return (
        <VerifyAccount
            userType={userType}
            email={email}
            phone={phone}
            verificationCode={verificationCode}
            fromLogin={fromLogin} // Pass the fromLogin flag
            onBackClick={() => navigate('/')} // Go back to login, not signup-selection
        />
    );
}

export default App;