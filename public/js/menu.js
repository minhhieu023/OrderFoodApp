function editItem(item) {
    // Cập nhật form thêm thành form sửa
    const form = document.querySelector('form');
    const titleEl = document.querySelector('.card-title');
    const submitBtn = document.querySelector('form button[type="submit"]');
    
    // Cập nhật action và method của form
    form.action = `/menu/${item.id}?_method=PUT`;
    
    // Điền dữ liệu vào form
    form.querySelector('input[name="name"]').value = item.name;
    form.querySelector('input[name="price"]').value = Math.round(item.price);
    
    // Thêm input ẩn để lưu id
    if (!form.querySelector('input[name="id"]')) {
        const idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.name = 'id';
        idInput.value = item.id;
        form.appendChild(idInput);
    } else {
        form.querySelector('input[name="id"]').value = item.id;
    }
    
    // Cập nhật UI
    titleEl.textContent = 'Edit Menu Item';
    submitBtn.textContent = 'Update Item';
    
    // Thêm nút Cancel
    if (!document.getElementById('cancelBtn')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancelBtn';
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn btn-secondary ms-2';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = resetForm;
        submitBtn.parentNode.appendChild(cancelBtn);
    }
}

function resetForm() {
    const form = document.querySelector('form');
    const titleEl = document.querySelector('.card-title');
    const submitBtn = document.querySelector('form button[type="submit"]');
    const cancelBtn = document.getElementById('cancelBtn');
    
    // Reset form
    form.reset();
    form.action = '/menu';
    
    // Reset UI
    titleEl.textContent = 'Add New Menu Item';
    submitBtn.textContent = 'Add Item';
    
    // Xóa nút Cancel
    if (cancelBtn) {
        cancelBtn.remove();
    }
} 