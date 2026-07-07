import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import "./styles/global.css";
import "./styles/variables.css";
import 'react-toastify/dist/ReactToastify.css';

// [SECURITY] Cưỡng chế hết hạn phiên làm việc và chặn Firefox Restore
(function() {
    const isPersistent = localStorage.getItem("isPersistent") === "true";
    
    // Nếu KHÔNG phải là "Ghi nhớ đăng nhập"
    if (!isPersistent) {
        // Kiểm tra xem trình duyệt có vừa được khôi phục không (Đặc trị Firefox)
        const isRestored = window.performance && window.performance.navigation && window.performance.navigation.type === 2;
        
        // Hoặc kiểm tra xem tab này có phải tab mới tinh không (chưa có session ID riêng)
        const tabSessionId = sessionStorage.getItem("tab_session_id");
        
        // Nếu là phiên khôi phục HOẶC chưa có session ID riêng cho tab này
        if (isRestored || !tabSessionId) {
            console.warn("Session purged: Restored or unauthorized tab detected.");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            localStorage.removeItem("userRole");
            localStorage.removeItem("isPersistent");
            localStorage.removeItem("last_active_time");
            
            // Xóa luôn sessionStorage để đảm bảo an toàn tuyệt đối
            sessionStorage.clear();
        }
    }
})();

// [DEPLOYMENT] Handle chunk load & CSS preloading errors (e.g. after a new deployment)
(function() {
    const handleChunkError = (message) => {
        const isChunkLoadError = /Loading chunk|Failed to fetch dynamically imported module|ChunkLoadError|Unable to preload CSS/.test(message || '');
        if (isChunkLoadError) {
            console.warn("Chunk/CSS load error detected, forcing page reload:", message);
            const hasReloaded = sessionStorage.getItem('chunk-error-reloaded') === 'true';
            if (!hasReloaded) {
                sessionStorage.setItem('chunk-error-reloaded', 'true');
                window.location.reload();
            }
        }
    };

    window.addEventListener('vite:preloadError', (event) => {
        console.warn("Vite preload error detected, reloading page...", event);
        event.preventDefault();
        const hasReloaded = sessionStorage.getItem('chunk-error-reloaded') === 'true';
        if (!hasReloaded) {
            sessionStorage.setItem('chunk-error-reloaded', 'true');
            window.location.reload();
        }
    });

    window.addEventListener('error', (event) => {
        handleChunkError(event.message);
    }, true);

    window.addEventListener('unhandledrejection', (event) => {
        handleChunkError(event.reason?.message || event.reason);
    });

    // Reset the reload flag after 5 seconds of successful run to prevent infinite reload loops
    if (sessionStorage.getItem('chunk-error-reloaded') === 'true') {
        setTimeout(() => {
            sessionStorage.removeItem('chunk-error-reloaded');
        }, 5000);
    }
})();

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

