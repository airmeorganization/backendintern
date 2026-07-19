import { auth } from './auth/supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const session = await auth.getSession();

        if (session) {
            window.location.href = '/pages/dashboard.html';
        } else {
            window.location.href = '/pages/login.html';
        }
    } catch (error) {
        console.error('Failed to initialize app:', error);
        window.location.href = '/pages/login.html';
    }
});
