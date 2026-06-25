- [x] Implement base64 image handling (FileReader) in AdminCarFormPage for both create + edit
- [x] Remove Firebase Storage upload logic from AdminCarFormPage (drop uploadCarImage usage)

- [ ] Remove Firebase Storage imports (getStorage/ref/uploadBytes/getDownloadURL) from codebase where only used for car images
- [ ] Remove uploadCarImage function if no longer used by car forms
- [ ] Remove unused storage import(s) from src/lib/firebase.ts if no longer required


- [ ] Remove uploadCarImage function if no longer used by car forms
- [x] Ensure edit keeps existing image_url when no new image is selected
- [x] Run typecheck/build/tests (npm run build / npm test or npm run lint if available)



