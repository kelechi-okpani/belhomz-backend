import { Request, Response } from "express";
import { catchAsync } from "../../../shared/utils/catchAsync";
import { sendSuccess } from "../../../shared/utils/ApiResponse";
import { ApiError } from "../../../shared/utils/ApiError";
import { propertyService } from "../services/property.service";

// export const uploadPropertyImage = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params as { id?: string | string[] };
//   const idStr = Array.isArray(id) ? id[0] : id;
//   if (!idStr || !req.file) throw ApiError.badRequest("No image file provided");

//   const property = await propertyService.uploadImage(idStr, req.file.buffer);
//   return sendSuccess(res, 200, property, "Image uploaded successfully");
// });

export const deletePropertyImage = catchAsync(async (req: Request, res: Response) => {
  const { id, publicId } = req.params as { id?: string | string[]; publicId?: string | string[] };
  const idStr = Array.isArray(id) ? id[0] : id;
  const publicIdStr = Array.isArray(publicId) ? publicId[0] : publicId;
  if (!idStr || !publicIdStr) throw ApiError.badRequest("Missing id or publicId");
  const property = await propertyService.removeImage(idStr, decodeURIComponent(publicIdStr));
  return sendSuccess(res, 200, property, "Image removed successfully");
});
