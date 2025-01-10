// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getFirestore, doc, setDoc,addDoc, getDoc, getDocs, updateDoc, deleteDoc, collection } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhG1b0gDFihO7jLZc1wBXYPSU8cx8yM2E",
  authDomain: "b2field-63952.firebaseapp.com",
  projectId: "b2field-63952",
  storageBucket: "b2field-63952.firebasestorage.app",
  messagingSenderId: "1043261302719",
  appId: "1:1043261302719:web:97b5eb6a1fe72b3721230a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// DOM Elements
const loginBtn = document.getElementById('login-btn');
const dataSection = document.getElementById('data-section');
const output = document.getElementById('output');
const saveBtn = document.getElementById('save-btn');
const deleteBtn = document.getElementById('delete-btn');
const editBtn = document.getElementById('edit-btn');
const dataInput = document.getElementById('data-input');
const dataList = document.getElementById('data-list'); // For displaying all entries

let userId = null; // To store the logged-in user's ID

// Handle Login
loginBtn.addEventListener('click', async () => {
    const loginCode = document.getElementById('login-code').value;
  
    if (loginCode) {
      const userDocRef = doc(db, "users", loginCode); // Reference to the user's document
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        // User exists, proceed
        userId = loginCode;
        output.innerHTML = `<p>Welcome back, User: ${userId}</p>`;
        dataSection.style.display = 'block'; // Show data operations section
        await loadUserData(); // Load saved data
      } else {
        // User doesn't exist, ask to create a new user
        const createNewUser = confirm("User does not exist. Would you like to create a new user?");
        if (createNewUser) {
          try {
            await setDoc(userDocRef, {}); // Create an empty user document
            userId = loginCode;
            output.innerHTML = `<p>New user created: ${userId}</p>`;
            dataSection.style.display = 'block'; // Show data operations section
            await loadUserData(); // No data to load, but ensures UI consistency
          } catch (error) {
            console.error("Error creating new user: ", error);
            alert("Failed to create new user. Please try again.");
          }
        }
      }
    } else {
      alert('Please enter a login code');
    }
  });
  

// Load All Data for the User
async function loadUserData() {
    if (!userId) return;
  
    // Reference the user's document
    const userDocRef = doc(db, "users", userId);
  
    // Reference the 'entries' subcollection
    const userEntriesRef = collection(userDocRef, "entries");
  
    const querySnapshot = await getDocs(userEntriesRef);
  
    // Clear the existing list
    dataList.innerHTML = '';
  
    querySnapshot.forEach((doc) => {
      const entry = doc.data();
      const listItem = document.createElement('li');
      listItem.textContent = `${entry.data} (ID: ${doc.id})`;
  
      // Add Edit and Delete Buttons
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', () => editSpecificEntry(doc.id));
  
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => deleteSpecificEntry(doc.id));
  
      listItem.appendChild(editButton);
      listItem.appendChild(deleteButton);
      dataList.appendChild(listItem);
    });
  }
  

// Save New Data Entry
saveBtn.addEventListener('click', async () => {
  const dataValue = dataInput.value;

  if (dataValue && userId) {
    try {
      const userEntriesRef = collection(db, "users", userId, "entries");
      await addDoc(userEntriesRef, { data: dataValue });
      output.innerHTML = `<p>Data Saved: ${dataValue}</p>`;
      dataInput.value = ''; // Clear input field
      await loadUserData(); // Refresh data list
    } catch (error) {
      console.error("Error saving data: ", error);
    }
  } else {
    alert('Enter data to save.');
  }
});

// Edit Specific Entry
async function editSpecificEntry(entryId) {
  const newDataValue = prompt("Enter new value for the data:");

  if (newDataValue) {
    try {
      const entryRef = doc(db, "users", userId, "entries", entryId);
      await updateDoc(entryRef, { data: newDataValue });
      output.innerHTML = `<p>Data Updated: ${newDataValue}</p>`;
      await loadUserData(); // Refresh data list
    } catch (error) {
      console.error("Error updating data: ", error);
    }
  }
}

// Delete Specific Entry
async function deleteSpecificEntry(entryId) {
  if (confirm("Are you sure you want to delete this entry?")) {
    try {
      const entryRef = doc(db, "users", userId, "entries", entryId);
      await deleteDoc(entryRef);
      output.innerHTML = `<p>Data Deleted</p>`;
      await loadUserData(); // Refresh data list
    } catch (error) {
      console.error("Error deleting data: ", error);
    }
  }
}