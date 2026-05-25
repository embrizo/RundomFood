# Random Food App — Requirements

> Personal web app that randomly picks meals to cook at home or nearby restaurants, with Google login and spin wheel animation.

---

## Overview

| Item | Detail |
|------|--------|
| **Type** | Web application |
| **Audience** | Personal use |
| **Main feature** | Random food picker (meals + restaurants) |
| **Authentication** | Google login (OAuth 2.0) |

---

## Core Features (Must Have)

### 1. Google Authentication
- Sign in with Google (OAuth 2.0)
- Session persisted across visits
- User profile (name, avatar) displayed after login
- Sign out button

### 2. Random Food Picker
- One-tap button to pick a random item
- Toggle between two modes: **Meal at home** / **Restaurant**
- Result displayed with name, description, and optional image

### 3. Meals at Home
- Built-in list of common meal ideas
- User can add their own custom meals
- Random selection from the active pool

### 4. Restaurant Suggestions
- Pull nearby restaurants using Google Places API
- Display name, cuisine type, rating, and distance
- Random pick from results

---

## Selected Features

### 5. Spin Wheel Animation
- Animated wheel that spins and lands on a random food item
- All active items from the custom list appear on the wheel
- Smooth, satisfying animation before revealing the result

### 6. Save Favorites
- Heart/bookmark any meal or restaurant result
- Dedicated Favorites page to browse saved items
- Remove from favorites at any time

### 7. Diet Filters
- Filter options include: Vegan, Vegetarian, Halal, Gluten-free, Dairy-free
- Filters apply to both meal suggestions and restaurant results
- Preferences saved per user account

### 8. Custom Food List (Input)
- Add, edit, and delete custom food items
- Each item can include: name, category, diet tags, notes
- Items appear on the spin wheel and in random picks

---

## Bonus Features (Nice to Have)

### 9. History Log
- Record of every food item picked (date + result)
- View history from the past 7 or 30 days
- Option to clear history

### 10. Location-Aware Restaurants
- Auto-detect user location (with permission)
- Filter restaurants by distance (e.g. within 1 km, 5 km)
- Map link to the selected restaurant

---

## Pages / Screens

| Page | Description |
|------|-------------|
| **Login** | Google sign-in button, app name and tagline |
| **Home / Spin** | Spin wheel + mode toggle (meal / restaurant) |
| **My Food List** | Add, edit, remove items from the pool |
| **Favorites** | Saved meals and restaurants |
| **Settings** | Diet preferences, location, account management |

---

## Recommended Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | Next.js (React) |
| Styling | Tailwind CSS |
| Authentication | Firebase Authentication (Google OAuth) |
| Database | Firestore (NoSQL) |
| Restaurant data | Google Places API |
| Hosting | Vercel |

---

## Data Models

### User
```json
{
  "uid": "string",
  "name": "string",
  "email": "string",
  "avatar": "string (URL)",
  "dietFilters": ["vegan", "halal"],
  "createdAt": "timestamp"
}
```

### Custom Food Item
```json
{
  "id": "string",
  "userId": "string",
  "name": "string",
  "category": "meal | restaurant",
  "dietTags": ["vegan", "gluten-free"],
  "notes": "string",
  "createdAt": "timestamp"
}
```

### Favorite
```json
{
  "id": "string",
  "userId": "string",
  "itemName": "string",
  "type": "meal | restaurant",
  "savedAt": "timestamp"
}
```

### History Entry
```json
{
  "id": "string",
  "userId": "string",
  "itemName": "string",
  "type": "meal | restaurant",
  "pickedAt": "timestamp"
}
```

---

## Development Phases

### Phase 1 — Core (MVP)
- [ ] Google login
- [ ] Random picker (meal mode)
- [ ] Basic spin wheel animation
- [ ] Custom food list (add/remove)

### Phase 2 — Restaurants + Filters
- [ ] Google Places API integration
- [ ] Restaurant random picker
- [ ] Diet filter UI and logic

### Phase 3 — Personal Data
- [ ] Save favorites
- [ ] History log
- [ ] Location-aware restaurant filter

### Phase 4 — Polish
- [ ] Improve spin wheel animation
- [ ] PWA support (installable on mobile)
- [ ] Dark mode

---

*Last updated: May 2026*
