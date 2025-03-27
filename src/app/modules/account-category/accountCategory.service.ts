/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryBuilder from "../../builder/QueryBuilder";
import { AccountCategory } from "./accountCategory.model";
import { IAccountCategory } from "./accountCategour.interface";

const post = async (payload: IAccountCategory) => {
  return await AccountCategory.create(payload);
};

const get = async (id: string) => {
  return await AccountCategory.findById(id);
};

const getAll = async (query: Record<string, any>) => {
  const queryObj = new QueryBuilder(AccountCategory.find(), query);
  const data = await queryObj
    .search(["name"])
    .filter()
    .sort()
    .paginate()
    .modelQuery.exec();

  const meta = await queryObj.countTotal();

  return {
    data,
    meta,
  };
};

export const AccountTypeService = {
  post,
  get,
  getAll,
};
