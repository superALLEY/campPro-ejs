
# CampPro (EJS)

CampPro is a web application built with Node.js, Express.js, and EJS templating. It allows users to browse, create, and manage campsite listings. This project demonstrates the use of a full-stack JavaScript application with a focus on dynamic content rendering using EJS.

## Features

- **User Authentication**: Secure login and signup functionality.
- **Create and Manage Campsites**: Add, update, or delete campsite listings.
- **Browse Campsites**: View a list of all available campsites with details.
- **Dynamic Views**: Content rendered using EJS templates.
- **Responsive Design**: Optimized for various devices.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/superALLEY/campPro-ejs.git
   cd campPro-ejs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```env
     PORT=3000
     DATABASE_URL=<your_database_url>
     SESSION_SECRET=<your_secret>
     ```

4. Run the application:
   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## Technologies Used

- **Frontend**:
  - HTML
  - CSS
  - EJS (Embedded JavaScript)

- **Backend**:
  - Node.js
  - Express.js

- **Database**:
  - MongoDB (or your preferred database)

- **Authentication**:
  - Passport.js (or another library)

## Folder Structure

```
campPro-ejs/
├── public/          # Static assets (CSS, JS, images)
├── views/           # EJS templates
├── routes/          # Application routes
├── models/          # Database models
├── .env             # Environment variables
├── app.js           # Main application file
├── package.json     # Project metadata and dependencies
```

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

---

Happy coding! 🎉
