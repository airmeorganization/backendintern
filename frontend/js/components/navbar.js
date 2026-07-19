import { auth } from '../auth/supabase.js';
import { $ } from '../utils/dom.js';

export async function setupNavbar(userRole) {
    const navbarHTML = `
        <nav class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex">
                        <div class="flex-shrink-0 flex items-center">
                            <a href="/pages/dashboard.html" class="text-xl font-bold text-indigo-600">InternEngine</a>
                        </div>
                        <div class="hidden sm:ml-6 sm:flex sm:space-x-8" id="nav-links">
                            <!-- Links injected here -->
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button id="logout-btn" class="text-gray-500 hover:text-gray-700 font-medium text-sm">
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', navbarHTML);

    const navLinks = $('#nav-links');

    const links = [
        { label: 'Dashboard', href: '/pages/dashboard.html', roles: ['student', 'company'] },
        { label: 'Internships', href: '/pages/internships.html', roles: ['student'] },
        { label: 'My Applications', href: '/pages/applications.html', roles: ['student'] },
        { label: 'Recommendations (AI)', href: '/pages/recommendations.html', roles: ['student'] },
        { label: 'Post Internship', href: '/pages/internships.html', roles: ['company'] },
        { label: 'Review Applications', href: '/pages/applications.html', roles: ['company'] },
        { label: 'Profile', href: '/pages/profile.html', roles: ['student', 'company'] },
    ];

    links.forEach(link => {
        if (link.roles.includes(userRole)) {
            const isActive = window.location.pathname === link.href;
            const a = document.createElement('a');
            a.href = link.href;
            a.className = `${isActive ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`;
            a.textContent = link.label;
            navLinks.appendChild(a);
        }
    });

    $('#logout-btn').addEventListener('click', async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });
}
