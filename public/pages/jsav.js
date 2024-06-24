
document.getElementById('youtube-tab').addEventListener('click', function () {
    document.getElementById('local-tab').classList.remove('active');
    document.getElementById('youtube-tab').classList.add('active');
});

document.getElementById('local-tab').addEventListener('click', function () {
    document.getElementById('youtube-tab').classList.remove('active');
    document.getElementById('local-tab').classList.add('active');
});


document.querySelector('.formy').addEventListener('submit', async function (event) {
    event.preventDefault();
    $('#submit-button').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...');

    const formData = new FormData(this);

    // Get the uploaded file
    const thumbnailFile = formData.get('thumbnail-column');

    // Check if a file was uploaded and the input is not empty
    if (thumbnailFile && thumbnailFile.name.trim().length > 0) {
        // Resize the image
        const resizedThumbnail = await resizeImage(thumbnailFile);
        // Replace the original file with the resized one
        formData.set('thumbnail-column', resizedThumbnail, thumbnailFile.name);
    }

    try {
        const response = await fetch('/addvideo/youtube', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            $('.formy').trigger('reset');
            Toastify({
                text: data.message,
                duration: 3000,
                close: true,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#198754",
            }).showToast();
        } else {
            const errorData = await response.json();
            errorData.errors.forEach(error => {
                Toastify({
                    text: error,
                    duration: 5000,
                    close: true,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#dc3545",
                }).showToast();
            });
        }
    } catch (error) {
        Toastify({
            text: error,
            duration: 5000,
            close: true,
            gravity: "bottom",
            position: "right",
            backgroundColor: "#dc3545",
        }).showToast();
        console.error('An error occurred:', error);
    }

    $('#submit-button').prop('disabled', false).html('Submit');
});

// Function to resize the image
async function resizeImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxWidth = 640;
                let width = img.width;
                let height = img.height;

                // Calculate new height to maintain aspect ratio
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now()
                    }));
                }, file.type);
            };
        };
        reader.onerror = (error) => reject(error);
    });
}

// JavaScript to handle form submission via AJAX
document.querySelector('.forml').addEventListener("submit", async function (event) {
    event.preventDefault();

    $('#submit-button-l').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...');


    const formData = new FormData(this);

    // Get the uploaded file
    const thumbnailFile = formData.get('thumbnail-column');

    // Check if a file was uploaded and the input is not empty
    if (thumbnailFile && thumbnailFile.name.trim().length > 0) {
        // Resize the image
        const resizedThumbnail = await resizeImage(thumbnailFile);
        // Replace the original file with the resized one
        formData.set('thumbnail-column', resizedThumbnail, thumbnailFile.name);
    }

    // Send AJAX request
    $.ajax({
        url: '/addvideo/local',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            // Handle success response
            $('.forml').trigger('reset');
            Toastify({
                text: response.message,
                duration: 3000,
                close: true,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#198754",
            }).showToast()
        },
        error: function (xhr, status, error) {
            // Handle error
            if (xhr.status === 400) {
                // Specific error returned by the server (validation errors)
                var errors = xhr.responseJSON.errors;
                console.log("Validation errors:");
                errors.forEach(function (error) {
                    Toastify({
                        text: error,
                        duration: 5000,
                        close: true,
                        gravity: "bottom",
                        position: "right",
                        backgroundColor: "#dc3545",
                    }).showToast()
                });
            } else {
                // If server returns generic error
                // console.error("Server error:", xhr.status, error);
                Toastify({
                    text: error,
                    duration: 5000,
                    close: true,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#dc3545",
                }).showToast()
            }
        }
    });


    $('#submit-button-l').prop('disabled', false).html('Submit');
});
