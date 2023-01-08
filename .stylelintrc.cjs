module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-vue',
    'stylelint-config-recommended-less',
  ],
  customSyntax: "postcss-less",
  overrides: [
    {
      "files": ["**/*.vue"],
      "customSyntax": "postcss-html"
    },
  ],
  rules: {
    'indentation': 2,
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep']
      }
    ],
    'no-descending-specificity': null
  }
}
