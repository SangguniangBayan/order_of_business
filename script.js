document.addEventListener('DOMContentLoaded', () => {
    fetchData(); // Load data from MongoDB

    // Select relevant elements
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    const dynamicContent = document.getElementById('dynamic-content');
    const publishButton = document.getElementById('publish-button');
    const editButton = document.createElement('button'); // Create Edit button

    // Define sections with add buttons
    const sectionsWithAddButton = [
        'Question Hour', 'First Reading', 'Proposed Ordinances',
        'Other Matters', 'Announcements', 'Unfinished Business',
        'Draft Ordinances and Resolutions', 'Committee Reports',
        'Review of SK and Barangay Resolutions Ordinances and Budgets',
        'Review of CSO Applications', 'Unassigned Business'
    ];

    // To track item numbers for each section
    const sectionCounters = {};

    // Sidebar link handling
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const title = link.textContent.trim();
            dynamicContent.innerHTML = `<h2>${title}</h2>`;
            handleSectionDisplay(title);
        });
    });

    // Handle section-specific content
    function handleSectionDisplay(title) {
        if (title === 'Calendar of Business') {
            dynamicContent.innerHTML += `
                <div>
                    <h3>Unfinished Business <button class="add-item" data-section="unfinished-business">+</button></h3>
                    <div id="unfinished-business"></div>
                    <h3>For Second Reading</h3>
                    <ul>
                        <li>Draft Ordinances and Resolutions <button class="add-item" data-section="draft-ordinances">+</button></li>
                        <div id="draft-ordinances"></div>
                        <li>Committee Reports <button class="add-item" data-section="committee-reports">+</button></li>
                        <div id="committee-reports"></div>
                    </ul>
                    <h3>Business for the Day</h3>
                    <ul>
                        <li>Review of Barangay & SK Resolutions, Ordinances and Budgets <button class="add-item" data-section="sk-resolutions">+</button></li>
                        <div id="sk-resolutions"></div>
                        <li>Review of CSO Applications <button class="add-item" data-section="cso-applications">+</button></li>
                        <div id="cso-applications"></div>
                    </ul>
                    <h3>Unassigned Business <button class="add-item" data-section="unassigned-business">+</button></h3>
                    <div id="unassigned-business"></div>
                </div>
            `;
        } else if (sectionsWithAddButton.includes(title)) {
            const sectionId = title.toLowerCase().replace(/\s/g, '-');
            dynamicContent.innerHTML += `
                <button class="add-item" data-section="${sectionId}">+</button>
                <div id="${sectionId}"></div>
            `;
        }
    }

    // Handle dynamic content actions (Add, Save, Edit)
    dynamicContent.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-item')) {
            handleAddItem(event.target);
        } else if (event.target.classList.contains('save-item')) {
            handleSaveItem(event.target);
        } else if (event.target.classList.contains('edit-item')) {
            handleEditItem(event.target);
        } else if (event.target.classList.contains('save-edit')) {
            handleSaveEdit(event.target);
        }
    });

    // Add new item
    function handleAddItem(button) {
        const sectionId = button.getAttribute('data-section');
        const sectionContainer = document.getElementById(sectionId);

        if (!sectionContainer.querySelector('.item-title')) {
            const itemContainer = document.createElement('div');
            itemContainer.innerHTML = `
                <textarea placeholder="Enter Title" class="item-title" rows="2" style="width: 100%;" required></textarea>
                <input type="file" class="item-file" accept="application/pdf" required>
                <button class="save-item" data-section="${sectionId}">Save</button>
            `;
            sectionContainer.appendChild(itemContainer);
        }
    }

    // Save new item
    function handleSaveItem(button) {
        const sectionId = button.getAttribute('data-section');
        const itemContainer = button.parentElement;
        const titleInput = itemContainer.querySelector('.item-title').value.trim();
        const fileInput = itemContainer.querySelector('.item-file').files[0];

        if (!validateInputs(titleInput, fileInput)) return;

        const sectionContainer = document.getElementById(sectionId);
        const itemNumber = incrementSectionCounter(sectionId);

        const newItem = document.createElement('div');
        newItem.innerHTML = `
            <p>${itemNumber}. <a href="${URL.createObjectURL(fileInput)}" target="_blank">${titleInput}</a>
            <button class="edit-item">Edit</button></p>
        `;

        sectionContainer.appendChild(newItem);
        itemContainer.remove();
    }

    // Validate title and file inputs
    function validateInputs(title, file) {
        if (!title || !file || file.type !== "application/pdf" || file.size > 10485760) {
            alert("Please provide a valid title and a PDF file smaller than 10MB.");
            return false;
        }
        return true;
    }

    // Increment and track section counters
    function incrementSectionCounter(sectionId) {
        if (!sectionCounters[sectionId]) sectionCounters[sectionId] = 0;
        return ++sectionCounters[sectionId];
    }

    // Edit existing item
    function handleEditItem(button) {
        const itemContainer = button.parentElement;
        const titleLink = itemContainer.querySelector('a');
        const currentTitle = titleLink.textContent;

        itemContainer.innerHTML = `
            <textarea class="edit-title" rows="2" style="width: 100%;">${currentTitle}</textarea>
            <input type="file" class="edit-file" accept="application/pdf">
            <button class="save-edit">Save</button>
        `;
    }

    // Save edits
    function handleSaveEdit(button) {
        const itemContainer = button.parentElement;
        const newTitle = itemContainer.querySelector('.edit-title').value.trim();
        const newFile = itemContainer.querySelector('.edit-file').files[0];

        if (!newTitle) {
            alert("Title cannot be empty.");
            return;
        }

        const fileUrl = newFile ? URL.createObjectURL(newFile) : itemContainer.querySelector('a').href;
        itemContainer.innerHTML = `
            <p><a href="${fileUrl}" target="_blank">${newTitle}</a>
            <button class="edit-item">Edit</button></p>
        `;
    }

    // Publish button functionality (with Edit button)
    publishButton.addEventListener('click', () => {
        // Save logic for uploaded PDFs and titles can be implemented here

        // Disable add and edit functionalities
        const addItemButtons = document.querySelectorAll('.add-item');
        addItemButtons.forEach(button => button.disabled = true);

        const editItemButtons = document.querySelectorAll('.edit-item');
        editItemButtons.forEach(button => button.disabled = true);

        // Mark publish button as clicked
        publishButton.textContent = 'Published';
        publishButton.disabled = true;

        // Add Edit button next to Publish button
        editButton.textContent = 'Edit';
        editButton.setAttribute('id', 'edit-button');
        publishButton.parentElement.appendChild(editButton);

        // Enable Edit button functionality
        editButton.addEventListener('click', handleEditButtonClick);
    });

    // Edit button click handler (Prompt for admin credentials)
    function handleEditButtonClick() {
        const adminPassword = prompt('Enter Administrator Password:');

        if (adminPassword === 'your_admin_password') { // Replace 'your_admin_password' with the actual password
            // Re-enable editing functionality
            const addItemButtons = document.querySelectorAll('.add-item');
            addItemButtons.forEach(button => button.disabled = false);

            const editItemButtons = document.querySelectorAll('.edit-item');
            editItemButtons.forEach(button => button.disabled = false);
        } else {
            alert('Incorrect password. Access denied.');
        }
    }

    // Fetch data from MongoDB
    function fetchData() {
        fetch('/get-data')
            .then(response => response.json())
            .then(data => displayData(data))
            .catch(error => {
                console.error('Error fetching data:', error);
                dynamicContent.innerHTML = '<p>Failed to load data. Please try again later.</p>';
            });
    }

    // Display fetched data
    function displayData(data) {
        dynamicContent.innerHTML = ''; // Clear previous content

        data.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            itemDiv.innerHTML = `
               
                
            `;
            dynamicContent.appendChild(itemDiv);
        });
    }
});
