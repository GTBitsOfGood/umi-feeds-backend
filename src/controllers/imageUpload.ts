import { Response, Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import storage from 'azure-storage';
import { uid } from 'uid';

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
            // let unique = false;
            const uniqueID: string = uid(11);
            const index: number = imgRequest.name.lastIndexOf('.');
            let blobName: string = imgRequest.name.substring(0, index);
            blobName = blobName.concat('_', uniqueID, imgRequest.name.substring(index));

            // TODO: This code is supposed to try to repeatedly a new UID if an image with this name and UID already exists. The while loop apparently does not terminate, unfortunately. I think we may want to use recursion. Anyway, the chances are pretty low that a file with this name already exists, and even if we overwrite an old file, it's not a huge deal.
            // while (!unique) {
            //     uniqueID = uid(11);
            //     index = imgRequest.name.lastIndexOf('.');
            //     blobName = imgRequest.name.substring(0, index) + '_' + uniqueID + imgRequest.name.substring(index);
            //     unique = true;

            //     blobSVC.doesBlobExist(containerName, blobName, function(error, result) {
            //         if (!error) {
            //           if (result.exists) {
            //             unique = true;
            //           } else {
            //           }
            //         }
            //       });
            // }

            blobSVC.createBlockBlobFromText(containerName, blobName, imgRequest.data, (err: Error) => {
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
