import crypto from 'crypto';

export const generateId = (prefix:any) => {
  const randomStr = crypto.randomBytes(8).toString('hex');
  return `${prefix}_${randomStr}`;
};

export const successResponse = (data:any) => {
  return {
    success: true,
    data: data,
    error: null,
  };
};

export const errorResponse = (errorCode:any) => {
  return {
    success: false,
    data: null,
    error: errorCode,
  };
};

