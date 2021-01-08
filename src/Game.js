import { INVALID_MOVE } from 'boardgame.io/core';
import { PlayerView } from 'boardgame.io/core';
import { TurnOrder } from 'boardgame.io/core';
import { deck } from './Deck.js';

export const Setback = {
  setup: () => ({
    secret: {
      deck: [],
      discardPile: [],
    },
    players: {
      '0': { hand: [] },
      '1': { hand: [] },
      '2': { hand: [] },
      '3': { hand: [] },
    },
    dealerID: '0',
    playOrder: ['0'],
    bids: [],
    bidWinnerId: null,
    discardTurnCount: 0,
  }),
  //playerView: PlayerView.STRIP_SECRETS,
  turn: {
    order: TurnOrder.CUSTOM_FROM('playOrder'),
  },
  phases: {
    deal: {
      start: true,
      moves: {
        Deal: {
          move: Deal,
          client: false,
        },
      },
      next: 'bid',
    },
    bid: {
      turn: {
        moveLimit: 1,
        order: TurnOrder.CUSTOM_FROM('playOrder'),
      },
      moves: {
        Bid: {
          move: Bid,
          client: false,
        },
      },
      endIf: getWinningBid,
      //onEnd: getWinningBid,
      //next: 'discard', //next: (G) => (G.pickBidSuit === true ? 'pickSuit' : 'play'),
    },
    pickSuit: {
      turn: {
        moveLimit: 1,
        order: TurnOrder.CUSTOM_FROM('playOrder'),
      },
      moves: { PickSuit },
      next: 'discard',
    },
    discard: {
      turn: {
        moveLimit: 1,
        order: TurnOrder.CUSTOM_FROM('playOrder'),
      },
      moves: {
        Discard: {
          move: Discard,
          client: false,
        },
      },
      endIf: (G) => G.discardTurnCount >= 4,
      next: 'play',
    },
    play: {
      moves: { PlayCard },
    },
  },
};

function Deal(G, ctx) {
  G.deck = new deck();
  G.discardPile = [];
  G.deck.shuffle();
  G.players['0'].hand = G.deck.getCards(6);
  G.players['1'].hand = G.deck.getCards(6);
  G.players['2'].hand = G.deck.getCards(6);
  G.players['3'].hand = G.deck.getCards(6);
  //  G.deck.deal(6, [G.players.0]);
  setPlayOrder(G, G.dealerID + 1);
  ctx.events.endPhase();
}

function Bid(G, ctx, id) {
  G.bids[ctx.currentPlayer] = id;
}

function PickSuit(G, ctx, suit) {
  G.trumpSuit = suit;
  G.bid = G.bid + ' ' + suit;
  console.log(G.trumpSuit);
  ctx.events.endPhase();
}

function Discard(G, ctx, discardIds) {
  for (let i = 0; i < discardIds.length; i++) {
    let discardId = discardIds[i];
    G.discardPile.push(G.players[ctx.currentPlayer].hand[discardId]);
    G.players[ctx.currentPlayer].hand[discardId] = G.deck.getCard().pop();
  }
  G.discardTurnCount = G.discardTurnCount + 1;
}

function PlayCard() {
  /*
  
      function () {
      //This is a callback function, called when the dealing
      //is done.
      G.discardPile.addCard(G.deck.topCard());
      G.discardPile.render();
    }
deck.click(function (card) {
    if (card === deck.topCard()) {
      hands.player1.addCard(deck.topCard());
      hands.player1.render();
    }
  });

  //Finally, when you click a card in your hand, if it's
  //the same suit or rank as the top card of the discard pile
  //then it's added to it
  hands.player1.click(function (card) {
    if (
      card.suit === discardPile.topCard().suit ||
      card.rank === discardPile.topCard().rank
    ) {
      hands.player1.addCard(card);
      discardPile.render();
      hands.player1.render();
    }
  });*/
}

function setPlayOrder(G, nextPlayer) {
  G.playOrder = [
    Number(nextPlayer).toString(),
    ((Number(nextPlayer) + 1) % 4).toString(),
    ((Number(nextPlayer) + 2) % 4).toString(),
    ((Number(nextPlayer) + 3) % 4).toString(),
  ];
}

function getWinningBid(G, ctx) {
  if (Object.keys(G.bids).length < 4) return false;
  let bidRanks = getBidRanks();
  let bidRank = [];

  bidRank[0] = bidRanks.indexOf(G.bids[0]);
  bidRank[1] = bidRanks.indexOf(G.bids[1]);
  bidRank[2] = bidRanks.indexOf(G.bids[2]);
  bidRank[3] = bidRanks.indexOf(G.bids[3]);

  let bidWinnerId = 0;
  let bidRankValue = bidRank[0];

  if (bidRank[1] > bidRank[bidWinnerId]) {
    bidWinnerId = 1;
    bidRankValue = bidRank[1];
  }
  if (bidRank[2] > bidRank[bidWinnerId]) {
    bidWinnerId = 2;
    bidRankValue = bidRank[2];
  }
  if (bidRank[3] > bidRank[bidWinnerId]) {
    bidWinnerId = 3;
    bidRankValue = bidRank[3];
  }
  //G.bidWinnerId = bidWinnerId;
  //G.bidRankValue = bidRankValue;
  //G.bid = G.bids[bidWinnerId].substring(4, 3);

  if (bidRankValue < 5) {
    //G.playOrder = [bidWinnerId];
    return { next: 'pickSuit' };
  } else {
    setPlayOrder(G, bidWinnerId);
    return { next: 'play' };
  }

  console.log(ctx.events);
  console.log(G.playOrder);
  console.log(G.pickBidSuit);
}

function getBidRanks() {
  return [
    'bidPass',
    'bid2',
    'bid3',
    'bid4',
    'bid5',
    'bidLow',
    'bidMid',
    'bidHigh',
    'bidLow2',
    'bidMid2',
    'bidHigh2',
  ];
}
