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
  summaryTotal.textContent = formatPrice(total);
  placeOrderButton.textContent = total ? `Оформить заказ на ${formatPrice(total)}` : 'Корзина пуста';
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
const adminOrders = document.querySelectorAll('.admin-order');
const adminCount = document.querySelector('#admin-count');
let currentStatus = 'all';

function syncAdminCounts() {
  const pending = document.querySelectorAll('.admin-order[data-status="pending"]').length;
  const ready = document.querySelectorAll('.admin-order[data-status="ready"]').length;
  document.querySelector('[data-status="pending"] b').textContent = pending;
  document.querySelector('[data-status="ready"] b').textContent = ready;
  document.querySelector('[data-status="all"] b').textContent = pending + ready;
}

function filterAdminOrders() {
  const city = cityFilter.value;
  let visible = 0;
  adminOrders.forEach(order => {
    const matchesStatus = currentStatus === 'all' || order.dataset.status === currentStatus;
    const matchesCity = city === 'all' || order.dataset.city === city;
    order.hidden = !(matchesStatus && matchesCity);
    if (!order.hidden) visible += 1;
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
  order.dataset.status = 'ready';
  const status = order.querySelector('.status');
  status.className = 'status done';
  status.innerHTML = '<i>✓</i>Собран';
  button.replaceWith(Object.assign(document.createElement('span'), { className: 'ready-note', textContent: 'Заказ собран' }));
  syncAdminCounts();
  filterAdminOrders();
  showToast('Заказ отмечен как собранный');
}));

updateCart();
document.querySelectorAll('.invoice-logo').forEach(logo => logo.firstChild.textContent = 'SMOKE WAVE');
