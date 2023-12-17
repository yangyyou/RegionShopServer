import * as crypto from 'crypto';

export function encryptPassword(password: string) {
  if (!password || password.length == 0) {
    return null;
  } else {
    const encrypt = crypto.createHmac('sha256', password).digest('hex');
    return encrypt;
  }
}
