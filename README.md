# Study Group Finder

A single-page web application where students can create and discover study groups, join the ones that fit their schedule, and manage the groups they organize.

**Live demo:** _<paste your Vercel link here>_
**Repository:** https://github.com/Deyvis-Gushterov/study-group-finder

---

## Functional Guide

> TODO: replace this section with the completed course Functional Guide template.

---

## Features

**Guests (not logged in)**
- Browse the catalog of all study groups
- Open a group to see its details: subject, description, schedule, location, organizer and member count
- Register or log in

**Logged-in users**
- Create a new study group
- Edit or delete their own groups (only the author can do this)
- Join or leave groups created by other users
- Log out

**Access rules**

| Page | Guest | Logged-in user |
|---|---|---|
| Home, Catalog, Details | yes | yes |
| Login, Register | yes | redirected to the catalog |
| Create group, Edit group | redirected to Login | yes (Edit: author only) |

## Pages and routes

| Route | Page | Access |
|---|---|---|
| `/` | Home | public |
| `/groups` | Catalog (list of all groups) | public |
| `/groups/:id` | Details of one group | public |
| `/groups/create` | Create group | logged-in only |
| `/groups/:id/edit` | Edit group | logged-in, author only |
| `/login` | Login | guests only |
| `/register` | Register | guests only |

## Tech stack

- **React 19** with **Vite**
- **React Router** for client-side routing
- **Firebase Authentication** (email and password)
- **Cloud Firestore** as the database
- Plain CSS files for styling
- Hosted on **Vercel** (frontend); Firebase provides the hosted backend

## Architecture

```
src/
  firebase.js              Firebase initialization (auth, db)
  context/
    AuthContext.jsx        Auth state shared across the app (user, register, login, logout)
  hooks/
    useAuth.js             Shortcut hook for the auth context
  services/
    groupService.js        All Firestore calls for groups (CRUD, join, leave)
  components/
    Navbar.jsx             Navigation, shows links depending on auth state
    PrivateRoute.jsx       Route guard: logged-in users only
    GuestRoute.jsx         Route guard: guests only
    GroupCard.jsx          Card shown in the catalog
    GroupForm.jsx          Shared, validated form used by Create and Edit
    Spinner.jsx            Loading state
    ErrorMessage.jsx       Error state
  pages/                   One component per route
  styles/                  External CSS files
```

**Key design decisions**
- **Context API** holds the logged-in user. `onAuthStateChanged` runs in a `useEffect`, subscribing on mount and unsubscribing on unmount, so the session survives page refreshes.
- **Service layer:** components never call Firestore directly, they call functions from `groupService.js`.
- **Reusable form:** Create and Edit share one controlled `GroupForm` component with validation.
- **Loading and error states:** every data-fetching page shows a loading indicator and a readable error message, and avoids setting state after unmount.

## Data model

**`groups/{groupId}`**

| Field | Description |
|---|---|
| `title`, `subject`, `description`, `location`, `schedule` | Group information |
| `ownerId`, `ownerName` | Author of the group |
| `members` | Array of user IDs who joined |
| `createdAt` | Server timestamp |

## Security

Data access is enforced by Firestore security rules, not only by hiding buttons in the UI:
- Anyone can read groups.
- Only logged-in users can create groups, and `ownerId` must be their own ID.
- Only the author can edit or delete a group.
- Any logged-in user can join or leave, but can only add or remove their own ID in `members`.

## Getting started

**Prerequisites:** Node.js 18 or newer and a Firebase project with Email/Password authentication and Firestore enabled.

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/Deyvis-Gushterov/study-group-finder.git
   cd study-group-finder
   npm install
   ```

2. Create a `.env` file in the project root with your Firebase web app config:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Then open the address printed in the terminal.

4. Create a production build:
   ```bash
   npm run build
   ```

## Deployment

- **Frontend:** deployed on Vercel. The six `VITE_FIREBASE_*` variables are set in the Vercel project settings, and `vercel.json` rewrites all routes to `index.html` so refreshing any page works.
- **Backend:** Firebase Authentication and Firestore are hosted by Google, so there is no separate server to deploy and no cold starts. Data persists between visits.

## Future improvements

- A live group chat for members of each group
- Owner announcements on each group page
- A "My groups" page
- Search and filtering in the catalog
