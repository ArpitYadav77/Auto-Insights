/**
 * Meesho RTO Optimization Platform - Main Application
 * Handles navigation, page rendering, charts, and all interactive features.
 */
(function () {
    'use strict';

    // ─── State ───────────────────────────────────────────────────
    const state = {
        currentPage: 'dashboard',
        charts: {},
        ordersPage: 1,
        ordersPerPage: 20,
        ordersFilter: { status: 'all', risk: 'all', payment: 'all', search: '' },
        customersPage: 1,
        customersPerPage: 15,
        addressPage: 1,
        addressPerPage: 15,
        addressFilter: { status: 'all', search: '' },
        checkoutPage: 1,
        checkoutPerPage: 10,
    };

    // ─── Helpers ─────────────────────────────────────────────────
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);
    const fmt = (n) => new Intl.NumberFormat('en-IN').format(n);
    const fmtCurrency = (n) => '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
    const fmtPercent = (n) => n.toFixed(1) + '%';

    function animateCounter(el, target, duration = 1200, prefix = '', suffix = '') {
        const start = 0;
        const startTime = performance.now();
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * eased);
            el.textContent = prefix + fmt(current) + suffix;
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = prefix + fmt(target) + suffix;
        }
        requestAnimationFrame(update);
    }

    function showToast(message, type = 'info') {
        const container = $('#toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-msg">${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
    }

    function openModal(title, bodyHTML) {
        $('#modalTitle').textContent = title;
        $('#modalBody').innerHTML = bodyHTML;
        $('#modalOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        $('#modalOverlay').classList.remove('active');
        document.body.style.overflow = '';
    }

    function getBadgeClass(level) {
        const map = { 'Low': 'badge-low', 'Medium': 'badge-medium', 'High': 'badge-high', 'Delivered': 'badge-delivered', 'RTO': 'badge-rto', 'In Transit': 'badge-transit', 'Processing': 'badge-processing', 'Valid': 'badge-valid', 'Partially Valid': 'badge-partial', 'Invalid': 'badge-invalid' };
        return map[level] || '';
    }

    function destroyCharts() {
        Object.values(state.charts).forEach(c => { if (c && c.destroy) c.destroy(); });
        state.charts = {};
    }

    // ─── Chart Defaults ──────────────────────────────────────────
    function getChartDefaults() {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const gridColor = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(0,0,0,0.08)';
        return { textColor, gridColor };
    }

    // ─── Navigation ──────────────────────────────────────────────
    function navigate(page) {
        state.currentPage = page;
        $$('.nav-link').forEach(l => l.classList.remove('active'));
        const navLink = $(`[data-page="${page}"]`);
        if (navLink) navLink.classList.add('active');

        const titles = {
            dashboard: 'Executive Dashboard',
            orders: 'Orders Management',
            customers: 'Customer Risk Analysis',
            addresses: 'Address Verification Center',
            checkout: 'Checkout Decision Engine',
            analytics: 'Analytics & SQL Insights',
            abtest: 'A/B Testing Module',
            architecture: 'System Architecture'
        };
        $('#pageTitle').textContent = titles[page] || 'Dashboard';

        destroyCharts();
        renderPage(page);

        // Close sidebar on mobile
        if (window.innerWidth < 768) {
            $('#sidebar').classList.remove('open');
        }
    }

    // ─── Page Router ─────────────────────────────────────────────
    function renderPage(page) {
        const container = $('#pageContainer');
        container.innerHTML = '';
        container.scrollTop = 0;

        const renderers = {
            dashboard: renderDashboard,
            orders: renderOrders,
            customers: renderCustomers,
            addresses: renderAddresses,
            checkout: renderCheckout,
            analytics: renderAnalytics,
            abtest: renderABTest,
            architecture: renderArchitecture
        };

        if (renderers[page]) {
            renderers[page](container);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 1. EXECUTIVE DASHBOARD
    // ═══════════════════════════════════════════════════════════════
    function renderDashboard(container) {
        const data = window.MeeshoData;
        const totalOrders = data.orders.length;
        const totalRevenue = data.orders.reduce((s, o) => s + o.order_value, 0);
        const rtoOrders = data.orders.filter(o => o.order_status === 'RTO').length;
        const rtoRate = (rtoOrders / totalOrders) * 100;
        const highRiskCustomers = data.riskScores.filter(r => r.risk_level === 'High').length;
        const avgOrderValue = totalRevenue / totalOrders;
        const deliveredOrders = data.orders.filter(o => o.order_status === 'Delivered').length;
        const logisticsCostPerRTO = 120;
        const targetRTO = 0.15;
        const currentRTO = rtoOrders / totalOrders;
        const potentialRTOReduction = Math.floor(totalOrders * (currentRTO - targetRTO));
        const logisticsSaved = potentialRTOReduction * logisticsCostPerRTO;

        const riskDist = { Low: 0, Medium: 0, High: 0 };
        data.riskScores.forEach(r => riskDist[r.risk_level]++);

        container.innerHTML = `
        <div class="page-content animate-in">
            <!-- KPI Cards Row 1 -->
            <div class="kpi-grid">
                <div class="kpi-card" style="--delay:0">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">📦</div>
                    <div class="kpi-info">
                        <span class="kpi-value" id="kpiTotalOrders">0</span>
                        <span class="kpi-label">Total Orders</span>
                        <span class="kpi-trend trend-up">↑ 12.5% vs last month</span>
                    </div>
                </div>
                <div class="kpi-card" style="--delay:1">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #10b981, #059669)">💰</div>
                    <div class="kpi-info">
                        <span class="kpi-value" id="kpiRevenue">₹0</span>
                        <span class="kpi-label">Total Revenue</span>
                        <span class="kpi-trend trend-up">↑ 8.3% vs last month</span>
                    </div>
                </div>
                <div class="kpi-card" style="--delay:2">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626)">🔄</div>
                    <div class="kpi-info">
                        <span class="kpi-value" id="kpiRTORate">0%</span>
                        <span class="kpi-label">Current RTO Rate</span>
                        <span class="kpi-trend trend-down">Target: 15%</span>
                    </div>
                </div>
                <div class="kpi-card" style="--delay:3">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706)">⚠️</div>
                    <div class="kpi-info">
                        <span class="kpi-value" id="kpiHighRisk">0</span>
                        <span class="kpi-label">High Risk Customers</span>
                        <span class="kpi-trend trend-neutral">${fmtPercent(highRiskCustomers/data.customers.length*100)} of total</span>
                    </div>
                </div>
            </div>

            <!-- KPI Cards Row 2 -->
            <div class="kpi-grid kpi-grid-3">
                <div class="kpi-card" style="--delay:4">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #06b6d4, #0891b2)">🚚</div>
                    <div class="kpi-info">
                        <span class="kpi-value" id="kpiLogistics">₹0</span>
                        <span class="kpi-label">Potential Logistics Savings</span>
                        <span class="kpi-trend trend-up">If RTO reduced to 15%</span>
                    </div>
                </div>
                <div class="kpi-card" style="--delay:5">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed)">📈</div>
                    <div class="kpi-info">
                        <span class="kpi-value" id="kpiAOV">₹0</span>
                        <span class="kpi-label">Average Order Value</span>
                        <span class="kpi-trend trend-up">↑ 5.2% vs last month</span>
                    </div>
                </div>
                <div class="kpi-card" style="--delay:6">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #10b981, #059669)">✅</div>
                    <div class="kpi-info">
                        <span class="kpi-value" id="kpiDelivered">0</span>
                        <span class="kpi-label">Delivered Orders</span>
                        <span class="kpi-trend trend-up">${fmtPercent(deliveredOrders/totalOrders*100)} delivery rate</span>
                    </div>
                </div>
            </div>

            <!-- Charts Row -->
            <div class="charts-grid">
                <div class="chart-container">
                    <div class="chart-header">
                        <h3 class="chart-title">Risk Distribution</h3>
                        <span class="chart-subtitle">Customer risk level breakdown</span>
                    </div>
                    <div class="chart-body">
                        <canvas id="riskDistChart"></canvas>
                    </div>
                </div>
                <div class="chart-container">
                    <div class="chart-header">
                        <h3 class="chart-title">RTO Trend</h3>
                        <span class="chart-subtitle">Monthly RTO rate over 6 months</span>
                    </div>
                    <div class="chart-body">
                        <canvas id="rtoTrendChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-container">
                    <div class="chart-header">
                        <h3 class="chart-title">COD vs Prepaid Analysis</h3>
                        <span class="chart-subtitle">Payment method impact on RTO</span>
                    </div>
                    <div class="chart-body">
                        <canvas id="codPrepaidChart"></canvas>
                    </div>
                </div>
                <div class="chart-container">
                    <div class="chart-header">
                        <h3 class="chart-title">Top Cities by RTO</h3>
                        <span class="chart-subtitle">Cities with highest RTO rates</span>
                    </div>
                    <div class="chart-body">
                        <canvas id="topCitiesChart"></canvas>
                    </div>
                </div>
            </div>
        </div>`;

        // Animate KPI counters
        setTimeout(() => {
            animateCounter($('#kpiTotalOrders'), totalOrders);
            animateCounter($('#kpiRevenue'), totalRevenue, 1200, '₹');
            const rtoEl = $('#kpiRTORate');
            animateCounter(rtoEl, Math.round(rtoRate * 10), 1200, '', '');
            setTimeout(() => rtoEl.textContent = fmtPercent(rtoRate), 1300);
            animateCounter($('#kpiHighRisk'), highRiskCustomers);
            animateCounter($('#kpiLogistics'), logisticsSaved, 1200, '₹');
            animateCounter($('#kpiAOV'), Math.round(avgOrderValue), 1200, '₹');
            animateCounter($('#kpiDelivered'), deliveredOrders);
        }, 200);

        // Render charts
        setTimeout(() => renderDashboardCharts(riskDist), 400);
    }

    function renderDashboardCharts(riskDist) {
        const { textColor, gridColor } = getChartDefaults();
        const data = window.MeeshoData;

        // Risk Distribution Doughnut
        state.charts.riskDist = new Chart($('#riskDistChart'), {
            type: 'doughnut',
            data: {
                labels: ['Low Risk', 'Medium Risk', 'High Risk'],
                datasets: [{
                    data: [riskDist.Low, riskDist.Medium, riskDist.High],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0,
                    spacing: 4,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: textColor, padding: 16, usePointStyle: true, pointStyleWidth: 10 } }
                },
                cutout: '68%'
            }
        });

        // RTO Trend Line
        const rtoTrend = data.getRTOTrend();
        state.charts.rtoTrend = new Chart($('#rtoTrendChart'), {
            type: 'line',
            data: {
                labels: rtoTrend.map(t => t.month),
                datasets: [
                    {
                        label: 'RTO Rate',
                        data: rtoTrend.map(t => t.rto_rate),
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239,68,68,0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: '#ef4444',
                        borderWidth: 2
                    },
                    {
                        label: 'Target (15%)',
                        data: rtoTrend.map(() => 15),
                        borderColor: '#10b981',
                        borderDash: [5, 5],
                        pointRadius: 0,
                        borderWidth: 2,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 35, ticks: { color: textColor, callback: v => v + '%' }, grid: { color: gridColor } },
                    x: { ticks: { color: textColor }, grid: { color: gridColor } }
                },
                plugins: { legend: { labels: { color: textColor, usePointStyle: true } } }
            }
        });

        // COD vs Prepaid
        const codPrepaid = data.getCODvsPrepaid();
        state.charts.codPrepaid = new Chart($('#codPrepaidChart'), {
            type: 'bar',
            data: {
                labels: ['Total Orders', 'RTO Rate (%)', 'Avg Order Value (₹/100)', 'Revenue (₹L)'],
                datasets: [
                    {
                        label: 'COD',
                        data: [codPrepaid.cod.total_orders, codPrepaid.cod.rto_rate, codPrepaid.cod.avg_order_value / 100, codPrepaid.cod.total_revenue / 100000],
                        backgroundColor: 'rgba(239,68,68,0.7)',
                        borderRadius: 6
                    },
                    {
                        label: 'Prepaid',
                        data: [codPrepaid.prepaid.total_orders, codPrepaid.prepaid.rto_rate, codPrepaid.prepaid.avg_order_value / 100, codPrepaid.prepaid.total_revenue / 100000],
                        backgroundColor: 'rgba(16,185,129,0.7)',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } },
                    x: { ticks: { color: textColor }, grid: { display: false } }
                },
                plugins: { legend: { labels: { color: textColor, usePointStyle: true } } }
            }
        });

        // Top Cities
        const topCities = data.getTopRiskyCities(8);
        state.charts.topCities = new Chart($('#topCitiesChart'), {
            type: 'bar',
            data: {
                labels: topCities.map(c => c.city),
                datasets: [{
                    label: 'Avg Risk Score',
                    data: topCities.map(c => c.avg_risk_score),
                    backgroundColor: topCities.map(c => c.avg_risk_score > 60 ? 'rgba(239,68,68,0.7)' : c.avg_risk_score > 40 ? 'rgba(245,158,11,0.7)' : 'rgba(16,185,129,0.7)'),
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: { beginAtZero: true, max: 100, ticks: { color: textColor }, grid: { color: gridColor } },
                    y: { ticks: { color: textColor }, grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. ORDERS MANAGEMENT
    // ═══════════════════════════════════════════════════════════════
    function renderOrders(container) {
        const data = window.MeeshoData;

        container.innerHTML = `
        <div class="page-content animate-in">
            <div class="filters-bar">
                <div class="filter-group">
                    <label>Status</label>
                    <select id="filterStatus" class="filter-select">
                        <option value="all">All Status</option>
                        <option value="Delivered">Delivered</option>
                        <option value="RTO">RTO</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Processing">Processing</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Risk Level</label>
                    <select id="filterRisk" class="filter-select">
                        <option value="all">All Risk</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Payment</label>
                    <select id="filterPayment" class="filter-select">
                        <option value="all">All Payment</option>
                        <option value="COD">COD</option>
                        <option value="Prepaid">Prepaid</option>
                    </select>
                </div>
                <div class="filter-group filter-search">
                    <label>Search</label>
                    <input type="text" id="filterSearch" class="filter-input" placeholder="Order ID, name, city...">
                </div>
                <div class="filter-group filter-actions">
                    <button class="btn btn-secondary" id="resetFilters">Reset</button>
                    <button class="btn btn-primary" id="exportOrders">📥 Export CSV</button>
                </div>
            </div>

            <div class="table-container">
                <div class="table-info">
                    <span id="tableCount">Showing 0 orders</span>
                </div>
                <div class="table-wrapper">
                    <table class="data-table" id="ordersTable">
                        <thead>
                            <tr>
                                <th data-sort="order_id">Order ID ↕</th>
                                <th data-sort="customer_name">Customer ↕</th>
                                <th data-sort="city">City ↕</th>
                                <th data-sort="order_value">Value ↕</th>
                                <th data-sort="payment_method">Payment ↕</th>
                                <th data-sort="historical_rto">Hist. RTO% ↕</th>
                                <th data-sort="risk_score">Risk Score ↕</th>
                                <th data-sort="risk_level">Risk Level ↕</th>
                                <th data-sort="order_status">Status ↕</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="ordersTableBody"></tbody>
                    </table>
                </div>
                <div class="pagination" id="ordersPagination"></div>
            </div>
        </div>`;

        setupOrderFilters();
        renderOrdersTable();
    }

    function getFilteredOrders() {
        const data = window.MeeshoData;
        const f = state.ordersFilter;
        return data.orders.filter(o => {
            const risk = data.getCustomerRisk(o.customer_id);
            const customer = data.customers.find(c => c.customer_id === o.customer_id);
            if (f.status !== 'all' && o.order_status !== f.status) return false;
            if (f.risk !== 'all' && risk && risk.risk_level !== f.risk) return false;
            if (f.payment !== 'all' && o.payment_method !== f.payment) return false;
            if (f.search) {
                const s = f.search.toLowerCase();
                const name = customer ? customer.name.toLowerCase() : '';
                const city = customer ? customer.city.toLowerCase() : '';
                if (!o.order_id.toLowerCase().includes(s) && !name.includes(s) && !city.includes(s)) return false;
            }
            return true;
        });
    }

    function renderOrdersTable() {
        const data = window.MeeshoData;
        const filtered = getFilteredOrders();
        const totalPages = Math.ceil(filtered.length / state.ordersPerPage);
        const start = (state.ordersPage - 1) * state.ordersPerPage;
        const pageOrders = filtered.slice(start, start + state.ordersPerPage);

        const tbody = $('#ordersTableBody');
        if (!tbody) return;

        tbody.innerHTML = pageOrders.map(o => {
            const customer = data.customers.find(c => c.customer_id === o.customer_id);
            const risk = data.getCustomerRisk(o.customer_id);
            const name = customer ? customer.name : 'N/A';
            const city = customer ? customer.city : 'N/A';
            const histRTO = risk ? risk.historical_rto_percent : 0;
            const riskScore = risk ? risk.risk_score : 0;
            const riskLevel = risk ? risk.risk_level : 'Low';
            return `<tr>
                <td><span class="order-id">${o.order_id}</span></td>
                <td>${name}</td>
                <td>${city}</td>
                <td>${fmtCurrency(o.order_value)}</td>
                <td><span class="badge ${o.payment_method === 'COD' ? 'badge-rto' : 'badge-delivered'}">${o.payment_method}</span></td>
                <td>${fmtPercent(histRTO)}</td>
                <td><div class="risk-meter"><div class="risk-fill" style="width:${riskScore}%;background:${riskScore > 70 ? '#ef4444' : riskScore > 40 ? '#f59e0b' : '#10b981'}"></div><span>${riskScore}</span></div></td>
                <td><span class="badge ${getBadgeClass(riskLevel)}">${riskLevel}</span></td>
                <td><span class="badge ${getBadgeClass(o.order_status)}">${o.order_status}</span></td>
                <td><button class="btn btn-sm btn-ghost" onclick="window.viewOrderDetail('${o.order_id}')">View</button></td>
            </tr>`;
        }).join('');

        $('#tableCount').textContent = `Showing ${start + 1}-${Math.min(start + state.ordersPerPage, filtered.length)} of ${filtered.length} orders`;
        renderPagination($('#ordersPagination'), state.ordersPage, totalPages, (p) => { state.ordersPage = p; renderOrdersTable(); });
    }

    function setupOrderFilters() {
        const filters = ['filterStatus', 'filterRisk', 'filterPayment'];
        filters.forEach(id => {
            const el = $('#' + id);
            if (el) el.addEventListener('change', () => {
                state.ordersFilter[id.replace('filter', '').toLowerCase()] = el.value;
                state.ordersPage = 1;
                renderOrdersTable();
            });
        });
        const searchEl = $('#filterSearch');
        if (searchEl) {
            let debounce;
            searchEl.addEventListener('input', () => {
                clearTimeout(debounce);
                debounce = setTimeout(() => {
                    state.ordersFilter.search = searchEl.value;
                    state.ordersPage = 1;
                    renderOrdersTable();
                }, 300);
            });
        }
        const resetBtn = $('#resetFilters');
        if (resetBtn) resetBtn.addEventListener('click', () => {
            state.ordersFilter = { status: 'all', risk: 'all', payment: 'all', search: '' };
            state.ordersPage = 1;
            $$('.filter-select').forEach(s => s.value = 'all');
            if ($('#filterSearch')) $('#filterSearch').value = '';
            renderOrdersTable();
        });
        const exportBtn = $('#exportOrders');
        if (exportBtn) exportBtn.addEventListener('click', exportOrdersCSV);
    }

    function exportOrdersCSV() {
        const data = window.MeeshoData;
        const filtered = getFilteredOrders();
        let csv = 'Order ID,Customer,City,Value,Payment,Hist RTO%,Risk Score,Risk Level,Status\n';
        filtered.forEach(o => {
            const customer = data.customers.find(c => c.customer_id === o.customer_id);
            const risk = data.getCustomerRisk(o.customer_id);
            csv += `${o.order_id},${customer?.name},${customer?.city},${o.order_value},${o.payment_method},${risk?.historical_rto_percent?.toFixed(1)},${risk?.risk_score},${risk?.risk_level},${o.order_status}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'meesho_orders_export.csv';
        a.click();
        showToast('Orders exported successfully!', 'success');
    }

    window.viewOrderDetail = function (orderId) {
        const data = window.MeeshoData;
        const order = data.orders.find(o => o.order_id === orderId);
        if (!order) return;
        const customer = data.customers.find(c => c.customer_id === order.customer_id);
        const risk = data.getCustomerRisk(order.customer_id);
        const address = data.getCustomerAddress(order.customer_id);

        openModal(`Order Details - ${orderId}`, `
            <div class="order-detail-grid">
                <div class="detail-section">
                    <h4>Order Information</h4>
                    <div class="detail-row"><span>Order ID:</span><span>${order.order_id}</span></div>
                    <div class="detail-row"><span>Value:</span><span>${fmtCurrency(order.order_value)}</span></div>
                    <div class="detail-row"><span>Payment:</span><span class="badge ${order.payment_method === 'COD' ? 'badge-rto' : 'badge-delivered'}">${order.payment_method}</span></div>
                    <div class="detail-row"><span>Status:</span><span class="badge ${getBadgeClass(order.order_status)}">${order.order_status}</span></div>
                    <div class="detail-row"><span>Category:</span><span>${order.product_category}</span></div>
                    <div class="detail-row"><span>Date:</span><span>${order.order_date}</span></div>
                </div>
                <div class="detail-section">
                    <h4>Customer Information</h4>
                    <div class="detail-row"><span>Name:</span><span>${customer?.name || 'N/A'}</span></div>
                    <div class="detail-row"><span>City:</span><span>${customer?.city || 'N/A'}</span></div>
                    <div class="detail-row"><span>Phone:</span><span>${customer?.phone || 'N/A'}</span></div>
                    <div class="detail-row"><span>Risk Score:</span><span><strong style="color:${risk?.risk_score > 70 ? '#ef4444' : risk?.risk_score > 40 ? '#f59e0b' : '#10b981'}">${risk?.risk_score || 0}</strong></span></div>
                    <div class="detail-row"><span>Risk Level:</span><span class="badge ${getBadgeClass(risk?.risk_level || 'Low')}">${risk?.risk_level || 'Low'}</span></div>
                    <div class="detail-row"><span>Historical RTO:</span><span>${fmtPercent(risk?.historical_rto_percent || 0)}</span></div>
                </div>
                <div class="detail-section full-width">
                    <h4>Delivery Address</h4>
                    <div class="detail-row"><span>Address:</span><span>${address?.full_address || 'N/A'}</span></div>
                    <div class="detail-row"><span>Validity:</span><span class="badge ${getBadgeClass(address?.validity_status || 'Valid')}">${address?.validity_status || 'Valid'}</span></div>
                    ${address?.issues?.length ? `<div class="detail-row"><span>Issues:</span><span>${address.issues.join(', ')}</span></div>` : ''}
                </div>
            </div>
        `);
    };

    // ═══════════════════════════════════════════════════════════════
    // 3. CUSTOMER RISK ANALYSIS
    // ═══════════════════════════════════════════════════════════════
    function renderCustomers(container) {
        container.innerHTML = `
        <div class="page-content animate-in">
            <div class="customers-overview">
                <div class="kpi-grid kpi-grid-3">
                    <div class="kpi-card mini" style="--delay:0">
                        <div class="kpi-icon mini-icon" style="background: linear-gradient(135deg, #10b981, #059669)">✅</div>
                        <div class="kpi-info">
                            <span class="kpi-value" id="lowRiskCount">0</span>
                            <span class="kpi-label">Low Risk Customers</span>
                        </div>
                    </div>
                    <div class="kpi-card mini" style="--delay:1">
                        <div class="kpi-icon mini-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706)">⚠️</div>
                        <div class="kpi-info">
                            <span class="kpi-value" id="medRiskCount">0</span>
                            <span class="kpi-label">Medium Risk Customers</span>
                        </div>
                    </div>
                    <div class="kpi-card mini" style="--delay:2">
                        <div class="kpi-icon mini-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626)">🚨</div>
                        <div class="kpi-info">
                            <span class="kpi-value" id="highRiskCount">0</span>
                            <span class="kpi-label">High Risk Customers</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="filters-bar">
                <div class="filter-group filter-search" style="flex:1">
                    <label>Search Customer</label>
                    <input type="text" id="customerSearch" class="filter-input" placeholder="Search by name, ID, or city...">
                </div>
                <div class="filter-group">
                    <label>Risk Level</label>
                    <select id="customerRiskFilter" class="filter-select">
                        <option value="all">All Levels</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
            </div>

            <div class="customers-grid" id="customersGrid"></div>
            <div class="pagination" id="customersPagination"></div>
        </div>`;

        const data = window.MeeshoData;
        const counts = { Low: 0, Medium: 0, High: 0 };
        data.riskScores.forEach(r => counts[r.risk_level]++);
        setTimeout(() => {
            animateCounter($('#lowRiskCount'), counts.Low);
            animateCounter($('#medRiskCount'), counts.Medium);
            animateCounter($('#highRiskCount'), counts.High);
        }, 200);

        renderCustomerCards();
        setupCustomerFilters();
    }

    function getFilteredCustomers() {
        const data = window.MeeshoData;
        const riskFilter = $('#customerRiskFilter')?.value || 'all';
        const search = ($('#customerSearch')?.value || '').toLowerCase();

        return data.customers.filter(c => {
            const risk = data.getCustomerRisk(c.customer_id);
            if (riskFilter !== 'all' && risk?.risk_level !== riskFilter) return false;
            if (search && !c.name.toLowerCase().includes(search) && !c.customer_id.toLowerCase().includes(search) && !c.city.toLowerCase().includes(search)) return false;
            return true;
        });
    }

    function renderCustomerCards() {
        const data = window.MeeshoData;
        const filtered = getFilteredCustomers();
        const totalPages = Math.ceil(filtered.length / state.customersPerPage);
        const start = (state.customersPage - 1) * state.customersPerPage;
        const pageCustomers = filtered.slice(start, start + state.customersPerPage);
        const grid = $('#customersGrid');
        if (!grid) return;

        grid.innerHTML = pageCustomers.map(c => {
            const risk = data.getCustomerRisk(c.customer_id);
            const orders = data.getCustomerOrders(c.customer_id);
            const riskLevel = risk?.risk_level || 'Low';
            const riskScore = risk?.risk_score || 0;
            const histRTO = risk?.historical_rto_percent || 0;
            const totalOrders = orders.length;
            const rtoOrders = orders.filter(o => o.order_status === 'RTO').length;
            const totalSpend = orders.reduce((s, o) => s + o.order_value, 0);

            const actions = {
                'Low': 'Approve all orders',
                'Medium': 'Show confirmation prompt',
                'High': 'Require 15% advance payment'
            };

            return `
            <div class="profile-card" onclick="window.viewCustomerDetail('${c.customer_id}')">
                <div class="profile-header">
                    <div class="profile-avatar" style="background: ${riskLevel === 'High' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : riskLevel === 'Medium' ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#10b981,#059669)'}">
                        ${c.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div class="profile-info">
                        <h4>${c.name}</h4>
                        <span class="profile-id">${c.customer_id} • ${c.city}</span>
                    </div>
                    <span class="badge ${getBadgeClass(riskLevel)}">${riskLevel}</span>
                </div>
                <div class="profile-stats">
                    <div class="stat">
                        <span class="stat-value">${totalOrders}</span>
                        <span class="stat-label">Orders</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value" style="color:${histRTO > 40 ? '#ef4444' : histRTO > 20 ? '#f59e0b' : '#10b981'}">${fmtPercent(histRTO)}</span>
                        <span class="stat-label">RTO Rate</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${riskScore}</span>
                        <span class="stat-label">Risk Score</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${fmtCurrency(totalSpend)}</span>
                        <span class="stat-label">Total Spend</span>
                    </div>
                </div>
                <div class="profile-risk-bar">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width:${riskScore}%;background:${riskScore > 70 ? '#ef4444' : riskScore > 40 ? '#f59e0b' : '#10b981'}"></div>
                    </div>
                </div>
                <div class="profile-action">
                    <span class="action-label">Recommended: </span>
                    <span class="action-text">${actions[riskLevel]}</span>
                </div>
            </div>`;
        }).join('');

        renderPagination($('#customersPagination'), state.customersPage, totalPages, (p) => { state.customersPage = p; renderCustomerCards(); });
    }

    function setupCustomerFilters() {
        const searchEl = $('#customerSearch');
        const riskEl = $('#customerRiskFilter');
        let debounce;
        if (searchEl) searchEl.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(() => { state.customersPage = 1; renderCustomerCards(); }, 300); });
        if (riskEl) riskEl.addEventListener('change', () => { state.customersPage = 1; renderCustomerCards(); });
    }

    window.viewCustomerDetail = function (customerId) {
        const data = window.MeeshoData;
        const customer = data.customers.find(c => c.customer_id === customerId);
        const risk = data.getCustomerRisk(customerId);
        const orders = data.getCustomerOrders(customerId);
        const address = data.getCustomerAddress(customerId);
        if (!customer) return;

        const rtoOrders = orders.filter(o => o.order_status === 'RTO');
        const deliveredOrders = orders.filter(o => o.order_status === 'Delivered');
        const totalSpend = orders.reduce((s, o) => s + o.order_value, 0);

        const riskBreakdown = [];
        if ((risk?.historical_rto_percent || 0) > 40) riskBreakdown.push({ factor: 'Historical RTO > 40%', points: 50, color: '#ef4444' });
        if (risk?.preferred_payment === 'COD') riskBreakdown.push({ factor: 'Preferred Payment: COD', points: 20, color: '#f59e0b' });
        if ((risk?.avg_order_value || 0) > 3000) riskBreakdown.push({ factor: 'Avg Order Value > ₹3000', points: 15, color: '#f59e0b' });
        if (address?.validity_status !== 'Valid') riskBreakdown.push({ factor: 'Invalid/Partial Address', points: 15, color: '#ef4444' });

        openModal(`Customer Profile - ${customer.name}`, `
            <div class="customer-detail">
                <div class="detail-header">
                    <div class="profile-avatar large" style="background: ${risk?.risk_level === 'High' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : risk?.risk_level === 'Medium' ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#10b981,#059669)'}">
                        ${customer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                        <h3>${customer.name}</h3>
                        <p>${customer.customer_id} • ${customer.city} • ${customer.phone}</p>
                        <span class="badge ${getBadgeClass(risk?.risk_level || 'Low')}">${risk?.risk_level || 'Low'} Risk</span>
                    </div>
                </div>

                <div class="detail-stats-grid">
                    <div class="detail-stat"><span class="detail-stat-value">${orders.length}</span><span>Total Orders</span></div>
                    <div class="detail-stat"><span class="detail-stat-value">${deliveredOrders.length}</span><span>Delivered</span></div>
                    <div class="detail-stat"><span class="detail-stat-value" style="color:#ef4444">${rtoOrders.length}</span><span>RTO</span></div>
                    <div class="detail-stat"><span class="detail-stat-value">${fmtPercent(risk?.historical_rto_percent || 0)}</span><span>RTO Rate</span></div>
                    <div class="detail-stat"><span class="detail-stat-value">${risk?.risk_score || 0}</span><span>Risk Score</span></div>
                    <div class="detail-stat"><span class="detail-stat-value">${fmtCurrency(totalSpend)}</span><span>Total Spend</span></div>
                </div>

                <h4 style="margin-top:1.5rem">Risk Score Breakdown</h4>
                <div class="risk-breakdown">
                    ${riskBreakdown.map(r => `
                        <div class="risk-factor">
                            <span>${r.factor}</span>
                            <span class="risk-points" style="color:${r.color}">+${r.points} pts</span>
                        </div>
                    `).join('')}
                    ${riskBreakdown.length === 0 ? '<div class="risk-factor"><span>No significant risk factors</span><span class="risk-points" style="color:#10b981">Clean profile</span></div>' : ''}
                </div>

                <h4 style="margin-top:1.5rem">Recent Orders</h4>
                <div class="mini-table-wrapper">
                    <table class="data-table mini-table">
                        <thead><tr><th>Order ID</th><th>Value</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
                        <tbody>
                            ${orders.slice(0, 10).map(o => `
                                <tr>
                                    <td>${o.order_id}</td>
                                    <td>${fmtCurrency(o.order_value)}</td>
                                    <td><span class="badge ${o.payment_method === 'COD' ? 'badge-rto' : 'badge-delivered'}">${o.payment_method}</span></td>
                                    <td><span class="badge ${getBadgeClass(o.order_status)}">${o.order_status}</span></td>
                                    <td>${o.order_date}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `);
    };

    // ═══════════════════════════════════════════════════════════════
    // 4. ADDRESS VERIFICATION CENTER
    // ═══════════════════════════════════════════════════════════════
    function renderAddresses(container) {
        const data = window.MeeshoData;
        const valid = data.addresses.filter(a => a.validity_status === 'Valid').length;
        const partial = data.addresses.filter(a => a.validity_status === 'Partially Valid').length;
        const invalid = data.addresses.filter(a => a.validity_status === 'Invalid').length;

        container.innerHTML = `
        <div class="page-content animate-in">
            <div class="kpi-grid kpi-grid-3">
                <div class="kpi-card mini" style="--delay:0">
                    <div class="kpi-icon mini-icon" style="background: linear-gradient(135deg, #10b981, #059669)">✅</div>
                    <div class="kpi-info">
                        <span class="kpi-value">${valid}</span>
                        <span class="kpi-label">Valid Addresses (${fmtPercent(valid/data.addresses.length*100)})</span>
                    </div>
                </div>
                <div class="kpi-card mini" style="--delay:1">
                    <div class="kpi-icon mini-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706)">⚠️</div>
                    <div class="kpi-info">
                        <span class="kpi-value">${partial}</span>
                        <span class="kpi-label">Partially Valid (${fmtPercent(partial/data.addresses.length*100)})</span>
                    </div>
                </div>
                <div class="kpi-card mini" style="--delay:2">
                    <div class="kpi-icon mini-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626)">❌</div>
                    <div class="kpi-info">
                        <span class="kpi-value">${invalid}</span>
                        <span class="kpi-label">Invalid Addresses (${fmtPercent(invalid/data.addresses.length*100)})</span>
                    </div>
                </div>
            </div>

            <div class="filters-bar">
                <div class="filter-group">
                    <label>Status</label>
                    <select id="addressStatusFilter" class="filter-select">
                        <option value="all">All Status</option>
                        <option value="Valid">Valid</option>
                        <option value="Partially Valid">Partially Valid</option>
                        <option value="Invalid">Invalid</option>
                    </select>
                </div>
                <div class="filter-group filter-search" style="flex:1">
                    <label>Search</label>
                    <input type="text" id="addressSearch" class="filter-input" placeholder="Search by address, city, pincode...">
                </div>
            </div>

            <div class="addresses-list" id="addressesList"></div>
            <div class="pagination" id="addressesPagination"></div>
        </div>`;

        renderAddressCards();
        const statusFilter = $('#addressStatusFilter');
        const searchEl = $('#addressSearch');
        let debounce;
        if (statusFilter) statusFilter.addEventListener('change', () => { state.addressFilter.status = statusFilter.value; state.addressPage = 1; renderAddressCards(); });
        if (searchEl) searchEl.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(() => { state.addressFilter.search = searchEl.value; state.addressPage = 1; renderAddressCards(); }, 300); });
    }

    function renderAddressCards() {
        const data = window.MeeshoData;
        const f = state.addressFilter;
        let filtered = data.addresses.filter(a => {
            if (f.status !== 'all' && a.validity_status !== f.status) return false;
            if (f.search) {
                const s = f.search.toLowerCase();
                if (!a.full_address.toLowerCase().includes(s) && !a.pincode?.toString().includes(s)) return false;
            }
            return true;
        });

        const totalPages = Math.ceil(filtered.length / state.addressPerPage);
        const start = (state.addressPage - 1) * state.addressPerPage;
        const pageAddresses = filtered.slice(start, start + state.addressPerPage);
        const list = $('#addressesList');
        if (!list) return;

        list.innerHTML = pageAddresses.map(a => {
            const customer = data.customers.find(c => c.customer_id === a.customer_id);
            return `
            <div class="address-card">
                <div class="address-header">
                    <div class="address-customer">
                        <strong>${customer?.name || 'Unknown'}</strong>
                        <span>${a.customer_id} • ${a.address_id}</span>
                    </div>
                    <span class="badge ${getBadgeClass(a.validity_status)}">${a.validity_status}</span>
                </div>
                <div class="address-body">
                    <div class="address-text">
                        <span class="address-label">📍 Current Address</span>
                        <p>${a.full_address}</p>
                    </div>
                    ${a.issues && a.issues.length > 0 ? `
                    <div class="address-issues">
                        <span class="address-label">⚠️ Issues Found</span>
                        <ul>${a.issues.map(i => `<li>${i}</li>`).join('')}</ul>
                    </div>` : ''}
                    ${a.suggested_correction ? `
                    <div class="address-suggestion">
                        <span class="address-label">💡 Suggested Correction</span>
                        <p class="suggestion-text">${a.suggested_correction}</p>
                    </div>` : ''}
                </div>
                <div class="address-footer">
                    <span class="confidence-score">Confidence: <strong style="color:${a.confidence_score > 80 ? '#10b981' : a.confidence_score > 50 ? '#f59e0b' : '#ef4444'}">${a.confidence_score}%</strong></span>
                    <span class="verification-date">Verified: ${a.verification_date}</span>
                </div>
            </div>`;
        }).join('');

        renderPagination($('#addressesPagination'), state.addressPage, totalPages, (p) => { state.addressPage = p; renderAddressCards(); });
    }

    // ═══════════════════════════════════════════════════════════════
    // 5. DYNAMIC CHECKOUT DECISION ENGINE
    // ═══════════════════════════════════════════════════════════════
    function renderCheckout(container) {
        const data = window.MeeshoData;

        // Process recent orders through decision engine
        const recentOrders = data.orders.slice(0, 100).map(o => {
            const risk = data.getCustomerRisk(o.customer_id);
            const customer = data.customers.find(c => c.customer_id === o.customer_id);
            const riskLevel = risk?.risk_level || 'Low';
            let decision, action, color;
            if (riskLevel === 'Low') {
                decision = 'APPROVED';
                action = 'Order approved. No additional verification required.';
                color = '#10b981';
            } else if (riskLevel === 'Medium') {
                decision = 'CONFIRMATION REQUIRED';
                action = 'Confirmation prompt displayed to customer. Order pending verification.';
                color = '#f59e0b';
            } else {
                decision = 'ADVANCE PAYMENT REQUIRED';
                action = `15% advance payment (${fmtCurrency(Math.round(o.order_value * 0.15))}) required before order confirmation.`;
                color = '#ef4444';
            }
            return { ...o, customer, risk, riskLevel, decision, action, color };
        });

        const approved = recentOrders.filter(o => o.decision === 'APPROVED').length;
        const confirmation = recentOrders.filter(o => o.decision === 'CONFIRMATION REQUIRED').length;
        const advance = recentOrders.filter(o => o.decision === 'ADVANCE PAYMENT REQUIRED').length;

        container.innerHTML = `
        <div class="page-content animate-in">
            <div class="engine-rules">
                <h3 class="section-title">🔧 Decision Engine Rules</h3>
                <div class="rules-grid">
                    <div class="rule-card rule-low">
                        <div class="rule-header">
                            <span class="rule-icon">✅</span>
                            <h4>Low Risk (0-39)</h4>
                        </div>
                        <p>Order automatically approved. No additional verification needed.</p>
                        <div class="rule-stat">${approved} orders</div>
                    </div>
                    <div class="rule-card rule-medium">
                        <div class="rule-header">
                            <span class="rule-icon">⚠️</span>
                            <h4>Medium Risk (40-69)</h4>
                        </div>
                        <p>Customer must confirm order via OTP/prompt before processing.</p>
                        <div class="rule-stat">${confirmation} orders</div>
                    </div>
                    <div class="rule-card rule-high">
                        <div class="rule-header">
                            <span class="rule-icon">🚨</span>
                            <h4>High Risk (70-100)</h4>
                        </div>
                        <p>15% advance payment required before order confirmation.</p>
                        <div class="rule-stat">${advance} orders</div>
                    </div>
                </div>
            </div>

            <h3 class="section-title" style="margin-top:2rem">📋 Recent Checkout Decisions</h3>
            <div class="checkout-decisions" id="checkoutDecisions"></div>
            <div class="pagination" id="checkoutPagination"></div>
        </div>`;

        renderCheckoutDecisions(recentOrders);
    }

    function renderCheckoutDecisions(orders) {
        const totalPages = Math.ceil(orders.length / state.checkoutPerPage);
        const start = (state.checkoutPage - 1) * state.checkoutPerPage;
        const pageOrders = orders.slice(start, start + state.checkoutPerPage);
        const list = $('#checkoutDecisions');
        if (!list) return;

        list.innerHTML = pageOrders.map(o => `
            <div class="checkout-card">
                <div class="checkout-header">
                    <div class="checkout-order-info">
                        <span class="order-id">${o.order_id}</span>
                        <span class="checkout-customer">${o.customer?.name || 'N/A'} • ${o.customer?.city || 'N/A'}</span>
                    </div>
                    <div class="checkout-value">${fmtCurrency(o.order_value)}</div>
                </div>
                <div class="checkout-body">
                    <div class="checkout-risk">
                        <div class="risk-indicator">
                            <span class="risk-label">Risk Score</span>
                            <div class="risk-meter large">
                                <div class="risk-fill" style="width:${o.risk?.risk_score || 0}%;background:${o.color}"></div>
                                <span>${o.risk?.risk_score || 0}/100</span>
                            </div>
                        </div>
                        <div class="risk-details">
                            <span class="badge ${getBadgeClass(o.riskLevel)}">${o.riskLevel} Risk</span>
                            <span class="badge ${o.payment_method === 'COD' ? 'badge-rto' : 'badge-delivered'}">${o.payment_method}</span>
                        </div>
                    </div>
                    <div class="checkout-decision" style="border-left: 3px solid ${o.color}">
                        <span class="decision-label" style="color:${o.color}">${o.decision}</span>
                        <p class="decision-action">${o.action}</p>
                    </div>
                </div>
            </div>
        `).join('');

        renderPagination($('#checkoutPagination'), state.checkoutPage, totalPages, (p) => {
            state.checkoutPage = p;
            renderCheckoutDecisions(orders);
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 6. ANALYTICS & SQL INSIGHTS
    // ═══════════════════════════════════════════════════════════════
    function renderAnalytics(container) {
        const data = window.MeeshoData;

        container.innerHTML = `
        <div class="page-content animate-in">
            <div class="tabs">
                <button class="tab-btn active" data-tab="highRiskCustomers">Top High Risk Customers</button>
                <button class="tab-btn" data-tab="highRiskCities">Top High Risk Cities</button>
                <button class="tab-btn" data-tab="codImpact">COD Impact</button>
                <button class="tab-btn" data-tab="rtoAnalysis">RTO Analysis</button>
                <button class="tab-btn" data-tab="revLeakage">Revenue Leakage</button>
            </div>
            <div class="tab-content" id="analyticsContent"></div>
        </div>`;

        $$('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                destroyCharts();
                renderAnalyticsTab(btn.dataset.tab);
            });
        });
        renderAnalyticsTab('highRiskCustomers');
    }

    function renderAnalyticsTab(tab) {
        const data = window.MeeshoData;
        const content = $('#analyticsContent');
        const { textColor, gridColor } = getChartDefaults();

        if (tab === 'highRiskCustomers') {
            const topCustomers = data.getTopRiskyCustomers(15);
            content.innerHTML = `
                <div class="analytics-section">
                    <div class="sql-block">
                        <div class="sql-header"><span>SQL Query</span><button class="btn btn-sm btn-ghost" onclick="navigator.clipboard.writeText(this.closest('.sql-block').querySelector('code').textContent);window.showToastGlobal('Copied!','success')">📋 Copy</button></div>
                        <pre><code>SELECT c.customer_id, c.name, c.city,
       r.risk_score, r.risk_level,
       r.historical_rto_percent,
       r.total_orders, r.total_rto_orders
FROM customers c
JOIN risk_scores r ON c.customer_id = r.customer_id
WHERE r.risk_level = 'High'
ORDER BY r.risk_score DESC
LIMIT 15;</code></pre>
                    </div>
                    <div class="table-wrapper">
                        <table class="data-table">
                            <thead><tr><th>Customer ID</th><th>Name</th><th>City</th><th>Risk Score</th><th>Risk Level</th><th>RTO %</th><th>Orders</th><th>RTO Orders</th></tr></thead>
                            <tbody>
                                ${topCustomers.map(c => `
                                <tr>
                                    <td>${c.customer_id}</td>
                                    <td>${c.name}</td>
                                    <td>${c.city}</td>
                                    <td><strong style="color:#ef4444">${c.risk_score}</strong></td>
                                    <td><span class="badge badge-high">${c.risk_level}</span></td>
                                    <td>${fmtPercent(c.rto_percent)}</td>
                                    <td>${c.total_orders}</td>
                                    <td>${Math.round(c.total_orders * c.rto_percent / 100)}</td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>`;
        } else if (tab === 'highRiskCities') {
            const topCities = data.getTopRiskyCities(15);
            content.innerHTML = `
                <div class="analytics-section">
                    <div class="sql-block">
                        <div class="sql-header"><span>SQL Query</span><button class="btn btn-sm btn-ghost" onclick="navigator.clipboard.writeText(this.closest('.sql-block').querySelector('code').textContent);window.showToastGlobal('Copied!','success')">📋 Copy</button></div>
                        <pre><code>SELECT c.city,
       COUNT(DISTINCT c.customer_id) AS total_customers,
       ROUND(AVG(r.risk_score), 1) AS avg_risk_score,
       ROUND(AVG(r.historical_rto_percent), 1) AS avg_rto_rate,
       SUM(CASE WHEN r.risk_level = 'High' THEN 1 ELSE 0 END) AS high_risk_count
FROM customers c
JOIN risk_scores r ON c.customer_id = r.customer_id
GROUP BY c.city
ORDER BY avg_risk_score DESC
LIMIT 15;</code></pre>
                    </div>
                    <div class="chart-container" style="margin-bottom:1.5rem">
                        <div class="chart-body" style="height:400px"><canvas id="cityRiskChart"></canvas></div>
                    </div>
                    <div class="table-wrapper">
                        <table class="data-table">
                            <thead><tr><th>City</th><th>Customers</th><th>Avg Risk Score</th><th>Avg RTO Rate</th><th>High Risk Count</th></tr></thead>
                            <tbody>
                                ${topCities.map(c => `
                                <tr>
                                    <td><strong>${c.city}</strong></td>
                                    <td>${c.customer_count}</td>
                                    <td><span style="color:${c.avg_risk_score > 60 ? '#ef4444' : c.avg_risk_score > 40 ? '#f59e0b' : '#10b981'}">${c.avg_risk_score.toFixed(1)}</span></td>
                                    <td>${fmtPercent(c.rto_rate)}</td>
                                    <td>${c.customer_count}</td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>`;
            setTimeout(() => {
                state.charts.cityRisk = new Chart($('#cityRiskChart'), {
                    type: 'bar',
                    data: {
                        labels: topCities.map(c => c.city),
                        datasets: [{
                            label: 'Avg Risk Score',
                            data: topCities.map(c => c.avg_risk_score),
                            backgroundColor: topCities.map(c => c.avg_risk_score > 60 ? 'rgba(239,68,68,0.7)' : c.avg_risk_score > 40 ? 'rgba(245,158,11,0.7)' : 'rgba(16,185,129,0.7)'),
                            borderRadius: 6
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
                        scales: { x: { beginAtZero: true, max: 100, ticks: { color: textColor }, grid: { color: gridColor } }, y: { ticks: { color: textColor }, grid: { display: false } } },
                        plugins: { legend: { display: false } }
                    }
                });
            }, 100);
        } else if (tab === 'codImpact') {
            const codPrepaid = data.getCODvsPrepaid();
            content.innerHTML = `
                <div class="analytics-section">
                    <div class="sql-block">
                        <div class="sql-header"><span>SQL Query</span><button class="btn btn-sm btn-ghost" onclick="navigator.clipboard.writeText(this.closest('.sql-block').querySelector('code').textContent);window.showToastGlobal('Copied!','success')">📋 Copy</button></div>
                        <pre><code>SELECT o.payment_method,
       COUNT(*) AS total_orders,
       SUM(CASE WHEN o.order_status = 'RTO' THEN 1 ELSE 0 END) AS rto_orders,
       ROUND(SUM(CASE WHEN o.order_status = 'RTO' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS rto_rate,
       ROUND(AVG(o.order_value), 0) AS avg_order_value,
       SUM(o.order_value) AS total_revenue
FROM orders o
GROUP BY o.payment_method;</code></pre>
                    </div>
                    <div class="kpi-grid" style="margin-bottom:1.5rem">
                        <div class="kpi-card mini">
                            <div class="kpi-info">
                                <span class="kpi-value" style="color:#ef4444">${codPrepaid.cod.total_orders}</span>
                                <span class="kpi-label">COD Orders</span>
                            </div>
                        </div>
                        <div class="kpi-card mini">
                            <div class="kpi-info">
                                <span class="kpi-value" style="color:#10b981">${codPrepaid.prepaid.total_orders}</span>
                                <span class="kpi-label">Prepaid Orders</span>
                            </div>
                        </div>
                        <div class="kpi-card mini">
                            <div class="kpi-info">
                                <span class="kpi-value" style="color:#ef4444">${fmtPercent(codPrepaid.cod.rto_rate)}</span>
                                <span class="kpi-label">COD RTO Rate</span>
                            </div>
                        </div>
                        <div class="kpi-card mini">
                            <div class="kpi-info">
                                <span class="kpi-value" style="color:#10b981">${fmtPercent(codPrepaid.prepaid.rto_rate)}</span>
                                <span class="kpi-label">Prepaid RTO Rate</span>
                            </div>
                        </div>
                    </div>
                    <div class="chart-container"><div class="chart-body" style="height:300px"><canvas id="codImpactChart"></canvas></div></div>
                </div>`;
            setTimeout(() => {
                state.charts.codImpact = new Chart($('#codImpactChart'), {
                    type: 'bar',
                    data: {
                        labels: ['Orders', 'RTO Rate (%)', 'Avg Value (₹/100)', 'Revenue (₹L)'],
                        datasets: [
                            { label: 'COD', data: [codPrepaid.cod.total_orders, codPrepaid.cod.rto_rate, codPrepaid.cod.avg_order_value / 100, codPrepaid.cod.total_revenue / 100000], backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 6 },
                            { label: 'Prepaid', data: [codPrepaid.prepaid.total_orders, codPrepaid.prepaid.rto_rate, codPrepaid.prepaid.avg_order_value / 100, codPrepaid.prepaid.total_revenue / 100000], backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 6 }
                        ]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        scales: { y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } }, x: { ticks: { color: textColor }, grid: { display: false } } },
                        plugins: { legend: { labels: { color: textColor, usePointStyle: true } } }
                    }
                });
            }, 100);
        } else if (tab === 'rtoAnalysis') {
            const rtoTrend = data.getRTOTrend();
            const rtoOrders = data.orders.filter(o => o.order_status === 'RTO');
            const totalRTOValue = rtoOrders.reduce((s, o) => s + o.order_value, 0);
            const avgRTOValue = totalRTOValue / rtoOrders.length;
            const categoryCounts = {};
            rtoOrders.forEach(o => { categoryCounts[o.product_category] = (categoryCounts[o.product_category] || 0) + 1; });
            const topRTOCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

            content.innerHTML = `
                <div class="analytics-section">
                    <div class="sql-block">
                        <div class="sql-header"><span>SQL Query</span><button class="btn btn-sm btn-ghost" onclick="navigator.clipboard.writeText(this.closest('.sql-block').querySelector('code').textContent);window.showToastGlobal('Copied!','success')">📋 Copy</button></div>
                        <pre><code>SELECT DATE_FORMAT(o.order_date, '%Y-%m') AS month,
       COUNT(*) AS total_orders,
       SUM(CASE WHEN o.order_status = 'RTO' THEN 1 ELSE 0 END) AS rto_orders,
       ROUND(SUM(CASE WHEN o.order_status = 'RTO' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS rto_rate,
       SUM(CASE WHEN o.order_status = 'RTO' THEN o.order_value ELSE 0 END) AS rto_revenue_loss
FROM orders o
GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
ORDER BY month;</code></pre>
                    </div>
                    <div class="kpi-grid kpi-grid-3" style="margin-bottom:1.5rem">
                        <div class="kpi-card mini"><div class="kpi-info"><span class="kpi-value" style="color:#ef4444">${rtoOrders.length}</span><span class="kpi-label">Total RTO Orders</span></div></div>
                        <div class="kpi-card mini"><div class="kpi-info"><span class="kpi-value" style="color:#ef4444">${fmtCurrency(totalRTOValue)}</span><span class="kpi-label">Total RTO Value</span></div></div>
                        <div class="kpi-card mini"><div class="kpi-info"><span class="kpi-value">${fmtCurrency(Math.round(avgRTOValue))}</span><span class="kpi-label">Avg RTO Order Value</span></div></div>
                    </div>
                    <div class="charts-grid">
                        <div class="chart-container"><div class="chart-header"><h3 class="chart-title">RTO Trend by Month</h3></div><div class="chart-body"><canvas id="rtoAnalysisChart"></canvas></div></div>
                        <div class="chart-container"><div class="chart-header"><h3 class="chart-title">RTO by Category</h3></div><div class="chart-body"><canvas id="rtoCategoryChart"></canvas></div></div>
                    </div>
                </div>`;
            setTimeout(() => {
                state.charts.rtoAnalysis = new Chart($('#rtoAnalysisChart'), {
                    type: 'line',
                    data: {
                        labels: rtoTrend.map(t => t.month),
                        datasets: [{
                            label: 'RTO Rate %', data: rtoTrend.map(t => t.rto_rate),
                            borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4, pointRadius: 5, borderWidth: 2
                        }, {
                            label: 'Target 15%', data: rtoTrend.map(() => 15),
                            borderColor: '#10b981', borderDash: [5, 5], pointRadius: 0, borderWidth: 2
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 35, ticks: { color: textColor, callback: v => v + '%' }, grid: { color: gridColor } }, x: { ticks: { color: textColor }, grid: { color: gridColor } } }, plugins: { legend: { labels: { color: textColor } } } }
                });
                const catColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
                state.charts.rtoCategory = new Chart($('#rtoCategoryChart'), {
                    type: 'doughnut',
                    data: {
                        labels: topRTOCategories.map(c => c[0]),
                        datasets: [{ data: topRTOCategories.map(c => c[1]), backgroundColor: catColors, borderWidth: 0, spacing: 3, borderRadius: 4 }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: textColor, padding: 12, usePointStyle: true } } }, cutout: '60%' }
                });
            }, 100);
        } else if (tab === 'revLeakage') {
            const rtoOrders = data.orders.filter(o => o.order_status === 'RTO');
            const totalRevenue = data.orders.reduce((s, o) => s + o.order_value, 0);
            const rtoRevenue = rtoOrders.reduce((s, o) => s + o.order_value, 0);
            const logisticsCostPerOrder = 120;
            const totalLogisticsLoss = rtoOrders.length * logisticsCostPerOrder;
            const totalLeakage = rtoRevenue + totalLogisticsLoss;
            const leakagePercent = (totalLeakage / totalRevenue) * 100;
            const targetRTO = 0.15;
            const currentRTO = rtoOrders.length / data.orders.length;
            const potentialSavings = Math.floor(data.orders.length * (currentRTO - targetRTO)) * logisticsCostPerOrder;

            content.innerHTML = `
                <div class="analytics-section">
                    <div class="sql-block">
                        <div class="sql-header"><span>SQL Query</span><button class="btn btn-sm btn-ghost" onclick="navigator.clipboard.writeText(this.closest('.sql-block').querySelector('code').textContent);window.showToastGlobal('Copied!','success')">📋 Copy</button></div>
                        <pre><code>SELECT
    SUM(o.order_value) AS total_revenue,
    SUM(CASE WHEN o.order_status = 'RTO' THEN o.order_value ELSE 0 END) AS rto_revenue_loss,
    COUNT(CASE WHEN o.order_status = 'RTO' THEN 1 END) * 120 AS logistics_cost_loss,
    ROUND(
        (SUM(CASE WHEN o.order_status = 'RTO' THEN o.order_value ELSE 0 END) +
         COUNT(CASE WHEN o.order_status = 'RTO' THEN 1 END) * 120) * 100.0 /
        SUM(o.order_value), 2
    ) AS leakage_percentage
FROM orders o;</code></pre>
                    </div>
                    <div class="kpi-grid">
                        <div class="kpi-card mini"><div class="kpi-info"><span class="kpi-value">${fmtCurrency(totalRevenue)}</span><span class="kpi-label">Total Revenue</span></div></div>
                        <div class="kpi-card mini"><div class="kpi-info"><span class="kpi-value" style="color:#ef4444">${fmtCurrency(rtoRevenue)}</span><span class="kpi-label">RTO Revenue Loss</span></div></div>
                        <div class="kpi-card mini"><div class="kpi-info"><span class="kpi-value" style="color:#f59e0b">${fmtCurrency(totalLogisticsLoss)}</span><span class="kpi-label">Logistics Cost Loss</span></div></div>
                        <div class="kpi-card mini"><div class="kpi-info"><span class="kpi-value" style="color:#ef4444">${fmtPercent(leakagePercent)}</span><span class="kpi-label">Total Leakage %</span></div></div>
                    </div>
                    <div class="leakage-summary" style="margin-top:1.5rem">
                        <div class="chart-container"><div class="chart-header"><h3 class="chart-title">Revenue Leakage Breakdown</h3></div><div class="chart-body" style="height:300px"><canvas id="leakageChart"></canvas></div></div>
                    </div>
                    <div class="savings-callout" style="margin-top:1.5rem">
                        <div class="callout-card">
                            <h4>💡 Potential Savings with 15% RTO Target</h4>
                            <p>By reducing RTO from <strong>${fmtPercent(currentRTO * 100)}</strong> to <strong>15%</strong>, Meesho can save approximately <strong style="color:#10b981">${fmtCurrency(potentialSavings)}</strong> in logistics costs alone.</p>
                        </div>
                    </div>
                </div>`;
            setTimeout(() => {
                state.charts.leakage = new Chart($('#leakageChart'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Retained Revenue', 'RTO Revenue Loss', 'Logistics Cost'],
                        datasets: [{ data: [totalRevenue - rtoRevenue, rtoRevenue, totalLogisticsLoss], backgroundColor: ['rgba(16,185,129,0.7)', 'rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)'], borderWidth: 0, spacing: 4, borderRadius: 6 }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: textColor, padding: 16, usePointStyle: true } } }, cutout: '55%' }
                });
            }, 100);
        }
    }

    window.showToastGlobal = showToast;

    // ═══════════════════════════════════════════════════════════════
    // 7. A/B TESTING MODULE
    // ═══════════════════════════════════════════════════════════════
    function renderABTest(container) {
        const data = window.MeeshoData;
        const ab = data.abTestData;
        const vA = ab.variant_a;
        const vB = ab.variant_b;
        const convA = (vA.conversions / vA.orders * 100);
        const convB = (vB.conversions / vB.orders * 100);
        const rtoA = (vA.rto_count / vA.orders * 100);
        const rtoB = (vB.rto_count / vB.orders * 100);
        const savingsB = vA.logistics_cost - vB.logistics_cost;
        const winner = rtoB < rtoA ? 'B' : 'A';

        container.innerHTML = `
        <div class="page-content animate-in">
            <div class="experiment-header">
                <div class="experiment-info">
                    <h2>${ab.experiment_name}</h2>
                    <p>Experiment ${ab.experiment_id} • ${ab.start_date} to ${ab.end_date}</p>
                    <span class="badge badge-delivered">Active Experiment</span>
                </div>
            </div>

            <div class="ab-comparison">
                <div class="variant-card variant-a">
                    <div class="variant-header">
                        <h3>Variant A</h3>
                        <span class="variant-label">Control</span>
                    </div>
                    <h4>${vA.name}</h4>
                    <div class="variant-metrics">
                        <div class="metric"><span class="metric-value">${fmt(vA.orders)}</span><span class="metric-label">Orders</span></div>
                        <div class="metric"><span class="metric-value">${fmtPercent(convA)}</span><span class="metric-label">Conversion Rate</span></div>
                        <div class="metric"><span class="metric-value" style="color:#ef4444">${fmtPercent(rtoA)}</span><span class="metric-label">RTO Rate</span></div>
                        <div class="metric"><span class="metric-value">${fmtCurrency(vA.revenue)}</span><span class="metric-label">Revenue</span></div>
                        <div class="metric"><span class="metric-value" style="color:#f59e0b">${fmtCurrency(vA.logistics_cost)}</span><span class="metric-label">Logistics Cost</span></div>
                    </div>
                </div>

                <div class="vs-divider">
                    <span class="vs-text">VS</span>
                </div>

                <div class="variant-card variant-b ${winner === 'B' ? 'winner' : ''}">
                    <div class="variant-header">
                        <h3>Variant B</h3>
                        <span class="variant-label">${winner === 'B' ? '🏆 Winner' : 'Treatment'}</span>
                    </div>
                    <h4>${vB.name}</h4>
                    <div class="variant-metrics">
                        <div class="metric"><span class="metric-value">${fmt(vB.orders)}</span><span class="metric-label">Orders</span></div>
                        <div class="metric"><span class="metric-value">${fmtPercent(convB)}</span><span class="metric-label">Conversion Rate</span></div>
                        <div class="metric"><span class="metric-value" style="color:#10b981">${fmtPercent(rtoB)}</span><span class="metric-label">RTO Rate</span></div>
                        <div class="metric"><span class="metric-value">${fmtCurrency(vB.revenue)}</span><span class="metric-label">Revenue</span></div>
                        <div class="metric"><span class="metric-value" style="color:#10b981">${fmtCurrency(vB.logistics_cost)}</span><span class="metric-label">Logistics Cost</span></div>
                    </div>
                </div>
            </div>

            <div class="ab-metrics-comparison">
                <h3 class="section-title">📊 Metric Comparison</h3>
                <div class="comparison-bars">
                    <div class="comparison-row">
                        <span class="comparison-label">RTO Rate</span>
                        <div class="comparison-bar-group">
                            <div class="comparison-bar-container">
                                <div class="comparison-bar variant-a-bar" style="width:${rtoA * 3}%">${fmtPercent(rtoA)}</div>
                                <span class="bar-label">A</span>
                            </div>
                            <div class="comparison-bar-container">
                                <div class="comparison-bar variant-b-bar" style="width:${rtoB * 3}%">${fmtPercent(rtoB)}</div>
                                <span class="bar-label">B</span>
                            </div>
                        </div>
                        <span class="comparison-delta ${rtoB < rtoA ? 'positive' : 'negative'}">${rtoB < rtoA ? '↓' : '↑'} ${fmtPercent(Math.abs(rtoA - rtoB))}</span>
                    </div>
                    <div class="comparison-row">
                        <span class="comparison-label">Conversion Rate</span>
                        <div class="comparison-bar-group">
                            <div class="comparison-bar-container">
                                <div class="comparison-bar variant-a-bar" style="width:${convA}%">${fmtPercent(convA)}</div>
                                <span class="bar-label">A</span>
                            </div>
                            <div class="comparison-bar-container">
                                <div class="comparison-bar variant-b-bar" style="width:${convB}%">${fmtPercent(convB)}</div>
                                <span class="bar-label">B</span>
                            </div>
                        </div>
                        <span class="comparison-delta ${convB > convA ? 'positive' : 'negative'}">${convB > convA ? '↑' : '↓'} ${fmtPercent(Math.abs(convA - convB))}</span>
                    </div>
                </div>
            </div>

            <div class="charts-grid" style="margin-top:2rem">
                <div class="chart-container">
                    <div class="chart-header"><h3 class="chart-title">Daily RTO Rate Comparison</h3></div>
                    <div class="chart-body"><canvas id="abRTOChart"></canvas></div>
                </div>
                <div class="chart-container">
                    <div class="chart-header"><h3 class="chart-title">Cumulative Revenue</h3></div>
                    <div class="chart-body"><canvas id="abRevenueChart"></canvas></div>
                </div>
            </div>

            <div class="experiment-conclusion" style="margin-top:2rem">
                <div class="callout-card">
                    <h4>🎯 Experiment Conclusion</h4>
                    <p><strong>Variant B (Risk-Based Checkout)</strong> demonstrates a significant reduction in RTO rate from <strong style="color:#ef4444">${fmtPercent(rtoA)}</strong> to <strong style="color:#10b981">${fmtPercent(rtoB)}</strong>, resulting in logistics cost savings of <strong style="color:#10b981">${fmtCurrency(savingsB)}</strong>.</p>
                    <p>Recommendation: <strong>Roll out Variant B</strong> to all users for maximum RTO reduction and cost optimization.</p>
                </div>
            </div>
        </div>`;

        setTimeout(() => renderABCharts(ab), 300);
    }

    function renderABCharts(ab) {
        const { textColor, gridColor } = getChartDefaults();
        const daily = ab.daily_data;

        state.charts.abRTO = new Chart($('#abRTOChart'), {
            type: 'line',
            data: {
                labels: daily.map((d, i) => `Day ${i + 1}`),
                datasets: [
                    { label: 'Variant A (Normal)', data: daily.map(d => (d.variant_a.rto_count / d.variant_a.orders * 100).toFixed(1)), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: false, tension: 0.4, borderWidth: 2, pointRadius: 2 },
                    { label: 'Variant B (Risk-Based)', data: daily.map(d => (d.variant_b.rto_count / d.variant_b.orders * 100).toFixed(1)), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: false, tension: 0.4, borderWidth: 2, pointRadius: 2 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, max: 40, ticks: { color: textColor, callback: v => v + '%' }, grid: { color: gridColor } }, x: { ticks: { color: textColor, maxTicksLimit: 10 }, grid: { color: gridColor } } },
                plugins: { legend: { labels: { color: textColor, usePointStyle: true } } }
            }
        });

        let cumA = 0, cumB = 0;
        const cumRevA = daily.map(d => { cumA += d.variant_a.revenue; return cumA; });
        const cumRevB = daily.map(d => { cumB += d.variant_b.revenue; return cumB; });
        state.charts.abRevenue = new Chart($('#abRevenueChart'), {
            type: 'line',
            data: {
                labels: daily.map((d, i) => `Day ${i + 1}`),
                datasets: [
                    { label: 'Variant A', data: cumRevA, borderColor: '#ef4444', fill: false, tension: 0.3, borderWidth: 2, pointRadius: 0 },
                    { label: 'Variant B', data: cumRevB, borderColor: '#10b981', fill: false, tension: 0.3, borderWidth: 2, pointRadius: 0 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, ticks: { color: textColor, callback: v => '₹' + (v / 1000).toFixed(0) + 'K' }, grid: { color: gridColor } }, x: { ticks: { color: textColor, maxTicksLimit: 10 }, grid: { color: gridColor } } },
                plugins: { legend: { labels: { color: textColor, usePointStyle: true } } }
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 8. SYSTEM ARCHITECTURE
    // ═══════════════════════════════════════════════════════════════
    function renderArchitecture(container) {
        container.innerHTML = `
        <div class="page-content animate-in">
            <div class="architecture-header">
                <h2>System Architecture Overview</h2>
                <p>End-to-end flow from customer checkout to delivery, powered by the RTO Optimization Engine.</p>
            </div>

            <div class="architecture-flow">
                <div class="arch-node node-start">
                    <div class="arch-icon">👤</div>
                    <div class="arch-label">Customer</div>
                    <div class="arch-desc">Initiates order</div>
                </div>
                <div class="arch-arrow">
                    <div class="arrow-line"></div>
                    <div class="arrow-head">→</div>
                </div>
                <div class="arch-node node-checkout">
                    <div class="arch-icon">🛒</div>
                    <div class="arch-label">Checkout</div>
                    <div class="arch-desc">Order placement</div>
                </div>
                <div class="arch-arrow">
                    <div class="arrow-line"></div>
                    <div class="arrow-head">→</div>
                </div>
                <div class="arch-node node-risk">
                    <div class="arch-icon">🧠</div>
                    <div class="arch-label">Risk Engine</div>
                    <div class="arch-desc">Score calculation</div>
                </div>
                <div class="arch-arrow">
                    <div class="arrow-line"></div>
                    <div class="arrow-head">→</div>
                </div>
                <div class="arch-node node-address">
                    <div class="arch-icon">📍</div>
                    <div class="arch-label">Address Validation</div>
                    <div class="arch-desc">Verify & correct</div>
                </div>
                <div class="arch-arrow">
                    <div class="arrow-line"></div>
                    <div class="arrow-head">→</div>
                </div>
                <div class="arch-node node-decision">
                    <div class="arch-icon">⚡</div>
                    <div class="arch-label">Decision Engine</div>
                    <div class="arch-desc">Approve / Flag / Block</div>
                </div>
                <div class="arch-arrow">
                    <div class="arrow-line"></div>
                    <div class="arrow-head">→</div>
                </div>
                <div class="arch-node node-oms">
                    <div class="arch-icon">📋</div>
                    <div class="arch-label">OMS</div>
                    <div class="arch-desc">Order management</div>
                </div>
                <div class="arch-arrow">
                    <div class="arrow-line"></div>
                    <div class="arrow-head">→</div>
                </div>
                <div class="arch-node node-logistics">
                    <div class="arch-icon">🚚</div>
                    <div class="arch-label">Logistics Partner</div>
                    <div class="arch-desc">Shipping & tracking</div>
                </div>
                <div class="arch-arrow">
                    <div class="arrow-line"></div>
                    <div class="arrow-head">→</div>
                </div>
                <div class="arch-node node-delivery">
                    <div class="arch-icon">📬</div>
                    <div class="arch-label">Delivery</div>
                    <div class="arch-desc">Final mile</div>
                </div>
            </div>

            <div class="architecture-details">
                <h3 class="section-title">🔧 Component Details</h3>
                <div class="arch-details-grid">
                    <div class="arch-detail-card">
                        <h4>🧠 Risk Engine</h4>
                        <ul>
                            <li>Historical RTO analysis (>40% = +50 pts)</li>
                            <li>Payment method check (COD = +20 pts)</li>
                            <li>Order value analysis (>₹3000 = +15 pts)</li>
                            <li>Address validity check (Invalid = +15 pts)</li>
                        </ul>
                    </div>
                    <div class="arch-detail-card">
                        <h4>📍 Address Validation</h4>
                        <ul>
                            <li>Pincode verification</li>
                            <li>House number detection</li>
                            <li>Address completeness check</li>
                            <li>Ambiguity resolution</li>
                            <li>Auto-correction suggestions</li>
                        </ul>
                    </div>
                    <div class="arch-detail-card">
                        <h4>⚡ Decision Engine</h4>
                        <ul>
                            <li>Low Risk (0-39): Auto-approve</li>
                            <li>Medium Risk (40-69): Confirmation prompt</li>
                            <li>High Risk (70-100): 15% advance payment</li>
                        </ul>
                    </div>
                    <div class="arch-detail-card">
                        <h4>📊 Analytics Layer</h4>
                        <ul>
                            <li>Real-time RTO monitoring</li>
                            <li>Customer risk profiling</li>
                            <li>Revenue leakage analysis</li>
                            <li>A/B testing framework</li>
                            <li>SQL-based insights engine</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="database-schema" style="margin-top:2rem">
                <h3 class="section-title">🗄️ Database Schema</h3>
                <div class="schema-grid">
                    <div class="schema-card">
                        <div class="schema-header">customers</div>
                        <div class="schema-fields">
                            <div class="schema-field"><span class="field-key">PK</span> customer_id VARCHAR</div>
                            <div class="schema-field">name VARCHAR</div>
                            <div class="schema-field">city VARCHAR</div>
                            <div class="schema-field">phone VARCHAR</div>
                            <div class="schema-field">email VARCHAR</div>
                            <div class="schema-field">join_date DATE</div>
                        </div>
                    </div>
                    <div class="schema-card">
                        <div class="schema-header">orders</div>
                        <div class="schema-fields">
                            <div class="schema-field"><span class="field-key">PK</span> order_id VARCHAR</div>
                            <div class="schema-field"><span class="field-key">FK</span> customer_id VARCHAR</div>
                            <div class="schema-field">order_value DECIMAL</div>
                            <div class="schema-field">payment_method VARCHAR</div>
                            <div class="schema-field">order_status VARCHAR</div>
                            <div class="schema-field">order_date DATE</div>
                            <div class="schema-field">product_category VARCHAR</div>
                        </div>
                    </div>
                    <div class="schema-card">
                        <div class="schema-header">risk_scores</div>
                        <div class="schema-fields">
                            <div class="schema-field"><span class="field-key">FK</span> customer_id VARCHAR</div>
                            <div class="schema-field">risk_score INT</div>
                            <div class="schema-field">risk_level VARCHAR</div>
                            <div class="schema-field">historical_rto_percent DECIMAL</div>
                            <div class="schema-field">total_orders INT</div>
                            <div class="schema-field">total_rto_orders INT</div>
                        </div>
                    </div>
                    <div class="schema-card">
                        <div class="schema-header">addresses</div>
                        <div class="schema-fields">
                            <div class="schema-field"><span class="field-key">PK</span> address_id VARCHAR</div>
                            <div class="schema-field"><span class="field-key">FK</span> customer_id VARCHAR</div>
                            <div class="schema-field">full_address TEXT</div>
                            <div class="schema-field">validity_status VARCHAR</div>
                            <div class="schema-field">issues JSON</div>
                            <div class="schema-field">confidence_score INT</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    // ═══════════════════════════════════════════════════════════════
    // PAGINATION HELPER
    // ═══════════════════════════════════════════════════════════════
    function renderPagination(container, currentPage, totalPages, onPageChange) {
        if (!container || totalPages <= 1) { if (container) container.innerHTML = ''; return; }
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

        let html = `<button class="page-btn" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>← Prev</button>`;
        if (startPage > 1) html += `<button class="page-btn" data-page="1">1</button><span class="page-dots">...</span>`;
        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        if (endPage < totalPages) html += `<span class="page-dots">...</span><button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
        html += `<button class="page-btn" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>`;

        container.innerHTML = html;
        container.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const p = btn.dataset.page;
                if (p === 'prev' && currentPage > 1) onPageChange(currentPage - 1);
                else if (p === 'next' && currentPage < totalPages) onPageChange(currentPage + 1);
                else if (p !== 'prev' && p !== 'next') onPageChange(parseInt(p));
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    function init() {
        // Theme toggle
        $('#themeToggle').addEventListener('click', () => {
            const html = document.documentElement;
            const current = html.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            $('#themeIcon').textContent = next === 'dark' ? '🌙' : '☀️';
            destroyCharts();
            renderPage(state.currentPage);
        });

        // Sidebar toggle (mobile)
        $('#hamburgerBtn').addEventListener('click', () => {
            $('#sidebar').classList.toggle('open');
        });
        $('#sidebarClose').addEventListener('click', () => {
            $('#sidebar').classList.remove('open');
        });

        // Navigation
        $$('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigate(link.dataset.page);
            });
        });

        // Modal close
        $('#modalClose').addEventListener('click', closeModal);
        $('#modalOverlay').addEventListener('click', (e) => {
            if (e.target === $('#modalOverlay')) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        // Hash-based routing
        function handleHash() {
            const hash = window.location.hash.replace('#', '') || 'dashboard';
            navigate(hash);
        }
        window.addEventListener('hashchange', handleHash);

        // Global search
        $('#globalSearch').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = e.target.value.trim();
                if (val) {
                    navigate('orders');
                    setTimeout(() => {
                        const search = $('#filterSearch');
                        if (search) { search.value = val; search.dispatchEvent(new Event('input')); }
                    }, 100);
                }
            }
        });

        // Wait for data to load then show dashboard
        const checkData = setInterval(() => {
            if (window.MeeshoData) {
                clearInterval(checkData);
                $('#loadingScreen')?.remove();
                handleHash();
            }
        }, 100);

        // Fallback: show dashboard after 3 seconds even if data isn't ready
        setTimeout(() => {
            clearInterval(checkData);
            if (!window.MeeshoData) {
                console.error('Data failed to load');
                $('#loadingScreen').innerHTML = '<div class="loader"><p style="color:#ef4444">Failed to load data. Please refresh.</p></div>';
            }
        }, 5000);
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
