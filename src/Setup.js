export const htmlInterfaceCardTrick = `
<div id="trick">
<card-t id="westCard" class="hand-card" suit="Hearts" rank="1"></card-t>
<card-t id="northCard" class="hand-card" suit="Spades" rank="1"></card-t>
<card-t id="southCard" class="hand-card" suit="Clubs" rank="1"></card-t>
<card-t id="eastCard" class="hand-card" suit="Diamonds" rank="1"></card-t>
</div>
`;
export const htmlInterfaceActions = `
<div id="actions">
  <div id="dealContainer" style="display: none;" class="inputContainer">
    <button type="button" class="btn btn-outline-secondary btn-sm" id="deal">
      Deal
    </button>
  </div>

  <div id="suitContainer" style="display: none;" class="inputContainer">
    <button type="button" class="btn btn-outline-secondary btn-sm" id="Spades">
      Spades &spades;
    </button>
    <button type="button" class="btn btn-outline-secondary btn-sm" id="Hearts">
      Hearts &hearts;
    </button>
    <button
      type="button"
      class="btn btn-outline-secondary btn-sm"
      id="Diamonds"
    >
      Diamonds &diams;
    </button>
    <button type="button" class="btn btn-outline-secondary btn-sm" id="Clubs">
      Clubs &clubs;
    </button>
  </div>

  <div id="bidContainer" class="inputContainer" style="display: none;">
    <button type="button" class="btn btn-outline-secondary btn-sm" id="bidPass">
      Pass
    </button>
    <button type="button" class="btn btn-outline-secondary btn-sm" id="bid2">
      2
    </button>
    <button type="button" class="btn btn-outline-secondary btn-sm" id="bid3">
      3
    </button>
    <button type="button" class="btn btn-outline-secondary btn-sm" id="bid4">
      4
    </button>
    <button type="button" class="btn btn-outline-secondary btn-sm" id="bid5">
      5
    </button>
    <button type="button" class="btn btn-outline-secondary btn-sm" id="bidLow">
      Low
    </button>
    <button type="button" class="btn btn-outline-secondary btn-sm" id="bidMid">
      Mid
    </button>
    <button type="button" class="btn btn-outline-secondary btn-sm" id="bidHigh">
      High
    </button>
    <button type="button" class="btn btn-outline-secondary btn-sm" id="bidLow2">
      2xLow
    </button>
    <button type="button" class="btn btn-outline-secondary btn-sm" id="bidMid2">
      2xMid
    </button>
    <button
      type="button"
      class="btn btn-outline-secondary btn-sm"
      id="bidHigh2"
    >
      2xHigh
    </button>
  </div>
  <div id="discardContainer" class="inputContainer" style="display: none;">
    <button type="button" class="btn btn-outline-secondary btn-sm" id="discard">
      Discard
    </button>
  </div>
</div>
`;
