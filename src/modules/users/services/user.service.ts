import { userRepository } from "../repositories/user.repository";
import { ApiError } from "../../../shared/utils/ApiError";
import { UserRole } from "../interfaces/user.interface";
import { activityFeedService } from "../../../shared/activity/services/activity.service";
import { ActivityType } from "../../../shared/activity/models/activity.model";

export class UserService {
  async listStaff() {
    return userRepository.findAll();
  }

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw ApiError.notFound("User not found");
    return user;
  }

  async updateProfile(id: string, data: { name?: string; phone?: string }) {
    const user = await userRepository.update(id, data);
    if (!user) throw ApiError.notFound("User not found");
    return user;
  }

  async changeRole(id: string, role: UserRole, actor?: string) {
    const user = await userRepository.update(id, { role });
    if (!user) throw ApiError.notFound("User not found");
    await activityFeedService.record({
      type: ActivityType.STAFF_ROLE_CHANGED,
      message: `${user.name}'s role changed to ${role.toLowerCase()}`,
      entityType: "User",
      entityId: (user as any)._id ? (user as any)._id.toString() : (user as any).id,
      actor,
    });
    return user;
  }

  async deactivate(id: string, actor?: string) {
    const user = await userRepository.setActive(id, false);
    if (!user) throw ApiError.notFound("User not found");
    await activityFeedService.record({
      type: ActivityType.STAFF_DEACTIVATED,
      message: `${user.name}'s account was deactivated`,
      entityType: "User",
      entityId: (user as any)._id ? (user as any)._id.toString() : (user as any).id,
      actor,
    });
    return user;
  }

  async reactivate(id: string, actor?: string) {
    const user = await userRepository.setActive(id, true);
    if (!user) throw ApiError.notFound("User not found");
    await activityFeedService.record({
      type: ActivityType.STAFF_REACTIVATED,
      message: `${user.name}'s account was reactivated`,
      entityType: "User",
      entityId: (user as any)._id ? (user as any)._id.toString() : (user as any).id,
      actor,
    });
    return user;
  }
}

export const userService = new UserService();