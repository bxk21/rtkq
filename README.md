# Redux Toolkit Query Login System

This project uses RTK-Q to implement API calls and caching of data.
It uses the Google Sheets API to write data to a faux database.

This project is hosted [here](https://sheetsdatabaseapi.vercel.app/) on Vercel

# Tech Stack

The Frontend is written with React Toolkit Query and NextJS: Node, React, Redux, Typescript.

The API Layer is written in NextJS. The Database is a Google Sheets document, accessed with google-spreadsheet and google-auth-library

# Features

## Login

User Accounts are created and logged in with a Username and Password.

In the backend, Passwords themselves aren't saved, but individually salted and hashed.

## Tokens

User Sessions are created when a User Logs In. Every Session has a userId, token, and tokenCreated.

Tokens are sent in the request header of every user API.

Tokens are assigned in the response header of the Login API and returned in every user API. The returned Token may be the same as the one given in the request, or may be a newly generated one to refresh timeouts.
