/**
 * Google Drive API v3 Service for client-side file upload and management
 */

export interface GoogleDriveUploadResult {
  fileId: string;
  webViewLink: string;
  webContentLink: string;
  fileName: string;
}

const DEFAULT_ROOT_FOLDER_NAME = 'Pusat_Administrasi_Sekolah';

/**
 * Find or create a folder in Google Drive
 */
export async function getOrCreateDriveFolder(
  folderName: string = DEFAULT_ROOT_FOLDER_NAME,
  accessToken: string
): Promise<string> {
  try {
    // Search for existing folder
    const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;

    const res = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // Create folder if not found
    const createUrl = 'https://www.googleapis.com/drive/v3/files?fields=id';
    const metadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };

    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });

    if (!createRes.ok) {
      throw new Error(`Failed to create Drive folder: ${createRes.statusText}`);
    }

    const folderData = await createRes.json();
    return folderData.id;
  } catch (err) {
    console.warn('Error in getOrCreateDriveFolder:', err);
    throw err;
  }
}

/**
 * Upload a file directly to Google Drive
 */
export async function uploadFileToGoogleDrive(
  file: File,
  accessToken: string,
  categoryFolder?: string,
  onProgress?: (progress: number) => void
): Promise<GoogleDriveUploadResult> {
  if (!accessToken) {
    throw new Error('Google OAuth Access Token is required to upload to Google Drive.');
  }

  if (onProgress) onProgress(10);

  // 1. Get root or category folder
  let parentFolderId: string | null = null;
  try {
    const rootFolderId = await getOrCreateDriveFolder(DEFAULT_ROOT_FOLDER_NAME, accessToken);
    if (categoryFolder) {
      parentFolderId = await getOrCreateDriveFolder(`${categoryFolder}`, accessToken);
    } else {
      parentFolderId = rootFolderId;
    }
  } catch (err) {
    console.warn('Could not set parent folder, uploading to Drive root:', err);
  }

  if (onProgress) onProgress(30);

  // 2. Prepare Multipart Upload Body
  const metadata = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    parents: parentFolderId ? [parentFolderId] : []
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink';

  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: form
  });

  if (onProgress) onProgress(80);

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Google Drive upload failed (${uploadRes.status}): ${errText}`);
  }

  const fileData = await uploadRes.json();
  const fileId = fileData.id;

  // 3. Make file readable by anyone with link (so teachers can view/download)
  try {
    const permissionUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`;
    await fetch(permissionUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    });
  } catch (permErr) {
    console.warn('Permission set warning:', permErr);
  }

  if (onProgress) onProgress(100);

  // Construct direct download & preview URLs
  const webViewLink = fileData.webViewLink || `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  const webContentLink = fileData.webContentLink || `https://drive.google.com/uc?id=${fileId}&export=download`;

  return {
    fileId,
    webViewLink,
    webContentLink,
    fileName: file.name
  };
}

/**
 * Delete a file from Google Drive
 */
export async function deleteFileFromGoogleDrive(fileId: string, accessToken: string): Promise<void> {
  if (!fileId || !accessToken) return;
  try {
    const deleteUrl = `https://www.googleapis.com/drive/v3/files/${fileId}`;
    await fetch(deleteUrl, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  } catch (err) {
    console.warn('Could not delete file from Google Drive:', err);
  }
}
