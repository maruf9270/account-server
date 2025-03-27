/* eslint-disable @typescript-eslint/no-unused-expressions */
import { FilterQuery, Query } from "mongoose";

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: "i" },
            }) as FilterQuery<T>
        ),
      });
    }

    return this;
  }

  filter(excludedFields?: string[]) {
    const queryObj = { ...this.query }; // copy

    // Filtering
    const excludeFields = ["searchTerm", "sort", "limit", "page", "fields"];
    excludedFields?.length && excludeFields.push(...excludedFields);

    excludeFields.forEach((el) => delete queryObj[el]);

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);

    return this;
  }

  sort() {
    let sortQuery = "-createdAt"; // Default sorting

    if (this?.query?.sort) {
      const sortFields = (this.query.sort as string).split(",");
      sortQuery = sortFields
        .map((field) => {
          if (field.startsWith("-")) {
            return `${field}`; // Already in descending format (-field)
          } else if (field.startsWith("+")) {
            return `${field.substring(1)}`; // Convert +field to field (ascending)
          } else {
            return `${field}`; // Default to ascending if no prefix
          }
        })
        .join(" ");
    }

    this.modelQuery = this.modelQuery.sort(sortQuery);
    return this;
  }
  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.split(",")?.join(" ") || "-__v";

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }
  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
