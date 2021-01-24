import { Client } from 'boardgame.io/client';
import { Setback } from './Game';
import { Local } from 'boardgame.io/multiplayer';
import { htmlInterfaceActions, htmlInterfaceCardTrick } from './Setup';

class SetbackClient {
  constructor(rootElement, { playerID } = {}) {
    this.client = Client({
      game: Setback,
      multiplayer: Local(),
      playerID,
      numPlayers: 4,
    });
    this.client.start();
    this.rootElement = rootElement;
    this.createTable(playerID);
    this.attachListeners();
    this.client.subscribe((state) => this.update(state));
  }

  createTable(playerID) {
    this.rootElement.innerHTML = `
      <div id='board'>
      ${htmlInterfaceCardTrick}
      <div id='commsContainer'>
      <div id='messageContainer'><div id='message' class='message'></div></div>
      ${htmlInterfaceActions}
      </div>
      <div id='hand'></div>      
      </div>
    `;
  }

  attachListeners() {
    const handleButtonClick = (event) => {
      const id = event.target.id;
      switch (id) {
        case 'deal':
          this.client.moves.Deal();
          this.rootElement.querySelector('#dealContainer').style.display =
            'none';
          break;
        case 'playCard':
          let cardIds = [];
          this.rootElement.querySelectorAll('.selected').forEach((scard) => {
            cardIds.push(Number(scard.id.substring(5, 4)));
          });
          if (cardIds.length === 1) {
            this.client.moves.PlayCard(cardIds[0]);
            this.rootElement.querySelector('#playCardContainer').style.display =
              'none';
          } else {
            const messageEl = this.rootElement.querySelector('#message');
            messageEl.innerHTML = 'Choose one card';
          }
          break;
        case 'discard':
          let discardIds = [];
          this.rootElement.querySelectorAll('.selected').forEach((scard) => {
            discardIds.push(Number(scard.id.substring(5, 4)));
          });
          this.client.moves.Discard(discardIds);
          this.rootElement.querySelector('#discardContainer').style.display =
            'none';
          break;
        case 'clearTrick':
          this.client.moves.ClearTrick();
          this.rootElement.querySelector('#clearContainer').style.display =
            'none';
          break;
        case 'Spades':
        case 'Hearts':
        case 'Diamonds':
        case 'Clubs':
          this.client.moves.PickSuit(id);
          this.rootElement.querySelector('#suitContainer').style.display =
            'none';
          break;
        default:
          this.client.moves.Bid(id);
          this.rootElement.querySelector('#bidContainer').style.display =
            'none';
          break;
      }
    };

    const buttons = this.rootElement.querySelectorAll('.btn');
    buttons.forEach((button) => {
      button.onclick = handleButtonClick;
    });
  }

  update(state) {
    if (state === null) return;

    const boardEl = this.rootElement.querySelector('#board');
    const messageEl = this.rootElement.querySelector('#message');
    if (state.ctx.activePlayers) {
      if (state.ctx.activePlayers[this.client.playerID]) {
        messageEl.innerHTML = `It is your turn to ${
          state.ctx.activePlayers[this.client.playerID]
        }!`;
        switch (state.ctx.activePlayers[this.client.playerID]) {
          case 'pickSuit':
            this.rootElement.querySelector('#suitContainer').style.display =
              'block';
            break;
          case 'clearTrick':
            messageEl.innerHTML = `You took the trick. Clear to contine play.`;

            this.rootElement.querySelector('#clearContainer').style.display =
              'block';
            break;
          case 'discard':
            messageEl.innerHTML = `The bid is ${
              state.G.bids[state.G.bidWinnerId].name
            } by player ${state.G.bidWinnerId}`;
            this.rootElement.querySelector('#discardContainer').style.display =
              'block';
            break;
          default:
            messageEl.innerHTML = 'Invalid stage';
            break;
        }
      } else {
        let waitingMessage = '';
        for (let player in state.ctx.activePlayers) {
          waitingMessage =
            waitingMessage +
            `Waiting on player ${player} to ${unCamelCase(
              state.ctx.activePlayers[player]
            )}..<br/>`;
        }
        messageEl.innerHTML = waitingMessage;
      }
    } else if (this.client.playerID === state.ctx.currentPlayer) {
      messageEl.innerHTML = `It is your turn to ${state.ctx.phase}!`;
      switch (state.ctx.phase) {
        case 'deal':
          this.rootElement.querySelector('#dealContainer').style.display =
            'block';
          break;
        case 'bid':
          this.rootElement.querySelector('#bidContainer').style.display =
            'block';
          break;
        case 'play':
          messageEl.innerHTML =
            'Select a card and confirm by clicking the play card button.';
          this.rootElement.querySelector('#playCardContainer').style.display =
            'block';
          break;
        default:
          messageEl.innerHTML = 'Invalid phase';
          break;
      }
    } else {
      messageEl.innerHTML = `Waiting on player ${
        state.ctx.currentPlayer
      } to ${unCamelCase(state.ctx.phase)}..`;
    }
    switch (state.ctx.phase) {
      case 'deal':
        this.setTrickCard(state.G.dealerId, ' ', '0', '#F00', 'Dealer', '#000');
        //this.setTrickCardMessage(state.G.dealerId, 'Dealer');
        break;
      case 'bid':
        for (let bidId in state.G.bids) {
          this.setTrickCardMessage(bidId, state.G.bids[bidId].name);
        }
        break;
      case 'play':
        for (let playerId in state.G.bids) {
          if (state.G.trick[playerId])
            this.setTrickCard(
              playerId,
              state.G.trick[playerId].suit,
              state.G.trick[playerId].rank
            );
          else {
            this.setTrickCardMessage(playerId, '');
          }
        }
        break;
      default:
        break;
    }
    this.updateHand(state);
  }

  setTrickCardMessage(playerId, message) {
    let playerLocation = this.getPlayerLocation(playerId);
    let containerId = '#' + playerLocation + 'CardContainer';
    let container = this.rootElement.querySelector(containerId);
    let messageEl = document.createElement('div');
    messageEl.id = playerLocation + 'Card';
    messageEl.classList.add('card');
    messageEl.classList.add('message');
    messageEl.classList.add('trickCardMessage');
    messageEl.innerHTML = message;
    container.replaceChild(messageEl, container.childNodes[0]);
  }

  setTrickCard(playerId, suit, rank, backcolor, backtext, backtextcolor) {
    let playerLocation = this.getPlayerLocation(playerId);
    let containerId = '#' + playerLocation + 'CardContainer';
    let container = this.rootElement.querySelector(containerId);
    let card = document.createElement('card-t');
    card.id = playerLocation + 'Card';
    card.classList.add('trick-card');
    card.rank = rank;
    card.suit = suit;
    card.backtext = backtext;
    card.backcolor = backcolor;
    card.backtextcolor = backtextcolor;
    container.replaceChild(card, container.childNodes[0]);
  }

  updateHand(state) {
    const handEl = this.rootElement.querySelector('#hand');
    let handContent = '';
    let cards = state.G.players[this.client.playerID].hand;
    for (let key in Object.keys(cards)) {
      if (cards[key]) {
        handContent += `<card-t id="card${key}" class="hand-card" suit="${cards[key].suit}" rank="${cards[key].rank}"></card-t>`;
      } else {
        //handContent += `<card-t id="card${key}" class="hand-card" suit backtext="" rank="0"></card-t>`;
      }
    }
    handEl.innerHTML = handContent;
    this.attachCardListeners();
  }

  attachCardListeners() {
    const handleCardClick = (event) => {
      const id = event.target.parentElement.id;
      this.rootElement.querySelector(`#${id}`).classList.toggle('selected');
    };
    const selectedCards = this.rootElement.querySelectorAll('.hand-card');
    selectedCards.forEach((scard) => {
      scard.onclick = handleCardClick;
    });
  }
  getPlayerLocation(playerId) {
    if (Number(playerId) === Number(this.client.playerID) % 4) {
      return 'south';
    } else if (Number(playerId) === (Number(this.client.playerID) + 1) % 4) {
      return 'west';
    } else if (Number(playerId) === (Number(this.client.playerID) + 2) % 4) {
      return 'north';
    } else if (Number(playerId) === (Number(this.client.playerID) + 3) % 4) {
      return 'east';
    } else {
      console.log('Failed to locate card identifier');
      //return '#southCard';
    }
  }
}

function unCamelCase(str) {
  if (str) {
    str = str.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2');
    str = str.toLowerCase(); //add space between camelCase text
  }
  return str;
}

const appElement = document.getElementById('app');
const playerIDs = ['0', '1', '2', '3'];

const clients = playerIDs.map((playerID) => {
  const rootElement = document.createElement('div');
  rootElement.setAttribute('id', 'client' + playerID);

  appElement.append(rootElement);
  return new SetbackClient(rootElement, { playerID });
});
