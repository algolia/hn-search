const pluralize = (val: number, word: string, plural = word + "s") => {
  const _pluralize = (num, word, plural = word + "s") =>
    [1, -1].includes(Number(num)) ? word : plural;

  if (typeof val === "object")
    return (num, word) => _pluralize(num, word, val[word]);

  return _pluralize(val, word, plural);
};

export default pluralize;
