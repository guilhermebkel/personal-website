export default {
  extends: ["html-validate:recommended"],
  rules: {
    // Why: two inline properties are the design's, and each is set from state at run time: animation-delay (each entrance sets its own delay: Reveal, Spotlight, the hero) and transform (the reading and quote progress bars). Every other style goes to a class.
    "no-inline-style": ["error", { allowedProperties: ["animation-delay", "transform"] }],
    // Why: Next writes async and nomodule on its scripts with a value; the generated markup is not ours to change.
    "attribute-boolean-style": "off",
    // Why: React writes self-closing void elements (meta, link) in its output.
    "void-style": "off",
    // Why: React writes charSet and fetchPriority in camel case, as its attribute names.
    "attr-case": "off",
    // Why: React writes crossorigin without a value in the generated head.
    "attribute-empty-style": "off",
    // Why: React's useId writes ids such as _R_ in the generated markup; HTML allows them, the rule does not.
    "valid-id": "off",
  },
};
