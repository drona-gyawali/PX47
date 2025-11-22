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
    Presigned url generator
*/
router.post(
  '/generate-presigned-url/:fileName',
  AuthMiddleware,
  generatePresignedUrl,
);

/* 
    S3 upload confirmation
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
