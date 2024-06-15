const fs = require('fs');
const { google } = require('googleapis');
const apikeys = require('./apigooglekey.json');
const SCOPE = ['https://www.googleapis.com/auth/drive'];

// A Function that can provide access to Google Drive API
async function authorize() {
    const jwtClient = new google.auth.JWT(
        apikeys.client_email,
        null,
        apikeys.private_key,
        SCOPE
    );

    await jwtClient.authorize();
    return jwtClient;
}

// A Function that will upload the desired file to Google Drive folder
async function uploadFile(authClient, name, parents, filePath, mimeType) {
    return new Promise((resolve, reject) => {
        const drive = google.drive({ version: 'v3', auth: authClient }); 

        const fileMetaData = {
            name: name,    
            parents: parents
        };

        drive.files.create({
            resource: fileMetaData,
            media: {
                body: fs.createReadStream(filePath), // File that will get uploaded
                mimeType: mimeType
            },
            fields: 'id'
        }, function(error, file) {
            if (error) {
                return reject(error);
            }
            resolve(file);
        });
    });
}
async function createFolder(authClient, folderName, parentFolderId = null) {
    return new Promise((resolve, reject) => {
        const drive = google.drive({ version: 'v3', auth: authClient });

        const fileMetadata = {
            'name': folderName,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': parentFolderId ? [parentFolderId] : []
        };

        drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        }, function (err, file) {
            if (err) {
                return reject(err);
            }
            resolve(file.data.id);
        });
    });
}



module.exports = { authorize, createFolder, uploadFile };
