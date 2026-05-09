// app/ houses application-level setup: providers, root layout, app-wide context wiring.
// Currently the root component lives in src/App.jsx — it will move here in a future step
// once the feature migration phase begins.
//
// Future shape:
//   app/
//   ├── App.jsx          ← root component (moved from src/App.jsx)
//   ├── providers.jsx    ← composed provider tree
//   └── router.jsx       ← router configuration (moved from src/routes/)
