const tabs = document.querySelectorAll('.tab');
const views = document.querySelectorAll('.view');

tabs.forEach(tab => tab.addEventListener('click', () => {
  tabs.forEach(item => item.classList.toggle('active', item === tab));
  views.forEach(view => view.classList.toggle('active', view.id === tab.dataset.tab));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}));

document.querySelectorAll('.chip').forEach(chip => chip.addEventListener('click', () => {
  const group = chip.closest('.chips, .order-filter');
  if (!group) return;
  group.querySelectorAll('.chip').forEach(item => item.classList.toggle('selected', item === chip));
}));

document.querySelectorAll('[data-go="details"]').forEach(button => button.addEventListener('click', () => {
  document.querySelector('#details').scrollIntoView({ behavior: 'smooth', block: 'start' });
}));

document.querySelectorAll('.radio-card').forEach(card => card.addEventListener('click', () => {
  document.querySelectorAll('.radio-card').forEach(item => item.classList.remove('chosen'));
  card.classList.add('chosen');
}));

const adminStatus = document.querySelectorAll('.admin-status .chip');
const cityFilter = document.querySelector('#city-filter');
const adminOrders = document.querySelectorAll('.admin-order');
const adminCount = document.querySelector('#admin-count');
let currentStatus = 'all';

function filterAdminOrders() {
  if (!cityFilter || !adminCount) return;
  const city = cityFilter.value;
  let visible = 0;
  adminOrders.forEach(order => {
    const matchesStatus = currentStatus === 'all' || order.dataset.status === currentStatus;
    const matchesCity = city === 'all' || order.dataset.city === city;
    const show = matchesStatus && matchesCity;
    order.hidden = !show;
    if (show) visible += 1;
  });
  adminCount.textContent = `Показано: ${visible} ${visible === 1 ? 'заказ' : visible < 5 ? 'заказа' : 'заказов'}`;
}

adminStatus.forEach(button => button.addEventListener('click', () => {
  currentStatus = button.dataset.status;
  adminStatus.forEach(item => item.classList.toggle('selected', item === button));
  filterAdminOrders();
}));

cityFilter?.addEventListener('change', filterAdminOrders);

document.querySelectorAll('.assemble-btn').forEach(button => button.addEventListener('click', () => {
  const order = button.closest('.admin-order');
  if (!order) return;
  order.dataset.status = 'ready';
  const status = order.querySelector('.status');
  status.className = 'status done';
  status.innerHTML = '<i>✓</i>Собран';
  button.replaceWith(Object.assign(document.createElement('span'), { className: 'ready-note', textContent: 'Заказ собран' }));
  const pending = document.querySelectorAll('.admin-order[data-status="pending"]').length;
  const ready = document.querySelectorAll('.admin-order[data-status="ready"]').length;
  document.querySelector('[data-status="pending"] b').textContent = pending;
  document.querySelector('[data-status="ready"] b').textContent = ready;
  document.querySelector('[data-status="all"] b').textContent = pending + ready;
  filterAdminOrders();
}));
