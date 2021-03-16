import { UploadedFile } from 'express-fileupload';
import { Response, Request, NextFunction } from 'express';
import storage from 'azure-storage';

const containerName = 'image-container';

/**
 * Upload one or multiple images into Azure. This is helpful because express-fileupload gives you an UploadedFile | UploadedFile[]
 * @param files a single image file, or an array of image files
 * @returns the image URLs of the uploaded files
 */
export function uploadFileOrFiles(files: UploadedFile | UploadedFile[]): string[] {
    if (Array.isArray(files)) {
        return uploadFiles(files);
    } else {
        return [uploadFile(files)];
    }
}

/**
 * Upload multiple images into Azure 
 * @param files image files
 * @returns the image URLs of the uploaded files
 */
export function uploadFiles(files: UploadedFile[]): string[] {
    return files.map(file => uploadFile(file));
}

/**
 * Upload single image into Azure
 * @param file image file
 */
export function uploadFile(file: UploadedFile): string {
    const blobSVC = storage.createBlobService(process.env.CONNECTION_STRING_AZURE);
    const imgRequest = file as UploadedFile;

    blobSVC.createBlockBlobFromText(containerName, imgRequest.name, imgRequest.data, (error: Error) => {
        if (error) {
            console.error(`Error in createBlockBlobFromText: ${error}`);
            throw new Error(error.message);
        }
    });
    return 'https://umifeedsimageupload.blob.core.windows.net/' + containerName + '/' + imgRequest.name; 
}

