var gulp = require("gulp"),
    ngAnnotate = require("gulp-ng-annotate"),
    coffee = require("gulp-coffee"),
    coffeelint = require("gulp-coffeelint")
;


var getDist = function() {
    return gulp.dest("./dist");
};


gulp.task("coffee", function() {
    return gulp.src("src/**/*.coffee")
        .pipe(coffeelint())
        .pipe(coffee())
        .pipe(ngAnnotate())
        .pipe(getDist());
});


// at the moment just copy the default css
gulp.task("css", function() {
    return gulp.src("src/**/*.css")
        .pipe(getDist());
});


gulp.task("dist", ["coffee", "css"]);


gulp.task("default", function() {
    console.log("Run `gulp dist` to create a new distribution.");
});
