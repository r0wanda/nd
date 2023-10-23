/* eslint-env node */
module.exports = {
    extends: ['eslint:reccomended', 'plugin:@typescrip-eslint/reccomended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    rules: {
        '@typescript-eslint/ban-ts-comment': 'off'
    },
    root: true
}