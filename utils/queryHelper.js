export const buildQuery = (req) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Sorting (?sort=createdAt:desc)
  const sortQuery = {};
  if (req.query.sort) {
    const [field, order] = req.query.sort.split(":");
    sortQuery[field] = order === "desc" ? -1 : 1;
  }

  // Search (?search=John)
  const search = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  // Field selection (?fields=name,email,role)
  const fields = req.query.fields ? req.query.fields.split(",").join(" ") : ""; // mongoose expects space-separated list

  return { page, limit, skip, sortQuery, search, fields };
};
