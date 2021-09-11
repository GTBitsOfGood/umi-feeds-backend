import express, { Response, Request } from 'express';
import { uid } from 'uid';
import { UploadedFile } from 'express-fileupload';
import { uploadFile } from '../../util/image';

const router = express.Router();

// For all your testing dreams

router.post('/upload', (req: Request, res: Response) => {
    // taking image so for postman in form-data for POST request, attach a key image with its value being the image file
    // the uid here is just for testing, actually it should be belonging to the user
    console.log(uid());
    const url = uploadFile(req.files.image as UploadedFile, uid());
    res.send(url);
});

export default router;
