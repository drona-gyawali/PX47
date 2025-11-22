import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import {
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_ENDPOINT,
  S3_BUCKET_NAME,
  S3_REGION,
  S3_BUCKET_OBJECT_URL,
} from './conf.js';

import { S3_EXPIRES } from './constants.js';
import { logger } from './logger.js';
import fs from 'fs';
import { generateS3Key, createLocalPath } from '../helpers.js';

class Bucket {
  constructor() {
    this.Client = new S3({
      endpoint: S3_ENDPOINT,
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
      },
      region: S3_REGION,
      forcePathStyle: true,
    });
  }

  async CreatePresignedUrl(userId, fileName) {
    try {
      const key = generateS3Key(userId, fileName);

      const command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
      });

      const url = await getSignedUrl(this.Client, command, {
        expiresIn: S3_EXPIRES,
      });

      return { url, key };
    } catch (error) {
      logger.error(`Presigned URL Error: ${error}`);
      throw new Error(error);
    }
  }

  async UploadtoS3(filePath, ContentType, userId) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = filePath
        .split('/')
        .pop()
        .replace(new RegExp(`^${userId}-`), '');
      const key = generateS3Key(userId, fileName);
      const upload = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType,
        ContentLength: fileBuffer.length,
      });

      await this.Client.send(upload);

      const objectUrl = `${S3_BUCKET_OBJECT_URL}${key}`;
      return { key, objectUrl };
    } catch (error) {
      logger.error(`Upload Error: ${error}`);
      throw new Error(error);
    }
  }

  async DownloadFromS3(s3Key) {
    try {
      const fileName = s3Key.split('/').pop();
      const localPath = await createLocalPath(fileName);

      const fileStream = fs.createWriteStream(localPath);

      const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: s3Key,
      });

      const response = await this.Client.send(command);
      response.Body.pipe(fileStream);

      return new Promise((resolve, reject) => {
        fileStream.on('finish', () => {
          logger.info(`Downloaded → ${localPath}`);
          resolve(localPath);
        });
        fileStream.on('error', reject);
      });
    } catch (error) {
      logger.error(`Download Error: ${error}`);
      throw new Error(error);
    }
  }

  async GetFileAccess(key) {
    try {
      const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
      });
      const url = await getSignedUrl(this.Client, command, { expiresIn: 2300 });
      return url;
    } catch (error) {
      logger.error(`Error to access the url ${error}`);
      throw new Error(error);
    }
  }
}

export { Bucket };
