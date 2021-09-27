import { BlobUploadCommonResponse } from '@azure/storage-blob';
import intoStream from 'into-stream';
import { UploadedFile } from 'express-fileupload';

const {
    BlobServiceClient,
    StorageSharedKeyCredential,
    newPipeline
} = require('@azure/storage-blob');

const containerName = 'image-container';
const ONE_MEGABYTE = 1024 * 1024;
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };

const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.AZURE_STORAGE_ACCOUNT_NAME,
    process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY
);
const pipeline = newPipeline(sharedKeyCredential);

const blobServiceClient = new BlobServiceClient(
    `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    pipeline
);

const getBlobName = (originalName:string) : string => {
    // Use a random number to generate a unique file name,
    // removing "0." from the start of the string.
    const identifier = Math.random().toString().replace(/0\./, '');
    return `${identifier}-${originalName}`;
};

export async function uploadImageAzure(file: UploadedFile) : Promise<string> {
    const blobName = getBlobName(file.name);
    const stream = intoStream(file.data);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    return new Promise((resolve, reject) => {
        blockBlobClient.uploadStream(stream,
            uploadOptions.bufferSize, uploadOptions.maxBuffers,
            { blobHTTPHeaders: { blobContentType: file.mimetype } })
            .then(() => {
                resolve(blockBlobClient.url);
            }).catch(reject);
    });
}
