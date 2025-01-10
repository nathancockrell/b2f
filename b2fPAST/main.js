const formViewBtn = document.getElementById('formView');
        const listViewBtn = document.getElementById('listView');
        const statsViewBtn = document.getElementById('statsView');
        const formScreen = document.getElementById('formScreen');
        const listScreen = document.getElementById('listScreen');
        const statsScreen = document.getElementById('statsScreen');
        const submissionForm = document.getElementById('submissionForm');
        const submissionFormEdit = document.getElementById('submissionFormEdit');
        const entryList = document.getElementById('entryList');
        const todoList = document.getElementById("todoList")
        const statsEntryList = document.getElementById('statsEntryList');
        const totalEntries = document.getElementById('totalEntries');
        const entriesWithIdentifier = document.getElementById('entriesWithIdentifier');
        const modal = document.getElementById('formModal');
        const modalEdit = document.getElementById('formModalEdit');
        const newFormBtn = document.getElementById('newFormBtn');
        const openFormBtn = document.getElementById('openFormBtn');
        const modalClose = document.getElementById('modalClose');
        const modalCloseEdit = document.getElementById('modalCloseEdit');
        const deleteBtn = document.getElementById("delete-btn")

        const filterByDate = document.getElementById("filterByDate");
    
        let entries = JSON.parse(localStorage.getItem('entries')) || [];
    
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

            const year = now.getFullYear();
            const month = now.getMonth() + 1; // Months are 0-indexed
            const day = now.getDate();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();

            const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
            console.log(formattedDate); // e.g., "2025-01-02"
            console.log(formattedDate + formattedTime); // e.g., "01:59:00"
            console.log(new Date().toISOString().slice(0,-8))
            document.getElementById('dateCreated').value = formattedDate +'T'+ formattedTime;
            modal.classList.remove('hidden');
            modal.scrollTo(0, 0); // Scroll to the top of the form
        });
    
        openFormBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            modal.scrollTo(0, 0); // Scroll to the top of the form
        });
    
        modalClose.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        modalCloseEdit.addEventListener('click', () => {
            modalEdit.classList.add('hidden');
        });
    
        submissionForm.addEventListener('submit', (e) => {
            e.preventDefault();
    
            const entry = {
                id: Date.now(),
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
                followUpDate: document.getElementById('followUpDate').value
            };
    
            const existingIndex = entries.findIndex((e) => e.id === entry.id);
            if (existingIndex !== -1) {
                entries[existingIndex] = entry; // Update existing
            } else {
                entries.push(entry); // Add new
            }
    
            saveToLocalStorage();
            updateEntryList();
            modal.classList.add('hidden');
            submissionForm.reset();
        });
        submissionFormEdit.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log(e.target);
            const entry = {
                id: document.getElementById('idEdit').value,
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
                followUpDate: document.getElementById('followUpDateEdit').value
            };
            console.log(entry.id)
            console.log(entries);
            const existingIndex = entries.findIndex((e) => e.id === Number(entry.id) || e.id === entry.id);
            console.log(existingIndex);
            if (existingIndex !== -1) {
                entries[existingIndex] = entry; // Update existing
            }
    
            saveToLocalStorage();
            updateEntryList();
            modalEdit.classList.add('hidden');
            submissionFormEdit.reset();
        });
    
        const updateEntryList = () => {
            console.log("updating entry list")
            entryList.innerHTML = '';
            const currentWeek = new Date();
            const startOfWeek = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay()));
            entries = JSON.parse(localStorage.getItem('entries')) || [];
            let sortedEntries = entries.sort((a,b) =>new Date(b.dateCreated) - new Date(a.dateCreated))
            sortedEntries.filter(entry => new Date(entry.dateCreated) >= startOfWeek).forEach(entry => {
                const div = document.createElement('div');
                div.className = 'entry';
                div.textContent = `${new Date(entry.dateCreated).toUTCString().slice(0,11)} ${new Date(entry.dateCreated).toUTCString().slice(17,22)} - ${entry.identifier}`;
                div.addEventListener('click', () => editEntry(entry.id));
                div.dataset.entryId = entry.id; // add entry id for easy access
                entryList.appendChild(div);
            });
            updateTodoList(entries)
        };

        const updateTodoList = (e) => {
            const today = new Date()
            let fe = e.filter(e => new Date(e.followUpDate) === today)
            console.log("todolist filter ",fe)
            let sortedEntries = fe.sort((a,b) =>new Date(b.dateCreated) - new Date(a.dateCreated))
            
            sortedEntries.forEach(entry=>{
                const div = document.createElement('div');
                div.className = 'entry';
                div.textContent = `${new Date(entry.dateCreated).toUTCString().slice(0,11)} ${new Date(entry.dateCreated).toUTCString().slice(17,22)} - ${entry.identifier}`;
                div.addEventListener('click', () => editEntry(entry.id));
                div.dataset.entryId = entry.id; // add entry id for easy access
                todoList.appendChild(div);
            })
        }
    
        const editEntry = (id) => {
            const entry = entries.find((e) => e.id === id);
            if (!entry) return;
    
            // Populate the form with the entry data
            Object.keys(entry).forEach((key) => {
                const input = document.getElementById(`${key}Edit`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = entry[key];
                    } else {
                        input.value = entry[key];
                    }
                }
            });
            // console.log("entry", entry)
            modalEdit.classList.remove('hidden');
            modalEdit.scrollTo(0, 0);
        };

        deleteBtn.addEventListener('click', (e)=>{
            e.preventDefault();
            console.log("deleting ", document.getElementById('idEdit').value)
            deleteEntry(document.getElementById('idEdit').value)

            modalEdit.classList.add('hidden');
        })
    
        const deleteEntry = (id) => {
            console.log("called delete entry with id ", id)
            entries = entries.filter((e) => e.id !== id && e.id !== Number(id));
            saveToLocalStorage();
            updateEntryList();
            submissionFormEdit.reset();
        };
    
        const saveToLocalStorage = () => {
            localStorage.setItem('entries', JSON.stringify(entries));
        };
    
        const updateStats = () => {
            totalEntries.textContent = entries.length;
            entriesWithIdentifier.textContent = entries.filter(entry => entry.identifier).length;
        };
    
    
        // Initial load
        updateEntryList();
        updateStats();