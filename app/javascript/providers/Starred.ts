const STARRED_KEY = "ALGOLIA_STARRED";
const LEGACY_KEY = "ngStorage-starred";

type StarredItems = Set<string>;

const readStorage = (
  key: "ALGOLIA_STARRED" | "ngStorage-starred" = STARRED_KEY,
  defaultValue: any = new Set()
) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return defaultValue;
  }
};

const readLegacyStarred = (): StarredItems => {
  const legacyItems = readStorage(LEGACY_KEY, {});
  const objectIDs = Object.keys(legacyItems);

  return new Set(objectIDs);
};

const initialize = (): StarredItems => {
  const starred = readStorage();
  if (starred.size > 0) return starred;

  const legacyStarred = readLegacyStarred();

  if (legacyStarred.size > 0) {
    localStorage.removeItem(LEGACY_KEY);
    return legacyStarred;
  }
};

interface IStarred {
  data: StarredItems;
  add: (itemID: string) => void;
  remove: (itemID: string) => void;
  toggle: (itemID: string) => boolean;
}

class Starred implements IStarred {
  data = initialize();

  toggle = (itemID): boolean => {
    if (this.data.has(itemID)) {
      this.remove(itemID);
      return false;
    }

    this.add(itemID);
    return true;
  };

  add = (itemID: string) => {
    if (this.data.has(itemID)) return;
    this.data.add(itemID);
  };

  remove = (itemID: string) => {
    if (!this.data.has(itemID)) return;

    this.data.delete(itemID);
  };
}

export default Starred;
