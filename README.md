# Smart Finance Platform

A modern personal finance management application built with React, Vite, Tailwind CSS, and Firebase.

## Features

- User authentication and account management
- Expense tracking with categories and filtering
- Income management with recurring income options
- Budget planning and expense allocation
- Financial goal setting and progress tracking
- Comprehensive financial reports and analysis

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend as a Service:** Firebase (Authentication, Firestore)
- **Routing:** React Router DOM
- **Charts and Visualizations:** Recharts (to be implemented)

## Getting Started

### Prerequisites

- Node.js and npm installed
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smart-finance.git
cd smart-finance
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password)
   - Create a Firestore database

4. Update Firebase configuration:
   - Copy your Firebase config from Project Settings
   - Update the config in `src/firebase/firebase.js`

5. Start the development server:
```bash
npm run dev
```

## Project Structure

- `/src`: Source code
  - `/components`: Reusable UI components
  - `/pages`: Application pages
  - `/firebase`: Firebase services and utilities
  - `/utils`: Helper functions and utilities
  - `/assets`: Static assets (images, icons, etc.)

## Firebase Data Structure

### Collections

- **users**: User profiles and settings
- **transactions**: All financial transactions (both income and expenses)
- **budgets**: Monthly budget allocations
- **goals**: Financial goals and savings targets

## Future Enhancements

- Mobile application with React Native
- PDF report generation and export
- Data import/export functionality
- Bill reminders and notifications
- Investment portfolio tracking
- Multi-currency support
- Dark mode theme

## License

This project is licensed under the MIT License.
