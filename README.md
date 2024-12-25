# Thesis Supervision and Management System

## Project Overview
The **Thesis Supervision and Management System** is a web application designed to streamline the thesis supervision process. It facilitates communication and document management between students, supervisors, and the Head of Department (HOD). The application provides features such as student and staff registration, thesis approval workflows, chat functionality, file uploads, and performance evaluation.

## Features

### General Features
- **Authentication and Authorization**:
  - Secure login for students, supervisors, and HOD.
  - Role-based access control to ensure functionality is restricted based on user roles.
- **Dynamic Dashboards**:
  - Personalized dashboards for supervisors and HODs to manage their tasks efficiently.

### Head of Department (HOD)
- Approve or reject thesis proposals submitted by students.
- Assign supervisors to approved students.
- Activate or deactivate staff as panelists.
- Publish approved thesis topics.
- View a list of all students in the department.

### Supervisor
- View assigned students.
- Communicate with assigned students via chat.
- Upload documents and supervise students' progress.
- Evaluate student submissions and provide grades.

### Student
- Register and log in to the system.
- Submit thesis proposals and track approval status.
- Communicate with supervisors via chat.
- Upload documents and view feedback.

## Technologies Used

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose** ORM

### Frontend
- **EJS** templating engine for dynamic HTML rendering.

### Middleware and Utilities
- **bcrypt** for password hashing.
- **Multer** for file uploads.
- **Connect-flash** for flash messages.
- **Socket.io** for real-time chat functionality.

## Database Models

### Staff Schema
Fields:
- First Name, Last Name, ID, Email, Department, Role, Password.
- Panelist status and activation fields.

### Student Schema
Fields:
- First Name, Last Name, ID, Email, Department, Program, Role, Password.
- Thesis details (topic, description, status).
- Supervisor details.
- Chat history and file uploads.
- Final document submissions and evaluations.

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd thesis-supervision-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up MongoDB:
   - Create a MongoDB database.
   - Update the connection string in your `.env` file.

4. Start the server:
   ```bash
   npm start
   ```

5. Access the application at `http://localhost:3000`.

## File Structure

```
project-root/
|-- db/
|   |-- staffdb.js         # Staff schema and model
|   |-- studentdb.js       # Student schema and model
|
|-- routes/
|   |-- register.js        # Registration routes for staff and students
|   |-- hod.js             # HOD-related routes
|   |-- supervisor.js      # Supervisor-related routes
|
|-- views/
|   |-- staffregister.ejs
|   |-- studentregister.ejs
|   |-- ...
|
|-- uploads/               # Uploaded files directory
|-- app.js                 # Main application file
|-- package.json           # Node.js dependencies
```

## Future Enhancements
- Add notifications for real-time updates.
- Improve UI/UX with a modern frontend framework.
- Enable multi-department support.

## License
This project is licensed under the MIT License.

## Contact
For inquiries or support, please contact [Amebley Afeti](mailto:saamebley@gmail.com).
