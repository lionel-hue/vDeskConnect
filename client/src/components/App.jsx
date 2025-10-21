import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Login from './auth/Login';
import SignupSelection from './auth/SignupSelection';
import SignupTeacher from './auth/SignupTeacher';
import SignupStudent from './auth/SignupStudent';
import VerifyAccount from './auth/VerifyAccount';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import Dashboard from './main/Dashboard';
import { SearchProvider } from './SearchManager';
import InviteManager from './main/InviteManager';

// import UserManagement from './UserManagement';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <SearchProvider>
            <Router>
                <div className="app">
                    <Routes>
                        {/* Public Routes - No Header/Sidebar */}
                        <Route path="/" element={<LoginWrapper onLogin={() => setIsAuthenticated(true)} />} />
                        <Route path="/signup-selection" element={<SignupSelectionWrapper />} />
                        <Route path="/signup-teacher" element={<SignupTeacherWrapper />} />
                        <Route path="/signup-student" element={<SignupStudentWrapper />} />
                        <Route path="/verify-account" element={<VerifyAccountWrapper onVerify={() => setIsAuthenticated(true)} />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

                        {/* Protected Routes - Each is standalone with Header/Sidebar */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/invite-manager" element={<InviteManager />} />
                    </Routes>
                </div>
            </Router>
        </SearchProvider>
    );
}

// Updated LoginWrapper to pass onLoginSuccess
function LoginWrapper({ onLogin }) {
    const navigate = useNavigate();
    return (
        <Login
            onSignupClick={() => navigate('/signup-selection')}
            onLoginSuccess={() => {
                onLogin(); // This sets isAuthenticated to true
                // Note: We DON'T navigate here anymore - navigation happens in Login.jsx
            }}
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
                setTimeout(() => navigate('/verify-account'), 2000);
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
                setTimeout(() => navigate('/verify-account'), 2000);
            }}
        />
    );
}

function VerifyAccountWrapper({ onVerify }) {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        userType = 'student',
        email = '',
        phone = '',
        verificationCode = '',
        fromLogin = false
    } = location.state || {};

    return (
        <VerifyAccount
            userType={userType}
            email={email}
            phone={phone}
            verificationCode={verificationCode}
            fromLogin={fromLogin}
            onBackClick={() => navigate('/')}
            onSuccess={() => {
                onVerify();
                navigate('/dashboard');
            }}
        />
    );
}

export default App;