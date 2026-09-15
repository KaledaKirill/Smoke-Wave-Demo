const tabs = document.querySelectorAll('.tab');
const views = document.querySelectorAll('.view');

function formatPrice(value) {
  return `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
}

function showToast(message) {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 2400);
}

tabs.forEach(tab => tab.addEventListener('click', () => {
  tabs.forEach(item => item.classList.toggle('active', item === tab));
  views.forEach(view => view.classList.toggle('active', view.id === tab.dataset.tab));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}));

const catalogProducts = [
  { id: 'waka', category: 'одноразки', brand: 'WAKA', name: 'soPro 20 000', flavor: 'Blueberry Raspberry', price: 1190, color: 'blue' },
  { id: 'drag', category: 'устройства', brand: 'VOOPOO', name: 'Drag X2', flavor: 'Satin Black', price: 2850, color: 'violet' },
  { id: 'bad-drip', category: 'жидкости', brand: 'BAD DRIP', name: 'Bad Blood, 50 мл', flavor: 'Pomegranate Blueberry', price: 690, color: 'peach' },
  { id: 'hqd', category: 'одноразки', brand: 'HQD', name: 'Vigo 20 000', flavor: 'Kiwi Passion Fruit', price: 1050, color: 'mint' },
];
document.querySelectorAll('.product-card').forEach((card, index) => {
  card.dataset.category = catalogProducts[index].category;
  card.dataset.product = catalogProducts[index].id;
});

document.querySelectorAll('.chips .chip').forEach(chip => chip.addEventListener('click', () => {
  document.querySelectorAll('.chips .chip').forEach(item => item.classList.toggle('selected', item === chip));
  const filter = chip.textContent.trim().toLowerCase();
  document.querySelectorAll('.product-card').forEach(card => {
    card.hidden = filter !== 'все товары' && card.dataset.category !== filter;
  });
}));

const cartBadge = document.querySelector('.cart-badge');
const cartPositionCount = document.querySelector('#cart-position-count');
const summaryQuantity = document.querySelector('#summary-quantity');
const summarySubtotal = document.querySelector('#summary-subtotal');
const summaryTotal = document.querySelector('#summary-total');
const placeOrderButton = document.querySelector('#place-order');
const checkoutButton = document.querySelector('#checkout-button');
const emptyCart = document.querySelector('#empty-cart');
const summaryDelivery = document.querySelector('.summary .summary-line:nth-of-type(2) em');
let deliveryExtra = 5;

function cartItems() {
  return [...document.querySelectorAll('[data-cart-item]')];
}

function updateCart() {
  let quantity = 0;
  let total = 0;
  cartItems().forEach(item => {
    const itemQuantity = Number(item.querySelector('.counter b').textContent);
    const price = Number(item.dataset.price);
    quantity += itemQuantity;
    total += itemQuantity * price;
    item.querySelector('.item-price').textContent = formatPrice(itemQuantity * price);
  });
  const positionLabel = `${quantity} ${quantity === 1 ? 'позиция' : quantity < 5 ? 'позиции' : 'позиций'}`;
  cartBadge.textContent = quantity;
  cartPositionCount.textContent = positionLabel;
  summaryQuantity.textContent = `Товары, ${quantity} шт.`;
  summarySubtotal.textContent = formatPrice(total);
  const payable = total + deliveryExtra;
  summaryTotal.textContent = formatPrice(payable);
  placeOrderButton.textContent = total ? `Оформить заказ на ${formatPrice(payable)}` : 'Корзина пуста';
  placeOrderButton.disabled = !total;
  checkoutButton.disabled = !total;
  emptyCart.hidden = quantity > 0;
  syncCatalogControls();
}

function clearCart() {
  cartItems().forEach(item => item.remove());
  updateCart();
}

function bindCartControls(item) {
  item.querySelectorAll('.counter button').forEach(button => button.addEventListener('click', () => {
    const quantity = button.parentElement.querySelector('b');
    const next = Number(quantity.textContent) + (button.dataset.quantity === 'increase' ? 1 : -1);
    if (next < 1) {
      item.remove();
      updateCart();
      showToast('Товар удалён из корзины');
      return;
    }
    quantity.textContent = next;
    updateCart();
  }));
  item.querySelector('.remove').addEventListener('click', () => {
    item.remove();
    updateCart();
    showToast('Товар удалён из корзины');
  });
}

document.querySelectorAll('[data-cart-item]').forEach(bindCartControls);

document.querySelector('#clear-cart')?.addEventListener('click', () => {
  clearCart();
  showToast('Корзина очищена');
});

function addNewCartItem(product) {
  const item = document.createElement('div');
  item.className = 'cart-item';
  item.dataset.cartItem = '';
  item.dataset.product = product.id;
  item.dataset.price = product.price;
  const deviceClass = product.id === 'bad-drip' ? 'cart-device red' : 'cart-device';
  item.innerHTML = `<div class="mini-product ${product.color}"><div class="${deviceClass}">${product.brand}</div></div><div class="item-main"><p class="brand">${product.brand}</p><h3>${product.name}</h3><p>${product.flavor}</p></div><div class="counter"><button type="button" data-quantity="decrease">−</button><b>1</b><button type="button" data-quantity="increase">+</button></div><strong class="item-price"></strong><button class="remove" type="button" aria-label="Удалить товар">×</button>`;
  document.querySelector('.notice').before(item);
  bindCartControls(item);
  return item;
}

function syncCatalogControls() {
  document.querySelectorAll('.product-card').forEach(card => {
    const item = document.querySelector(`[data-cart-item][data-product="${card.dataset.product}"]`);
    const buyRow = card.querySelector('.buy-row');
    if (!item) {
      buyRow.innerHTML = '<button class="add wide" type="button">В корзину</button>';
      return;
    }
    const quantity = item.querySelector('.counter b').textContent;
    buyRow.innerHTML = `<div class="catalog-counter"><button type="button" data-catalog-quantity="decrease">−</button><b>${quantity} шт.</b><button type="button" data-catalog-quantity="increase">+</button></div>`;
  });
}

document.querySelector('.product-grid')?.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const card = button.closest('.product-card');
  if (!card) return;
  const product = catalogProducts.find(item => item.id === card.dataset.product);
  let cartMatch = document.querySelector(`[data-cart-item][data-product="${product.id}"]`);

  if (button.classList.contains('add')) {
    cartMatch = addNewCartItem(product);
    updateCart();
    showToast(`${product.name} добавлен в корзину`);
    return;
  }

  if (!button.dataset.catalogQuantity || !cartMatch) return;
  const quantity = cartMatch.querySelector('.counter b');
  const next = Number(quantity.textContent) + (button.dataset.catalogQuantity === 'increase' ? 1 : -1);
  if (next < 1) {
    cartMatch.remove();
    showToast('Товар удалён из корзины');
  } else {
    quantity.textContent = next;
  }
  updateCart();
});

document.querySelector('.search input')?.addEventListener('input', event => {
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll('.product-card').forEach(card => card.hidden = Boolean(query) && !card.textContent.toLowerCase().includes(query));
});

checkoutButton?.addEventListener('click', () => {
  if (checkoutButton.disabled) return showToast('Добавьте товары в корзину');
  document.querySelector('#details').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.querySelectorAll('.radio-card').forEach(card => card.addEventListener('click', () => {
  document.querySelectorAll('.radio-card').forEach(item => item.classList.toggle('chosen', item === card));
  card.querySelector('input').checked = true;
}));

const deliveryForm = document.querySelector('#order-form');
const deliveryFieldset = deliveryForm.querySelector('fieldset');
const originalCityField = [...deliveryForm.children].find(element => element.tagName === 'LABEL');
const telegramField = [...deliveryForm.children].find(element => element.querySelector('input[value="dmitry_shop"]'));
const deliveryFields = document.createElement('div');
deliveryFields.className = 'delivery-fields form-full';
deliveryFields.id = 'delivery-fields';
originalCityField.remove();
deliveryFieldset.classList.add('delivery-fieldset');
deliveryForm.insertBefore(deliveryFields, telegramField);

const deliveryMethods = [
  { id: 'minsk-route', fee: 5, label: 'Маршрутка по Минску', price: '+5 BYN к сумме заказа', detail: 'Передача по городу. Укажите номер телефона для связи с водителем.', fields: [{ name: 'phone', label: 'Телефон', type: 'tel', placeholder: '+375 29 000-00-00' }] },
  { id: 'intercity-route', fee: 0, label: 'Маршрутка в другой город', price: 'Обычно 10–15 BYN — оплачивается отдельно', detail: 'Стоимость доставки не входит в сумму заказа для сборки.', fields: [{ name: 'city', label: 'Город доставки', type: 'text', placeholder: 'Например, Гродно' }] },
  { id: 'minsk-courier', fee: 15, label: 'Адресом по Минску', price: '+15 BYN к сумме заказа', detail: 'За МКАД стоимость может быть выше — менеджер согласует её отдельно.', fields: [{ name: 'phone', label: 'Телефон', type: 'tel', placeholder: '+375 29 000-00-00' }, { name: 'address', label: 'Адрес доставки', type: 'text', placeholder: 'Улица, дом, квартира' }] },
  { id: 'belpost', fee: 0, label: 'Белпочта', price: 'Стоимость рассчитает менеджер', detail: 'Нужны данные получателя для оформления отправления.', fields: [{ name: 'phone', label: 'Телефон', type: 'tel', placeholder: '+375 29 000-00-00' }, { name: 'full-name', label: 'ФИО получателя', type: 'text', placeholder: 'Иванов Иван Иванович' }, { name: 'postal-code', label: 'Почтовый индекс', type: 'text', placeholder: '220000', pattern: '[0-9]{6}' }] },
];

function renderDeliveryFields(method) {
  const inputs = method.fields.map(field => `<label>${field.label}<input name="${field.name}" type="${field.type}" placeholder="${field.placeholder}" ${field.pattern ? `pattern="${field.pattern}"` : ''} required></label>`).join('');
  deliveryFields.innerHTML = `<div class="delivery-policy"><span>Условия доставки</span><b>${method.price}</b><p>${method.detail}</p></div><div class="delivery-inputs">${inputs}</div>`;
  summaryDelivery.textContent = method.fee ? `+ ${method.fee} BYN` : method.id === 'intercity-route' ? 'Оплачивается отдельно' : 'Рассчитаем позже';
}

function selectDeliveryMethod(method) {
  deliveryExtra = method.fee;
  renderDeliveryFields(method);
  updateCart();
}

document.querySelectorAll('.radio-card').forEach((card, index) => {
  const method = deliveryMethods[index];
  card.dataset.delivery = method.id;
  card.addEventListener('click', () => selectDeliveryMethod(method));
});

selectDeliveryMethod(deliveryMethods[0]);

const successModal = document.querySelector('#order-success');
document.querySelector('#order-form')?.addEventListener('submit', event => {
  event.preventDefault();
  if (placeOrderButton.disabled) return showToast('Добавьте товары в корзину');
  document.querySelector('#order-number').textContent = `SW-${String(Date.now()).slice(-6)}`;
  successModal.classList.add('is-open');
  successModal.setAttribute('aria-hidden', 'false');
  clearCart();
});

function closeModal() {
  successModal.classList.remove('is-open');
  successModal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('[data-close-modal], .modal-close').forEach(button => button.addEventListener('click', closeModal));
successModal?.addEventListener('click', event => { if (event.target === successModal) closeModal(); });

const adminStatus = document.querySelectorAll('.admin-status .chip');
const cityFilter = document.querySelector('#city-filter');
const adminCount = document.querySelector('#admin-count');
const adminOrdersContainer = document.querySelector('.admin-orders');
let currentStatus = 'all';
const adminOrdersData = [
  { id: 'MS-240918', status: 'pending', city: 'minsk', cityName: 'Минск', customer: 'Дмитрий', telegram: '@dmitry_shop', delivery: 'Маршрутка по Минску', note: 'Написать в Telegram', items: [{ product: 'waka', price: 1190, quantity: 2 }, { product: 'bad-drip', price: 690, quantity: 1 }] },
  { id: 'MS-240917', status: 'pending', city: 'grodno', cityName: 'Гродно', customer: 'Марина', telegram: '@marina_vape', delivery: 'Белпочта', note: 'Позвонить перед отправкой', items: [{ product: 'hqd', price: 1050, quantity: 8 }, { product: 'drag', price: 2850, quantity: 2 }] },
  { id: 'MS-240915', status: 'ready', city: 'brest', cityName: 'Брест', customer: 'Денис', telegram: '@denis_store', delivery: 'Маршрутка в другой город', note: '—', items: [{ product: 'waka', price: 1190, quantity: 10 }, { product: 'bad-drip', price: 690, quantity: 8 }] },
];

function findAdminOrder(id) {
  return adminOrdersData.find(order => order.id === id);
}

function adminTotal(order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderAdminOrders() {
  adminOrdersContainer.innerHTML = adminOrdersData.map(order => {
    const ready = order.status === 'ready';
    const rows = order.items.length ? order.items.map(item => {
      const product = catalogProducts.find(entry => entry.id === item.product);
      return `<div class="admin-invoice-row"><span><b>${product.name}</b><small>${product.flavor}</small></span><label><small>Цена</small><input class="invoice-input" data-field="price" data-product="${item.product}" type="number" min="0" value="${item.price}"> ₽</label><label><small>Кол-во</small><input class="invoice-input" data-field="quantity" data-product="${item.product}" type="number" min="1" value="${item.quantity}"> шт.</label><strong>${formatPrice(item.price * item.quantity)}</strong><button class="line-delete" data-admin-action="delete" data-product="${item.product}" type="button" aria-label="Удалить товар">×</button></div>`;
    }).join('') : '<div class="admin-invoice-empty">В накладной нет товаров</div>';
    return `<article class="order-card admin-order" data-status="${order.status}" data-city="${order.city}"><div class="order-top"><div><span class="status ${ready ? 'done' : 'assembling'}"><i>${ready ? '✓' : ''}</i>${ready ? 'Собран' : 'Не собран'}</span><h2>Заказ №${order.id}</h2><p>${order.customer} · ${order.telegram}</p></div><div class="admin-order-actions"><select class="status-select" data-order="${order.id}" aria-label="Статус заказа"><option value="pending" ${ready ? '' : 'selected'}>Не собран</option><option value="ready" ${ready ? 'selected' : ''}>Собран</option></select><strong>${formatPrice(adminTotal(order))}</strong></div></div><div class="invoice invoice-shot"><div class="invoice-head"><span class="invoice-logo">SMOKE WAVE<span>•</span></span><span>НАКЛАДНАЯ № ${order.id}</span></div><div class="admin-invoice-table"><div class="admin-invoice-labels"><span>Товар</span><span>Цена</span><span>Количество</span><span>Сумма</span></div>${rows}<div class="admin-invoice-total"><span>Итого по накладной</span><strong>${formatPrice(adminTotal(order))}</strong></div></div></div><div class="order-meta admin-meta"><div><span>Город</span><b>${order.cityName}</b></div><div><span>Доставка</span><b>${order.delivery}</b></div><div><span>Примечание</span><b>${order.note}</b></div><button class="admin-secondary" data-admin-action="add" type="button">+ Добавить товар</button><button class="assemble-btn" data-admin-action="download" type="button">Скачать накладную ↓</button></div></article>`;
  }).join('');
}

function syncAdminCounts() {
  const pending = adminOrdersData.filter(order => order.status === 'pending').length;
  const ready = adminOrdersData.filter(order => order.status === 'ready').length;
  document.querySelector('[data-status="pending"] b').textContent = pending;
  document.querySelector('[data-status="ready"] b').textContent = ready;
  document.querySelector('[data-status="all"] b').textContent = pending + ready;
}

function filterAdminOrders() {
  const city = cityFilter.value;
  let visible = 0;
  document.querySelectorAll('.admin-order').forEach(order => {
    const show = (currentStatus === 'all' || order.dataset.status === currentStatus) && (city === 'all' || order.dataset.city === city);
    order.hidden = !show;
    if (show) visible += 1;
  });
  adminCount.textContent = `Показано: ${visible} ${visible === 1 ? 'заказ' : visible < 5 ? 'заказа' : 'заказов'}`;
}

function refreshAdmin() {
  renderAdminOrders();
  syncAdminCounts();
  filterAdminOrders();
}

function openAddProductModal(orderId) {
  document.querySelector('#admin-add-modal')?.remove();
  const productOptions = query => catalogProducts.filter(product => `${product.brand} ${product.name} ${product.flavor}`.toLowerCase().includes(query.toLowerCase())).map(product => `<option value="${product.id}">${product.brand} — ${product.name} · ${formatPrice(product.price)}</option>`).join('');
  document.body.insertAdjacentHTML('beforeend', `<div class="success-modal is-open" id="admin-add-modal" aria-hidden="false"><div class="success-card add-product-card"><button class="modal-close" type="button" aria-label="Закрыть">×</button><p class="eyebrow">РЕДАКТОР НАКЛАДНОЙ</p><h2>Добавить товар</h2><form id="admin-add-form" data-order="${orderId}"><label>Поиск товара<input id="admin-product-search" type="search" placeholder="Название, бренд или вкус" autocomplete="off"></label><label>Товар<select name="product" id="admin-product-select">${productOptions('')}</select></label><label>Количество<input name="quantity" type="number" min="1" value="1" required></label><button class="primary" type="submit">Добавить в накладную</button></form></div></div>`);
  document.querySelector('#admin-add-modal .modal-close').addEventListener('click', () => document.querySelector('#admin-add-modal').remove());
  document.querySelector('#admin-product-search').addEventListener('input', event => {
    const select = document.querySelector('#admin-product-select');
    const hasMatches = catalogProducts.some(product => `${product.brand} ${product.name} ${product.flavor}`.toLowerCase().includes(event.target.value.toLowerCase()));
    select.innerHTML = productOptions(event.target.value) || '<option disabled>Ничего не найдено</option>';
    document.querySelector('#admin-add-form button[type="submit"]').disabled = !hasMatches;
  });
}

function downloadInvoice(order) {
  const lines = [`Smoke Wave — накладная №${order.id}`, `Получатель: ${order.customer} (${order.telegram})`, `Город: ${order.cityName}`, `Доставка: ${order.delivery}`, '', 'Товар | Цена | Количество | Сумма'];
  order.items.forEach(item => { const product = catalogProducts.find(entry => entry.id === item.product); lines.push(`${product.name} | ${formatPrice(item.price)} | ${item.quantity} шт. | ${formatPrice(item.price * item.quantity)}`); });
  lines.push('', `ИТОГО: ${formatPrice(adminTotal(order))}`);
  const link = document.createElement('a');
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
  link.href = url;
  link.download = `invoice-${order.id}.txt`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

adminStatus.forEach(button => button.addEventListener('click', () => {
  currentStatus = button.dataset.status;
  adminStatus.forEach(item => item.classList.toggle('selected', item === button));
  filterAdminOrders();
}));
cityFilter?.addEventListener('change', filterAdminOrders);

adminOrdersContainer.addEventListener('click', event => {
  const button = event.target.closest('[data-admin-action]');
  if (!button) return;
  const order = findAdminOrder(button.closest('.admin-order').querySelector('.status-select').dataset.order);
  const action = button.dataset.adminAction;
  if (action === 'add') openAddProductModal(order.id);
  if (action === 'download') downloadInvoice(order);
  if (action === 'delete') { order.items = order.items.filter(item => item.product !== button.dataset.product); refreshAdmin(); showToast('Товар удалён из накладной'); }
});

adminOrdersContainer.addEventListener('change', event => {
  const order = findAdminOrder(event.target.closest('.admin-order').querySelector('.status-select').dataset.order);
  if (event.target.classList.contains('status-select')) { order.status = event.target.value; refreshAdmin(); return; }
  if (!event.target.classList.contains('invoice-input')) return;
  const item = order.items.find(entry => entry.product === event.target.dataset.product);
  const value = Number(event.target.value);
  if (event.target.dataset.field === 'price' && value >= 0) item.price = value;
  if (event.target.dataset.field === 'quantity' && value >= 1) item.quantity = value;
  refreshAdmin();
});

document.addEventListener('submit', event => {
  if (event.target.id !== 'admin-add-form') return;
  event.preventDefault();
  const order = findAdminOrder(event.target.dataset.order);
  const product = catalogProducts.find(entry => entry.id === event.target.product.value);
  const quantity = Number(event.target.quantity.value);
  const existing = order.items.find(item => item.product === product.id);
  if (existing) existing.quantity += quantity;
  else order.items.push({ product: product.id, price: product.price, quantity });
  document.querySelector('#admin-add-modal').remove();
  refreshAdmin();
  showToast('Товар добавлен в накладную');
});

refreshAdmin();

updateCart();
document.querySelectorAll('.invoice-logo').forEach(logo => logo.firstChild.textContent = 'SMOKE WAVE');
