Wanderlust 🏨
Wanderlust is a full-stack web application inspired by Airbnb, designed to allow users to discover, book, and review unique places to stay around the world. This project demonstrates a complete CRUD (Create, Read, Update, Delete) application with user authentication, image uploads, and an interactive user interface.

✨ Features
User Authentication: Secure user sign-up and login functionality using Passport.js. Authenticated users can manage their listings and post reviews.

Browse Listings: A clean, responsive interface to view all available properties.

CRUD for Listings: Authenticated users can Create new listings, Read details of any listing, Update their own listings, and Delete them.

Image Uploads: Users can upload images for their listings, which are handled by Multer.

Reviews and Ratings: Logged-in users can post reviews and ratings for properties they've visited.

Authorization: Users can only edit or delete the listings and reviews they have created.

Flash Messages: Interactive flash messages provide feedback to the user after performing actions (e.g., "New Listing Created!", "You are logged out!").

🛠️ Tech Stack
Frontend: HTML, CSS, JavaScript, EJS (Embedded JavaScript templates)

Backend: Node.js, Express.js

Database: MongoDB with Mongoose

Authentication: Passport.js (Local Strategy)

Styling: Bootstrap

Utilities: Method-Override, Multer, Express-Session, Connect-Flash, EJS-Mate

🚀 Getting Started
Follow these instructions to get a copy of the project up and running on your local machine.

Prerequisites
Node.js installed (which includes npm). You can download it from nodejs.org.

MongoDB installed and running on your local machine. You can use MongoDB Compass for a user-friendly interface.

Installation & Setup
Clone the repository (or download the WanderLustFinal folder):

git clone https://your-repository-url.git
cd WanderLustFinal

Install NPM packages:
Open your terminal in the project directory and run:

npm install

Set up Environment Variables:
Create a file named .env in the root of your project and add the following line. You can change the secret to any random string.

SECRET="mySuperSecretCode"

Start the Server:
Run the following command to start the application using nodemon (which automatically restarts the server on file changes):

npm run dev

Your server should now be running on http://localhost:3000.

🖼️ Screenshots
(You can add screenshots of your application here to showcase its features)

Home Page:

Listing Detail Page:

New Listing Form:

🔮 Future Scope
Cloud Image Uploads: Integrate a service like Cloudinary to store images in the cloud instead of locally.

Map Integration: Use a service like Mapbox to show the location of properties on an interactive map.

Booking Functionality: Implement a booking system with date pickers and availability checks.

User Profiles: Create dedicated user profile pages to view personal information and managed listings.