$('#summernote').summernote({
    height: 800,
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
const pond = FilePond.create(document.querySelector(".filepondinput1"), {
    maxFileSize: '10MB',
    credits: null,
    acceptedFileTypes: ['image/*'] // Only allow image files
});

const pond2 = FilePond.create(document.querySelector(".filepondinput2"), {
    maxFileSize: '10MB',
    credits: null,
});
const pond3 = FilePond.create(document.querySelector(".filepondinput3"), {
    maxFileSize: '10MB',
    credits: null,
    acceptedFileTypes: ['image/*'] // Only allow image files
});

function viderInputs() {
    $('#blogForm').trigger('reset');


    pond.removeFiles();
    pond2.removeFiles();
    pond3.removeFiles();

    // Si vous utilisez un éditeur WYSIWYG comme Summernote, vous devrez peut-être également le vider
    $('#summernote').summernote('code', '');

    // Reset the Tagify input by removing all tags
    tagify.removeAllTags();
};

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
    $('#blogForm').submit(function (e) {
        e.preventDefault(); // Prevent the default form submission
        // Disable the submit button and show loading text
        $('#submit-button').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Posting blog...');


        var summernoteHTML = $('#summernote').summernote('code');
        //console.log(summernoteHTML);

        // Get files from FilePond instance
        const files = pond.getFiles();
        const files2 = pond2.getFiles();
        const files3 = pond3.getFiles();

        // Create FormData object and append files to it
        const formData = new FormData(this);
        files.forEach(file => {
            formData.append('filepond', file.file);
        });
        files2.forEach(file => {
            formData.append('filepond2', file.file);
        });
        files3.forEach(file => {
            formData.append('filepond3', file.file);
        });

        formData.append('summernote', summernoteHTML);

        // Send AJAX request
        $.ajax({
            type: 'POST',
            url: '/addblog', // The URL to your Express route
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

// The DOM element you wish to replace with Tagify
var input = document.querySelector('input[name=tags-blog]');
// initialize Tagify on the above input node reference
var tagify = new Tagify(input);

$(document).ready(function () {
    // Sélectionnez l'input fullname
    var $fullnameInput = $('input[name="full-name"]');

    // Sélectionnez les autres inputs
    var $inlinkInput = $('input[name="In-link"]');
    var $fblinkInput = $('input[name="fb-link"]');
    var $inslinkInput = $('input[name="Ins-link"]');

    var $telgnumberInput = $('input[name="telg-number"]');
    var $twlinkInput = $('input[name="tw-link"]');
    var $whnumberInput = $('input[name="wh-number"]');

    var $expertiseInput = $('input[name="expertise"]');
    var $filepondInput = $('input[name="filepond3"]');

    // Ajoutez un écouteur d'événements sur l'input fullname
    $fullnameInput.on('input', function () {
        // Vérifiez si l'input fullname est vide
        if ($(this).val().trim() === '') {
            // Désactivez les autres inputs s'il est vide
            $inlinkInput.prop('disabled', true);
            $fblinkInput.prop('disabled', true);
            $inslinkInput.prop('disabled', true);

            $telgnumberInput.prop('disabled', true);
            $twlinkInput.prop('disabled', true);
            $whnumberInput.prop('disabled', true);

            $expertiseInput.prop('disabled', true);
            $filepondInput.prop('disabled', true);
        } else {
            // Sinon, activez les autres inputs
            $inlinkInput.prop('disabled', false);
            $fblinkInput.prop('disabled', false);
            $inslinkInput.prop('disabled', false);

            $telgnumberInput.prop('disabled', false);
            $twlinkInput.prop('disabled', false);
            $whnumberInput.prop('disabled', false);

            $expertiseInput.prop('disabled', false);
            $filepondInput.prop('disabled', false);
        }
    });

    // Désactivez les autres inputs au chargement de la page si fullname est vide
    if ($fullnameInput.val().trim() === '') {
        $inlinkInput.prop('disabled', true);
        $fblinkInput.prop('disabled', true);
        $inslinkInput.prop('disabled', true);

        $telgnumberInput.prop('disabled', true);
        $twlinkInput.prop('disabled', true);
        $whnumberInput.prop('disabled', true);

        $expertiseInput.prop('disabled', true);
        $filepondInput.prop('disabled', true);
    }
});
