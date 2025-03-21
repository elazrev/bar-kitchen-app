# Bar Kitchen Management System

<div align="center">

![Bar Kitchen Management System Logo](public/images/default-recipe.jpg)

A comprehensive web application for managing bar kitchen operations, recipes, and inventory.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-React-blue)](https://vitejs.dev/)
[![Cloudinary](https://img.shields.io/badge/Images-Cloudinary-blueviolet)](https://cloudinary.com/)
[![Responsive](https://img.shields.io/badge/Design-Responsive-green)](https://en.wikipedia.org/wiki/Responsive_web_design)

</div>

## 🌟 Features

- **Opening Procedures** - Checklist for kitchen opening tasks
- **Recipes Management** - Store, view, and edit recipe details with images
- **Closing Procedures** - Checklist for kitchen closing tasks
- **Shortage Reporting** - Track and manage inventory shortages
- **Admin Dashboard** - Manage content, tasks, and recipes
- **Reports** - View task completion and shortage statistics
- **Mobile Responsive** - Optimized for all devices
- **Role-based Access** - Different permissions for staff and managers

## 📋 Table of Contents

- [Bar Kitchen Management System](#bar-kitchen-management-system)
  - [Features](#-features)
  - [Table of Contents](#-table-of-contents)
  - [Live Demo](#-live-demo)
  - [Technologies](#-technologies)
  - [Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Firebase Setup](#firebase-setup)
    - [Environment Variables](#environment-variables)
  - [Usage](#-usage)
    - [User Roles](#user-roles)
    - [Main Modules](#main-modules)
  - [Project Structure](#-project-structure)
  - [Deployment](#-deployment)
  - [License](#-license)
  - [Contact](#-contact)

## 🚀 Live Demo

You can view the live application here: [Bar Kitchen Management System](https://your-deployment-url.vercel.app)

## 💻 Technologies

- **Frontend**:
  - React.js
  - React Router
  - Styled Components
  - React Icons
  - React Toastify

- **Backend**:
  - Firebase Authentication
  - Firebase Firestore Database
  - Cloudinary (Image storage)

- **Development & Deployment**:
  - Vite
  - Git & GitHub
  - Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- A Firebase account
- A Cloudinary account (for image storage)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bar-kitchen-app.git
cd bar-kitchen-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a default image for recipes:
```bash
mkdir -p public/images
# Add a default image named default-recipe.jpg to the public/images directory
```

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firebase Authentication with email/password
3. Create a Firestore Database
4. Add the following collections:
   - `users`
   - `openingTasks`
   - `closingTasks`
   - `recipes`
   - `shortages`
   - `taskReports`
5. Update the Firebase configuration in `src/services/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## 📖 Usage

### User Roles

The application supports two user roles:

1. **Staff (Regular Users)**:
   - View opening procedures and mark them as complete
   - View recipes and their details
   - View closing procedures and mark them as complete
   - Report shortages

2. **Managers (Admin Users)**:
   - All staff permissions
   - Add, edit, and remove opening procedures
   - Add, edit, and remove recipes
   - Add, edit, and remove closing procedures
   - View reports and statistics
   - Mark shortages as resolved

### Main Modules

1. **Opening Procedures**:
   - Checklist of tasks to be completed when opening the kitchen
   - Staff can mark tasks as complete and submit a report

2. **Recipes**:
   - Browse all available recipes
   - View detailed recipe information including ingredients, instructions, and images
   - Managers can add, edit, and delete recipes

3. **Closing Procedures**:
   - Checklist of tasks to be completed when closing the kitchen
   - Staff can mark tasks as complete and submit a report

4. **Shortage Reporting**:
   - Report items that are in short supply
   - Managers can mark shortages as resolved

5. **Reports (Managers Only)**:
   - View statistics on opening and closing procedures
   - Track shortages and resolutions
   - View historical data filtered by date range

## 📁 Project Structure

```
bar-kitchen-app/
│
├── public/              # Static files
│   ├── images/          # Images including default recipe image
│
├── src/
│   ├── assets/          # Internal assets
│   │
│   ├── components/      # Reusable components
│   │   ├── layout/      # Layout components (Navbar, Sidebar)
│   │   └── shared/      # Shared components (TaskList, etc.)
│   │
│   ├── context/         # React Context providers
│   │   ├── AuthContext.jsx    # Authentication context
│   │   └── AppContext.jsx     # Application state context
│   │
│   ├── features/        # Feature modules
│   │   ├── admin/       # Admin components
│   │   ├── auth/        # Authentication components
│   │   ├── closing/     # Closing procedures
│   │   ├── opening/     # Opening procedures
│   │   ├── recipes/     # Recipe components
│   │   └── reports/     # Reports components
│   │
│   ├── hooks/           # Custom React hooks
│   │
│   ├── services/        # API and service functions
│   │   ├── api.js       # API functions
│   │   ├── firebase.js  # Firebase configuration
│   │   └── cloudinary.js # Cloudinary service
│   │
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
│
├── .env                 # Environment variables
├── index.html           # HTML template
├── vercel.json          # Vercel deployment configuration
├── package.json         # Dependencies and scripts
└── README.md            # Project documentation
```

## 🚢 Deployment

This application can be easily deployed to Vercel:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy the application:
```bash
vercel
```

For automatic deployments, connect your GitHub repository to Vercel:

1. Create a new project on Vercel and import your GitHub repository
2. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Set up environment variables

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For questions or support, contact:

[elaz.rev@gmail.com](mailto:elaz.rev@gmail.com)

---

Copyright © 2025 elaz.rev. All rights reserved.