const STARRED_KEY = "ALGOLIA_STARRED";
const LEGACY_KEY = "ngStorage-starred";

type StarredItems = Set<string>;

const readStorage = (
  key: "ALGOLIA_STARRED" | "ngStorage-starred" = STARRED_KEY,
  defaultValue: number[] = []
) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const readNewStarred = (): StarredItems => {
  const newStarredItems = readStorage();
  return new Set(newStarredItems);
};

const readLegacyStarred = (): StarredItems => {
  const legacyItems = readStorage(LEGACY_KEY, []);
  const objectIDs = Object.keys(legacyItems);
  return new Set(objectIDs);
};

const initializeStarredItems = (): StarredItems => {
  const starred = readNewStarred();
  if (starred.size > 0) {
    saveStarredItems(starred);
    return starred;
  }

  const legacyStarred = readLegacyStarred();

  if (legacyStarred.size > 0) {
    saveStarredItems(legacyStarred);
    return legacyStarred;
  }

  return new Set();
};

const saveStarredItems = (items: StarredItems) => {
  localStorage.setItem(STARRED_KEY, JSON.stringify(Array.from(items)));
};

interface IStarred {
  data: StarredItems;
  add: (itemID: number) => void;
  remove: (itemID: number) => void;
  toggle: (itemID: number) => boolean;
}

class Starred implements IStarred {
  data: StarredItems = initializeStarredItems();
  asString = (itemID: number) => String(itemID);

  toggle = (itemID: number): boolean => {
    const ID = this.asString(itemID);

    if (this.data.has(ID)) {
      this.remove(itemID);
      saveStarredItems(this.data);
      return false;
    }

    this.add(itemID);
    saveStarredItems(this.data);
    return true;
  };

  add = (itemID: number) => {
    const ID = this.asString(itemID);

    if (this.data.has(ID)) return;
    this.data.add(ID);
    saveStarredItems(this.data);
  };

  remove = (itemID: number) => {
    const ID = this.asString(itemID);
    if (!this.data.has(ID)) return;

    this.data.delete(ID);
    saveStarredItems(this.data);
  };
}

export default Starred;
