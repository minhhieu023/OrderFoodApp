let currentOrder = {
    items: [],
    total: 0
};

// Load customer name from localStorage when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Request notification permission
    if ("Notification" in window) {
        Notification.requestPermission();
    }

    // Toggle order status
    const toggleBtn = document.getElementById('toggleOrderBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', async function() {
            try {
                const response = await fetch('/orders/toggle-status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                
                if (data.success) {
                    location.reload();
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
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

document.getElementById('placeOrder').addEventListener('click', async function() {
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
                items: currentOrder.items,
                total: currentOrder.total
            })
        });

        if (response.status === 403) {
            const error = await response.json();
            alert(error.error || 'Order system is currently closed');
            return;
        }

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

// Schedule notification
async function scheduleOrderNotification() {
    // Get notification time from settings
    let notificationTime;
    let notificationContent;
    try {
        const [timeRes, contentRes] = await Promise.all([
            fetch('/users/settings/notification-time'),
            fetch('/users/settings/notification-content')
        ]);
        const timeData = await timeRes.json();
        const contentData = await contentRes.json();
        
        if (timeData.success) {
            notificationTime = timeData.time;
        } else {
            notificationTime = '11:00'; // fallback
        }
        
        if (contentData.success) {
            notificationContent = contentData.content;
        } else {
            notificationContent = {
                title: 'Food Order Reminder',
                body: "It's time to order your lunch!"
            };
        }
    } catch (error) {
        console.error('Error getting notification settings:', error);
        notificationTime = '11:00';
        notificationContent = {
            title: 'Food Order Reminder',
            body: "It's time to order your lunch!"
        };
    }

    const now = new Date();
    const [hours, minutes] = notificationTime.split(':');
    let scheduledTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        parseInt(hours),
        parseInt(minutes),
        0
    );

    // If it's past notification time, schedule for next day
    if (now > scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = Math.max(0, scheduledTime - now);
    setTimeout(function() {
        if (Notification.permission === "granted") {
            new Notification(
                notificationContent.title,
                {
                    body: notificationContent.body,
                    icon: "/images/food-icon.png"
                }
            );
        }
        scheduleOrderNotification();
    }, timeUntilNotification);
}

// Start scheduling
if ("Notification" in window) {
    scheduleOrderNotification();
}

async function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        try {
            const response = await fetch(`/orders/${orderId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                alert(error.error || 'Failed to delete order');
                return;
            }

            const result = await response.json();
            if (result.success) {
                location.reload();
            } else {
                alert('Failed to delete order');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete order');
        }
    }
}

async function updateOrder(orderId) {
    try {
        const response = await fetch(`/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: currentOrder.items,
                total: currentOrder.total
            })
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.error || 'Failed to update order');
            return;
        }

        const result = await response.json();
        if (result.success) {
            location.reload();
        } else {
            alert('Failed to update order');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update order');
    }
} 