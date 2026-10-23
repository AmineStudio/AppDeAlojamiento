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

*   **Frontend:** React 19, TypeScript, Vite 6, React Router DOM
*   **Styling & Motion:** Tailwind CSS 4, Motion (Framer Motion), Lucide React
*   **Testing:** Vitest
*   **CI/CD:** GitHub Actions
*   **Backend & Services (Firebase):** 
    *   Authentication (Email/Password, Google OAuth)
    *   Firestore (NoSQL Database with granular security rules)
    *   Hosting & Cloud Functions

## Available Scripts

*   `npm run dev`: Inicia el servidor de desarrollo en local.
*   `npm run build`: Compila el bundle optimizado para producción con code-splitting.
*   `npm run lint`: Ejecuta la verificación estricta de tipos de TypeScript.
*   `npm test`: Ejecuta los tests unitarios automatizados con Vitest.

## Project Structure

*   `/src/views/`: Contains the main page views (Home, Detail, Dashboard, Contact, Blog, Inbox).
*   `/src/components/`: Reusable UI components (Navigation, Footer, LoginModal, etc.).
*   `/src/types.ts`: TypeScript interfaces for the application data models.
*   `/src/data.ts`: Initial seed data for the application.
*   `/src/App.tsx`: Main application component containing routing logic, state management, and Firebase data syncing.

## License

This project is proprietary and confidential.
