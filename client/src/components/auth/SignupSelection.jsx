// SignupSelection.jsx
function SignupSelection({ onTeacherSignup, onStudentSignup, onLoginClick, formMessage }) {
    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <div className="logo">
                        <span>vD</span>
                    </div>
                    <div className="header-content">
                        <h1 className="card-title">Join vDeskconnect</h1>
                        <p className="card-description">Choose your account type to get started</p>
                    </div>
                </div>
                <div className="card-content">
                    {formMessage && (
                        <div className={`${formMessage.type}-message`}>
                            {formMessage.text}
                        </div>
                    )}

                    <div className="selection-buttons">
                        <button
                            onClick={onTeacherSignup}
                            className="btn btn-selection btn-teacher"
                        >
                            <i data-lucide="graduation-cap"></i>
                            <div className="btn-content">
                                <div className="btn-title">Sign up as Teacher</div>
                                <div className="btn-subtitle">Create and manage classes</div>
                            </div>
                        </button>

                        <button
                            onClick={onStudentSignup}
                            className="btn btn-selection btn-student"
                        >
                            <i data-lucide="users"></i>
                            <div className="btn-content">
                                <div className="btn-title">Sign up as Student</div>
                                <div className="btn-subtitle">Join classes and learn</div>
                            </div>
                        </button>
                    </div>

                    <div className="footer-link">
                        <button
                            onClick={onLoginClick}
                            className="link-btn"
                        >
                            Already have an account? Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupSelection;