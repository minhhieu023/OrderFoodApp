# Food Ordering System

Hệ thống đặt món ăn đơn giản được xây dựng bằng Node.js, Express và MySQL.

## Tính năng

- 🍽️ **Quản lý Menu**
  - Thêm, sửa, xóa món ăn
  - Quản lý giá và mô tả
  - Sắp xếp theo danh mục

- 🛒 **Xử lý Đơn hàng**
  - Tạo đơn hàng mới
  - Thêm nhiều món với số lượng
  - Thêm ghi chú cho từng món
  - Sửa hoặc hủy đơn hàng
  - Theo dõi đơn hàng

- 📊 **Báo cáo**
  - Báo cáo bán hàng theo ngày
  - Lịch sử đặt hàng của khách

## Công nghệ sử dụng

- **Backend**: Node.js + Express  
- **Database**: MySQL  
- **View Engine**: EJS  
- **Frontend**: Bootstrap 5  
- **Icons**: Bootstrap Icons  

## Yêu cầu hệ thống

- **Node.js** (v14 trở lên)  
- **MySQL** (v5.7 trở lên)  
- **npm** hoặc **yarn**  

## Cài đặt

1. **Clone repository**
   ```bash
   git clone https://github.com/minhhieu023/OrderFoodApp.git
   cd food-ordering-system
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Tạo file `.env` và cập nhật thông tin database**
   ```env
   NODE_ENV=development
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=food_order
   ```

4. **Khởi tạo database**
   ```bash
   node config/init-db.js
   ```

5. **Chạy ứng dụng**
   ```bash
   npm start
   ```
   Ứng dụng sẽ chạy tại `http://localhost:3000`

## Cấu trúc thư mục

```
food-ordering-system/
├── config/         # File cấu hình
│   ├── database.js # Kết nối database
│   └── init-db.js  # Khởi tạo database
├── controllers/    # Xử lý request
├── models/         # Model database
├── public/         # File tĩnh
│   ├── css/        # Stylesheet
│   └── js/         # JavaScript
├── routes/         # Định tuyến
├── views/          # Template EJS
│   └── layouts/    # Layout chung
└── app.js          # File khởi chạy
```

## Phát triển

- **Chạy môi trường development với hot reload**:
  ```bash
  npm start
  ```

- **Chạy môi trường production**:
  ```bash
  npm run prod
  ```

## API Endpoints

### Orders

- `GET /orders` - Trang đặt hàng  
- `POST /orders` - Tạo đơn hàng mới  
- `GET /orders/report` - Báo cáo theo ngày  
- `GET /orders/detail/:id` - Chi tiết đơn hàng  
- `GET /orders/edit/:id` - Sửa đơn hàng  
- `PUT /orders/:id` - Cập nhật đơn hàng  
- `DELETE /orders/:id` - Xóa đơn hàng  

### Menu

- `GET /menu` - Quản lý menu  
- `POST /menu` - Thêm món ăn  
- `PUT /menu/:id` - Cập nhật món ăn  
- `DELETE /menu/:id` - Xóa món ăn  

## License

[MIT License](LICENSE)
```
