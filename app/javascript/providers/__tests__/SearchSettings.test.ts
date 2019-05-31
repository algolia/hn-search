import {
  AUTHORS_REGEXP,
  extractByRegExp,
  extractAuthorsQuery,
  extractPointsQuery,
  extractCommentsQuery,
  extractCreatedAtQuery,
  extractStoryQuery,
  parseTagFiltersFromQuery
} from "../SearchSettings";

const VALID_NUMERICAL_OPERATORS = ["!=", ">", "<", "<=", ">=", "="];

describe("extractByRegExp", () => {
  it("blank", () => {
    expect(extractByRegExp("", AUTHORS_REGEXP)).toStrictEqual([]);
  });

  it("undefined", () => {
    expect(extractByRegExp(undefined, AUTHORS_REGEXP)).toStrictEqual([]);
  });

  it("no match", () => {
    expect(
      extractByRegExp("authorzz:jonas testing", AUTHORS_REGEXP)
    ).toStrictEqual([]);
  });

  it("space match", () => {
    expect(
      extractByRegExp("author: jonas testing", AUTHORS_REGEXP)
    ).toStrictEqual(["author: jonas"]);
  });

  it("single match", () => {
    expect(extractByRegExp("author:jonas testing", AUTHORS_REGEXP)).toEqual([
      "author:jonas"
    ]);
  });

  it("multiple match", () => {
    expect(
      extractByRegExp("author:jonas author:other", AUTHORS_REGEXP)
    ).toEqual(["author:jonas", "author:other"]);
  });
});

describe("extractAuthorsQuery", () => {
  const tests = [
    {
      query: "author:jonas author: marc",
      expectation: {
        query: "",
        tagFilters: ["author_jonas", "author_marc"],
        numericFilters: []
      }
    },
    {
      query: "author:jonas author: marc_testing some_leftover query",
      expectation: {
        query: "some_leftover query",
        tagFilters: ["author_jonas", "author_marc_testing"],
        numericFilters: []
      }
    },
    {
      query: "author:",
      expectation: {
        query: "author:",
        tagFilters: [],
        numericFilters: []
      }
    },
    {
      query: "",
      expectation: {
        query: "",
        tagFilters: [],
        numericFilters: []
      }
    }
  ];

  tests.map(test => {
    it(test.query, () => {
      expect(extractAuthorsQuery(test.query)).toEqual(test.expectation);
    });
  });
});

describe("extractPointsQuery", () => {
  const tests = [
    {
      query: "points>20 points>30 test",
      expectation: {
        query: "test",
        numericFilters: ["points>20", "points>30"],
        tagFilters: []
      }
    },
    {
      query: "points=20 points<=30 test",
      expectation: {
        query: "test",
        numericFilters: ["points=20", "points<=30"],
        tagFilters: []
      }
    },
    {
      query: "points=20 testing points<=30",
      expectation: {
        query: "testing",
        numericFilters: ["points=20", "points<=30"],
        tagFilters: []
      }
    },
    {
      query: "points=",
      expectation: { query: "points=", numericFilters: [], tagFilters: [] }
    },
    {
      query: "=",
      expectation: { query: "=", numericFilters: [], tagFilters: [] }
    }
  ];

  tests.map(test => {
    it(test.query, () => {
      expect(extractPointsQuery(test.query)).toEqual(test.expectation);
    });
  });

  VALID_NUMERICAL_OPERATORS.map(operator => {
    it(operator, () => {
      const points = Math.round(Math.random() * 100);
      const query = `points${operator}${points}`;
      expect(extractPointsQuery(query)).toEqual({
        query: "",
        numericFilters: [query],
        tagFilters: []
      });
    });
  });
});

describe("extractCommentsQuery", () => {
  const tests = [
    {
      query: "comments>20 comments=30 test",
      expectation: {
        query: "test",
        numericFilters: ["num_comments>20", "num_comments=30"],
        tagFilters: []
      }
    }
  ];

  tests.map(test => {
    it(test.query, () => {
      expect(extractCommentsQuery(test.query)).toEqual(test.expectation);
    });
  });

  VALID_NUMERICAL_OPERATORS.map(operator => {
    it(operator, () => {
      const points = Math.round(Math.random() * 100);
      const query = `comments${operator}${points}`;
      expect(extractCommentsQuery(query)).toEqual({
        query: "",
        numericFilters: [query.replace("comments", "num_comments")],
        tagFilters: []
      });
    });
  });
});

describe("extractCreatedAtQuery", () => {
  const tests = [
    {
      query: "date=12345 date>6789 test",
      expectation: {
        query: "test",
        numericFilters: ["created_at_i=12345", "created_at_i>6789"],
        tagFilters: []
      }
    }
  ];

  tests.map(test => {
    it(test.query, () => {
      expect(extractCreatedAtQuery(test.query)).toEqual(test.expectation);
    });
  });

  VALID_NUMERICAL_OPERATORS.map(operator => {
    it(operator, () => {
      const points = Math.round(Math.random() * 100);
      const query = `date${operator}${points}`;
      expect(extractCreatedAtQuery(query)).toEqual({
        query: "",
        numericFilters: [query.replace("date", "created_at_i")],
        tagFilters: []
      });
    });
  });
});

describe("extractStoryQuery", () => {
  const tests = [
    {
      query: "story:12345 story:6789 test",
      expectation: {
        query: "test",
        tagFilters: ["story_12345", "story_6789"],
        numericFilters: []
      }
    }
  ];

  tests.map(test => {
    it(test.query, () => {
      expect(extractStoryQuery(test.query)).toEqual(test.expectation);
    });
  });
});

describe("parseTagFilters", () => {
  const tests = [
    {
      query: "story:12345 points=30 comments>30 author:jonas date=12345 test",
      expectation: {
        query: "test",
        numericFilters: ["points=30", "num_comments>30", "created_at_i=12345"],
        tagFilters: ["author_jonas", "story_12345"]
      }
    },
    {
      query: "story:12345 points=30 comments>30 author:jonas test",
      expectation: {
        query: "test",
        numericFilters: ["points=30", "num_comments>30"],
        tagFilters: ["author_jonas", "story_12345"]
      }
    }
  ];

  tests.map(test => {
    it(test.query, () => {
      expect(parseTagFiltersFromQuery(test.query)).toEqual(test.expectation);
    });
  });
});
