import { Response, Request, NextFunction } from 'express';

import { BlobServiceClient, ContainerClient} from '@azure/storage-blob';
import { UploadedFile } from 'express-fileupload';

const sasToken = process.env.storagesastoken || 'sv=2019-12-12&ss=b&srt=sco&sp=rwdlacx&se=2021-03-17T01:19:33Z&st=2021-02-16T18:19:33Z&spr=https&sig=1cPkIKyFMSghjuiMyHgiBFSC6pnKiW86U%2FlF6O%2Fgzcw%3D';
const containerName = 'image-container';
const storageAccountName = process.env.storageresourcename || 'umifeedsimageupload';

export const isStorageConfigured = () => {
  return (!storageAccountName || !sasToken) ? false : true;
};

// return list of blobs in container to display
const getBlobsInContainer = async (containerClient: ContainerClient) => {
  const returnedBlobUrls: string[] = [];

  // get list of blobs in container
  for await (const blob of containerClient.listBlobsFlat()) {
    // if image is public, just construct URL
    returnedBlobUrls.push(
      `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blob.name}`
    );
  }

  return returnedBlobUrls;
};

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
          const blobSVC = storage.createBlobService('DefaultEndpointsProtocol=https;AccountName=umifeedsimageupload;AccountKey=SYmnFv5x5fhqiSe6sdqyeaiu299/zvlwaRDd6mnMrjXgsGfiVra1SY8mVntzAz+Ks9HQoUv/tV8qfhaZO4IJcw==;EndpointSuffix=core.windows.net');

        
          blobSVC.createBlockBlobFromText(containerName, imgRequest.name, imgRequest.data, function(err: any) {
            if (err)
                return res.status(500).send(err);
        
            res.send('File uploaded!');
          });

        }
    } catch (err) {
      res.status(500).send(err);
    }
};