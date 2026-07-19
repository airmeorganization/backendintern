import { auth } from '../auth/supabase.js';
import { notifications } from '../components/notifications.js';
import { $, setLoading } from '../utils/dom.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Redirect if already logged in
    const session = await auth.getSession();
    if (session) {
        window.location.href = '/pages/dashboard.html';
        return;
    }

    const form = $('#login-form');
    const submitBtn = $('#submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = $('#email').value;
        const password = $('#password').value;

        try {
            setLoading(submitBtn, true);
            await auth.signIn(email, password);
            notifications.success('Successfully logged in!');
            setTimeout(() => {
                window.location.href = '/pages/dashboard.html';
            }, 1000);
        } catch (error) {
            notifications.error(error.message || 'Failed to login');
            setLoading(submitBtn, false);
        }
    });
});
