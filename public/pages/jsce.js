
var startDate = document.getElementById('start-date');
var endDate = document.getElementById('end-date');

flatpickr('.flatpickr-no-config', {
  enableTime: true,
  dateFormat: "Y-m-d H:i"
  /*       ,onChange: function(selectedDates, dateStr, instance) {
          if (instance.element.id === 'start-date') {
            endDate._flatpickr.set('minDate', selectedDates[0]);
          }
          if (instance.element.id === 'end-date') {
            startDate._flatpickr.set('maxDate', selectedDates[0]);
          }
        } */
});

$('#summernote').summernote({
  height: 400,
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


FilePond.registerPlugin(FilePondPluginFileValidateSize);
const pond = FilePond.create(document.getElementById("filepondinput"), {
  maxFileSize: '5MB',
  credits: null,
});
const pond2 = FilePond.create(document.getElementById("filepondinput2"), {
  maxFileSize: '5MB',
  credits: null,
});
const pond3 = FilePond.create(document.getElementById("filepondinput3"), {
  maxFileSize: '5MB',
  credits: null,
});
const pond4 = FilePond.create(document.getElementById("filepondinput4"), {
  maxFileSize: '5MB',
  credits: null,
});

// The DOM element you wish to replace with Tagify
var inputtag = document.querySelector('input[name=tags-event]');
var inputo = document.querySelector('input[name=organizers]');
var inputs = document.querySelector('input[name=sponsors]');


// initialize Tagify on the above input node reference
var tagifytag = new Tagify(inputtag);
var tagifys = new Tagify(inputs);
var tagifyo = new Tagify(inputo);


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
$(document).ready(function() {
  $('#eventform').submit(function(e) {
    e.preventDefault(); // Prevent the default form submission
    // Disable the submit button and show loading text
    $('#submit-button').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Posting event...');


    var summernoteHTML = $('#summernote').summernote('code');
    //console.log(summernoteHTML);

    // Get files from FilePond instance
    const files = pond.getFiles();
    const files2 = pond2.getFiles();
    const files3 = pond3.getFiles();
    const files4 = pond4.getFiles();


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
    files4.forEach(file => {
      formData.append('filepond4', file.file);
    });



    formData.append('summernote', summernoteHTML);

    // Send AJAX request
    $.ajax({
      type: 'POST',
      url: '/createevent',
      data: formData,
      processData: false,
      contentType: false,
      success: function(response) {
        setTimeout(function() {
          //viderInputs();
          showMessage(response, -1, "#4fbe87");
          $('#submit-button').prop('disabled', false).html('Post');
          document.getElementById("eventform").reset();
          $('#summernote').summernote('code', '');
          pond.removeFiles();
          pond2.removeFiles();
          pond3.removeFiles();
          pond4.removeFiles();
        }, 1000);


      },
      error: function(xhr, status, error) {
        if (xhr.responseJSON && xhr.responseJSON.errors) {
          const errors = xhr.responseJSON.errors;
          // Iterate through each error in the "errors" list
          errors.forEach(function(errorMsg) {
            // Handle each error as needed
            //console.error('Error:', errorMsg);
            showMessage(errorMsg, -1, "#dc3545");
          });
        }
        // Re-enable the submit button
        $('#submit-button').prop('disabled', false).html('Post');

      }
    });
  });
});
