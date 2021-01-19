import { INVALID_MOVE } from 'boardgame.io/core';
import { PlayerView } from 'boardgame.io/core';
import { TurnOrder } from 'boardgame.io/core';
import { ActivePlayers } from 'boardgame.io/core';
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
    dealerId: '0',
    bids: {},
    trick: {},
    bidWinnerId: null,
    discardTurnCount: 0,
  }),
  //playerView: PlayerView.STRIP_SECRETS,
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
        stages: {
          pickSuit: {
            moves: { PickSuit },
          },
          discard: {
            moves: {
              Discard: {
                move: Discard,
                client: false,
              },
            },
          },
        },
      },
      moves: {
        Bid: {
          move: Bid,
          client: false,
        },
      },
      next: 'play',
    },
    play: {
      turn: {
        moveLimit: 1,
        order: {
          first: (G, ctx) => Number(G.bidWinnerId),
          next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
        },
      },
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
  //setPlayOrder(G, G.dealerID + 1);
  ctx.events.endPhase();
}

function Bid(G, ctx, bidId) {
  let bidRank = getBidRank(bidId);
  G.bids[ctx.currentPlayer] = {
    playerId: ctx.currentPlayer,
    bidId: bidId,
    rank: bidRank,
    name: getBidName(bidId),
  };

  if (
    !G.bidWinnerId ||
    G.bids[ctx.currentPlayer].rank > G.bids[G.bidWinnerId].rank
  ) {
    G.bidWinnerId = ctx.currentPlayer;
  }

  ctx.events.endTurn();

  if (Object.keys(G.bids).length >= 4) {
    ctx.events.setActivePlayers({
      value: {
        [G.bidWinnerId]: { stage: 'pickSuit', moveLimit: 1 },
      },
    });
  }
}

function PickSuit(G, ctx, suit) {
  G.bids[ctx.playerID].name = G.bids[ctx.playerID].name + ' ' + suit;
  ctx.events.setActivePlayers({ all: 'discard', moveLimit: 1 });
}

function Discard(G, ctx, discardIds) {
  for (let i = 0; i < discardIds.length; i++) {
    let discardId = discardIds[i];
    G.discardPile.push(G.players[ctx.playerID].hand[discardId]);
    G.players[ctx.playerID].hand[discardId] = G.deck.getCard().pop();
  }
  G.discardTurnCount = G.discardTurnCount + 1;

  if (G.discardTurnCount >= 4) {
    ctx.events.endPhase();
  }
}

function PlayCard(G, ctx, cardId) {
  console.log(cardId);
  G.trick[ctx.playerID] = G.players[ctx.playerID].hand[cardId];
  G.players[ctx.playerID].hand[cardId] = null;
  if (Object.keys(G.trick).length >= 4) {
    for (let key in Object.keys(G.trick)) {
      G.discardPile.push(G.trick[key]);
      delete G.trick[key];
    }
  }
}

function isBiddingDone(G) {
  if (Object.keys(G.bids).length < 4 || !G.bids[G.bidWinnerId].rank)
    return false;
  if (G.bids[G.bidWinnerId].rank < 5) {
    // standard 2-5 bid
    //G.playOrder = [G.bids['winningBid'].playerId];
    return { next: 'pickSuit' };
  } else {
    //setPlayOrder(G, G.bids['winningBid'].playerId);
    return { next: 'play' };
  }
}

function getBid(G, ctx) {
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
}

function getBidRank(bidId) {
  return getBidRanks().indexOf(bidId);
}

function getBidName(bidId) {
  return bidId.substring(3);
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
