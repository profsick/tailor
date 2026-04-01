# Daily Run Checklist (Tailor Project)

Use this every time you open or close the project.

## 1) Open project

1. Open VS Code folder:
   - `C:\Users\acer\Documents\GitHub\tailor`
2. Open terminal in VS Code.
3. Start backend from project root:
   - `npm start`
4. Open app in browser:
   - `http://localhost:3001`
5. Optional health check:
   - `http://localhost:3001/api/health`

## 2) Close project safely

1. In terminal where server is running, press `Ctrl + C`.
2. If asked `Terminate batch job (Y/N)?`, press `Y`.
3. Close browser tab and VS Code.

## 3) If startup fails

### Error: `Could not read package.json`

- You are in the wrong folder.
- Run:
  - `cd C:\Users\acer\Documents\GitHub\tailor`
  - `npm start`

### Error: `EADDRINUSE` (port already in use)

- Another app is using the same port.
- Quick fix: change port in `.env` and restart.
  - Example: `PORT=3002`

### Error: MongoDB connection fails

- Check `.env` exists in backend folder.
- Confirm `MONGODB_URI` is correct.
- Confirm Atlas:
  - Database user is active
  - Network Access allows your IP (or `0.0.0.0/0` for testing)

## 4) Important reminders

- Orders are stored in MongoDB Atlas (cloud), so they stay after restart.
- Cart and temporary customer details are stored in browser localStorage.
- Never share `.env` publicly (it contains DB credentials).

## 5) Optional convenience

One-click scripts are now available from project root:

- `npm run dev` (auto-restart on code changes)
- `npm run install:backend` (install backend dependencies)
