import { Client } from 'boardgame.io/client';
import { Setback } from './Game';
import { Local } from 'boardgame.io/multiplayer';
import { htmlInterfaceActions } from './Setup';

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
      <div id='board'><div id='message'></div>${htmlInterfaceActions}</div>
      <div id='hand'></div>
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
        case 'discard':
          let discardIds = [];
          this.rootElement.querySelectorAll('.selected').forEach((scard) => {
            discardIds.push(Number(scard.id.substring(5, 4)));
          });
          this.client.moves.Discard(this.client.playerID, discardIds);
          this.rootElement.querySelector('#discardContainer').style.display =
            'none';
          break;
        case 'Spades':
        case 'Hearts':
        case 'Diamonds':
        case 'Clubs':
          this.client.moves.PickSuit(this.client.playerID, id);
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
            `Waiting on player ${player} to ${state.ctx.activePlayers[player]}..<br/>`;
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
        default:
          messageEl.innerHTML = 'Invalid phase';
          break;
      }
    } else {
      messageEl.innerHTML = `Waiting on player ${state.ctx.currentPlayer} to ${state.ctx.phase}..`;
    }
    this.updateHand(state);
  }

  updateHand(state) {
    const handEl = this.rootElement.querySelector('#hand');
    let handContent = '';
    let cards = state.G.players[this.client.playerID].hand;
    for (let key in Object.keys(cards)) {
      handContent += `<card-t id="card${key}" class="hand-card" suit="${cards[key].suit}" rank="${cards[key].rank}"></card-t>`;
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
}

const appElement = document.getElementById('app');
const playerIDs = ['0', '1', '2', '3'];

const clients = playerIDs.map((playerID) => {
  const rootElement = document.createElement('div');
  appElement.append(rootElement);
  return new SetbackClient(rootElement, { playerID });
});
