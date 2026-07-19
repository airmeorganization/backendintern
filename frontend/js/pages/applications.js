import { auth } from '../auth/supabase.js';
import { ApplicationService, ProfileService } from '../api/services.js';
import { setupNavbar } from '../components/navbar.js';
import { $, hide, show } from '../utils/dom.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const session = await auth.getSession();
        if (!session) {
            window.location.href = '/pages/login.html';
            return;
        }

        const profileRes = await ProfileService.getProfile();
        const userRole = profileRes.data.role;

        await setupNavbar(userRole);

        $('#page-title').textContent = userRole === 'student' ? 'My Applications' : 'Review Applications';

        const res = await ApplicationService.getApplications();
        const applications = res.data || [];
        const container = $('#applications-list');

        hide($('#loading-state'));

        if (applications.length === 0) {
            show($('#empty-state'));
            return;
        }

        show(container);

        applications.forEach(app => {
            const date = new Date(app.created_at).toLocaleDateString();

            let statusColor = 'bg-yellow-100 text-yellow-800';
            if (app.status === 'Accepted') statusColor = 'bg-green-100 text-green-800';
            if (app.status === 'Rejected') statusColor = 'bg-red-100 text-red-800';

            let html = '';

            if (userRole === 'student') {
                html = `
                    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
                            <div>
                                <h3 class="text-lg leading-6 font-medium text-gray-900">${app.internships?.title || 'Unknown Role'}</h3>
                                <p class="mt-1 max-w-2xl text-sm text-gray-500">${app.internships?.companies?.company_name || 'Unknown Company'}</p>
                            </div>
                            <div class="flex flex-col items-end gap-2">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
                                    ${app.status}
                                </span>
                                <span class="text-xs text-gray-400">Applied: ${date}</span>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                html = `
                    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div class="px-4 py-5 sm:px-6 flex justify-between items-start">
                            <div>
                                <h3 class="text-lg leading-6 font-medium text-gray-900">${app.users?.full_name || app.users?.email}</h3>
                                <p class="mt-1 max-w-2xl text-sm text-gray-500">Applied for: <strong>${app.internships?.title}</strong></p>
                            </div>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
                                ${app.status}
                            </span>
                        </div>
                        <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div class="sm:col-span-1">
                                    <dt class="text-sm font-medium text-gray-500">Email address</dt>
                                    <dd class="mt-1 text-sm text-gray-900">${app.users?.email}</dd>
                                </div>
                                <div class="sm:col-span-1">
                                    <dt class="text-sm font-medium text-gray-500">Education</dt>
                                    <dd class="mt-1 text-sm text-gray-900">${app.student_profiles?.education || 'Not provided'}</dd>
                                </div>
                                <div class="sm:col-span-2">
                                    <dt class="text-sm font-medium text-gray-500">Skills</dt>
                                    <dd class="mt-1 text-sm text-gray-900">${(app.student_profiles?.skills || []).join(', ') || 'None listed'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                `;
            }
            container.insertAdjacentHTML('beforeend', html);
        });

    } catch (error) {
        console.error('Applications load error:', error);
        hide($('#loading-state'));
        $('#empty-message').textContent = 'Failed to load applications.';
        show($('#empty-state'));
    }
});
