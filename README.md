# Study Group Finder

A single-page web application where students can create and discover study groups, join the ones that fit their schedule, and manage the groups they organize.

**Live demo:** https://study-group-finder-three-zeta.vercel.appgit add README.md (Firebase backend, so no server warm-up is needed)
**Repository:** https://github.com/Deyvis-Gushterov/study-group-finder

---

## Functional Guide

### 1. Project Overview

**Application Name:** Study Group Finder

**Application Category / Topic:** Community / Booking-style platform for student study groups

**Main Purpose:** Study Group Finder helps students find people to study with. Anyone can browse the available study groups, and registered users can create their own group, join other groups, and manage the groups they organize. It solves the problem of studying alone or not knowing who else is preparing for the same subject, by putting groups, schedules and locations in one place.

### 2. User Access & Permissions

**Guest (Not Authenticated)**
- **Available pages / routes:** Home (`/`), Catalog (`/groups`), Group Details (`/groups/:id`), Login (`/login`), Register (`/register`), and a 404 page for unknown URLs.
- **Public data shown:** the list of all study groups and, for each group, its title, subject, description, schedule, location, organizer name and number of members. A guest sees a "Log in to join this group" prompt instead of action buttons.

**Authenticated User**
- **Main sections / pages:** everything a guest can see, plus Create Group (`/groups/create`). Login and Register are no longer reachable; the user is redirected to the catalog.
- **Details pages:** on a group's page, a user who is not the author sees a **Join group** / **Leave group** button. The author sees **Edit** and **Delete** buttons and a note that they organize the group.
- **Create / Edit / Delete actions:** any logged-in user can create a group. Only the author of a group can edit or delete it. This is enforced in the UI and again by Firestore security rules.

### 3. Authentication & Session Handling

**Authentication Flow**
- **On app load:** the `AuthProvider` subscribes to Firebase's `onAuthStateChanged`. While Firebase restores the session, a `loading` flag is true and guarded routes show "Loading..." instead of redirecting.
- **Checking status:** components read `user` and `isAuthenticated` from the context through the `useAuth` hook.
- **Login / registration:** on success the user is stored in context and redirected to the catalog. During registration the chosen username is saved as the Firebase `displayName`.
- **Logout:** `signOut` is called, the context user becomes `null`, the navbar switches back to Login / Register, and the user is sent to the home page.

**Session Persistence**
- **How the session is stored:** Firebase Authentication keeps the session in the browser, and the Context API shares the current user across the app.
- **Automatic login after refresh:** when the page reloads, `onAuthStateChanged` fires with the saved user, so the user stays logged in without signing in again.

### 4. Routing Structure

**Route Guards Logic**
- `GuestRoute` wraps Login and Register and redirects logged-in users to `/groups`.
- `PrivateRoute` wraps Create Group and Edit Group and redirects guests to `/login`.
- Catalog, Details and Home are outside both guards, so guests can read them.
- Both guards wait for the auth `loading` state before deciding, to avoid wrongly redirecting a logged-in user on refresh.

**Main Routes**

| Route | Page | Access |
|---|---|---|
| `/` | Home | public |
| `/groups` | Catalog | public |
| `/groups/:id` | Details | public |
| `/groups/create` | Create group | logged-in only |
| `/groups/:id/edit` | Edit group | author only |
| `/login` | Login | guests only |
| `/register` | Register | guests only |
| `*` | Page not found | public |

There are 7 main pages plus the 404 page.

**Nested & Parameterized Routes**
- **Nested routing:** yes. The guards are layout routes (`GuestRoute`, `PrivateRoute`) that render their child routes through `<Outlet />`.
- **URL parameters:** `/groups/:id` (Details) and `/groups/:id/edit` (Edit), read with `useParams`.

### 5. List → Details Flow

**Catalog / List Page**
- **Data displayed:** every study group as a card with title, subject, schedule, location, number of members and organizer, newest first.
- **Interaction:** the user clicks **View details** on a card. The catalog has no filter, sort or search yet; this is listed under future improvements.

**Details Page**
- **Navigation:** each card contains a React Router `<Link>` to `/groups/<id>`. After creating or editing a group, `useNavigate` takes the user to its details page.
- **Data received via route parameters:** the group's `id`, read with `useParams`. The page uses it to fetch that single group from Firestore.

### 6. Data Source & Backend

**Backend Type:** real backend, **Firebase**: Firebase Authentication for users and Cloud Firestore for data. Both are hosted by Google, so there is no separate server to deploy, no cold starts, and the data persists between visits. Access rules are enforced by Firestore security rules.

### 7. Data Operations (CRUD)

The collection is `groups` (separate from the users managed by Firebase Auth).

**Create (POST)**
The logged-in user fills in the Create Group form (title, subject, description, location, schedule). `createGroup` adds a document to Firestore with the user's ID as `ownerId`, their name as `ownerName`, themselves as the first member, and a server timestamp. The user is then redirected to the new group's page.

**Read (GET)**
- The Catalog and the Home page call `getAllGroups()` and display the results (the Home page shows the three newest).
- The Details and Edit pages call `getGroupById(id)` to load one group.

**Update (PUT/PATCH)**
- The author clicks **Edit** on the Details page. The shared form is pre-filled with the current values, and on save `updateGroup` updates the document.
- After saving, the user is redirected to the details page, which reloads the data, so the new values appear immediately.
- Joining and leaving also update the group (`arrayUnion` / `arrayRemove` on `members`), and the page updates its member count right away.

**Delete**
- The author clicks **Delete** on the Details page and confirms in a dialog. `deleteGroup` removes the document.
- The user is redirected to the catalog, which no longer lists that group.

### 8. Forms & Validation

**Forms Used**
1. Register (username, email, password, confirm password)
2. Login (email, password)
3. Create Group and Edit Group (one shared form: title, subject, description, location, schedule)

All forms use controlled inputs and React synthetic events (`onChange`, `onSubmit`).

**Validation Rules**
- **Username (Register):** required, at least 3 characters.
- **Email (Register and Login):** must match a valid email format.
- **Password (Register):** at least 6 characters, and the confirmation field must match it. This field has multiple rules.
- **Title (Group form):** at least 3 characters.
- **Description (Group form):** at least 10 characters.
- **Subject, Location, Schedule (Group form):** required.

Errors appear under the relevant field, and the form is not submitted until it is valid. Submit buttons are disabled while a request is in progress.

### 9. React-Specific Techniques

**Hooks & Component Lifecycle**
- **Hooks used:** `useState` (form values, errors, loading, data), `useEffect` (data loading and auth subscription), `useContext` (via the custom `useAuth` hook), `useParams`, `useNavigate`.
- **Mount / update / unmount example:** the Details page loads its group in a `useEffect`. It runs on mount, runs again when the `id` parameter changes (update), and its cleanup function sets a `cancelled` flag on unmount so no state is set after the user has left the page. The `AuthProvider` likewise subscribes to `onAuthStateChanged` on mount and unsubscribes on unmount.

**Context API**
`AuthContext` shares the current user, `isAuthenticated`, the `loading` flag, and the `register`, `login` and `logout` functions. It is consumed by the Navbar, both route guards, the Login and Register pages, and the Home, Details, Create and Edit pages.

**Component Styling**
Components are styled with external CSS files in `src/styles/` (`auth.css`, `navbar.css`, `groups.css`, plus the global `index.css`).

### 10. Typical User Flow

1. A visitor opens the app, browses the catalog and opens a group to read its details.
2. They register an account (or log in) and are redirected to the catalog.
3. They click **Join group** on a group they like, or **Create Group** to organize one, filling in the subject, place and schedule.
4. They can later return to a group they created to **edit** its details or **delete** it, and **log out** when finished.

### 11. Error & Edge Case Handling

- **Authentication errors:** Firebase error codes are translated into readable messages, for example wrong credentials, email already in use, weak password, invalid email, too many attempts and network failure. They show in a banner above the form.
- **Network or data errors:** every page that loads data shows a loading state first and a clear error message if the request fails. Failed create, edit, delete, join and leave actions show an error banner instead of crashing.
- **Empty or missing data:** an empty catalog shows "No groups yet", opening a group that does not exist shows "Group not found" with a link back, and unknown URLs show a 404 page. A user who is not the author cannot open the edit page and is redirected back to the group.

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
