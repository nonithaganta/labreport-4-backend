# Lab 4: Registration, Login and JWT

**Name:** G.NONITHA 
**Registration Number:** 252U1R6073 
**Section/Class:** 207-AIML-2b
**Live Link:** Not deployed (run locally for this lab submission)

## Objective
Build user registration and login APIs using hashed passwords and JSON Web Tokens (JWT).

## Technologies Used
- Node.js
- Express.js
- SQLite3
- bcrypt
- jsonwebtoken

## Project Features
- `express.json()` reads JSON request bodies.
- User registration stores only a bcrypt password hash.
- Username is unique.
- Existing usernames are rejected with status `400`.
- Login checks unknown users and wrong passwords with status `400`.
- Successful login returns a JWT.
- The JWT payload contains only the username, never the password.
- SQL queries use parameterized placeholders (`?`).

## How to Run

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
npm start
```

The server runs at:
```text
http://localhost:3000
```

For development with automatic restart:
```bash
npm run dev
```

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Checks whether the API is running |
| POST | `/register` | Registers a new user with a hashed password |
| POST | `/login` | Validates credentials and returns a JWT |

## Request Examples

### Register
**POST** `/register`

```json
{
  "username": "nonitha",
  "name": "G. Nonitha",
  "password": "Nonitha123"
}
```

### Successful Registration Response
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "nonitha",
    "name": "G. Nonitha"
  }
}
```

### Login
**POST** `/login`

```json
{
  "username": "nonitha",
  "password": "Nonitha123"
}
```

### Successful Login Response
```json
{
  "jwt_token": "<generated JWT token>"
}
```

## Testing in Postman
Import `Lab_04_Postman_Collection.json` into Postman and test:
1. Registration success
2. Duplicate registration failure
3. Login success
4. Wrong password failure
5. Unknown user failure

## JWT Verification
Copy the token returned by `/login` and paste it into **jwt.io**. You can identify:
- **Header:** token algorithm and type
- **Payload:** username and token timestamps
- **Signature:** verifies that the token was signed with the secret key

The password must never be placed in the JWT payload.

## Screenshots
Place your actual Postman screenshots in the `screenshots/` folder before GitHub submission. Recommended screenshots:
- `register-success.png`

- `register-duplicate.png`

- `login-success.png`

- `login-wrong-password.png`

- `login-unknown-user.png`


> Actual screenshots are not fabricated in this project. Run the API and capture your own Postman results.

## Problems Faced and Solutions
- **Duplicate username:** Checked the database before inserting a new user.
- **Password security:** Used `bcrypt.hash()` so passwords are not stored as plain text.
- **Login validation:** Used `bcrypt.compare()` to compare the entered password with the stored hash.
- **Authentication token:** Used `jwt.sign()` and included only the username in the payload.

## Submission Notes
- Do not commit `node_modules/`.
- Do not commit `.env` files when environment variables are used.
- `database.db` is ignored so each local environment can create its own database.
