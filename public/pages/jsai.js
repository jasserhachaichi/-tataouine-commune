
function showMessage(msg, duration, color) {
    Toastify({
        text: msg,
        close: true,
        duration: duration,
        gravity: "bottom",
        position: "right",
        backgroundColor: color,
    }).showToast()
}

function clearFormFields() {
    var fileInput = document.getElementById("filepondinput");
    if (fileInput) {
        // Supprime tous les fichiers sélectionnés
        pond.removeFiles();
    }
}

// FilePond plugin registration and initialization
FilePond.registerPlugin(FilePondPluginFileValidateSize);
const pond = FilePond.create(document.getElementById("filepondinput"), {
    maxFileSize: '10MB',
    credits: null,
});

document.getElementById('imageForm').addEventListener('submit', function (event) {
    event.preventDefault();

    $('#submit-button').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Uploading...');

    // Get files from FilePond instance
    const files = pond.getFiles();

    // Create FormData object and append files to it
    const formData = new FormData(this);
    files.forEach(file => {
        formData.append('filepond', file.file);
    });


    fetch('/addimage', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            clearFormFields();
            showMessage(data.success, -1, "#4fbe87");
            $('#submit-button').prop('disabled', false).html('Sauvegarder');
        })
        .catch(error => {
            showMessage(error, 3000, "#dc3545");
            $('#submit-button').prop('disabled', false).html('Sauvegarder');
        });

});

