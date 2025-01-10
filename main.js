import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  getDocs,
  where,
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDhG1b0gDFihO7jLZc1wBXYPSU8cx8yM2E",
    authDomain: "b2field-63952.firebaseapp.com",
    projectId: "b2field-63952",
    storageBucket: "b2field-63952.firebasestorage.app",
    messagingSenderId: "1043261302719",
    appId: "1:1043261302719:web:97b5eb6a1fe72b3721230a",
  };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM elements
const formViewBtn = document.getElementById('formView');
const listViewBtn = document.getElementById('listView');
const statsViewBtn = document.getElementById('statsView');
const formScreen = document.getElementById('formScreen');
const listScreen = document.getElementById('listScreen');
const statsScreen = document.getElementById('statsScreen');
const submissionForm = document.getElementById('submissionForm');
const submissionFormEdit = document.getElementById('submissionFormEdit');
const entryList = document.getElementById('entryList');
const todoList = document.getElementById("todoList");
const statsEntryList = document.getElementById('statsEntryList');
const totalEntries = document.getElementById('totalEntries');
const entriesWithIdentifier = document.getElementById('entriesWithIdentifier');
const modal = document.getElementById('formModal');
const modalEdit = document.getElementById('formModalEdit');
const newFormBtn = document.getElementById('newFormBtn');
const openFormBtn = document.getElementById('openFormBtn');
const modalClose = document.getElementById('modalClose');
const modalCloseEdit = document.getElementById('modalCloseEdit');
const deleteBtn = document.getElementById("delete-btn");
const filterByDate = document.getElementById("filterByDate");

let userId = null;
let entries = [];

// Helper to load entries from Firebase
const loadEntries = async () => {
  if (!userId) return;

  const entriesRef = collection(db, `users/${userId}/entries`);
  const entriesSnapshot = await getDocs(entriesRef);
  entries = entriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  updateEntryList();
  updateStats();
};

// Switch between views
const switchView = (view) => {
  formScreen.classList.add('hidden');
  listScreen.classList.add('hidden');
  statsScreen.classList.add('hidden');
  if (view === 'form') formScreen.classList.remove('hidden');
  if (view === 'list') listScreen.classList.remove('hidden');
  if (view === 'stats') statsScreen.classList.remove('hidden');
};

formViewBtn.addEventListener('click', () => switchView('form'));
listViewBtn.addEventListener('click', () => switchView('list'));
statsViewBtn.addEventListener('click', () => {
  updateStats();
  switchView('stats');
});

newFormBtn.addEventListener('click', () => {
  submissionForm.reset();
  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}T${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  document.getElementById('dateCreated').value = formattedDate;
  modal.classList.remove('hidden');
  modal.scrollTo(0, 0);
});

modalClose.addEventListener('click', () => modal.classList.add('hidden'));
modalCloseEdit.addEventListener('click', () => modalEdit.classList.add('hidden'));

// Add new entry
submissionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!userId) return alert("No user logged in.");

  const entry = {
    identifier: document.getElementById('identifier').value,
    dateCreated: document.getElementById('dateCreated').value,
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    isBusiness: document.getElementById('isBusiness').checked,
    business: document.getElementById('business').value,
    location: document.getElementById('location').value,
    sentQuote: document.getElementById('sentQuote').checked,
    notes: document.getElementById('notes').value,
    futureActions: document.getElementById('futureActions').value,
    followUpDate: document.getElementById('followUpDate').value,
  };

  const entriesRef = collection(db, `users/${userId}/entries`);
  await addDoc(entriesRef, entry);
  await loadEntries();
  modal.classList.add('hidden');
  submissionForm.reset();
});

// Populate the edit form with entry data
// const editEntry = (id) => {
//     const entry = entries.find((e) => e.id === id);
//     if (!entry) return;

//     // Populate the form with the entry data
//     Object.keys(entry).forEach((key) => {
//         const input = document.getElementById(`${key}Edit`);
//         if (input) {
//             if (input.type === 'checkbox') {
//                 input.checked = entry[key];
//             } else {
//                 input.value = entry[key];
//             }
//         }
//     });

//     document.getElementById('idEdit').value = entry.id; // Ensure the ID is set
//     modalEdit.classList.remove('hidden');
//     modalEdit.scrollTo(0, 0);
// };

// Handle form submission for editing
submissionFormEdit.addEventListener('submit', async (e) => {
    e.preventDefault();

    const entryId = document.getElementById('idEdit').value;

    // Collect updated data
    const updatedEntry = {
        id: entryId,
        identifier: document.getElementById('identifierEdit').value,
        dateCreated: document.getElementById('dateCreatedEdit').value,
        name: document.getElementById('nameEdit').value,
        phone: document.getElementById('phoneEdit').value,
        email: document.getElementById('emailEdit').value,
        isBusiness: document.getElementById('isBusinessEdit').checked,
        business: document.getElementById('businessEdit').value,
        location: document.getElementById('locationEdit').value,
        sentQuote: document.getElementById('sentQuoteEdit').checked,
        notes: document.getElementById('notesEdit').value,
        futureActions: document.getElementById('futureActionsEdit').value,
        followUpDate: document.getElementById('followUpDateEdit').value,
        userId: userId, // Ensure the entry is tied to the logged-in user
    };

    try {
        const entryDocRef = doc(db, `users/${userId}/entries/${entryId}`); // Reference to the specific entry
        await setDoc(entryDocRef, updatedEntry, { merge: true }); // Merge updates with existing data
    
        await loadEntries(); // Reload entries to reflect changes in the UI
        modalEdit.classList.add('hidden'); // Hide the edit modal
        submissionFormEdit.reset(); // Reset the form
      } catch (error) {
        console.error("Error updating entry:", error);
        alert("Failed to update entry. Please try again.");
      }
});


// Edit an entry
const editEntry = async (id) => {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;

  Object.keys(entry).forEach(key => {
    const input = document.getElementById(`${key}Edit`);
    if (input) {
      if (input.type === 'checkbox') {
        input.checked = entry[key];
      } else {
        input.value = entry[key];
      }
    }
  });
  modalEdit.classList.remove('hidden');
  modalEdit.scrollTo(0, 0);
};

// Delete an entry
deleteBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const id = document.getElementById('idEdit').value;
  if (!id || !userId) return;

  try {
    const entryRef = doc(db, `users/${userId}/entries`, id);
  await deleteDoc(entryRef);
  await loadEntries();
  modalEdit.classList.add('hidden');
  } catch(error){
    console.error(error)
  }
});

// Update entry list
const updateEntryList = () => {
  entryList.innerHTML = '';
  entries.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'entry';
    div.textContent = `${new Date(entry.dateCreated).toUTCString().slice(0, 11)} - ${entry.identifier}`;
    div.addEventListener('click', () => editEntry(entry.id));
    entryList.appendChild(div);
  });
};

// Update stats
const updateStats = () => {
  totalEntries.textContent = entries.length;
  entriesWithIdentifier.textContent = entries.filter(entry => entry.identifier).length;
};

// Login and create user if needed
const login = async (loginCode) => {
  const userDocRef = doc(db, "users", loginCode);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    const createNew = confirm("User not found. Create new user?");
    if (!createNew) return;
    await setDoc(userDocRef, {});
  }
  userId = loginCode;
  await loadEntries();
};

// Example login usage
const key = prompt("enter login code")
login(key);
