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

document.getElementById('Form').addEventListener('submit', function(event) {
  event.preventDefault();

  $('#submit-button').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...');

  const files = pond.getFiles();
  const formData = new FormData(this);

  if (files.length > 0) {
    formData.append('filepond', files[0].file);
  }



  fetch('/updateachievement', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      clearFormFields();
      showMessage(data.success, -1, "#4fbe87");
      $('#submit-button').prop('disabled', false).html('Update');
    })
    .catch(error => {
      showMessage(error, 3000, "#dc3545");
      $('#submit-button').prop('disabled', false).html('Update');
    });

});
