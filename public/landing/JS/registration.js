
// IMPORTANT: Add your Firebase project configuration to this file.
// Replace the placeholder values with your actual Firebase project configuration.
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBdnBuP7rRqc1p_F3Sms2lvQGqCUshp1aI",
    authDomain: "iste-fadcc.firebaseapp.com",
    projectId: "iste-fadcc",
    storageBucket: "iste-fadcc.firebasestorage.app",
    messagingSenderId: "708189772352",
    appId: "1:708189772352:web:213e2fc3466136394e9da5",
    measurementId: "G-83BTDXW86M"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const db = firebase.firestore();

const registrationForm = document.getElementById("registration-form");
const submissionStatus = document.getElementById("submission-status");

// Google Sheets Script URL (Replace with your deployed script URL)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxiX1yhhjL6dgOgKsS4m9Kft5JUx1Mvsnibh6xM8TwxWmZu9hac1AgRVgQODxrQ_USx1A/exec";

registrationForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = registrationForm.name.value;
    const dob = registrationForm.dob.value;
    const year = registrationForm.year.value;
    const branch = registrationForm.branch.value;
    const phone = registrationForm.phone.value;
    const email = registrationForm.email.value;
    const membership = registrationForm.membership.value;
    const screenshotFile = registrationForm.screenshot.files[0];

    if (!screenshotFile) {
        submissionStatus.innerHTML = "<p style='color:red;'>Please upload a screenshot of the payment.</p>";
        return;
    }

    submissionStatus.innerHTML = "<p>Submitting...</p>";

    try {
        // 1. Upload screenshot to Firebase Storage
        const storageRef = storage.ref(`screenshots/${Date.now()}_${screenshotFile.name}`);
        const uploadTask = storageRef.put(screenshotFile);

        uploadTask.on("state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                submissionStatus.innerHTML = `<p>Upload is ${Math.round(progress)}% done</p>`;
            },
            (error) => {
                console.error("Error uploading screenshot:", error);
                submissionStatus.innerHTML = "<p style='color:red;'>Error uploading screenshot. Please try again.</p>";
            },
            async () => {
                // Get screenshot URL
                const screenshotURL = await uploadTask.snapshot.ref.getDownloadURL();

                // 2. Save registration data to Firestore (Backup/Admin Panel)
                const firestorePromise = db.collection("registrations").add({
                    name,
                    dob,
                    year,
                    branch,
                    phone,
                    email,
                    membership,
                    screenshotURL,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

                // 3. Save registration data to Google Sheets (Offline File)
                const formData = new FormData();
                formData.append('name', name);
                formData.append('dob', dob);
                formData.append('year', year);
                formData.append('branch', branch);
                formData.append('phone', phone);
                formData.append('email', email);
                formData.append('membership', membership);
                formData.append('screenshot url', screenshotURL); // Note: key matches sheet header (lowercase)

                const googleSheetPromise = fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: formData
                }).catch(err => console.error("Error submitting to Google Sheets:", err));

                // Wait for both to complete (optional, but good for UX)
                await Promise.all([firestorePromise, googleSheetPromise]);

                submissionStatus.innerHTML = "<p style='color:green;'>Registration successful! Data saved.</p>";
                registrationForm.reset();
            }
        );
    } catch (error) {
        console.error("Error submitting registration:", error);
        submissionStatus.innerHTML = "<p style='color:red;'>Error submitting registration. Please try again.</p>";
    }
});
