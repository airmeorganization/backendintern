import { auth } from '../auth/supabase.js';
import { ProfileService } from '../api/services.js';
import { setupNavbar } from '../components/navbar.js';
import { notifications } from '../components/notifications.js';
import { $, hide, show, setLoading } from '../utils/dom.js';

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const session = await auth.getSession();
        if (!session) {
            window.location.href = '/pages/login.html';
            return;
        }

        const res = await ProfileService.getProfile();
        currentUser = res.data;

        await setupNavbar(currentUser.role);

        if (currentUser.role === 'student') {
            show($('#student-fields'));
            if (currentUser.profile) {
                $('#preferred_domain').value = currentUser.profile.preferred_domain || '';
                $('#skills').value = (currentUser.profile.skills || []).join(', ');
                $('#education').value = currentUser.profile.education || '';
            }
        } else if (currentUser.role === 'company') {
            show($('#company-fields'));
            if (currentUser.company) {
                $('#company_name').value = currentUser.company.company_name || '';
                $('#description').value = currentUser.company.description || '';
            }
        }

        hide($('#loading-state'));
        show($('#content-state'));

        $('#profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = $('#save-btn');

            try {
                setLoading(btn, true);

                let data = {};
                if (currentUser.role === 'student') {
                    data = {
                        preferred_domain: $('#preferred_domain').value,
                        skills: $('#skills').value.split(',').map(s => s.trim()).filter(Boolean),
                        education: $('#education').value
                    };
                } else if (currentUser.role === 'company') {
                    data = {
                        company_name: $('#company_name').value,
                        description: $('#description').value
                    };
                }

                await ProfileService.updateProfile(data);
                notifications.success('Profile updated successfully!');
            } catch (error) {
                notifications.error(error.message || 'Failed to update profile');
            } finally {
                setLoading(btn, false);
            }
        });

    } catch (error) {
        console.error('Profile load error:', error);
        notifications.error('Failed to load profile');
        hide($('#loading-state'));
    }
});
