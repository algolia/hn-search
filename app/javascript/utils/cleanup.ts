const cleanup = (input?: string) => {
  if (!input) return input;

  // handle line breaks
  let string = input.replace(/(\\r)?\\n/g, "<br />");

  // remove stopwords highlighting
  string = string.replace(
    /<em>(a|an|s|is|and|are|as|at|be|but|by|for|if|in|into|is|it|no|not|of|on|or|such|the|that|their|then|there|these|they|this|to|was|will|with)<\/em>/gi,
    "$1"
  );

  // work-around =\\" escaping bug (6c92ae092359647c04804876139516163d0567de)
  string = string.replace(/=\\"/g, '="');

  // XSS (seems HN is not stripping all of them)
  // string = $("<div />")
  //   .text(string)
  //   .html()
  // keep some tags like <p>, <pre>, <em>, <strong>, <code> & <i>
  // .replace(/&lt;(\/?)(p|pre|code|em|strong|i)&gt;/g, "<$1$2>")
  // // restore predefined XML entities (quotes, apos & amps)
  // .replace(/&quot;/g, '"')
  // .replace(/&apos;/g, "'")
  // .replace(/&amp;/g, "&")
  // // restore links as well
  // .replace(
  //   /&lt;a href="([^"]+?)" rel="nofollow"&gt;(.+?)&lt;\/a&gt;/g,
  //   '<a href="$1" rel="nofollow">$2</a>'
  // );

  return string;
};

export default cleanup;
