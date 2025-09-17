# **App Name**: Dynamic QR Self-Host

## Core Features:

- QR Code Generation: Generate QR codes linked to short URLs (e.g., domain.de/q/abc123) that redirect to target URLs. This feature will provide the option for PNG export of the QR code.
- Dynamic Redirection: Enable changing the destination URL associated with a QR code, ensuring the code always points to the correct location. Incorporates reasoning to choose from multiple fallback URLs if the primary is unavailable, acting as a "tool" for resilient linking.
- Scan Tracking & Analytics: Track QR code scans and provide basic analytics, like hit count, to understand usage patterns. Implement tracking using Next.js server functions and edge caching for optimal performance.
- User Role Management: Manage user roles (user, marketing_manager, admin) with different levels of access to the admin interface, enabling controlled administration.
- Admin Interface: Provide an admin interface for managing QR codes (create, view, edit, download) and users (create, manage roles), accessible based on user roles.
- Access Restrictions: Based on user role (super-admin, marketing_manager, regular user) only allow users to access appropriate pages/views and actions within the app. Example: regular users cannot see the Admin interface.

## Style Guidelines:

- Primary color: HSL(210, 65%, 50%) - RGB(45, 138, 255) - A vibrant blue representing trust and technology, appropriate for the application's functionality.
- Background color: HSL(210, 20%, 95%) - RGB(242, 247, 255) - A light, desaturated shade of blue that provides a clean, professional backdrop.
- Accent color: HSL(180, 55%, 45%) - RGB(61, 191, 179) - A teal, slightly brighter and more saturated, used for interactive elements and key actions.
- Font: 'Inter', a sans-serif font, will be used for both headlines and body text. Note: currently only Google Fonts are supported.
- Simple, clear icons will be used to represent different actions and data types within the admin interface.
- A clean, well-organized layout with intuitive navigation is important. Prioritize key features with easily accessible actions.
- Subtle animations should be used on state changes or when generating a QR code, but animations should be simple.