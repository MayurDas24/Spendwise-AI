import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

import App from './App.jsx';

import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                fontSize: '14px',
                            },
                        }}
                    />

                    <App />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>
);