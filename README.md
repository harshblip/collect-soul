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

A collaborative content-sharing backend architecture built with scalability, security, and real-time performance at its core.

> Checkout the workflow of the [backend](https://whimsical.com/AssHGnjcEBEoucSVXDV4LB)

## ✨ Features

- **Secure auth** 🐱‍👤😏 - w/ automatic token refreshing (coded jwt, pretty basic) on select (*remember me*) with rate limiting
  
- **Progressive account lockout** 🔐 - your account gets locked for more and more time the more you enter wrong password 🙂
  
- **Interact with files** 📸 - star, delete, recover, add to folders, lock them, download them. you can do so much oh my goodddd
  
- **Infinitely nested folders** 📂 - create folders under folders under folders, lock them or delete them
  
- **Trigram search**🔎 - leveraging ```pg_trgm``` extention for super fast db level trigram matching search results as you type
  
- **Using SQL's arsenal** - unified table, normalizzed schema, CTE's for data retrieval, btree/gin indexes for fast lookups and sorting 😎, using triggers for automatic(😯) audit trails and consistency

## System Architecture
<img src="/public/backendArch.png" alt="Backend Arch">

Here's an high-level architecture of how this backend works 😁

## Implementation details
### Auth

  - **Auto-refreshing tokens**
    
    - which means the jwt access token gets replaced by an unexpired refresh token making it seamingly smooth experience for user. not requiring to logut and login again
      
    - this happens only when user sends ```true``` for ```remember me``` option from frontend (which basically remembers it by not expiring the auth token)
  - **Progressive Account Lockout**
    
    - Incase any unknown human tries to sneak in to your account trying multiple times (wrong password) he will get cooked with the account getting locked.
      
    - the account gets locked for a specific interval of time initially and then as the number of wrong passwords increases - lockout time increases. muhahahhhahaha
### Files

  - **Trash/recover files**
    
    - with everything being inspired from Google Drive itself. this feature also mimics it.
      
    - you delete a file, it doesn't directly erase from db but goes to trash
      
    - the trash keeps the files for 30dys and then periodically deletes it.
      
    - you can recover any file from trash before that
      
  - **Small utilities to files**
    
    - star -> star a file which is important to you and be able to see it separately in other tab
      
    - delete
      
    - lock a file - lock your image with yo girlfriend so that nobody else sees it with encrypted passwords
      
    - add multiple files to folders
  - **Using pre-signed URLs**
    - not just using envs and using aws sdk for uploading (noob)
    - using a temporary pre-signed url received from s3 and uploading files through axios
### Folders

  - **Lock folders**
    
  - **Nested folders**
    
    - create folders under folders under folders
      
    - ```myfamily/myhome/mybrother/brother.jpg```

### Search
<img src="/public/fuzzy-search.jpeg" alt="Search flow">
  
  - **DB level fuzzy matchmaking**
    
    - using ```gin``` indexes for lightning fast query results even in large datasets
      
    - using ```pg_trgm``` extension of postgres. enabling db level fuzzy matchmaking of words
      
    - covering the case when you type "maptop" instead of "laptop" or "my borpther" instead of "my brother"
      
  - **Super strong multi-filter search**
    
    - couldn't keep this normal too
      
    - search your queries along side with multiple filters
      
    - streamline your search based on size, dateCreated, type, starred ornot.
      
  - **Search-as-you-type with ranked suggestions**
    
    - the results shown aren't just random result set but ranked from most relevant to least relevant based on the similarlty of the text.
      
    - it divides the text into a set of trigrams to calculate edit distance for the closest word. so words shown match what you are thinking
### Papa Postgres
  - **unified, normalized schema**
    - created unified signle table with enums for all types of media
    - 3NF normalized to the core 
    - columns indexed for faster retrieval with no wasted traversals
  - **using CTE's and triggers**
    - Instead of stacking subqueries inside subqueries, used common table expressions ```(WITH ... AS (...))``` to break big queries into smaller, understandable steps. Makes queries easy to read, debug, and maintain.
    - cte's are cool
    - For things like fetching files with folders, or combining filters + search results, CTEs let us chain logic together in one SQL call. That means fewer round-trips to the database and faster responses.
    - utlized triggers. db on autopilot. somethings in the tables needed to be updated as soon as other fields were changing. instead of writing multiple ```UPDATE``` queries just stick triggers to those columns. fires when condition hits
- 
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
