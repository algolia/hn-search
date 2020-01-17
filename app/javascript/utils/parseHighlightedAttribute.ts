export const HIGHLIGHT_TAGS = {
  pre: `__ais-highlight__`,
  post: `__/ais-highlight__`
};

/**
 * Parses an highlighted attribute into an array of objects with the string value, and
 * a boolean that indicated if this part is highlighted.
 * https://github.com/algolia/react-instantsearch/blob/b5fe4f76b15523835a3ca10f8d82ba24f937a545/packages/react-instantsearch-core/src/core/highlight.js#L17-L48
 *
 * @param {string} pre - string used to identify the start of an highlighted value
 * @param {string} post - string used to identify the end of an highlighted value
 * @param {string} highlightedValue - highlighted attribute as returned by Algolia highlight feature
 * @return {object[]} - An array of {value: string, isHighlighted: boolean}.
 */
const parseHighlightedAttribute = (highlightedValue: string = "") => {
  const { pre, post } = HIGHLIGHT_TAGS;
  const splitByPres = highlightedValue.split(pre);
  const firstValue = splitByPres.shift();

  const elements =
    firstValue === "" ? [] : [{ value: firstValue, isHighlighted: false }];

  if (post === pre) {
    let isHighlighted = true;
    splitByPres.forEach(split => {
      elements.push({ value: split, isHighlighted });
      isHighlighted = !isHighlighted;
    });
  } else {
    splitByPres.forEach(split => {
      const splitByPost = split.split(post);

      elements.push({
        value: splitByPost[0],
        isHighlighted: true
      });

      if (splitByPost[1] !== "") {
        elements.push({
          value: splitByPost[1],
          isHighlighted: false
        });
      }
    });
  }

  return elements;
};

export default parseHighlightedAttribute;
