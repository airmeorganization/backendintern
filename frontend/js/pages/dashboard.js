import { auth } from '../auth/supabase.js';
import { ProfileService, ApplicationService, RecommendationService } from '../api/services.js';
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
        const user = profileRes.data;

        await setupNavbar(user.role);

        $('#welcome-message').textContent = `Welcome back, ${user.full_name || user.email}!`;

        const isStudent = user.role === 'student';
        const isCompany = user.role === 'company';

        let profileComplete = false;
        if (isStudent && user.profile) {
            profileComplete = !!(user.profile.skills && user.profile.skills.length > 0 && user.profile.preferred_domain);
            $('#profile-status').innerHTML = profileComplete
                ? '<span class="text-green-600">Your profile is complete! You are ready to get recommendations.</span>'
                : 'Your profile is incomplete. <a href="/pages/profile.html" class="text-indigo-600 hover:underline">Complete it</a> to get better AI recommendations.';
        } else if (isCompany && user.company) {
            profileComplete = !!(user.company.company_name && user.company.description);
            $('#profile-status').innerHTML = profileComplete
                ? '<span class="text-green-600">Your company profile is set up!</span>'
                : 'Your company profile is incomplete. <a href="/pages/profile.html" class="text-indigo-600 hover:underline">Complete it</a> to post internships.';
        } else {
             $('#profile-status').innerHTML = 'Please <a href="/pages/profile.html" class="text-indigo-600 hover:underline">setup your profile</a> first.';
        }

        const statsContainer = $('#stats-container');

        // Fetch role specific data
        const appsRes = await ApplicationService.getApplications();
        const apps = appsRes.data || [];

        if (isStudent) {
            statsContainer.innerHTML = `
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <dt class="text-sm font-medium text-gray-500 truncate">Applications Submitted</dt>
                        <dd class="mt-1 text-3xl font-semibold text-gray-900">${apps.length}</dd>
                    </div>
                </div>
            `;

            // Just load recommendations count if profile is complete
            if (profileComplete) {
                 const recsRes = await RecommendationService.getRecommendations();
                 const recs = recsRes.data?.recommendations || [];
                 statsContainer.innerHTML += `
                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <dt class="text-sm font-medium text-gray-500 truncate">AI Matches Available</dt>
                            <dd class="mt-1 text-3xl font-semibold text-indigo-600">${recs.length}</dd>
                        </div>
                    </div>
                 `;
            }
        } else if (isCompany) {
            statsContainer.innerHTML = `
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <dt class="text-sm font-medium text-gray-500 truncate">Total Applications Received</dt>
                        <dd class="mt-1 text-3xl font-semibold text-gray-900">${apps.length}</dd>
                    </div>
                </div>
            `;
        }

        hide($('#loading-state'));
        show($('#content-state'));

    } catch (error) {
        console.error('Dashboard load error:', error);
        window.location.href = '/pages/login.html';
    }
});
