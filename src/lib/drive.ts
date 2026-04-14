import { google } from 'googleapis';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export const getDriveClient = (accessToken: string) => {
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
  oauth2Client.setCredentials({ access_token: accessToken });
  
  return google.drive({ version: 'v3', auth: oauth2Client });
};

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  size?: string;
  createdTime?: string;
}

export const listMusicFiles = async (accessToken: string, folderId?: string) => {
  const drive = getDriveClient(accessToken);
  
  // Query for audio formats using proper Drive API v3 syntax
  const fileQuery = `(mimeType contains 'audio/' or fileExtension = 'mp3' or fileExtension = 'wav' or fileExtension = 'flac')`;
  const query = folderId 
    ? `'${folderId}' in parents and trashed = false and ${fileQuery}`
    : `trashed = false and ${fileQuery}`;

  try {
    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, thumbnailLink, size, createdTime)',
      spaces: 'drive',
    });

    return response.data.files as DriveFile[];
  } catch (error) {
    console.error('Error listing Drive files:', error);
    throw error;
  }
};

export const getFolderMetadata = async (accessToken: string, folderId: string) => {
  const drive = getDriveClient(accessToken);
  try {
    const response = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, mimeType',
    });
    return response.data;
  } catch (error) {
    console.error('Error getting Drive folder metadata:', error);
    throw error;
  }
};

export const makeFolderPublic = async (accessToken: string, folderId: string) => {
  const drive = getDriveClient(accessToken);
  try {
    await drive.permissions.create({
      fileId: folderId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    return true;
  } catch (error) {
    console.error('Error making folder public:', error);
    // Ignora se não conseguir (ex: políticas do workspace da conta podem bloquear).
    return false;
  }
};

