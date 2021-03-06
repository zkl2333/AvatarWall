module.exports = {
    root: true,
    extends: 'eslint:recommended',
    "env": {
        "browser": true,
        "jquery": true
    },
    "parserOptions": {
        "ecmaVersion": 5
    },
    "globals": {
        "myWebSocket": false,
        "wall": false,
        "maxid": true,
        "imgXYarr": true
    },
    "rules": {
        "indent": [
            "error",
            "tab"
        ],
        "semi": ["warn", "never"],
        "quotes": "off",
        "no-console": "off",
        "no-unused-vars": "off",
        "no-unreachable": "off",
        "no-redeclare": "warn"
    }
};