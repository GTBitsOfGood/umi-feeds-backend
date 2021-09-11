import { UploadedFile } from 'express-fileupload';
import storage from 'azure-storage';
import config from '../config';
// import { Response, Request, NextFunction } from 'express';
// import { uid } from 'uid';
// import { String } from 'lodash';

const Config = config[process.env.NODE_ENV || 'development'];
const containerName = 'image-container';

/**
 * NOT NEEDED FOR NOW
 * Upload one or multiple images into Azure. This is helpful because express-fileupload gives you an UploadedFile | UploadedFile[]
 * @param files a single image file, or an array of image files
 * @returns the image URLs of the uploaded files
 */
// export function uploadFileOrFiles(files: UploadedFile | UploadedFile[]): string[] {
//     if (Array.isArray(files)) {
//         return uploadFiles(files);
//     } else {
//         return [uploadFile(files)];
//     }
// }

/**
 * NOT NEEDED FOR NOW
 * Upload multiple images into Azure
 * @param files image files
 * @returns the image URLs of the uploaded files
 */
// export function uploadFiles(files: UploadedFile[]): string[] {
//     return files.map(file => uploadFile(file));
// }

/**
 * Upload single image into Azure
 * @param file image file
 * @param user_uid the user id that the file belongs to
 * @return url string to the uploaded blob file
 */
export function uploadFile(file: UploadedFile, user_uid: string) {
    const blobSVC = storage.createBlobService(process.env.CONNECTION_STRING_AZURE);
    const imgRequest = file as UploadedFile;
    const index: number = imgRequest.name.lastIndexOf('.');
    let blobName: string = imgRequest.name.substring(0, index);
    blobName = blobName.concat('_', user_uid);

    // Please note that this part is async(will return first before result is returned) but is going to have to do as we don't have an background processing server
    blobSVC.createBlockBlobFromText(Config.ImageContainerName, blobName, imgRequest.data, (error: Error, results) => {
        if (error) {
            console.error(`Error in createBlockBlobFromText: ${error}`);
            throw new Error(error.message);
        }
        console.log(results);
    });
    return `${Config.ImageURL}/${Config.ImageContainerName}/${blobName}`;
}
