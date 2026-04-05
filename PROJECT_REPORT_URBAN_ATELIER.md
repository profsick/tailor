URBAN ATELIER
CUSTOM TAILORING WEB APPLICATION
Major Project Report

Submitted in partial fulfillment of the requirements for the award of the degree of

BACHELOR OF TECHNOLOGY / BACHELOR OF COMPUTER APPLICATIONS
(Replace with your actual degree)

Submitted by:

Name: **\*\*\*\***\_**\_**\*\*\*\***
Roll No: **\*\*\*\*******\*\*\*\***
Department: **\*\***\_**\_**\*\***
College: **\*\*\*\***\_\_****\*\*\*\***
University: **\*\*\*\***\_**\*\*\*\***

Academic Year: 2025-2026

CERTIFICATE

This is to certify that the project report entitled "Urban Atelier - Custom Tailoring Web Application" is a bonafide work carried out by **\*\*\*\*******\*\*\*\*** under my supervision and guidance in partial fulfillment of the requirements for the award of the degree **\*\*\*\*******\*\*\*\*** during the academic year 2025-2026.

Guide Signature: **\*\*\*\***\_\_**\*\*\*\***

Head of Department: **\*\*\*\***\_\_**\*\*\*\***

Date: **\*\*\*\***\_\_**\*\*\*\***

Place: **\*\*\*\***\_\_**\*\*\*\***

DECLARATION

I hereby declare that this project report titled "Urban Atelier - Custom Tailoring Web Application" is my original work and has been carried out under the guidance of my project supervisor. This report has not been submitted to any other university or institution for the award of any degree, diploma, or certificate.

Student Signature: **\*\*\*\***\_\_**\*\*\*\***

Name: **\*\*\*\***\_\_**\*\*\*\***

Date: **\*\*\*\***\_\_**\*\*\*\***

ACKNOWLEDGEMENT

I would like to express my sincere gratitude to my project guide for continuous support, valuable suggestions, and encouragement throughout the development of this project. I also thank the Head of Department, faculty members, and my friends for their guidance and help during the project work.

I am deeply thankful to my family for their constant motivation and moral support.

PROJECT SUMMARY

Urban Atelier is a full-stack web application built to modernize custom tailoring operations by digitizing order placement, measurement capture, catalog management, and order tracking. The system provides a customer-facing storefront where users select clothing types, choose fabrics, save measurements, and place orders. It also provides an authenticated admin dashboard to monitor incoming orders, update order status, delete orders, and manage catalog entries.

The project integrates a static frontend built with HTML, CSS, and JavaScript with a backend API built using Node.js and Express, and it stores application data in MongoDB Atlas. The platform demonstrates practical use of REST APIs, browser storage, schema-driven data modeling, asynchronous communication, and role-based workflow separation between customers and administrators.

Key outcomes of the project include:

Reduced manual order recording process.
Better order visibility for both customer and admin.
Centralized and scalable order persistence in MongoDB.
Shared catalog updates across browsers and devices.
Expandable architecture for future additions like payment and delivery.

ABSTRACT

Traditional tailoring businesses often rely on manual notebooks, in-person measurement records, and phone-based updates. This method leads to communication delays, poor order visibility, and a higher chance of data loss. Urban Atelier addresses these problems through a web-based custom tailoring platform with both customer and administrator workflows.

The customer module allows users to browse tailoring options, select apparel categories, choose suitable fabrics, review cart data, and submit detailed orders along with body measurements and special instructions. The admin module includes a backend-validated login flow, a complete order table view, status update actions, deletion controls, and service-health checks.

On the technical side, the solution uses a decoupled architecture:

Frontend pages manage user interactions and local state.
A backend API validates and processes order and catalog operations.
MongoDB stores finalized orders and catalog entries with structured fields.

The project emphasizes maintainability and extensibility. It uses modular route/controller/model separation in backend code and dedicated scripts for customer flow, admin dashboard operations, and catalog management. The admin login routes through the backend for credential verification and token-based session handling. Catalog images are stored in MongoDB as base64 strings so the clothing and fabric catalogue can be shared across browsers and devices.

The developed system successfully demonstrates an industry-relevant full-stack workflow and provides a practical foundation for real deployment in small and medium tailoring businesses.

Keywords: custom tailoring, full-stack web app, MongoDB, Express.js, order management, admin dashboard, JWT, catalog management.

TABLE OF CONTENTS

Project Summary - 3
Abstract - 4

1. Chapter 1 - Introduction - 5
   1.1 Introduction to the Project - 6
   1.2 System Specification - 7
   1.2.1 Hardware Configuration - 8
   1.2.2 Software Specification - 8
2. Chapter 2 - System Study - 9
   2.1 Existing System - 10
   2.2 Drawbacks of Existing System - 10
   2.3 Proposed System - 11
   2.4 Advantages of Proposed System - 11
3. Chapter 3 - System Design and Development - 12
   3.1 File Design - 13
   3.2 Input Design - 14
   3.3 Output Design - 14
   3.4 Database Design - 15
   3.5 System Development - 15
   3.5.1 Description of Modules - 16
4. Chapter 4 - Testing and Implementation - 17
   4.1 System Testing - 18
   4.2 Implementation - 19
5. Chapter 5 - Conclusion - 20
   5.1 Future Enhancements - 22
6. Bibliography - 23
7. Appendices - 23
   Data Flow Diagram (DFD) - 24
   Database Table Structure - 24
   Code Snippets - 26
   Screenshots - 47
   CHAPTER 1 - INTRODUCTION
   1.1 Introduction to the Project

The tailoring industry is highly personalized, but many businesses still use fragmented manual systems for managing customer requirements, body measurements, and order tracking. In such environments, order history is difficult to retrieve, changes are hard to track, and communication with customers is inconsistent.

Urban Atelier is developed as a custom tailoring web platform that combines ordering, measurements, catalog browsing, and status updates into one unified solution. It targets three major goals:

The platform aims to digitize the customer order journey, reduce manual overhead for tailor or admin staff, and provide a transparent workflow where both the customer and the tailor can monitor order state.

The project includes a customer storefront for product selection, a cart-based flow for multi-item custom orders, a measurement capture and review mechanism, backend order persistence with MongoDB, and an admin dashboard for order operations and catalog management.

This project demonstrates core software engineering principles such as modular architecture, input validation, error handling, state synchronization, and API-driven communication.

Problem Statement

Manual tailoring operations face the following recurring issues:

Orders are often maintained in diaries or spreadsheets without structured validation, customer measurements are lost or overwritten, order status updates are delayed and non-standardized, and the admin has no real-time dashboard for pending or completed orders.

Hence, there is a need for a responsive and maintainable web application that formalizes order lifecycle management.

Objectives

Primary objectives of Urban Atelier:

The primary objectives are to build a user-friendly interface for selecting clothing and fabric combinations, enable customers to submit measurements and contact details with each order, persist finalized orders and catalog entries into MongoDB, provide admin controls to list, complete, and delete orders, and maintain a clear separation between customer UI logic and backend business logic.

Scope of the Project

In-scope:

The current scope includes frontend pages for ordering and history tracking, an admin dashboard with order actions, a REST API for order and catalog CRUD-related operations, and a MongoDB schema for order and catalog data.

Out-of-scope for the current phase:

The current phase does not include online payment gateway integration, OTP-based authentication, a multi-admin role hierarchy, or real-time notifications through email or messaging apps.

Significance

Urban Atelier provides a practical digital bridge for local tailoring businesses transitioning from offline workflow to online order processing. The architecture is intentionally lightweight for easy deployment and future expansion.

In practical terms, this means the system is suitable for small tailoring shops that want a low-friction digital entry point without adopting a heavy enterprise platform. It also gives the project a realistic scope because the core workflow can be demonstrated clearly during testing, while still leaving room for future additions such as payments, delivery coordination, and automated notifications.
1.2 System Specification

System specification defines the minimum hardware and software environment required to build, run, and test the project reliably.

The project has been designed to run on commonly available student laptops and desktops without requiring high-end infrastructure. The specification below separates baseline requirements for successful execution from recommended requirements for smoother development and testing.
1.2.1 Hardware Configuration

Minimum requirements:

Processor: Intel i3 or equivalent and above
RAM: 4 GB minimum, 8 GB recommended
Storage: 2 GB free disk space
Internet: Required for MongoDB Atlas connectivity

Recommended requirements:

Processor: Intel i5/i7 or equivalent
RAM: 8 GB or more
SSD storage for faster package installation and builds

Additional practical considerations:

Stable broadband connection for database connectivity and package installation.
At least 1366x768 display resolution for comfortable multi-panel development in VS Code.
Dual-core or higher CPU improves local API responsiveness during simultaneous browser and server usage.
SSD-based systems reduce startup delays for Node.js server and improve dependency installation time.
1.2.2 Software Specification

Development tools and stack:

OS: Windows 10/11
Editor: Visual Studio Code
Runtime: Node.js
Package Manager: npm
Backend Framework: Express.js
Database: MongoDB Atlas
ODM: Mongoose
Version Control: Git
Browser: Google Chrome or Microsoft Edge

Recommended runtime versions:

Node.js: v18 or later (LTS preferred for stability)
npm: v9 or later
MongoDB Atlas cluster with active network access rules

Frontend technologies:

HTML5
CSS3
Vanilla JavaScript (ES6+)

Backend dependencies:

express
mongoose
cors
dotenv
bcryptjs
jsonwebtoken
nodemon for development

Supporting configuration requirements:

Backend environment file with MONGODB_URI, PORT, ADMIN_USERNAME, ADMIN_PASSWORD_HASH, and JWT_SECRET.
Browser support for modern JavaScript, Fetch API, sessionStorage/localStorage, and responsive CSS.
Optional Postman or Thunder Client setup for direct API validation during testing.

Execution environment summary:

Frontend is served as static files through the Express application.
Backend APIs run on the configured localhost port.
MongoDB Atlas stores persistent order and catalog data.
Admin authentication relies on server-side credential verification and JWT token issuance.

This execution model keeps development simple while still reflecting a production-style split between presentation, application logic, and data storage. It also makes the system easy to test on a student machine because the frontend and backend can run together locally, yet the data layer remains cloud-based and persistent.
CHAPTER 2 - SYSTEM STUDY
2.1 Existing System

Traditional tailoring workflow is mostly manual:

Customer visits the shop physically.
Tailor notes measurements in a register.
Garment choices and fabric notes are written as text.
Progress updates happen through calls or direct follow-ups.
Completion records are rarely structured.

In some semi-digital cases, shops use social media or messaging apps, but such tools are not designed for structured order records, validation, searchable history, or catalog management.

Existing Workflow Characteristics

The existing workflow is characterized by unstructured data entry, no guaranteed backup, no normalized order status model, no easy retrieval by date or customer, and no customer self-service visibility.
2.2 Drawbacks of Existing System

Operational drawbacks:

Operationally, the system suffers from duplicate effort in collecting and rewriting customer details, human error in recording measurements, difficulty in handling multiple pending orders, and no quick way to identify delayed orders.

Technical drawbacks:

Technically, it lacks a central database, API-based integration, and a modular software architecture.

Customer experience drawbacks:

From the customer perspective, there is uncertainty in order status, no digital trail for previous orders, and manual re-entry of details for repeat orders.

Business drawbacks:

On the business side, the workflow has limited scalability as customer volume grows, high dependency on specific staff members, and weak reporting and analytics capability.
2.3 Proposed System

Urban Atelier proposes a full-stack web system with two coordinated tracks:

Customer track:

The customer track begins with clothing and fabric selection, continues through cart addition and measurement entry, and ends with order submission to the backend and order status tracking on the orders page.

Admin track:

The admin track starts with dashboard login, then allows the admin to view all backend orders, mark orders as completed, delete one or all orders when needed, and manage catalog items from the add-items page.

Proposed Architecture

Three-layer architecture is used:

The architecture follows a three-layer model consisting of a presentation layer built with HTML, CSS, and JavaScript pages, an application layer handled by Express routes and controllers, and a data layer managed through MongoDB with Mongoose schemas.

This ensures clean responsibility boundaries and easier maintenance.
2.4 Advantages of Proposed System

The proposed system provides structured order capture with validation, persistent storage in a cloud database, faster order lookup for the admin, better customer confidence through status visibility, a reusable and modular codebase, easier extension for payments, notifications, and analytics, and shared catalog updates across browsers and devices.

Another important advantage is that the proposed system creates a single source of truth for both customer and admin activity. Instead of relying on separate notebooks, chats, or local files, all important order and catalog information is stored in one consistent workflow, which reduces duplication and makes the business process easier to audit later.

Comparative Summary
CHAPTER 3 - SYSTEM DESIGN AND DEVELOPMENT
3.1 File Design

The project is split into frontend files at the root and backend files under a Node app folder. This design keeps UI assets and API implementation independent while still allowing a simple deployment setup.

Frontend File Organization

Core customer pages:

The core customer pages are index.html for the landing page and product or fabric selection, cart.html for cart listing, quantity updates, and measurement review, order.html for the final order placement form, and yorders.html for customer order history and status tracking.

Core admin pages:

The core admin pages are admin.html for the login gate and dashboard shell, and add-items.html for catalog management of clothing and fabric items.

Frontend scripts:

The frontend scripts are script.js for customer-side business logic, admin.js for admin dashboard operations, and add-items.js for admin catalog operations.

Styles:

The styles are defined in styles.css for customer page styling and admin.css for admin page styling.

Backend File Organization

Server bootstrap:

src/server.js

Express app config:

src/app.js

Database:

src/config/db.js

API routes:

src/routes/index.js

Business logic:

src/controllers/orderController.js
src/controllers/adminController.js
src/controllers/catalogController.js

Data models:

src/models/Order.js
src/models/CatalogItem.js

Design Rationale

The design uses a centralized API helper pattern on the frontend to reduce duplicate fetch logic, controller-based backend structure to keep route definitions simple, Mongoose schemas to enforce order and catalog data consistency, static file serving from Express for straightforward deployment, and token-based admin authentication to protect privileged operations.

This structure also helps future development because each layer can be changed with limited impact on the others. For example, the UI can be redesigned without rewriting database logic, and the backend can add new endpoints without breaking the existing customer pages as long as the response contracts stay stable.
3.2 Input Design

Input design ensures all user and admin data capture is consistent, validated, and processable.

Customer Inputs

Selection inputs:

Customer selection inputs include the clothing item, fabric item, and quantity adjustments in the cart.

Form inputs at checkout:

The checkout form collects the full name, email, phone number, and special instructions.

Measurement inputs:

The measurement inputs cover full shoulder, full sleeve, full chest, waist, hips, front chest, back chest, jacket length, pants waist, low hip, thigh, crotch, pant length, bicep, neck, and cuffs.

Validation approach:

Required fields are checked before submission, the phone pattern is constrained at form level, and the backend re-validates critical fields.

Admin Inputs

Admin inputs include the username and password in the login form, action buttons for status update and delete, a file upload input for adding clothing and fabric images, and a text input for the catalog item name.

Storage Inputs

Browser storage keys used:

The browser storage keys used are tailorCart, tailorMeasurements, customerDetails, and orders.

MongoDB collections used:

The MongoDB collections used are CatalogItem and Order.
3.3 Output Design

Output design focuses on user feedback clarity and operational visibility.

Customer Outputs

Customer outputs include a dynamic cart count badge, a cart summary with total items and total price, a measurement preview block, an order success confirmation banner, order history cards with current status labels, and empty-state messages for no cart or no orders scenarios.

Admin Outputs

Admin outputs include a dashboard order table with date, contact, item info, measurements, and status, status badges for Pending and Completed, success and error message banners, an API health test result message, and catalog cards with item previews and delete actions.

API Outputs

Example response from order creation:

json
{
"id": "<mongo-id>",
"status": "Pending",
"createdAt": "<timestamp>"
}

Example list response:

json
[
{
"id": "...",
"created_at": "...",
"name": "...",
"phone": "...",
"email": "...",
"clothing": "...",
"fabric": "...",
"measurements": {},
"instructions": "...",
"total": 0,
"status": "Pending"
}
]
3.4 Database Design

The database design is based on two primary collections: orders and catalog items.

Entity Overview

The Order entity stores customer info, item list, measurements, pricing, status, and timestamps. The CatalogItem entity stores type, name, image, and timestamps.

Order Schema Fields

Catalog Schema Fields

Data Integrity Considerations

Data integrity is enforced through required constraints on name and phone, status values restricted to enum options, minimum bounds on quantity and price, a backend-computed fallback total when needed, and a catalog type limited to clothing or fabric.

Database Connectivity

Database connectivity uses the MongoDB URI from an environment variable, establishes the connection through Mongoose, and supports graceful degraded startup when the database is unavailable.

This approach is useful in development because it prevents the entire application from failing when the database connection is temporarily unavailable. Instead, the backend can still start and serve non-database-dependent pages, which makes debugging and incremental testing easier.
3.5 System Development

This section explains implementation decisions and development process.

Development Lifecycle Followed

The development lifecycle moved from requirement understanding and frontend prototype creation to cart and measurement logic implementation, backend API creation, database schema integration, admin dashboard integration, catalog storage migration to MongoDB, testing and bug fixes, and finally documentation.

Frontend Development Highlights

The frontend work focused on responsive pages for the customer flow, a reusable Cart class in JavaScript, localStorage for persistent cart and temporary customer context, order history tracking with backend status synchronization, and custom in-page confirmation modals for selection review.

Backend Development Highlights

The backend implementation added RESTful routes under /api, controller methods for create, list, update, and delete, object ID validation before critical operations, structured JSON responses for consistent frontend handling, JWT-based admin authentication with protected endpoints, and catalog persistence in MongoDB through a dedicated collection.

Admin Development Highlights

The admin work implemented authenticated login through the backend API, token-based session handling for admin actions, order table rendering and action controls, a test connection feature using the health endpoint, and a separate add-items interface for catalog updates.

Error Handling Strategy

Frontend:

The frontend handles errors with try/catch around API requests, user-visible message banners, and empty-state fallback UI.

Backend:

The backend uses 400 responses for invalid input, 404 responses for missing resources, and 500 responses for unexpected failures.

Security and Reliability Notes

Current phase includes practical admin authentication and protected API access.

Admin credentials are verified on the backend instead of being hardcoded in the browser, password checks use hashed credentials and successful login returns a token for protected requests, and environment variables protect sensitive values such as the database URI and JWT secret.

These checks were added to keep the project closer to a real deployment scenario. Even though the application is still a student project, the backend-controlled login and protected requests reduce obvious security weaknesses and make the admin workflow more credible during demonstrations.
3.5.1 Description of Modules
Module A: Customer Storefront Module

Responsibilities:

The customer storefront module displays the hero and product-selection sections, renders clothing and fabric cards, and handles selection events and item addition.

Primary files:

index.html, script.js, and styles.css
Module B: Cart and Measurement Module

Responsibilities:

The cart and measurement module shows selected items and totals, allows quantity updates and item removal, and saves and displays measurement data.

Primary files:

cart.html and script.js
Module C: Checkout and Order Submission Module

Responsibilities:

The checkout and order submission module displays the order summary, captures customer contact details, and sends the normalized order payload to the backend API.

Primary files:

order.html, script.js, and the backend order creation endpoint
Module D: Customer Order Tracking Module

Responsibilities:

The customer order tracking module displays local order history and syncs status values from the backend using remote IDs.

Primary files:

yorders.html and script.js
Module E: Admin Dashboard Module

Responsibilities:

The admin dashboard module provides the authenticated login gate, loads and renders all backend orders, supports marking completed or deleting one or all records, and handles logout with protected request headers.

Primary files:

admin.html and admin.js
Module F: Catalog Management Module

Responsibilities:

The catalog management module adds new clothing and fabric entries with image upload, deletes catalog entries, and persists catalog data in MongoDB.

Primary files:

add-items.html, add-items.js, and the catalog API endpoints
Module G: Backend API Module

Responsibilities:

The backend API module handles route definitions, request validation, business logic execution, and database operations.

Primary files:

src/routes/index.js, src/controllers/orderController.js, src/controllers/adminController.js, src/controllers/catalogController.js, src/models/Order.js, and src/models/CatalogItem.js
Module H: Database Module

Responsibilities:

The database module connects the application to MongoDB Atlas and maintains order and catalog schema integrity.

Primary files:

src/config/db.js, src/models/Order.js, and src/models/CatalogItem.js
CHAPTER 4 - TESTING AND IMPLEMENTATION
4.1 System Testing

Testing verifies whether each functional unit behaves as expected and whether integrated modules satisfy project requirements.

Testing Types Used

Testing types used include unit-level functional checks, API endpoint testing, integration testing between frontend and backend, UI interaction testing, and negative or error-path testing.

Sample Test Cases
Test Case 1: Add Item to Cart

Input: Select one clothing and one fabric.
Expected: Item appears in cart, cart count increments.
Result: Pass.
Test Case 2: Checkout Without Required Name or Phone

Input: Submit order form with missing required fields.
Expected: Browser or backend validation blocks request.
Result: Pass.
Test Case 3: Create Order API

Input: POST /api/orders with valid payload.
Expected: 201 response with id, status, and createdAt.
Result: Pass.
Test Case 4: List Orders in Admin

Input: Open dashboard and refresh.
Expected: Table displays latest orders first.
Result: Pass.
Test Case 5: Mark Order Completed

Input: PATCH /api/orders/:id/complete.
Expected: Status changes to Completed.
Result: Pass.
Test Case 6: Delete Single Order

Input: DELETE /api/orders/:id.
Expected: Record removed and success message shown.
Result: Pass.
Test Case 7: Delete All Orders

Input: DELETE /api/orders with confirmation.
Expected: All records removed.
Result: Pass.
Test Case 8: Health Endpoint

Input: GET /api/health.
Expected: API is running.
Result: Pass.
Test Case 9: Invalid Order ID Completion

Input: PATCH with malformed id.
Expected: 400 invalid order id.
Result: Pass.
Test Case 10: DB Unavailable Startup

Input: Start server with invalid URI.
Expected: Server starts in degraded mode and DB actions fail gracefully.
Result: Pass.
Test Case 11: Admin Login Success

Input: Valid admin username and password.
Expected: JWT token returned and dashboard opens.
Result: Pass.
Test Case 12: Catalog Upload Success

Input: Upload clothing or fabric image through add-items page.
Expected: Item saved in MongoDB and appears in both admin and storefront catalog.
Result: Pass.

Browser Compatibility Testing

Browsers tested:

Google Chrome and Microsoft Edge

Expected behavior validated:

The validated behavior included responsive layout, form controls, localStorage and sessionStorage behavior, API communication, and catalog refresh after backend updates.

Performance Observations

Local rendering is smooth for low-to-moderate order volume, API response is quick for normal testing data sizes, base64 image storage in MongoDB works well for a project of this scale, and very large image files can increase database size and should be optimized later.

The testing results also show that the current architecture is adequate for a project-level deployment, but it would need optimization if the catalog or order volume grows significantly. In particular, image handling and reporting would be the first areas to improve if the system were moved into a larger business environment.
4.2 Implementation

Implementation describes practical steps to run the project end-to-end.

Deployment or Run Steps (Local)

1. Open project root in VS Code.
2. Open terminal and start the backend from the root workspace.
3. Install dependencies if needed.
4. Configure environment variable MONGODB_URI in .env.
5. Configure admin auth variables in the backend .env file.
6. Start the backend with npm start.
7. Open browser at the local app URL.
8. Test customer order flow.
9. Open admin page and perform dashboard actions.
10. Use add-items page to manage MongoDB catalog entries.

Implementation Notes

Backend serves both API and frontend static pages, the API base is derived from the current window origin with the /api suffix, orders persist in MongoDB while cart and measurements persist in browser storage, admin dashboard requests include backend-issued auth tokens, and catalog items are stored in MongoDB and loaded by both storefront and admin pages.

Operational Checklist

Verify the API health endpoint before testing the full flow, ensure MongoDB Atlas IP access includes the current machine, avoid exposing .env files publicly, and restart the backend process on port 3001 after code changes.

This checklist matters because most implementation problems in a small full-stack project come from environment setup rather than application logic. Verifying the backend health, database access, and runtime configuration first saves time and prevents false debugging when the issue is actually in the local setup.

Practical Implementation Challenges Faced

1. Handling mixed frontend payload shapes during API migration.
   - Solved by normalizing items in the backend controller.

2. Supporting graceful startup when DB temporarily unavailable.
   - Solved by degraded mode startup logic.

3. Keeping catalog updates synchronized across tabs.
   - Solved by a BroadcastChannel refresh mechanism.

4. Displaying verbose measurement fields in a compact admin table.
   - Solved using labels and formatted HTML rendering.

5. Moving catalog storage from browser storage to MongoDB.
   - Solved by adding a dedicated CatalogItem collection and REST endpoints.
     CHAPTER 5 - CONCLUSION

Urban Atelier successfully demonstrates a complete custom tailoring management workflow using modern web technologies. The project transforms a manual, error-prone process into a structured digital pipeline. Customers can place orders conveniently with detailed measurements, while administrators gain better operational control through a centralized dashboard.

Technically, the project achieves frontend-backend separation with clear module boundaries, API-driven data flow with structured error handling, persistent and query-friendly order and catalog storage in MongoDB, a maintainable architecture suitable for future production hardening, and secure admin authentication using backend verification and JWT tokens.

From an academic standpoint, the project validates practical understanding of full-stack development, database schema design, and deployment-oriented coding practices.

The project also shows how a relatively small web application can still solve a real operational problem when the workflow is designed carefully. By combining customer ordering, admin control, and database-backed persistence, Urban Atelier demonstrates the kind of system behavior expected from a practical software engineering project rather than a simple static website.
5.1 Future Enhancements

Recommended next improvements:

Future enhancements include payment gateway integration through UPI, cards, or wallets, delivery and pickup slot scheduling, real-time notifications via SMS, email, or WhatsApp, product image optimization and object storage integration, an analytics dashboard for order trends and revenue insights, multi-language UI support, advanced search, filter, and export in the admin panel, and role-based access control for multiple admin users.

BIBLIOGRAPHY

1. Express.js Documentation, https://expressjs.com/
2. Mongoose Documentation, https://mongoosejs.com/docs/
3. MongoDB Documentation, https://www.mongodb.com/docs/
4. Node.js Documentation, https://nodejs.org/docs/
5. MDN Web Docs for HTML, CSS, and JavaScript, https://developer.mozilla.org/
6. REST API design references and backend implementation notes.
7. Course notes and faculty guidance on software engineering and web systems.

APPENDICES
DATA FLOW DIAGRAM (DFD)

Context-Level DFD (Level 0)

External entities:

Customer
Admin
MongoDB Database

System process:

Urban Atelier Web System

Data flow summary:

Customer sends order details and receives status view.
Admin sends management actions and receives dashboard data.
System writes and reads orders and catalog items to and from the database.

Level 1 DFD (Suggested Process Breakdown)

P1: Customer Selection and Cart Process
P2: Measurement and Checkout Process
P3: Order API Processing
P4: Admin Order Management
P5: Catalog Management Process
P6: Status Synchronization Process

(Insert DFD diagrams here as screenshots or images in the final document.)
DATABASE TABLE STRUCTURE

orders Collection

CatalogItem Collection

CODE SNIPPETS

Admin Login Flow

javascript
async function handleLogin(event) {
event.preventDefault();
const username = document.getElementById("username").value.trim();
const password = document.getElementById("password").value.trim();

const payload = await apiRequest("/admin/login", {
method: "POST",
body: JSON.stringify({ username, password }),
});

sessionStorage.setItem("adminLoggedIn", "true");
sessionStorage.setItem("adminToken", payload.token);
}

Catalog Item Creation

javascript
exports.createCatalogItem = async (req, res) => {
const createdItem = await CatalogItem.create({
type,
name,
image,
});

return res.status(201).json({
id: String(createdItem.\_id),
type: createdItem.type,
name: createdItem.name || "",
image: createdItem.image,
});
};

Storefront Catalog Loading

javascript
async function loadCatalogItemsFromApi() {
const [clothingItems, fabricItems] = await Promise.all([
apiRequest("/catalog?type=clothing"),
apiRequest("/catalog?type=fabric"),
]);
}

SCREENSHOTS

Insert screenshots here in the final Word/PDF version.
Suggested screenshots:

1. Home page
2. Clothing selection section
3. Fabric selection section
4. Confirmation modal
5. Cart page
6. Measurement form
7. Order submission page
8. Customer orders page
9. Admin login page
10. Admin dashboard
11. Add-items page
12. Catalog upload result
13. Catalog deletion result
14. MongoDB collection view
15. API test / health endpoint

Page-count guidance for final formatting:

Keep each major screenshot on a separate figure block with caption and short explanation.
Add at least 20-25 screenshots across customer flow, admin flow, API checks, and database views.
Keep code snippets and database tables on separate pages where needed.
With 12 pt font, 1.5 spacing, and these figures, the document will stay at the indexed page count or higher.
