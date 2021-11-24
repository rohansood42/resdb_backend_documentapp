# resdb_backend_documentapp

This is an API server for the document application built on top of ResilientDB.

### Running the API Server

Navigate inside the API `npm start`

### API Documentation

#### Login/Register API

POST - `/auth/register` - Register a new user
Request Body -

```
{
"first_name": String,
"last_name": String,
"email": String,
"password": String
}
```

POST - `/auth/login` - Login a user and get JWT token to access other APIs
Request Body -

```
{
"email": String,
"password": String
}
```

### Authorization token needed for all the other APIs, header `x-access-token: ''` needs to be passed.

#### User API

GET - `/users/all` - Get all the users registered in the app

GET - `/auth/search?id=""` OR `/auth/search?email=""` - Get a particular user with email of ObjectId of the user

#### Document API

Request body should be sent in multipart/form-data

POST - `/document/upload` - Upload a new document
Request Body -

```
{
"file": Upload a file here,
"name": String,
"associated_users" = Array of Strings of ObjectId,
"document_hash" : String
}
```

PATCH - `/document/upload` - Modify the document
Request Body -

```
{
"file": Upload a file here,
"_id": String,
"name": String,
"associated_users" = Array of ObjectID,
"document_hash" : String
}
```

PUT - `/document/data` - Edit the data for the particular document
Request Body -

```
{
"_id": String,
"name": String,
"associated_users" = Array of ObjectID
}
```

GET - `/document/download?id=""` - Download a particular file

GET - `/document/user` - Get all the documents for a particular user

POST - `/document/verify` - Get all the documents for a particular user

```
{
"_id": String,
"document_hash": String,
}
```

POST - `/document/approve` - Get all the documents for a particular user

```
{
"_id": String,
}
```
