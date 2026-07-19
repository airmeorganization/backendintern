import { auth } from '../auth/supabase.js';
import { InternshipService, ProfileService, ApplicationService } from '../api/services.js';
import { setupNavbar } from '../components/navbar.js';
import { notifications } from '../components/notifications.js';
import { $, $$, hide, show, setLoading } from '../utils/dom.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const session = await auth.getSession();

        let userRole = 'student';
        if (session) {
            const profileRes = await ProfileService.getProfile();
            userRole = profileRes.data.role;
        }

        await setupNavbar(userRole);

        if (userRole === 'company') {
            show($('#post-internship-btn'));
        }

        $('#post-internship-btn').addEventListener('click', () => {
            show($('#post-form-container'));
            hide($('#post-internship-btn'));
        });

        $('#cancel-post-btn').addEventListener('click', () => {
            hide($('#post-form-container'));
            show($('#post-internship-btn'));
            $('#post-form').reset();
        });

        $('#post-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = $('#save-post-btn');
            try {
                setLoading(btn, true);
                const data = {
                    title: $('#int-title').value,
                    description: $('#int-desc').value,
                    required_skills: $('#int-skills').value.split(',').map(s => s.trim()).filter(Boolean),
                    location: $('#int-location').value,
                    work_mode: $('#int-mode').value
                };
                await InternshipService.createInternship(data);
                notifications.success('Internship posted successfully');
                $('#post-form').reset();
                hide($('#post-form-container'));
                show($('#post-internship-btn'));
                await loadInternships(); // reload
            } catch (error) {
                notifications.error(error.message || 'Failed to post internship');
            } finally {
                setLoading(btn, false);
            }
        });

        await loadInternships(userRole);

    } catch (error) {
        console.error('Internships load error:', error);
        hide($('#loading-state'));
    }
});

async function loadInternships(userRole) {
    try {
        const res = await InternshipService.getInternships();
        const internships = res.data?.items || [];
        const container = $('#internships-list');

        hide($('#loading-state'));
        container.innerHTML = '';

        if (internships.length === 0) {
            show($('#empty-state'));
            hide(container);
            return;
        }

        hide($('#empty-state'));
        show(container);

        internships.forEach(intern => {
            const html = `
                <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div class="px-4 py-5 sm:px-6 flex justify-between items-start">
                        <div>
                            <h3 class="text-lg leading-6 font-medium text-gray-900">${intern.title}</h3>
                            <p class="mt-1 max-w-2xl text-sm text-gray-500">${intern.companies?.company_name || 'Unknown Company'}</p>
                        </div>
                        ${userRole === 'student' ? `<button data-id="${intern.id}" class="apply-btn inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Apply</button>` : ''}
                    </div>
                    <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                            <div><span class="font-medium text-gray-900">Location:</span> ${intern.location || 'Remote'}</div>
                            <div><span class="font-medium text-gray-900">Mode:</span> ${intern.work_mode || 'N/A'}</div>
                            <div class="sm:col-span-2"><span class="font-medium text-gray-900">Skills:</span> ${(intern.required_skills || []).join(', ')}</div>
                            <div class="sm:col-span-2 mt-2 text-gray-600">${intern.description}</div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });

        if (userRole === 'student') {
            $$('.apply-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const button = e.currentTarget;
                    const id = button.dataset.id;

                    try {
                        setLoading(button, true);
                        await ApplicationService.createApplication({ internship_id: id });
                        notifications.success('Application submitted!');
                        button.textContent = 'Applied';
                        button.disabled = true;
                        button.classList.replace('bg-indigo-600', 'bg-green-600');
                        button.classList.replace('hover:bg-indigo-700', 'hover:bg-green-700');
                    } catch (error) {
                        notifications.error(error.message || 'Already applied or failed to apply');
                        setLoading(button, false);
                    }
                });
            });
        }
    } catch (err) {
        notifications.error('Failed to load internships');
    }
}
