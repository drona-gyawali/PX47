import { Router } from 'express';
import { loginUser, registerUser, me } from '../controller/userController.js';
import {
  UpdateAudio,
  CreateAudio,
  generatePresignedUrl,
  fileUploadCompleted,
  getUserContent,
  getContentAccess,
} from '../controller/audioController.js';
import {
  CreateVideo,
  UpdateVideo,
  VideoUploadCompleted,
} from '../controller/videoController.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

/* 
    Authentication route
*/
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.get('/auth/profile', AuthMiddleware, me);

/* 
    Audio route
*/
router.post('/audio', AuthMiddleware, CreateAudio);
router.put('/audio/:audioId', AuthMiddleware, UpdateAudio);

/* 
    video route
*/
router.post('/video', AuthMiddleware, CreateVideo);
router.put('/video/:videoId', AuthMiddleware, UpdateVideo);

/* 
    s3 video confirmation
*/

router.post('/videoUploaded/:videoId', AuthMiddleware, VideoUploadCompleted);

/* 
    Presigned url generator
*/
router.post(
  '/generate-presigned-url/:fileName',
  AuthMiddleware,
  generatePresignedUrl,
);

/* 
    S3 audio upload confirmation
*/
router.post('/fileUploaded/:audioId', AuthMiddleware, fileUploadCompleted);

/* 
    Fetch user audio file metadata
*/
router.get('/contents', AuthMiddleware, getUserContent);

/* 
    Grant access to the user file from s3(limited time)
*/
router.post('/get-content-access/:key', AuthMiddleware, getContentAccess);

export default router;
