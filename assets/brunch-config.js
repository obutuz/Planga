exports.config = {
    // See http://brunch.io/#documentation for docs.
    files: {
        javascripts: {
            // joinTo: {
            //     "js/app.js": /^js\/(?!js_snippet.js)/,
            //     "js/js_snippet.js": /^js\/(js_snippet|socket)|^node_modules\/phoenix/
            // }
            entryPoints: {
                'js/app.js': 'js/app.js',
                'js/js_snippet.js': 'js/js_snippet.js',
            }

            // To use a separate vendor.js bundle, specify two files path
            // http://brunch.io/docs/config#-files-
            // joinTo: {
            //   "js/app.js": /^js/,
            //   "js/vendor.js": /^(?!js)/
            // }
            //
            // To change the order of concatenation of files, explicitly mention here
            // order: {
            //   before: [
            //     "vendor/js/jquery-2.1.1.js",
            //     "vendor/js/bootstrap.min.js"
            //   ]
            // }
        },
        stylesheets: {
            joinTo: "css/app.css"
        },
        templates: {
            joinTo: "js/app.js"
        },
    },

    conventions: {
        // This option sets where we should place non-css and non-js assets in.
        // By default, we set this to "/assets/static". Files in this directory
        // will be copied to `paths.public`, which is "priv/static" by default.
        assets: /^(static)/
    },

    // Phoenix paths configuration
    paths: {
        // Dependencies and current project directories to watch
        watched: ["static", "css", "js", "vendor"],
        // Where to compile files to
        public: "../priv/static"
    },

    // Configure your plugins
    plugins: {
        babel: {
            // Do not use ES6 compiler in vendor code
            ignore: [/vendor/]
        },
        // This will copy the font files to priv/static/fonts
        copycat: {
            "fonts": [
                "node_modules/semantic-ui-css/themes/default/assets/fonts"
            ]
        }

    },

    modules: {
        autoRequire: {
            "js/app.js": ["js/app"],
            "js/js_snippet.js": ["js/js_snippet"]
        }
    },

    npm: {
        enabled: true,
        styles: {
            // Adds this to app.css
            "semantic-ui-css": ["semantic.min.css"]
        }
    }
};
