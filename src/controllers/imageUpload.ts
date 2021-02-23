import { Response, Request } from 'express';

import { UploadedFile } from 'express-fileupload';

const containerName = 'image-container';

export const postImage = (req: Request, res: Response) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded',
            });
        } else {
          const imgRequest = req.files.image as UploadedFile;

          const storage = require('azure-storage');
          const blobSVC = storage.createBlobService(process.env.CONNECTION_STRING_AZURE);

        
          blobSVC.createBlockBlobFromText(containerName, imgRequest.name, imgRequest.data, function(err: string) {
            if (err)
                return res.status(500).send(err);
        
            res.send('File uploaded!');
          });

        }
    } catch (err) {
      res.status(500).send(err);
    }
};