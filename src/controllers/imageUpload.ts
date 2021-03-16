import { Response, Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import storage from 'azure-storage';

const containerName = 'image-container';

/**
 * Upload an image to Azure Blob Storage.
 * @param req Send a multipart/form-data request with the "image" key as the image you are uploading.
 * @route POST /upload
 */
export const postImage = (req: Request, res: Response) => {
    try {
        if (!req.files) {
            res.status(400).send({
                status: false,
                message: 'No file uploaded',
                sentReq: String(req.files)
            });
        } else if (!req.files.image) {
            res.status(400).send({
                status: false,
                message: 'No file attached to the key "image" in your request',
                sentReq: String(req.files)
            });
        } else {
            const imgRequest = req.files.image as UploadedFile;
            const blobSVC = storage.createBlobService(process.env.CONNECTION_STRING_AZURE);

            blobSVC.createBlockBlobFromText(containerName, imgRequest.name, imgRequest.data, (err: Error) => {
                if (err) {
                    console.error(`Error in createBlockBlobFromText: ${err}`);
                    res.status(500).send(String(err));
                } else {
                    res.send('File uploaded!');
                }
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(String(err));
    }
};
