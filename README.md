<div align="center">
  
<img src="/public/github-logo.png" alt="Circular Image" width="600" height="250">

</div>
<h3 align="center"> backend to a main project </h3>

<p align="center">
     <img src = "https://img.shields.io/badge/Node-40916c?style=for-the-badge&logo=node.js&logoColor=white" />
     <img src = "https://img.shields.io/badge/PostgreSQL-5849BE?style=for-the-badge&logo=postgresql&logoColor=white" />
     <img src = "https://img.shields.io/badge/Express-52b788.svg?style=for-the-badge&logo=express&logoColor=white" />
     <img src = "https://img.shields.io/badge/aws-fdc500.svg?style=for-the-badge&logo=amazon-web-services&logoColor=black" />
     <img src = "https://img.shields.io/badge/JWT-%23000000.svg?style=for-the-badge&logo=json-web-tokens&logoColor=white" />
 </p>

## 🧠 Collect – Backend

> A collaborative content-sharing backend architecture built with scalability, security, and real-time performance at its core.

> Checkout the workflow of the [backend](https://whimsical.com/AssHGnjcEBEoucSVXDV4LB)

## 🚀 Features
### 🔐 Authentication & Authorization

- Secure JWT-based authentication

- Role-based access control

- Email verification and password reset workflows

### 🗂️ File and Content Management

- Upload and organize files (photos, videos, notes)

- Amazon S3 for scalable file storage

- Support for metadata and versioning

### 👥 Collaborative Sharing

- Add collaborators with view/edit permissions

- WebSocket-powered real-time folder sharing

### ✍️ Notes with Live Editing

- Real-time text collaboration using WebSockets (like Google Docs)

- Optimized for low latency and synchronization

### 📈 Rate Limiting & Account Lockout

- IP + account-level rate-limiting

- Progressive lockout mechanism after consecutive failed logins

### 🛡️ Security Best Practices

- Input sanitization and validation

- Helmet for secure HTTP headers

- Rate limiting and brute-force protection

- Environment variable encryption (dotenv + secure secrets)

## Local setup
### 📦 PostgreSQL Setup
- Download and install PostgreSQL from the official website or use your system’s package manager.
- During installation or via terminal/pgAdmin, create a superuser with a secure password.
- Once the user is set up, create a new database for the project:

### ☁️ AWS S3 Bucket Setup
- Sign up or log in at https://aws.amazon.com
  
- Create a New S3 Bucket
  - Navigate to S3 in the AWS Console.
  - Click Create Bucket.
  - Set a unique bucket name and select your region.
  - Configure permissions to allow only authenticated access (private by default is recommended).

- Find your region
  - Your region identifier (e.g., us-east-1, ap-south-1) will be shown in the bucket dashboard. You'll need this for your .env config

create .env file and set the variables and their values
```env
USER = 
PASSWORD = 
DATABASE = 
PORT = 

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=

ACCESS_SECRET = 
REFRESH_SECRET = 
```

## schema diagram
<img src="/collect-schema.png" width="780" height="450">

```
https://drawsql.app/teams/tcs-56/diagrams/collect-schemas
```
