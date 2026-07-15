import { UserModel, UserDocument } from "../../users/models/user.model";

export class UserRepository {
  async findByEmail(email: string, includePassword = false): Promise<UserDocument | null> {
    const query = UserModel.findOne({ email: email.toLowerCase() });
    if (includePassword) query.select("+password");
    return query.exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).exec();
  }

  async create(data: Partial<UserDocument>): Promise<UserDocument> {
    return UserModel.create(data);
  }

  async findAll(filter: Record<string, unknown> = {}): Promise<UserDocument[]> {
    return UserModel.find(filter).exec();
  }

  async update(id: string, data: Partial<UserDocument>): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async setActive(id: string, isActive: boolean): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, { isActive }, { new: true }).exec();
  }

  /**
   * Updates a user's password. Deliberately uses findById + save() rather
   * than findByIdAndUpdate, since the latter bypasses the pre("save")
   * password-hashing hook on the model.
   */
  async updatePassword(id: string, newPassword: string): Promise<UserDocument | null> {
    const user = await UserModel.findById(id).select("+password");
    if (!user) return null;
    user.password = newPassword;
    await user.save();
    return user;
  }
}

export const userRepository = new UserRepository();