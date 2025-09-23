import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Login from './auth/Login';
import SignupSelection from './auth/SignupSelection';
import SignupTeacher from './auth/SignupTeacher';
import SignupStudent from './auth/SignupStudent';
import VerifyAccount from './auth/VerifyAccount';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import DashboardLayout from './dashboard/DashboardLayout';
import DashboardHome from './dashboard/DashboardHome';
import SidebarNav from './components/SidebarNav';
import '../style/auth.css';
import '../style/sidebar.css'

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <Router>
            <div className="app">
                {/* SidebarNav is rendered here to be available across all authenticated routes */}
                <SidebarNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LoginWrapper onSidebarToggle={() => setSidebarOpen(true)} />} />
                    <Route path="/signup-selection" element={<SignupSelectionWrapper />} />
                    <Route path="/signup-teacher" element={<SignupTeacherWrapper />} />
                    <Route path="/signup-student" element={<SignupStudentWrapper />} />
                    <Route path="/verify-account" element={<VerifyAccountWrapper />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Protected Dashboard Routes */}
                    <Route
                        path="/dashboard/*"
                        element={
                            <DashboardLayout
                                sidebarOpen={sidebarOpen}
                                onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                            />
                        }
                    >
                        <Route index element={<DashboardHome />} />
                        <Route path="analytics" element={<div>Analytics Page</div>} />
                        <Route path="grades" element={<div>Grades Page</div>} />
                        <Route path="invite-manager" element={<div>Invite Manager Page</div>} />
                        <Route path="lectures" element={<div>Lectures Page</div>} />
                        <Route path="subjects" element={<div>Subjects Page</div>} />
                        <Route path="user-management" element={<div>User Management Page</div>} />
                        <Route path="profile" element={<div>Profile Page</div>} />
                        <Route path="profile/edit" element={<div>Edit Profile Page</div>} />
                        <Route path="settings" element={<div>Settings Page</div>} />
                        <Route path="privacy" element={<div>Privacy Page</div>} />
                    </Route>
                </Routes>
            </div>
        </Router>
    );
}

// Updated wrapper components to include sidebar toggle functionality
function LoginWrapper({ onSidebarToggle }) {
    const navigate = useNavigate();
    return (
        <Login
            onSignupClick={() => navigate('/signup-selection')}
            onSidebarToggle={onSidebarToggle}
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
                setTimeout(() => navigate('/dashboard'), 2000);
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
                setTimeout(() => navigate('/dashboard'), 2000);
            }}
        />
    );
}

function VerifyAccountWrapper() {
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
            onSuccess={() => navigate('/dashboard')}
        />
    );
}

export default App;