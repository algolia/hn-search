const STARRED_KEY = "ALGOLIA_STARRED";
const LEGACY_KEY = "ngStorage-starred";

type StarredItems = Set<number>;

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
  const objectIDs = Object.keys(legacyItems).map(number => parseInt(number));
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

  public toggle = (itemID: number): boolean => {
    if (this.data.has(itemID)) {
      this.remove(itemID);
      saveStarredItems(this.data);
      return false;
    }

    this.add(itemID);
    saveStarredItems(this.data);
    return true;
  };

  public add = (itemID: number) => {
    if (this.data.has(itemID)) return;
    this.data.add(itemID);
    saveStarredItems(this.data);
  };

  public remove = (itemID: number) => {
    if (!this.data.has(itemID)) return;

    this.data.delete(itemID);
    saveStarredItems(this.data);
  };
}

export default Starred;
