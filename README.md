# Express Product API with Caching

A layered Express.js application that provides product APIs with an in-memory caching mechanism.

The application is structured using a clean layered architecture:

```text
Route → Middleware → Controller → Service → Database
```

It implements caching for product retrieval endpoints, cache invalidation for data-modifying requests, and a **1-minute Time To Live (TTL)** for cached data.

---

## 📌 Features

* RESTful Product API using Express.js
* Layered application architecture
* In-memory caching
* Caching for:

  * `GET /products`
  * `GET /products/:id`
* Cache middleware
* Cache HIT/MISS response headers
* 1-minute cache TTL
* Automatic cache expiration
* Automatic cache invalidation after successful:

  * `POST`
  * `PUT`
  * `PATCH`
  * `DELETE`
* Separation of routes, controllers, services, database, and middleware

---

## 📂 Project Structure

```text
project-root/
│
├── routes/
│   └── productRoutes.js
│
├── controllers/
│   └── productController.js
│
├── services/
│   └── productService.js
│
├── database/
│   └── productDatabase.js
│
├── middleware/
│   ├── cacheMiddleware.js
│   └── cacheInvalidation.js
│
├── app.js
├── package.json
├── package-lock.json
└── README.md
```

### Folder Responsibilities

#### `routes/`

Defines the API endpoints and connects them to the appropriate middleware and controllers.

```text
Route → Middleware → Controller
```

#### `middleware/`

Contains reusable middleware responsible for:

* Checking the cache
* Returning cached responses
* Detecting cache HIT/MISS
* Invalidating cache entries after data modification

#### `controllers/`

Handles HTTP requests and responses.

Controllers receive requests from the routes and communicate with the service layer.

#### `services/`

Contains the application's business logic.

The service layer communicates with the database layer and is responsible for fetching and modifying product data.

#### `database/`

Contains the data storage and database-related operations.

The application uses this layer instead of allowing controllers to directly access stored data.

---

# 🔄 Request Flow

The application follows the required layered structure:

```text
Client
   │
   ▼
Route
   │
   ▼
Middleware
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Database
```

For example, a request to:

```http
GET /products
```

follows:

```text
GET /products
      ↓
Product Route
      ↓
Cache Middleware
      ↓
Product Controller
      ↓
Product Service
      ↓
Database
```

---

# ⚡ Caching

Caching is implemented for the following GET endpoints:

```http
GET /products
GET /products/:id
```

The cache stores the response data along with the time at which the entry was created.

A conceptual cache entry looks like:

```javascript
{
  data: [...],
  createdAt: 1727890000000
}
```

---

# ⏱️ Cache TTL

The application uses a **1-minute TTL**.

```text
TTL = 60 seconds
```

Whenever a cached value is requested, the application checks how old the cache entry is.

Conceptually:

```javascript
const age = Date.now() - cacheEntry.createdAt;

if (age < 60 * 1000) {
    // Cache is valid
} else {
    // Cache has expired
}
```

### Cache behavior

If the cache entry is less than 1 minute old:

```text
Request
   ↓
Cache exists?
   ↓
Is it less than 1 minute old?
   ↓
YES
   ↓
Return cached data
```

If the cache entry is older than 1 minute:

```text
Request
   ↓
Cache exists?
   ↓
Is it less than 1 minute old?
   ↓
NO
   ↓
Fetch latest data from database
   ↓
Update cache
   ↓
Return fresh data
```

Expired cache entries are **never returned to the client**.

---

# 🎯 Cache HIT and MISS Headers

The API provides headers indicating whether the response was served from the cache.

### Cache HIT

When valid cached data is available:

```http
X-Cache: HIT
```

This indicates that the response was served directly from the cache.

### Cache MISS

When cached data is unavailable or has expired:

```http
X-Cache: MISS
```

This indicates that fresh data was fetched and the cache was updated.

---

# 🔄 Cache Invalidation

Whenever stored product data is successfully modified, potentially stale cache entries are removed.

Cache invalidation is triggered after successful:

```http
POST
PUT
PATCH
DELETE
```

For example:

```text
POST /products
      ↓
Product created successfully
      ↓
Invalidate product caches
```

Similarly:

```text
PUT /products/:id
PATCH /products/:id
DELETE /products/:id
```

will invalidate the relevant cache entries.

This prevents the application from returning outdated product information.

---

# 🧹 Why Cache Invalidation Is Required

Suppose the following request is made:

```http
GET /products
```

The response is cached.

Later, a product is updated:

```http
PUT /products/5
```

If the cache is not invalidated, another request to:

```http
GET /products
```

could return the old cached product.

Therefore, after a successful modification:

```text
POST
PUT
PATCH
DELETE
      ↓
Invalidate cache
      ↓
Next GET request
      ↓
Database
      ↓
Fresh data stored in cache
```

---

# 📡 API Endpoints

## Get All Products

```http
GET /products
```

Returns all available products.

Possible cache header:

```http
X-Cache: HIT
```

or:

```http
X-Cache: MISS
```

---

## Get Product by ID

```http
GET /products/:id
```

Returns a specific product.

Example:

```http
GET /products/1
```

---

## Create Product

```http
POST /products
```

Creates a new product.

After successful creation, relevant cached product data is invalidated.

---

## Update Product

```http
PUT /products/:id
```

Updates an existing product.

After successful modification, relevant cached data is invalidated.

---

## Partially Update Product

```http
PATCH /products/:id
```

Partially updates an existing product.

After successful modification, relevant cached data is invalidated.

---

## Delete Product

```http
DELETE /products/:id
```

Deletes an existing product.

After successful deletion, relevant cached data is invalidated.

---

# 🧠 Cache Lifecycle

The complete caching lifecycle is:

```text
                 ┌─────────────────┐
                 │   GET Request   │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Check Cache     │
                 └────────┬────────┘
                          ↓
                ┌───────────────────┐
                │ Cache exists?     │
                └───────┬───────────┘
                    YES │     │ NO
                        ↓     ↓
                 ┌──────────┐ ┌──────────────┐
                 │ Check TTL│ │ Cache MISS   │
                 └────┬─────┘ └──────┬───────┘
                      ↓               ↓
              ┌──────────────┐  ┌─────────────┐
              │ < 1 minute?  │  │  Database   │
              └──────┬───────┘  └──────┬──────┘
                 YES │   │ NO           │
                     ↓   ↓              ↓
              ┌────────┐ ┌──────────────┐
              │  HIT   │ │ Fetch Fresh  │
              └────────┘ │    Data      │
                         └──────┬───────┘
                                ↓
                         ┌──────────────┐
                         │ Update Cache │
                         └──────────────┘
```

---

# 🛠️ Technologies Used

* **Node.js**
* **Express.js**
* **JavaScript**
* **In-memory caching**
* **REST API architecture**

---

# 🚀 Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Navigate into the project:

```bash
cd <PROJECT_FOLDER>
```

Install dependencies:

```bash
npm install
```

---

# ▶️ Running the Application

Start the application using:

```bash
npm start
```

If the project uses a development script:

```bash
npm run dev
```

The API will typically be available at:

```text
http://localhost:3000
```

---

# 🧪 Testing the API

The API can be tested using:

* Postman
* Thunder Client
* VS Code REST Client
* cURL

Example:

```bash
curl http://localhost:3000/products
```

To test a specific product:

```bash
curl http://localhost:3000/products/1
```

Check the response headers to verify:

```text
X-Cache: MISS
```

On a subsequent request within one minute:

```text
X-Cache: HIT
```

After the TTL expires, the request should again produce:

```text
X-Cache: MISS
```

and retrieve fresh data from the database.

---

# ✅ Requirements Implemented

| Requirement                 | Implementation |
| --------------------------- | -------------- |
| `routes` folder             | ✅              |
| `controllers` folder        | ✅              |
| `services` folder           | ✅              |
| `database` folder           | ✅              |
| `middleware` folder         | ✅              |
| GET `/products` caching     | ✅              |
| GET `/products/:id` caching | ✅              |
| Cache middleware            | ✅              |
| Cache HIT header            | ✅              |
| Cache MISS header           | ✅              |
| 1-minute TTL                | ✅              |
| Store cache creation time   | ✅              |
| Expired cache handling      | ✅              |
| POST cache invalidation     | ✅              |
| PUT cache invalidation      | ✅              |
| PATCH cache invalidation    | ✅              |
| DELETE cache invalidation   | ✅              |
| Layered request flow        | ✅              |

---

# 📚 Workshop Requirement

This project was developed as part of the Express.js caching workshop.

The primary objective is to demonstrate:

1. Layered application architecture
2. Middleware-based caching
3. Cache HIT/MISS handling
4. TTL-based cache expiration
5. Cache invalidation
6. Separation of application responsibilities

---

## 👨‍💻 Author

**Kanishq Arora**

B.Tech CSE — AI & ML

---

## 📄 Workshop Submission

The completed project repository can be submitted through the workshop submission form.

**Submission Form:**
https://docs.google.com/forms/d/e/1FAIpQLSeKyCbxS_85GbVgAzPONQDqMU3eXNU2TV4Nc_VxFtSZFfJq0g/viewform
