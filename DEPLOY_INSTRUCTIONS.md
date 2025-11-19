# DEPLOY INSTRUCTIONS

## The changes ARE in the code, but NOT deployed yet!

All the fixes have been applied to the source code and built into the `dist/` folder, but they need to be deployed to Firebase for you to see them.

## To Deploy:

1. Open your terminal in the project directory

2. Run:
```bash
firebase deploy --only hosting
```

OR if you're not logged in:

```bash
firebase login
firebase deploy --only hosting
```

## What Will Be Fixed After Deploy:

✅ Bug report modal will have FULL background blur (no overlap at bottom)
✅ Chat page buttons will be BLUE (not red)
✅ ALL buttons and inputs will be ROUNDED (Material Design style)
✅ Support chat will have proper z-index layering

## If You Don't Want to Use Firebase:

You can run locally with:
```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

The local dev server will show the updated code immediately.
