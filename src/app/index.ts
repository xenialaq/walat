import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './index.html'
})
export class App implements AfterViewInit {
  constructor() { }

  fruitNames = {
    "description": "A list of fruits.",
    "fruits": [
      "apple",
      "apricot",
      "avocado",
      "banana",
      "bell pepper",
      "bilberry",
      "blackberry",
      "blackcurrant",
      "blood orange",
      "blueberry",
      "boysenberry",
      "breadfruit",
      "canary melon",
      "cantaloupe",
      "cherimoya",
      "cherry",
      "chili pepper",
      "clementine",
      "cloudberry",
      "coconut",
      "cranberry",
      "cucumber",
      "currant",
      "damson",
      "date",
      "dragonfruit",
      "durian",
      "eggplant",
      "elderberry",
      "feijoa",
      "fig",
      "goji berry",
      "gooseberry",
      "grape",
      "grapefruit",
      "guava",
      "honeydew",
      "huckleberry",
      "jackfruit",
      "jambul",
      "jujube",
      "kiwi fruit",
      "kumquat",
      "lemon",
      "lime",
      "loquat",
      "lychee",
      "mandarine",
      "mango",
      "mulberry",
      "nectarine",
      "nut",
      "olive",
      "orange",
      "pamelo",
      "papaya",
      "passionfruit",
      "peach",
      "pear",
      "persimmon",
      "physalis",
      "pineapple",
      "plum",
      "pomegranate",
      "pomelo",
      "purple mangosteen",
      "quince",
      "raisin",
      "rambutan",
      "raspberry",
      "redcurrant",
      "rock melon",
      "salal berry",
      "satsuma",
      "star fruit",
      "strawberry",
      "tamarillo",
      "tangerine",
      "tomato",
      "ugli fruit",
      "watermelon"
    ]
  };

  ngAfterViewInit() {
    $('.message .close')
      .on('click', function() {
        if ($(this).closest('.message').is(':visible')) {
          $(this).closest('.message').transition('fade');
        }
      });

    if (!Cookies.get('author name')) {
      Cookies.set('author name', _.sample(this.fruitNames.fruits), { expires: 7 });
    }
  }
}
