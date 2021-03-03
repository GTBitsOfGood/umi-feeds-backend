import { UploadedFile } from 'express-fileupload';
import { Response, Request, NextFunction } from 'express';
import storage from 'azure-storage';

const containerName = 'image-container';

/**
 * Upload multiple images into Azure 
 * @param files images 
 */
export function uploadFiles(files: UploadedFile[], res: Response): string[] {
    const blobSVC = storage.createBlobService(process.env.CONNECTION_STRING_AZURE);
    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
        const imgRequest = files[i] as UploadedFile;
        blobSVC.createBlockBlobFromText(containerName, imgRequest.name, imgRequest.data, (error: Error) => {
            if (error) {
                console.error(`Error in createBlockBlobFromText: ${error}`);
                return res.status(500).json({error: error.message});
            }
        });
        const url = 'https://umifeedsimageupload.blob.core.windows.net/' + containerName + '/' + imgRequest.name; 
        urls.push(url);
    }
    return urls;
}

/**
 * Upload single image into Azure
 * @param file image
 */
export function uploadFile(file: UploadedFile, res: Response): string[] {
    const blobSVC = storage.createBlobService(process.env.CONNECTION_STRING_AZURE);
    const urls: string[] = [];
    const imgRequest = file as UploadedFile;

    blobSVC.createBlockBlobFromText(containerName, imgRequest.name, imgRequest.data, (error: Error) => {
        if (error) {
            console.error(`Error in createBlockBlobFromText: ${error}`);
            return res.status(500).json({error: error.message});
        }
    });
    const url = 'https://umifeedsimageupload.blob.core.windows.net/' + containerName + '/' + imgRequest.name; 
    urls.push(url);
    return urls;
}

