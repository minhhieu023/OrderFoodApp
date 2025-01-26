let currentOrder = {
    items: [],
    total: 0
};

// Load customer name from localStorage when page loads
document.addEventListener('DOMContentLoaded', function() {
    const savedName = localStorage.getItem('customerName');
    if (savedName) {
        document.getElementById('customerName').value = savedName;
    }
});

document.querySelectorAll('.add-to-order').forEach(button => {
    button.addEventListener('click', function() {
        const input = this.parentElement.querySelector('.quantity-input');
        const noteInput = this.parentElement.querySelector('.note-input');
        const quantity = parseInt(input.value);
        if (quantity > 0) {
            const id = input.dataset.id;
            const price = parseFloat(input.dataset.price);
            const name = input.dataset.name;
            const note = noteInput.value.trim();
            
            addToOrder({id, name, price, quantity, note});
            input.value = 1;
            noteInput.value = '';
        }
    });
});

function addToOrder(item) {
    // Tìm item có cùng id và cùng note (case insensitive)
    const existingItem = currentOrder.items.find(i => 
        i.id === item.id && 
        ((i.note || '').toLowerCase() === (item.note || '').toLowerCase())  // So sánh note không phân biệt hoa thường
    );

    if (existingItem) {
        // Nếu tìm thấy item có cùng id và cùng note thì cộng số lượng
        existingItem.quantity += item.quantity;
    } else {
        // Nếu không tìm thấy (khác id hoặc khác note) thì thêm mới
        currentOrder.items.push(item);
    }
    updateOrderDisplay();
}

function updateOrderDisplay() {
    const orderItems = document.getElementById('orderItems');
    orderItems.innerHTML = '';
    let total = 0;

    // Sắp xếp items theo tên (case insensitive)
    const sortedItems = [...currentOrder.items].sort((a, b) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    sortedItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        orderItems.innerHTML += `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <h6 class="mb-0">${item.name}</h6>
                    <small class="text-muted">${item.quantity} x ${formatCurrency(item.price)}</small>
                    ${item.note ? `<br><small class="text-muted fst-italic">Note: ${item.note}</small>` : ''}
                </div>
                <div class="text-end">
                    <div class="mb-1">${formatCurrency(itemTotal)}</div>
                    <button class="btn btn-sm btn-danger" onclick="removeItem('${item.id}', '${item.note || ''}')">×</button>
                </div>
            </div>
        `;
    });

    currentOrder.total = total;
    document.getElementById('orderTotal').textContent = formatCurrency(total);
}

function removeItem(id, note) {
    // Xóa item dựa trên cả id và note (case insensitive)
    currentOrder.items = currentOrder.items.filter(item => 
        !(item.id === id && (item.note || '').toLowerCase() === note.toLowerCase())
    );
    updateOrderDisplay();
}

// Thêm sự kiện input để lưu tên khi người dùng nhập
document.getElementById('customerName').addEventListener('input', function(e) {
    localStorage.setItem('customerName', e.target.value);
});

document.getElementById('placeOrder').addEventListener('click', async function() {
    const customerName = document.getElementById('customerName').value.trim();
    if (!customerName) {
        alert('Please enter customer name');
        return;
    }
    if (currentOrder.items.length === 0) {
        alert('Please add items to order');
        return;
    }

    try {
        const response = await fetch('/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customerName,
                items: currentOrder.items,
                total: currentOrder.total
            })
        });

        const result = await response.json();
        
        if (result.success) {
            window.location.href = `/orders/success/${result.orderId}`;
        } else {
            alert('Failed to place order');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to place order');
    }
});

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
} 