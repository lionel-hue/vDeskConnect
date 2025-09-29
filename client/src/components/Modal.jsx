// components/Modal.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../style/modal.css';

// Custom hook for modal management
export const useModal = () => {
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'alert', // 'alert', 'confirm', 'prompt'
        title: '',
        message: '',
        value: '',
        onConfirm: null,
        onCancel: null,
        confirmText: 'OK',
        cancelText: 'Cancel',
        placeholder: ''
    });

    const alert = (message, title = 'Alert') => {
        return new Promise((resolve) => {
            setModal({
                isOpen: true,
                type: 'alert',
                title,
                message,
                onConfirm: () => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
                confirmText: 'OK'
            });
        });
    };

    const confirm = (message, title = 'Confirm') => {
        return new Promise((resolve) => {
            setModal({
                isOpen: true,
                type: 'confirm',
                title,
                message,
                onConfirm: () => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
                onCancel: () => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    resolve(false);
                },
                confirmText: 'Confirm',
                cancelText: 'Cancel'
            });
        });
    };

    const prompt = (message, defaultValue = '', title = 'Prompt') => {
        return new Promise((resolve) => {
            setModal({
                isOpen: true,
                type: 'prompt',
                title,
                message,
                value: defaultValue,
                onConfirm: (value) => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    resolve(value);
                },
                onCancel: () => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    resolve(null);
                },
                confirmText: 'OK',
                cancelText: 'Cancel',
                placeholder: 'Enter value...'
            });
        });
    };

    const closeModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
        if (modal.onCancel) modal.onCancel();
    };

    return { modal, setModal, alert, confirm, prompt, closeModal };
};

// Modal Component
const Modal = ({ modal, setModal }) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        setInputValue(modal.value);
    }, [modal.value]);

    useEffect(() => {
        if (modal.isOpen && modal.type === 'prompt' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [modal.isOpen, modal.type]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && modal.isOpen) {
                handleCancel();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [modal.isOpen]);

    const handleConfirm = () => {
        if (modal.type === 'prompt') {
            modal.onConfirm(inputValue);
        } else {
            modal.onConfirm();
        }
    };

    const handleCancel = () => {
        if (modal.onCancel) {
            modal.onCancel();
        }
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleCancel();
        }
    };

    if (!modal.isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-container">
                <div className="modal-header">
                    <div className="modal-icon">
                        {modal.type === 'alert' && (
                            <i data-lucide="alert-circle" className="icon-alert"></i>
                        )}
                        {modal.type === 'confirm' && (
                            <i data-lucide="help-circle" className="icon-confirm"></i>
                        )}
                        {modal.type === 'prompt' && (
                            <i data-lucide="edit-3" className="icon-prompt"></i>
                        )}
                    </div>
                    <h3 className="modal-title">{modal.title}</h3>
                    <button className="modal-close" onClick={handleCancel}>
                        <i data-lucide="x"></i>
                    </button>
                </div>
                
                <div className="modal-content">
                    <p className="modal-message">{modal.message}</p>
                    
                    {modal.type === 'prompt' && (
                        <div className="modal-input-container">
                            <input
                                ref={inputRef}
                                type="text"
                                className="modal-input"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={modal.placeholder}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleConfirm();
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>
                
                <div className="modal-actions">
                    {(modal.type === 'confirm' || modal.type === 'prompt') && (
                        <button
                            className="modal-btn modal-btn-secondary"
                            onClick={handleCancel}
                        >
                            {modal.cancelText}
                        </button>
                    )}
                    <button
                        className="modal-btn modal-btn-primary"
                        onClick={handleConfirm}
                        autoFocus={modal.type !== 'prompt'}
                    >
                        {modal.confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;