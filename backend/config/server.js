import Express from 'express';
import cookieParser from 'cookie-parser';
import { PORT } from './conf.js';
import { LoggerMiddleware } from '../middleware/logger.middleware.js';
import { errorHandler } from '../middleware/errorHandler.middleware.js';
import cors from 'cors';
import authRoutes from '../routes/index.js';
import { corsOptions } from './conf.js';
const app = Express();
app.use(LoggerMiddleware);
app.use(Express.json());
app.use(errorHandler);
app.use(cookieParser());
app.use(LoggerMiddleware);
app.use(cors(corsOptions));

app.use('/api/v1/', authRoutes);

app.listen(PORT, () => {
  console.log(`Port running at ${PORT}`);
});
