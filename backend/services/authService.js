import UserRepo from '../repository/userRepository.js';
import { hashPassword, verifyPassword, createToken } from '../helpers.js';
import { RegisterSchema } from '../schemaValidator.js';
import { ZodError } from 'zod';

class AuthService {
  constructor() {
    this.auth = new UserRepo();
  }

  async RegisterService(email, password) {
    try {
      const validated = RegisterSchema.parse({ email, password });
      const { email: validatedEmail, password: validatedPassword } = validated;
      const checkUser = await this.auth.GetUser(validatedEmail);
      if (checkUser) return { message: 'User Already Exists' };
      const hashedPassword = await hashPassword(validatedPassword);
      const registered = await this.auth.Register({
        email: validatedEmail,
        password: hashedPassword,
      });
      return registered;
    } catch (error) {
      if (error instanceof ZodError) {
        return error;
      }
      return error;
    }
  }

  async LoginService(email, password) {
    try {
      const validated = RegisterSchema.parse({ email, password });
      const { email: validatedEmail, password: validatedPassword } = validated;
      const verifyUser = await this.auth.GetUser(validatedEmail);
      if (!verifyUser) return { message: 'Unregistered user' };
      const credentialCheck = await verifyPassword(
        validatedPassword,
        verifyUser.password,
      );
      if (!credentialCheck) return { message: 'Password mismatch' };
      const token = createToken(verifyUser.id, '1h');
      return token;
    } catch (error) {
      if (error instanceof ZodError) {
        return error;
      }
      return error;
    }
  }

  async me(userId) {
    try {
      const user = await this.auth.GetUserbyId(userId);
      if (!user) {
        return EvalError('Error while fetching');
      }
      return user;
    } catch (error) {
      return error;
    }
  }
}

export default AuthService;
