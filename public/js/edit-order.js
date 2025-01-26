function addToEditOrder(button) {
  const parent = button.closest('.card-body');
  const id = parent.querySelector('.quantity-input').dataset.id;
  const name = parent.querySelector('.quantity-input').dataset.name;
  const price = parseFloat(parent.querySelector('.quantity-input').dataset.price) || 0;
  const quantity = parseInt(parent.querySelector('.quantity-input').value);
  const note = parent.querySelector('.note-input').value;

  if (quantity <= 0) {
    alert('Please enter a valid quantity');
    return;
  }

  if (price <= 0) {
    alert('Invalid item price');
    return;
  }

  editOrder.items.push({ id, name, price, quantity, note });
  updateOrderDisplay();
}

function updateOrderDisplay() {
  const orderItems = document.getElementById('orderItems');
  orderItems.innerHTML = '';
  let total = 0;

  editOrder.items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    orderItems.innerHTML += `
      <div class="card mb-2 border-0 bg-light">
        <div class="card-body p-2">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="mb-1">${item.name}</h6>
              <div class="text-muted small">
                ${item.quantity} x ${formatCurrency(item.price)}
                ${item.note ? `<br><i class="bi bi-pencil-square me-1"></i>${item.note}` : ''}
              </div>
            </div>
            <div class="text-end">
              <div class="mb-1">${formatCurrency(itemTotal)}</div>
              <button class="btn btn-sm btn-outline-danger" 
                      onclick="removeEditItem(${index})">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  editOrder.total = total;
  document.getElementById('orderTotal').textContent = formatCurrency(total);
}

function removeEditItem(index) {
  editOrder.items.splice(index, 1);
  updateOrderDisplay();
} 