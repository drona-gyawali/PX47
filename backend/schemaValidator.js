import z from 'zod';

export const RegisterSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(
      z
        .email({ message: 'Invalid email address' })
        .transform((email) => email.toLowerCase()),
    ),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const strTransform = (val) =>
  typeof val === 'string' ? val.trim().toLowerCase() : val;

export const AudioSchema = z.object({
  userId: z.string().min(2).max(255).transform(strTransform),
  s3: z.json().default('{}').optional(),
  codec: z.string().max(255).optional().transform(strTransform),
  title: z.string().max(255).optional().transform(strTransform),
  album: z.string().max(255).optional().transform(strTransform),
  genre: z.string().max(255).optional().transform(strTransform),
  trackNumber: z.coerce.number().int().min(1).max(255).optional(),
  comments: z.string().min(2).max(255).optional().transform(strTransform),
  duration: z.number().min(0).optional(),
  sampleRate: z.number().int().min(1).optional(),
  bitRate: z.number().int().min(1).optional(),
  channels: z.number().int().min(1).optional(),
  fileSize: z.coerce
    .bigint()
    .optional()
    .refine((n) => n === undefined || n > 0, {
      message: 'fileSize must be > 0',
    }),
  fileName: z.string().max(255).optional().transform(strTransform),
  fileType: z.string().max(255).optional().transform(strTransform),
  status: z.enum(['uploading', 'processing', 'ready', 'failed', 'corrupted']),
});

export const VideoSchema = z.object({
  userId: z.string().min(2).max(255).transform(strTransform),
  audioId: z.string().min(2).max(255).optional().transform(strTransform),
  s3: z.json().default('{}').optional(),
  codec: z.string().max(255).optional().transform(strTransform),
  title: z.string().max(255).optional().transform(strTransform),
  album: z.string().max(255).optional().transform(strTransform),
  genre: z.string().max(255).optional().transform(strTransform),
  trackNumber: z.coerce.number().int().min(1).max(255).optional(),
  duration: z.number().min(0).optional(),
  bitRate: z.number().int().min(1).optional(),
  format_name: z.string().max(255).optional().transform(strTransform),
  width: z.number().int().min(1).optional(),
  height: z.number().int().min(1).optional(),
  pix_fmt: z.string().max(255).optional().transform(strTransform),
  fps: z.number().int().optional(),
  aspect_ratio: z.string().max(255).optional().transform(strTransform),
  color_space: z.string().max(255).optional().transform(strTransform),
  color_primaries: z.string().max(255).optional().transform(strTransform),
  color_transfer: z.string().max(255).optional().transform(strTransform),
  language: z.string().max(255).optional().transform(strTransform),
  has_audio: z.boolean().optional(),
  size: z.coerce
    .bigint()
    .optional()
    .refine((n) => n === undefined || n > 0, {
      message: 'fileSize must be > 0',
    }),
  fileName: z.string().max(255).optional().transform(strTransform),
  status: z.enum(['uploading', 'processing', 'ready', 'failed', 'corrupted']),
});
