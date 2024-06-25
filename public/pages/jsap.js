
flatpickr('.flatpickr-no-config', {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
})

$('#summernote').summernote({
    height: 450,
    fontSizes: ['8', '9', '10', '11', '12', '14', '18', '24', '36'],
    styleTags: [
        'p',
        {
            title: 'Blockquote',
            tag: 'blockquote',
            className: 'blockquote',
            value: 'blockquote'
        },
        'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    ],
    toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'italic', 'strikethrough', 'superscript', 'subscript', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['insert', ['ltr', 'rtl']],
        ['height', ['height']],
        ['table', ['table']],
        ['insert', ['link', 'picture', 'video', 'hr']],
        ['misc', ['emoji']],
        ['view', ['fullscreen', 'undo', 'redo', 'codeview', 'help']]
    ],
});
// FilePond plugin registration and initialization
FilePond.registerPlugin(FilePondPluginFileValidateSize);
const pond = FilePond.create(document.getElementById("filepondinput"), {
    maxFileSize: '10MB',
    credits: null,
    acceptedFileTypes: ['image/*'] // Only allow image files
});
const pond2 = FilePond.create(document.querySelector(".filepondinput2"), {
    maxFileSize: '10MB',
    credits: null,
});

function viderInputs() {
    $('#announcementForm').trigger('reset');


    pond.removeFiles();
    pond2.removeFiles();

    // Si vous utilisez un éditeur WYSIWYG comme Summernote, vous devrez peut-être également le vider
    $('#summernote').summernote('code', ''); // Utilisez votre ID Summernote ici
}



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


$(document).ready(function () {
    $('#announcementForm').submit(function (e) {
        e.preventDefault(); // Prevent the default form submission
        // Disable the submit button and show loading text
        $('#submit-button').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Posting...');


        var summernoteHTML = $('#summernote').summernote('code');
        //console.log(summernoteHTML);

        // Get files from FilePond instance
        const files = pond.getFiles();
        const files2 = pond2.getFiles();

        // Create FormData object and append files to it
        const formData = new FormData(this);
        files.forEach(file => {
            formData.append('filepond', file.file);
        });
        files2.forEach(file => {
            formData.append('filepond2', file.file);
        });

        formData.append('summernote', summernoteHTML);

        // Send AJAX request
        $.ajax({
            type: 'POST',
            url: '/addpost',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                setTimeout(function () {
                    viderInputs();
                    showMessage(response, -1, "#4fbe87");
                    $('#submit-button').prop('disabled', false).html('Sauvegarder');
                }, 1000);


            },
            error: function (xhr, status, error) {
                if (xhr.responseJSON && xhr.responseJSON.errors) {
                    const errors = xhr.responseJSON.errors;
                    // Iterate through each error in the "errors" list
                    errors.forEach(function (errorMsg) {
                        // Handle each error as needed
                        //console.error('Error:', errorMsg);
                        showMessage(errorMsg, -1, "#dc3545");
                    });
                }
                // Re-enable the submit button
                $('#submit-button').prop('disabled', false).html('Sauvegarder');

            }
        });
    });
});
