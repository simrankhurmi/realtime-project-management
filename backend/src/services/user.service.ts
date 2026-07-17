import { User } from '../models';

export class UserService {
  async listActive() {
    const users = await User.find({ isActive: true })
      .select('firstName lastName email role')
      .sort({ firstName: 1 });

    return users.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }));
  }
}

export const userService = new UserService();
