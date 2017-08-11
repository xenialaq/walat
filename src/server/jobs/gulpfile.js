const gulp = require('gulp');
const file = require('gulp-file');
const template = require('gulp-template');
const render = require('render-quill');
const fs = require('fs');
const path = require('path');

let tempDir = path.join(__dirname, '../../../tmp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

tempDir = fs.mkdtempSync(path.join(tempDir, 'walat-'));

gulp.task('default', function() {
  var delta = pageData.fields.content.text;

  render(delta, (err, output) => {
    file('text.html', output, { src: true })
      .pipe(gulp.dest(tempDir));

    gulp.src('../../assets/templates/page.html')
      .pipe(template({
        pageName: 'P1',
        pageType: 'video and question',
        notesSrc: 'aaabbb.html',
        textSrc: 'text.html',
        videoSrc: pageData.fields.content.video.path
      }))
      .pipe(gulp.dest(tempDir));
  });
});

var pageData = {
  "id": 1,
  "name": "P1",
  "path": "0rUNMjd21QEsheeQam2OfLolBtAY8UiR",
  "description": "",
  "fields": {
    "content": {
      "mode": "text",
      "text": {
        "ops": [{
            "attributes": {
              "color": "#222222"
            },
            "insert": "The Martin J. Whitman School of Management is the business school of Syracuse University in Syracuse, New York. Named after Martin J. Whitman, an alumnus and benefactor of the school, the school was established in 1919. "
          },
          {
            "attributes": {
              "color": "#1a0dab",
              "link": "https://en.wikipedia.org/wiki/Martin_J._Whitman_School_of_Management"
            },
            "insert": "Wikipedia"
          },
          {
            "insert": "\n"
          }
        ]
      },
      "image": {
        "name": "",
        "path": ""
      },
      "video": {
        "name": "",
        "path": "",
        "isWaveform": false
      }
    },
    "dir": {
      "directions": "Go On"
    },
    "sound": {
      "name": "tysg.mp3",
      "path": "ln2jh9ekTwFCK3C0IUOz3uK9wfxpdHIp/QSd9dAXmVd0ySjFp1HFCpWDw1slaAFhv/0rUNMjd21QEsheeQam2OfLolBtAY8UiR/f42f74440ea9ac34dc2d87dff94cccad520ea114"
    },
    "duration": {
      "isFixed": true,
      "length": 20,
      "length-var": 0,
      "length-multiplier": 1
    },
    "element": {
      "element": "text"
    },
    "directions": {
      "directions": "Go Next"
    }
  },
  "script": "show text @content \nshow directions @dir \nplay @sound \nwait \nrecord @duration \nhide @element \nshow directions @directions \nwait",
  "exercise": 1
};
