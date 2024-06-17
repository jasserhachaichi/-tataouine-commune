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
        }, function (error, file) {
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


async function createSheet(authClient, folderId, sheetTitle, labels) {
    return new Promise((resolve, reject) => {
        const drive = google.drive({ version: 'v3', auth: authClient });
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        sheets.spreadsheets.create({
            resource: {
                properties: {
                    title: sheetTitle
                }
            }
        }, async function (err, spreadsheet) {
            if (err) {
                console.error('Error creating spreadsheet:', err);
                return reject(err);
            }

            const spreadsheetId = spreadsheet.data.spreadsheetId;
            const sheetTitle = 'Sheet1'; // Default sheet title

            // Update sheet properties
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: spreadsheetId,
                resource: {
                    requests: [{
                        updateSheetProperties: {
                            properties: {
                                sheetId: 0, // first sheet
                                title: sheetTitle,
                                gridProperties: {
                                    rowCount: 1, // Number of rows
                                    columnCount: labels.length // Number of columns
                                }
                            },
                            fields: 'title,gridProperties(rowCount,columnCount)'
                        }
                    }]
                }
            });

            // Update the first row with labels
            const updateRange = `${sheetTitle}!A1:${String.fromCharCode(64 + labels.length)}1`;
            const updateValues = [labels]; // Labels as an array of strings

            await sheets.spreadsheets.values.update({
                spreadsheetId: spreadsheetId,
                range: updateRange,
                valueInputOption: 'RAW',
                resource: {
                    values: updateValues
                }
            });

            // Move the spreadsheet to the specified folder
            await drive.files.update({
                fileId: spreadsheetId,
                addParents: folderId,
                removeParents: 'root',
                fields: 'id,parents'
            });

            resolve(spreadsheetId);
        });
    });
}



async function appendToSheet(authClient, spreadsheetId, values) {
    // Convert arrays to comma-separated strings
    const formattedValues = values.map(value => {
        if (Array.isArray(value)) {
            return value.join(', '); // Join array elements with a comma and space
        }
        return value;
    });

    return new Promise((resolve, reject) => {
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: 'Sheet1!A:A', // Assumes data starts from column A
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [formattedValues]
            }
        }, (err, response) => {
            if (err) {
                console.error('Error appending to spreadsheet:', err);
                return reject(err);
            }
            resolve(response);
        });
    });
}

async function deleteFolder(authClient, folderId) {
    const drive = google.drive({ version: 'v3', auth: authClient });

    try {
        await drive.files.delete({
            fileId: folderId
        });
        console.log(`Folder ${folderId} deleted from Google Drive`);
    } catch (error) {
        console.error(`Error deleting folder ${folderId} from Google Drive:`, error);
        throw error;
    }
}






module.exports = { authorize, createFolder, uploadFile, createSheet, appendToSheet,deleteFolder};
