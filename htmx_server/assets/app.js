(() => {
    const sidebar = document.getElementById('app-sidebar');
    const navigation = document.getElementById('app-navigation');
    const toggle = document.getElementById('navigation-toggle');
    const backdrop = document.getElementById('navigation-backdrop');
    const mobile = window.matchMedia('(max-width: 1023px)');

    function setNavigation(open, returnFocus = false) {
        if (!sidebar || !toggle) return;
        const expanded = mobile.matches && open;
        document.body.classList.toggle('navigation-open', expanded);
        toggle.setAttribute('aria-expanded', String(expanded));
        sidebar.inert = mobile.matches && !expanded;
        backdrop.hidden = !expanded;
        if (expanded) sidebar.querySelector('button, a, input')?.focus();
        else if (returnFocus) toggle.focus();
    }

    function updateNavigation(path = window.location.pathname) {
        if (!navigation) return;
        const buttons = [...navigation.querySelectorAll('button[hx-get]')];
        const matches = buttons.filter(button => {
            const target = new URL(button.getAttribute('hx-get'), window.location.origin).pathname;
            return path === target || (path === '/' && target === '/dashboard/') || (target !== '/' && path.startsWith(target));
        });
        const selected = matches.sort((a, b) => b.getAttribute('hx-get').length - a.getAttribute('hx-get').length)[0];
        buttons.forEach(button => {
            if (button === selected) button.setAttribute('aria-current', 'page');
            else button.removeAttribute('aria-current');
        });
        const label = selected?.querySelector('span.text-sm')?.textContent.trim();
        if (label) document.getElementById('current-section').textContent = label;
    }

    function prepareTables() {
        document.querySelectorAll('#main-content table').forEach(table => {
            if (table.parentElement.classList.contains('table-scroll')) return;
            const wrapper = document.createElement('div');
            wrapper.className = 'table-scroll';
            wrapper.tabIndex = 0;
            // Native focus allows horizontal scrolling with the keyboard.
            table.before(wrapper);
            wrapper.append(table);
        });
    }

    let dashboardChart = null;
    function renderDashboardChart() {
        dashboardChart?.destroy();
        dashboardChart = null;
        const canvas = document.getElementById('revenueChart');
        const source = document.getElementById('chart-data');
        if (!canvas || !source || !window.Chart) return;
        Chart.getChart(canvas)?.destroy();
        const values = JSON.parse(source.textContent);
        const dark = document.documentElement.classList.contains('dark');
        const fill = canvas.getContext('2d').createLinearGradient(0, 0, 0, 280);
        fill.addColorStop(0, 'rgba(245, 158, 11, .15)');
        fill.addColorStop(1, 'rgba(245, 158, 11, 0)');
        dashboardChart = new Chart(canvas, {
            type: 'line',
            data: { labels: values.labels, datasets: [{
                label: canvas.dataset.label, data: values.data,
                borderColor: '#d97706', borderWidth: 2, backgroundColor: fill,
                pointRadius: 0, pointHoverRadius: 5, tension: .35, fill: true,
            }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { duration: 350 },
                plugins: { legend: { display: false }, tooltip: { callbacks: {
                    label: item => `TZS ${item.parsed.y.toLocaleString()}`,
                } } },
                interaction: { mode: 'index', intersect: false },
                scales: {
                    y: { beginAtZero: true, border: { display: false },
                        grid: { color: dark ? '#374151' : '#f3f4f6' },
                        ticks: { color: '#9ca3af', font: { size: 11 }, callback: value => value >= 1000000 ? `${value / 1000000}M` : value >= 1000 ? `${value / 1000}K` : value },
                    },
                    x: { grid: { display: false }, border: { display: false },
                        ticks: { color: '#9ca3af', maxTicksLimit: 7, maxRotation: 0, font: { size: 11 } },
                    },
                },
            },
        });
    }

    toggle?.addEventListener('click', () => setNavigation(!document.body.classList.contains('navigation-open')));
    document.querySelector('[data-navigation-close]')?.addEventListener('click', () => setNavigation(false, true));
    backdrop?.addEventListener('click', () => setNavigation(false, true));
    mobile.addEventListener('change', () => setNavigation(false));
    document.addEventListener('keydown', event => {
        if (!document.body.classList.contains('navigation-open')) return;
        if (event.key === 'Escape') setNavigation(false, true);
        if (event.key !== 'Tab') return;
        const controls = [...sidebar.querySelectorAll('button, a[href], input, select')].filter(el => !el.disabled && el.getClientRects().length);
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
    document.body.addEventListener('htmx:afterSwap', event => {
        prepareTables();
        if (['main-content', 'dashboard-body'].includes(event.detail.target.id)) renderDashboardChart();
        if (event.detail.target.id === 'main-content') {
            if (event.detail.xhr?.responseURL) updateNavigation(new URL(event.detail.xhr.responseURL).pathname);
            setNavigation(false);
            document.getElementById('main-content').focus({ preventScroll: true });
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    });
    document.body.addEventListener('htmx:afterRequest', event => {
        if (!event.detail.successful || !event.detail.elt?.matches('[data-period]')) return;
        document.querySelectorAll('[data-period]').forEach(button => {
            button.setAttribute('aria-pressed', String(button === event.detail.elt));
        });
    });
    document.addEventListener('themechange', renderDashboardChart);
    document.body.addEventListener('htmx:historyRestore', () => { updateNavigation(); prepareTables(); renderDashboardChart(); });
    setNavigation(false);
    updateNavigation();
    prepareTables();
    renderDashboardChart();
})();
