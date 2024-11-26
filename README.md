# Summary of this project


This project is a complex backend project that is built with nodejs, expressjs, mongodb, mongoose, jwt, bcrypt, and many more. This project is a complete backend project that has all the features that a backend project should have. We are building a complete video hosting website similar to youtube with all the features like login, signup, upload video, like, dislike, comment, reply, subscribe, unsubscribe, and many more.

Project uses all standard practices like JWT, bcrypt, access tokens, refresh Tokens and many more. I have spent a lot of time in building this project.



# Backend Documentation for PlaylistTube (YouTube-Clone Project)

### Overview

- The backend code for the PlaylistTube project is designed to emulate key functionalities of a YouTube-style platform. It is built with a modular structure for scalability, maintainability, and ease of development. The backend handles user authentication, video management, playlists, subscriptions, comments, likes, tweets, and a dashboard for data aggregation and insights. It also includes utility functions, middleware, and robust error handling.

## Directory Structure
The project backend follows a well-organized structure to separate concerns and maintain clarity.

#### Top-Level Files and Folders
- `.vscode`: Configuration files for Visual Studio Code to enhance the development experience.
- `Model_Arch`: Architecture diagrams or model references.
- `public/temp`: Temporary storage for uploaded files or assets.
- `src`: Core folder containing all backend-related files and logic.
- `.env.sample`: Sample file for environment variables.
- `.gitignore`: Defines files and folders to ignore in version control.
- `.prettierignore & .prettierrc`: Configuration for code formatting using Prettier.
- `README.md`: Documentation for the project.
- `package.json & package-lock.json`: Defines dependencies and scripts for the Node.js application.


### Core Backend Components
The core functionality resides within the src folder, which is divided into subdirectories:

#### 1. Routes
- Defines the API endpoints for each feature of the application. Routes act as the entry point to the backend logic.

- `Comment Routes:` Manage comment-related actions.
- `Dashboard Routes:` Provide aggregated data and analytics for the platform.
- `Healthcheck Routes:` Monitor the health of the application.
- `Likes Routes:` Handle user likes for videos or comments.
- `Playlist Routes:` Manage user-created playlists.
- `Subscription Routes:` Handle user subscriptions to channels.
- `Tweet Routes:` Manage user tweets or status updates.
- `User Routes:` Manage user accounts, profiles, and authentication.
- `Video Routes:` Handle video uploads, retrieval, and metadata.

#### 2. Controllers
- Contain the logic for each route. Controllers interact with models and perform actions like CRUD operations and data transformations.

- `Comment Controller:` Handles creation, updating, and deletion of comments.
- `Dashboard Controller:` Provides data insights and metrics for user dashboards.
- `Healthcheck Controller:` Ensures the backend is operational.
- `Like Controller:` Manages likes and unlikes for videos and comments.
- `Playlist Controller:` Handles playlist creation, modification, and deletion.
- `Subscription Controller:` Manages user subscriptions and notifications.
- `Tweet Controller:` Implements logic for user tweets or announcements.
- `User Controller:` Manages user registration, login, profiles, and authentication.
- `Video Controller:` Handles video uploads, metadata, and playback-related actions.

#### 3. Models
Defines the database schemas using an Object Data Modeling (ODM) library like Mongoose for MongoDB. These schemas dictate the structure of stored data.

- `Comments Model:` Schema for comments on videos or playlists.
- `Likes Model:` Tracks likes and unlikes for videos or comments.
- `Playlist Model:` Schema for user-created playlists.
- `Subscription Model:` Tracks user subscriptions to channels.
- `Tweets Model:` Schema for user-generated tweets or status updates.
- `User Model:` Schema for user accounts and profile information.
- `Video Model:` Schema for video files, metadata, and related data.

#### 4. Middleware
- Contains reusable functions that execute during the request-response cycle.

- `OAuth Middleware:` Handles OAuth authentication for secure login.
- `Auth Middleware:` Verifies user authentication using JWTs.
- `Multer Middleware:` Manages file uploads for videos, avatars, and other media.

#### 5. Utils
- Reusable utilities for various backend functionalities.

- `ApiError:` Standardizes error handling across the application.
- `ApiResponse:` Constructs consistent API responses.
- `UnlinkPath:` Utility to delete temporary files after processing.
- `AsyncHandler:` Wraps asynchronous routes to handle errors efficiently.
- `FileUpload:` Provides utilities for managing and storing uploaded files.

#### 6. Config
- Houses configuration files for database connections and other environment-dependent setups.

- `DB.js:` Configures and initializes the database connection using MongoDB.

#### 7. Constants.js
- Defines constant values used throughout the application, such as roles, statuses, or fixed messages.

- `8. App.js`
- The main Express.js application setup file. Configures middlewares, initializes routes, and starts the server.

- `9. Index.js`
- Entry point for the backend server. Loads environment variables, initializes the application, and starts listening for incoming requests.

## Key Features

### User Management:

- User registration, login, logout, and profile management.
- OAuth authentication and JWT-based authorization.

### Video Management:

- Uploading and retrieving video files and metadata.
- Handling video likes and watch histories.

### Playlist Management:

- Creation, modification, and deletion of playlists.
- Associating videos with playlists.

### Subscriptions:

- Managing subscriptions to user channels.
- Notifications for channel updates.

### Comments and Likes:

- CRUD operations for comments on videos and playlists.
- Like/unlike functionality for user interactions.

### Dashboard Insights:

- Aggregated data like subscriber counts, video views, and more.

### Healthcheck:

- Ensures backend services are running correctly.
Error Handling:

- Centralized error handling with descriptive API responses.

## Deployment and Configuration

### Environment Variables:

- Store sensitive data such as database credentials and JWT secrets in a .env file.
- Use the provided .env.sample as a template.

### Database:

- MongoDB is used as the database.
- Models are defined using Mongoose to interact with MongoDB collections.

### Running the Application:

- Install dependencies: `npm install`
- Start the development server: `npm run dev`
- Build and run for production: `npm run build` && `npm start`


## Endpoints in postman `https://documenter.getpostman.com/view/37991803/2sAYBVgr5M`
## Repo:-https: `https://github.com/sunilrathod098/YouTube-Clone-Project`

## Conclusion
- This backend structure is robust, modular, and scalable, designed to support a PlaylistTube platform's core functionalities efficiently. The use of industry-standard practices like JWT, OAuth, and modular architecture ensures the backend is secure, maintainable, and ready for scaling.






