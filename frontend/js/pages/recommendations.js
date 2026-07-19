import { auth } from '../auth/supabase.js';
import { RecommendationService, ApplicationService } from '../api/services.js';
import { setupNavbar } from '../components/navbar.js';
import { notifications } from '../components/notifications.js';
import { $, $$, hide, show, setLoading } from '../utils/dom.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const session = await auth.getSession();
        if (!session) {
            window.location.href = '/pages/login.html';
            return;
        }

        await setupNavbar('student');

        const recsRes = await RecommendationService.getRecommendations();
        hide($('#loading-state'));

        const recs = recsRes.data?.recommendations;

        if (!recs || recs.length === 0) {
            if (recsRes.message) {
                $('#empty-message').textContent = recsRes.message;
            }
            show($('#empty-state'));
            return;
        }

        const container = $('#recommendations-container');

        recs.forEach((internship, index) => {
            const isTopMatch = index === 0 && internship.explanation;
            const scorePercent = Math.round(internship.score * 100);

            let html = `
                <div class="bg-white shadow overflow-hidden sm:rounded-lg ${isTopMatch ? 'border-2 border-indigo-500' : ''}">
                    ${isTopMatch ? `<div class="bg-indigo-50 px-4 py-3 sm:px-6 border-b border-indigo-100 flex items-center">
                        <span class="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">Top Match</span>
                        <p class="ml-3 text-sm text-indigo-800 italic">✨ ${internship.explanation}</p>
                    </div>` : ''}

                    <div class="px-4 py-5 sm:px-6 flex justify-between items-start">
                        <div>
                            <h3 class="text-lg leading-6 font-medium text-gray-900">${internship.title}</h3>
                            <p class="mt-1 max-w-2xl text-sm text-gray-500">${internship.companies?.company_name || 'Unknown Company'} • ${internship.location || 'Remote'}</p>
                        </div>
                        <div class="flex flex-col items-end">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Match Score: ${scorePercent}%
                            </span>
                        </div>
                    </div>

                    <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
                        <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div class="sm:col-span-2">
                                <dt class="text-sm font-medium text-gray-500">Description</dt>
                                <dd class="mt-1 text-sm text-gray-900">${internship.description}</dd>
                            </div>
                            <div class="sm:col-span-2">
                                <dt class="text-sm font-medium text-gray-500">Required Skills</dt>
                                <dd class="mt-1 text-sm text-gray-900 flex flex-wrap gap-2">
                                    ${(internship.required_skills || []).map(s => `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">${s}</span>`).join('')}
                                </dd>
                            </div>
                        </dl>

                        <div class="mt-6 flex justify-end">
                            <button data-id="${internship.id}" class="apply-btn inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                Apply Now
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });

        show(container);

        // Setup event listeners for apply buttons
        $$('.apply-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const button = e.currentTarget;
                const id = button.dataset.id;

                try {
                    setLoading(button, true);
                    await ApplicationService.createApplication({ internship_id: id });
                    notifications.success('Application submitted successfully!');
                    button.textContent = 'Applied';
                    button.disabled = true;
                    button.classList.replace('bg-indigo-600', 'bg-green-600');
                    button.classList.replace('hover:bg-indigo-700', 'hover:bg-green-700');
                } catch (error) {
                    notifications.error(error.message || 'Failed to apply');
                    setLoading(button, false);
                }
            });
        });

    } catch (error) {
        console.error('Recommendations load error:', error);
        notifications.error('Failed to load recommendations');
        hide($('#loading-state'));
    }
});
