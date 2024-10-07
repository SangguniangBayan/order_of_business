document.addEventListener('DOMContentLoaded', () => {
    fetchData(); // Load data from MongoDB

    // Select relevant elements
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    const dynamicContent = document.getElementById('dynamic-content');
    const publishButton = document.getElementById('publish-button');
    const editButton = document.getElementById('edit-button');

    // Store uploaded items
    const uploadedItems = {};

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
        // Create section-specific content based on title
        const sectionId = title.toLowerCase().replace(/\s/g, '-');
        dynamicContent.innerHTML += `
            <div id="${sectionId}">
                <h3>${title} <button class="add-item" data-section="${sectionId}">+</button></h3>
                <div class="item-container" id="${sectionId}-container"></div>
            </div>
        `;
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
        const sectionContainer = document.getElementById(sectionId + '-container');

        const itemContainer = document.createElement('div');
        itemContainer.innerHTML = `
            <textarea placeholder="Enter Title" class="item-title" rows="2" style="width: 100%;" required></textarea>
            <input type="file" class="item-file" accept="application/pdf" required>
            <button class="save-item" data-section="${sectionId}">Save</button>
        `;
        sectionContainer.appendChild(itemContainer);
    }

    // Save new item
    function handleSaveItem(button) {
        const sectionId = button.getAttribute('data-section');
        const itemContainer = button.parentElement;
        const titleInput = itemContainer.querySelector('.item-title').value.trim();
        const fileInput = itemContainer.querySelector('.item-file').files[0];

        if (!validateInputs(titleInput, fileInput)) return;

        if (!uploadedItems[sectionId]) {
            uploadedItems[sectionId] = [];
        }
        uploadedItems[sectionId].push({ title: titleInput, file: URL.createObjectURL(fileInput) });

        displayUploadedItems(sectionId);

        // Clear the input fields after saving
        itemContainer.innerHTML = '';
    }

    // Validate title and file inputs
    function validateInputs(title, file) {
        if (!title || !file || file.type !== "application/pdf" || file.size > 10485760) {
            alert("Please provide a valid title and a PDF file smaller than 10MB.");
            return false;
        }
        return true;
    }

    // Display uploaded items
    function displayUploadedItems(sectionId) {
        const sectionContainer = document.getElementById(sectionId + '-container');
        sectionContainer.innerHTML = ''; // Clear previous items

        uploadedItems[sectionId].forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `
                <p>${index + 1}. <a href="${item.file}" target="_blank">${item.title}</a>
                <button class="edit-item">Edit</button></p>
            `;
            sectionContainer.appendChild(itemDiv);
        });
    }

    // Publish button functionality
    publishButton.addEventListener('click', () => {
        // Disable functionalities
        disableFunctionalities();

        // Change publish button text
        publishButton.textContent = 'Published';
        publishButton.disabled = true;
        editButton.style.display = 'inline-block'; // Show the Edit button after publish
    });

    // Disable functionalities like Add, Save, Edit
    function disableFunctionalities() {
        const addButtons = dynamicContent.querySelectorAll('.add-item');
        const saveButtons = dynamicContent.querySelectorAll('.save-item');
        const editButtons = dynamicContent.querySelectorAll('.edit-item');

        addButtons.forEach(button => button.disabled = true);
        saveButtons.forEach(button => button.disabled = true);
        editButtons.forEach(button => button.disabled = true);
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
                <p><a href="${item.fileUrl}" target="_blank">${item.title}</a></p>
            `;
            dynamicContent.appendChild(itemDiv);
        });
    }
});
