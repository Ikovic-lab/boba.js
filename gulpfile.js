var options, paths,
  gulp = require("gulp"),
  merge = require("merge-stream"),
  path = require("path"),

  clean = require("gulp-clean"),
  concat = require("gulp-concat"),
  markdown = require("gulp-markdown"),
  minifyCSS = require("gulp-minify-css"),
  removeLines = require("gulp-remove-lines"),
  rename = require("gulp-rename"),
  replace = require("gulp-replace"),
  shell = require("gulp-shell"),
  uncss = require("gulp-uncss");

paths = {
  clean: [
    "./tmp",
    "./site/css"
  ],
  jekyll: {
    build: "_site",
    source: "site",
    includes: "site/_includes",
    all: "site/**/*"
  },
  js: [
    "./site/js/vendor/**/*",
    "./site/js/boba.js",
    "./site/js/main.js"
  ],
  readme: "README.md",
  cname: "./gh-pages-src/CNAME",
  temp: "./tmp"
};

options = {
  uncss: {
    html: ["./site/_site/index.html"],
    ignore: [/trippy/]
  }
};

gulp.task("boba-js", function() {
  return gulp.src("./boba.js") // Build window.Boba version.
    .pipe(replace("module.exports", "window.Boba"))
    .pipe(gulp.dest(paths.jekyll.source + "/js"));
});

gulp.task("clean", function() {
  return gulp.src(paths.clean, {read: false})
    .pipe(clean());
});

gulp.task("readme", function() {
  return gulp.src(paths.readme)
    .pipe(markdown())
    .pipe(removeLines({filters: [
      /id="boba-js"/,
      /id="contributing"/,
      /the contributing guide/,
      /boba.gif/
    ]}))
    .pipe(gulp.dest(paths.jekyll.includes));
});

gulp.task("jekyll", shell.task([
  "cd " + paths.jekyll.source + " && bundle exec jekyll build"
]));

gulp.task("serve", shell.task([
  "cd " + paths.jekyll.source + " && bundle exec jekyll serve --watch"
]));

gulp.task("uncss", function() {
  return gulp.src("./site/css/styles.css")
    .pipe(uncss(options.uncss))
    .pipe(minifyCSS({ keepBreaks:false }))
    .pipe(gulp.dest("./site/css"));
});

gulp.task("app-js", function() {
  gulp.src(paths.js)
    .pipe(concat("app.js"))
    .pipe(gulp.dest("./site/js"));
});

gulp.task("default", [ "clean", "readme", "boba-js", "uncss", "app-js", "jekyll" ]);
gulp.task("dev", ["clean", "readme", "boba-js", "uncss", "app-js", "serve"]);

gulp.task("deploy", shell.task([
  "git subtree push --prefix " + paths.jekyll.source + " origin gh-pages"
]));

