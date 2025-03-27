import { AccountCategory } from "./accountCategory.model";
import { defaultAccountType } from "./accountCategour.interface";

export const postDefaultAccountType = async () => {
  try {
    console.log("Inserting Default account type");
    const postPromise = defaultAccountType.map(async (at) => {
      const doesExists = await AccountCategory.exists({ name: at.name });
      if (!doesExists) {
        await AccountCategory.create(at);
      }
    });

    return await Promise.all(postPromise);
  } catch (error) {
    console.error(error);
  }
};
