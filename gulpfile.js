var gulp = require("gulp"),
    ngAnnotate = require("gulp-ng-annotate"),
    coffee = require("gulp-coffee"),
    coffeelint = require("gulp-coffeelint"),
    jade = require("gulp-jade"),
    plumber = require("gulp-plumber"),
    notify = require("gulp-notify"),
    beeper = require("beeper")
;


var errorPlumber = function() {
    return plumber({
        errorHandler: notify.onError(function (error) {
            beeper();
            return "Error: " + error.message;
        })
    });
};


var getDist = function() {
    return gulp.dest("./dist");
};


coffeeSrc = ["src/**/*.coffee", "!src/**/demo*.coffee"];
gulp.task("coffee", function() {
    return gulp.src(coffeeSrc)
        .pipe(errorPlumber())
        .pipe(coffeelint())
        .pipe(coffeelint.reporter('default'))
        .pipe(coffeelint.reporter('fail'))
        .pipe(coffee())
        .pipe(ngAnnotate())
        .pipe(getDist());
});


cssSrc = "src/**/*.css";
gulp.task("css", function() {
    // at the moment just copy the default css
    return gulp.src(cssSrc)
        .pipe(getDist());
});


indexSrc = "src/index.jade";
gulp.task("index", function() {
    return gulp.src(indexSrc)
        .pipe(errorPlumber())
        .pipe(jade())
        .pipe(getDist());
});


demoCoffeeSrc = "src/demo.coffee";
gulp.task("demoCoffee", function() {
    return gulp.src(demoCoffeeSrc)
        .pipe(errorPlumber())
        .pipe(coffeelint())
        .pipe(coffee())
        .pipe(ngAnnotate())
        .pipe(getDist());
});


gulp.task("dist", ["coffee", "css", "index"]);


gulp.task("develop", ["dist"], function() {
    gulp.watch(coffeeSrc, ["coffee"]);
    gulp.watch(indexSrc, ["index"]);
    gulp.watch(demoCoffeeSrc, ["demoCoffee"]);
    gulp.watch(cssSrc, ["css"]);
});


gulp.task("default", function() {
    console.log("Run `gulp dist` to create a new distribution.");
});
