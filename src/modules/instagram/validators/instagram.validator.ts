export interface GetPostsQueryInput {
  page?: number | string;
  limit?: number | string;
}

export const validateGetPostsInput = (input: GetPostsQueryInput) => {
  const page = Math.max(1, Number(input.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(input.limit) || 10));
  return { page, limit };
};