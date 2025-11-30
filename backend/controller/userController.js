import AuthService from '../services/authService.js';
import { successResponse, errorResponse, setCookie } from '../helpers.js';
import status from 'http-status-codes';
import { logger } from '../config/logger.js';

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const register = await new AuthService().RegisterService(email, password);
    successResponse(
      res,
      register,
      'User Registered Successfully',
      status.CREATED,
    );
  } catch (error) {
    logger.error(`Error Occured | fx=registerUser | ${error}`);
    errorResponse(res, error);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const login = await new AuthService().LoginService(email, password);
    if (login.valueError) {
      return errorResponse(res, login.valueError, status.BAD_REQUEST);
    }
    setCookie(req, res, login, false);
    successResponse(res, login, '', status.ACCEPTED);
  } catch (error) {
    logger.error(`Error Occured | fx=loginUser | ${error}`);
    errorResponse(res, error);
  }
};

export const me = async (req, res) => {
  try {
    const userDetails = await new AuthService().me(req.user.userId);
    const { password: _, ...userData } = userDetails;
    successResponse(res, userData, 'Profile details', status.ACCEPTED);
  } catch (error) {
    logger.error(`Error Occured | fx=me | ${error}`);
    errorResponse(res, error);
  }
};
