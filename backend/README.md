# Movie Search Backend

A production-ready movie search backend built with Node.js, Express, and MongoDB.

## Features

- **CRUD Operations**: Create, Read, Update, Delete movies.
- **Data Validation**: Ensures data integrity.
- **Error Handling**: Centralized error management.
- **Logging**: Tracks application behavior.
- **Security Enhancements**: Protects against common vulnerabilities.
- **Testing**: Ensures reliability with automated tests.

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js installed. [Download Node.js](https://nodejs.org/)
- **MongoDB**: You can use a local MongoDB instance or a cloud service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/mankal-27/movieSearch.git
   cd movieSearch/backend

**Generating a JWT Secret using Base64**

Here's a Node.js command to generate a random 256-bit JWT secret and encode it using base64:

```bash
node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"