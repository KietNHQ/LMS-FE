import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import "./styles/global.css";
import "./styles/variables.css";
import "./styles/teacher-theme-bridge.css";
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});

createRoot(document.getElementById('root')).render(

    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
            <ToastContainer position="top-right" autoClose={3000} />
        </QueryClientProvider>
    </StrictMode>,
)

