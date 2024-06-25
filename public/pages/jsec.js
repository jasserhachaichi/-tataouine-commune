
$('#summernote').summernote({
    height: 350,
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

function viderInputs() {
    // Sélectionnez tous les champs de formulaire que vous souhaitez vider
    var inputsToClear = document.querySelectorAll('input[type=text]');

    // Parcourez chaque champ de formulaire et réinitialisez sa valeur à une chaîne vide
    inputsToClear.forEach(function (input) {
        input.value = '';
    });


    pond.removeFiles();

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
// Filepond: Multiple Files
var pond = FilePond.create(document.querySelector(".multiple-files-filepond"), {
    credits: null,
    allowImagePreview: false,
    allowMultiple: true,
    allowFileEncode: false,
    required: false,
    storeAsFile: true,
})


$(document).ready(function () {
    $('#emailForm').submit(function (e) {
        e.preventDefault(); // Prevent the default form submission
        // Disable the submit button and show loading text
        $('#submit-button').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...');


        var summernoteHTML = $('#summernote').summernote('code');
        //console.log(summernoteHTML);

        // Get files from FilePond instance
        const files = pond.getFiles();

        // Create FormData object and append files to it
        const formData = new FormData(this);
        files.forEach(file => {
            formData.append('filepond', file.file);
        });

        formData.append('summernote', summernoteHTML);

        // Send AJAX request
        $.ajax({
            type: 'POST',
            url: '/emailbox/emailcreator', // The URL to your Express route
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                //console.log(response);
                // Re-enable the submit button after 1 second
                setTimeout(function () {
                    viderInputs();
                    showMessage(response, -1, "#4fbe87");
                    $('#submit-button').prop('disabled', false).html('Envoyer un e-mail');
                }, 1000);




            },
            error: function (xhr, status, error) {
                console.error(error);
                showMessage(error, -1, "#dc3545");
                // Re-enable the submit button
                $('#submit-button').prop('disabled', false).html('Envoyer un e-mail');
            }
        });
    });
});
