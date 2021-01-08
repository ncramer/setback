function Card(value, suit, rank) {
  this.value = value;
  this.suit = suit;
  this.rank = rank;
}

export function deck() {
  this.values = [
    '14',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
  ];
  this.ranks = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'Jack',
    'Queen',
    'King',
  ];
  this.suits = ['Hearts', 'Diamonds', 'Spades', 'Clubs'];
  this.cards = [];
  for (var s = 0; s < this.suits.length; s++) {
    for (var n = 0; n < this.values.length; n++) {
      this.cards.push(new Card(this.values[n], this.suits[s], this.ranks[n]));
    }
  }
  this.shuffle = function () {
    var j, x, i;
    for (i = this.cards.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = this.cards[i];
      this.cards[i] = this.cards[j];
      this.cards[j] = x;
    }
  };
  this.getCards = function (number) {
    if (typeof number === 'undefined') number = 1;
    var returnCards = [];
    for (var i = number; i > 0; i--) {
      returnCards.push(this.cards.pop());
    }
    return returnCards;
  };
  this.getCard = function () {
    return this.getCards(1);
  };
}
