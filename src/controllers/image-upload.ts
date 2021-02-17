import { Response, Request, NextFunction } from 'express';

import { BlobServiceClient, ContainerClient} from '@azure/storage-blob';

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

const createBlobInContainer = async (containerClient: ContainerClient, file: File) => {
  
  // create blobClient for container
  const blobClient = containerClient.getBlockBlobClient(file.name);

  // set mimetype as determined from browser with file upload control
  const options = { blobHTTPHeaders: { blobContentType: file.type } };

  // upload file
  await blobClient.uploadBrowserData(file, options);
};

export const uploadFileToBlob = async (file: File | null): Promise<string[]> => {
  if (!file) return [];

  // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
  const blobService = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
  );

  // get Container - full public read access
  const containerClient: ContainerClient = blobService.getContainerClient(containerName);
  await containerClient.createIfNotExists({
    access: 'container',
  });

  // upload file
  await createBlobInContainer(containerClient, file);

  // get list of blobs in container
  return getBlobsInContainer(containerClient);
};

// export default uploadFileToBlob;

export const postImage = (req: Request, res: Response) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            // const image = req.files.image;
            // uploadFileToBlob(image);
        }
    } catch (err) {
        res.status(500).send(err);
    }
};