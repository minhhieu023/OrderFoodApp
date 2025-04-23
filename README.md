# Food Ordering App

A comprehensive food ordering system built with Node.js, Express, and MySQL, designed for managing daily food orders and monthly invoicing.

## Features

### 🔐 User Management
- User registration and authentication
- Role-based access control (Admin/User)
- JWT-based session management
- Profile management

### 🍽️ Menu Management (Admin)
- Add, edit, and delete menu items
- Set prices and descriptions
- Real-time menu updates
- Search and sort functionality

### 🛒 Order Management
- Create new orders
- Add multiple items with quantities
- Add notes for each item
- Edit or cancel orders
- Automatic empty order handling
- Order status tracking
- Real-time order updates

### 📊 Reporting System
- Daily order reports
- Customer order history
- Monthly sales analytics
- Export functionality

### 💰 Invoice Management
- Automated monthly invoice generation
- Invoice status tracking (New, Transferred, Confirmed, Cancelled)
- QR code payment integration
- Payment status tracking
- Invoice notes and comments

### 🔔 Notifications
- Configurable notification times
- Customizable notification content
- Order status notifications
- Payment reminders

## Tech Stack

### Backend
- **Runtime**: Node.js (v14+)
- **Framework**: Express.js
- **Database**: MySQL (v5.7+)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs

### Frontend
- **Template Engine**: EJS
- **UI Framework**: Bootstrap 5
- **Icons**: Bootstrap Icons
- **JavaScript**: Vanilla JS with Fetch API
- **Currency**: Vietnamese Dong (VND)

### Development
- **Package Manager**: npm/yarn
- **Environment**: dotenv
- **Database Migration**: Custom migration system
- **Date Handling**: Native JavaScript Date
- **Code Organization**: MVC architecture

## Project Structure
```
OrderFoodApp/
├── config/         # Database and app configuration
├── controllers/    # Route controllers
├── middleware/     # Auth and validation middleware
├── models/         # Database models
├── public/         # Static assets
├── routes/         # Route definitions
├── utils/         # Helper functions
└── views/         # EJS templates
```

## Setup Requirements
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn package manager

## Environment Variables
```
DB_HOST=localhost
DB_USER=your_username
DB_PASS=your_password
DB_NAME=your_database
JWT_SECRET=your_jwt_secret
PORT=3000
```

## Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`
4. Initialize database: `npm run init-db`
5. Run migrations: `npm run migrate`
6. Start the server: `npm start`

## Development
- Start dev server: `npm run dev`
- Run tests: `npm test`
- Lint code: `npm run lint`

## Security Features
- JWT-based authentication
- Password hashing with bcrypt
- XSS protection
- CSRF protection
- Input validation
- Secure session handling

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License
MIT License
