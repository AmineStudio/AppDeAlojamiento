# Mila - Stay Management Platform

Mila is a stay and property management platform built with modern web technologies. It allows guests to discover properties, read local stories, and contact the host for bookings. It also provides a comprehensive host dashboard to manage listings, respond to guest inquiries, publish local stories, and edit host contact details.

## Features

*   **Property Discovery & Details:** Guests can view available houses and rooms, including pricing, descriptions, amenities, and photo galleries.
*   **Authentication (Guest & Host):** 
    *   Secure authentication powered by Firebase Auth.
    *   Supports Google Sign-in and standard Email/Password authentication.
    *   Includes email verification and password reset workflows.
*   **Role-Based Access Control:** 
    *   **Guests:** Can browse properties, read blogs, send inquiries, and access their personal inbox to track requests.
    *   **Host (Admin):** Restricted access based on predefined admin emails. The host has access to a powerful private dashboard.
*   **Host Dashboard:**
    *   **Manage Stays:** Edit house descriptions, features, room pricing, and toggle room availability.
    *   **Guest Inquiries:** Read and respond to messages and inquiries sent by guests through the contact form.
    *   **Content Management:** Write and publish local stories and blog posts for guests to read.
    *   **Profile Settings:** Update host bio, contact information (email, phone, address), and presentation details directly from the UI.
*   **Real-time Database:** Utilizes Firebase Firestore to persist and sync application data (Houses, Rooms, Blog Posts, Host Profile, Inquiries, Reviews).
*   **Responsive Design:** Fully responsive interface built with Tailwind CSS, ensuring a great experience on desktop, tablet, and mobile devices.

## Tech Stack

*   **Frontend:** React 18, TypeScript, Vite
*   **Styling:** Tailwind CSS, Lucide React (Icons)
*   **Backend & Services (Firebase):** 
    *   Authentication (Email/Password, Google OAuth)
    *   Firestore (NoSQL Database)
    *   Hosting (if applicable)

## Recent Updates

*   **Authentication Enhancements:** Added support for both Google Sign-In and Email/Password registration/login workflows. Included email verification requirements and password reset functionality.
*   **Dynamic Host Profile:** The host's contact information (name, title, bio, phone, email, address) is now fully dynamic and editable directly from the Host Dashboard, updating the Contact page in real-time.
*   **Admin Access:** Granted predefined admin emails full administrative access to the host dashboard.
*   **Dashboard Editing Capabilities:** Enhanced the host dashboard to allow editing of house descriptions, amenities, room details, and pricing.

## Setup Instructions

1.  **Clone the repository**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables:**
    Ensure you have your Firebase configuration set up in your environment. You will need to create a project in the Firebase Console and enable Authentication (Email/Password & Google) and Firestore.
4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## Project Structure

*   `/src/views/`: Contains the main page views (Home, Detail, Dashboard, Contact, Blog, Inbox).
*   `/src/components/`: Reusable UI components (Navigation, Footer, LoginModal, etc.).
*   `/src/types.ts`: TypeScript interfaces for the application data models.
*   `/src/data.ts`: Initial seed data for the application.
*   `/src/App.tsx`: Main application component containing routing logic, state management, and Firebase data syncing.

## License

This project is proprietary and confidential.
