import BaseRepo from './baseRepo.js';
import prisma from '../config/db.js';
import { logger } from '../config/logger.js';

class UserRepo {
  constructor() {
    this.repo = new BaseRepo(prisma.user);
  }

  async Register(data) {
    try {
      const registered = await this.repo.create(data);
      if (!registered) return { message: 'falied to create user' };
      logger.info(`register| data=${registered}`);
      return registered;
    } catch (error) {
      throw new Error(`Error occurred while registering user: ${error}`);
    }
  }

  async GetUser(email) {
    try {
      const fetched = await this.repo.get({ email });
      return fetched;
    } catch (error) {
      throw new Error(`Error occurred while getting user: ${error}`);
    }
  }

  async GetUserbyId(id) {
    try {
      const fetched = await this.repo.get({ id });
      return fetched;
    } catch (error) {
      throw new Error(`Error occurred while getting user: ${error}`);
    }
  }
}

export default UserRepo;
