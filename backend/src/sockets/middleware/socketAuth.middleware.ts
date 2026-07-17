import { Socket } from 'socket.io';
import { verifyAccessToken } from '../../utils/jwt';
import { User } from '../../models';

export interface AuthenticatedSocket extends Socket {
  userId: string;
  email: string;
}

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      next(new Error('Authentication required'));
      return;
    }

    const decoded = verifyAccessToken(token as string);

    const user = await User.findById(decoded.userId).select('isActive');
    if (!user || !user.isActive) {
      next(new Error('User not found or inactive'));
      return;
    }

    (socket as AuthenticatedSocket).userId = decoded.userId;
    (socket as AuthenticatedSocket).email = decoded.email;

    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
};
