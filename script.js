document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    const dynamicContent = document.getElementById('dynamic-content');

    const sectionsWithAddButton = [
        'Question Hour', 'First Reading', 'Proposed Ordinances', 
        'Other Matters', 'Announcements', 'Unfinished Business', 
        'Draft Ordinances and Resolutions', 'Committee Reports', 
        'Review of SK and Barangay Resolutions Ordinances and Budgets', 
        'Review of CSO Applications', 'Unassigned Business'
    ];

    // To keep track of item numbers
    const sectionCounters = {};

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const title = link.textContent.trim();
            dynamicContent.innerHTML = `<h2>${title}</h2>`;

            // Handle the "Calendar of Business" section specifically
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
                return;
            }

            // For other sections with add buttons
            if (sectionsWithAddButton.includes(title)) {
                dynamicContent.innerHTML += `
                    <button class="add-item" data-section="${title.toLowerCase().replace(/\s/g, '-')}">+</button>
                    <div id="${title.toLowerCase().replace(/\s/g, '-')}"></div>
                `;
            }
        });
    });

    // Event delegation for dynamic content (Add and Save functionality)
    dynamicContent.addEventListener('click', (event) => {
        // Add new item
        if (event.target.classList.contains('add-item')) {
            const sectionId = event.target.getAttribute('data-section');
            const sectionContainer = document.getElementById(sectionId);

            // Prevent adding multiple input fields at once
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

        // Save item functionality
        if (event.target.classList.contains('save-item')) {
            const sectionId = event.target.getAttribute('data-section');
            const itemContainer = event.target.parentElement;
            const titleInput = itemContainer.querySelector('.item-title').value.trim();
            const fileInput = itemContainer.querySelector('.item-file').files[0];

            // Validate inputs
            if (!titleInput || !fileInput || fileInput.type !== "application/pdf") {
                alert("Please provide a valid title and a PDF file.");
                return;
            }

            // Initialize section counter if not present
            if (!sectionCounters[sectionId]) {
                sectionCounters[sectionId] = 0;
            }

            // Increment the counter for the section
            sectionCounters[sectionId]++;
            const itemNumber = sectionCounters[sectionId];

            // Create the new item with the uploaded file link
            const newItem = document.createElement('div');
            newItem.innerHTML = `
                <p>${itemNumber}. <a href="${URL.createObjectURL(fileInput)}" target="_blank">${titleInput}</a>
                <button class="edit-item">Edit</button></p>
            `;

            // Append the new item to the section
            const sectionContainer = document.getElementById(sectionId);
            sectionContainer.appendChild(newItem);

            // Clear the input fields
            itemContainer.remove();
        }

        // Edit button functionality
        if (event.target.classList.contains('edit-item')) {
            const itemContainer = event.target.parentElement;
            const titleLink = itemContainer.querySelector('a');
            const currentTitle = titleLink.textContent;

            // Create editable fields with the current title and file option
            itemContainer.innerHTML = `
                <textarea class="edit-title" rows="2" style="width: 100%;">${currentTitle}</textarea>
                <input type="file" class="edit-file" accept="application/pdf">
                <button class="save-edit">Save</button>
            `;
        }

        // Save changes after editing
        if (event.target.classList.contains('save-edit')) {
            const itemContainer = event.target.parentElement;
            const newTitle = itemContainer.querySelector('.edit-title').value.trim();
            const newFile = itemContainer.querySelector('.edit-file').files[0];

            // Validate edited title
            if (!newTitle) {
                alert("Title cannot be empty.");
                return;
            }

            // Update the title and file URL (only if a new file is uploaded)
            const fileUrl = newFile ? URL.createObjectURL(newFile) : itemContainer.querySelector('a').href;

            // Revert to display mode with updated content
            itemContainer.innerHTML = `
                <p><a href="${fileUrl}" target="_blank">${newTitle}</a>
                <button class="edit-item">Edit</button></p>
            `;
        }
    });

    // Helper function to download file
    function downloadFile(filename, content) {
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/html' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element); // Required for Firefox
        element.click();
        document.body.removeChild(element);
    }

    // Publish button functionality
    const publishButton = document.getElementById('publish-button');
    publishButton.addEventListener('click', () => {
        // Clone the header
        const headerClone = document.querySelector('header').outerHTML;

        // Clone the sidebar and remove the "Publish" button
        const sidebarClone = document.querySelector('.sidebar').cloneNode(true);
        const publishButtonInSidebar = sidebarClone.querySelector('#publish-button');
        if (publishButtonInSidebar) {
            publishButtonInSidebar.remove();
        }

        // Clone the dynamic content and remove interactive buttons
        const dynamicContentClone = document.getElementById('dynamic-content').cloneNode(true);
        const buttons = dynamicContentClone.querySelectorAll('button');
        buttons.forEach(button => button.remove());

        // Assemble the viewer HTML
        const viewerHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>View Only Mode - Order of Business</title>
                <link rel="stylesheet" href="style.css">
            </head>
            <body>
                ${headerClone}
                <div class="container">
                    ${sidebarClone.outerHTML}
                    <div id="content">
                        ${dynamicContentClone.innerHTML}
                    </div>
                </div>
            </body>
            </html>
        `;

        // Open a new window and write the viewer HTML
        const viewerWindow = window.open('', '_blank');
        viewerWindow.document.write(viewerHtml);
        viewerWindow.document.close();

        // Download the viewer.html file
        downloadFile('viewer.html', viewerHtml);

        // Change the "Publish" button to "Published" and disable it
        publishButton.textContent = 'Published';
        publishButton.disabled = true;
    });
});
// Your existing code (if any) goes here

// This code fetches data from MongoDB when the document is loaded
document.addEventListener("DOMContentLoaded", function() {
    fetchData();

    function fetchData() {
        fetch('/get-data')
            .then(response => response.json())
            .then(data => {
                displayData(data);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    function displayData(data) {
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = ''; // Clear previous content

        data.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            itemDiv.innerHTML = `
                <h2>${item.title}</h2>
                <p>${item.description}</p>
                <a href="${item.fileUrl}" target="_blank">Download PDF</a>
            `;
            dynamicContent.appendChild(itemDiv);
        });
    }
});
