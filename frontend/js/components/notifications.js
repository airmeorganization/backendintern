import { createElement } from '../utils/dom.js';

class NotificationSystem {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const bgColors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500'
        };

        const bgColor = bgColors[type] || bgColors.info;

        const notification = createElement('div', {
            className: `${bgColor} text-white px-6 py-3 rounded shadow-lg transform transition-all duration-300 translate-x-full opacity-0 flex items-center justify-between min-w-[300px]`
        },
            createElement('span', {}, message),
            createElement('button', {
                className: 'ml-4 text-white hover:text-gray-200 focus:outline-none font-bold',
                onClick: () => this.remove(notification)
            }, '×')
        );

        this.container.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.classList.remove('translate-x-full', 'opacity-0');
        });

        if (duration > 0) {
            setTimeout(() => this.remove(notification), duration);
        }
    }

    success(message, duration) { this.show(message, 'success', duration); }
    error(message, duration) { this.show(message, 'error', duration); }
    info(message, duration) { this.show(message, 'info', duration); }

    remove(notification) {
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300); // match duration-300
    }
}

export const notifications = new NotificationSystem();
