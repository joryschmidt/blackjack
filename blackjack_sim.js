// Add surrendering, splits, and soft total logic


// Game configuration

var shoe_size = 6;
var DAS = true;
var initial_bet = 10;
var Player = {
  wins: 0,
  losses: 0,
  money: 0,
  bet: initial_bet
};


// Create the shoe and shuffle it

var vals = [11,10,10,10,10,9,8,7,6,5,4,3,2];
var deck = [];
for (var i=0; i<4; i++) { deck = deck.concat(vals); }
var shoe = [];
for (var i=0; i<shoe_size; i++) { shoe = shoe.concat(deck); }

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

shoe = shuffle(shoe);

// Gameplay functions

function evaluateHand(player) {
  var total = player.reduce(function(p,c) { return p+c; });
  console.log(total);
  player.forEach(function(card, index, hand) {
    if (card == 11 && total > 21) {
      player[index] = 1;
      total = evaluateHand(player);
    }
  });
  
  return total;
}

function playHand() {
  var dealer = [], player = [];
  // Deal cards
  dealer.push(shoe.pop()); player.push(shoe.pop());
  dealer.push(shoe.pop()); player.push(shoe.pop());
  
  Player.bet = initial_bet;
  return determinePlay(dealer, player);
}

function determinePlay(dealer, player) {
  console.log(dealer, player);
  var score = evaluateHand(player);
  var dealt = player.length == 2;
  
  if (dealt && score == 21) {
    if (dealer[0] + dealer[1] == 21) return 'TIE';
    else return 'BLACKJACK';
  }
  else if (score > 21) return 'LOSE';
  
  if (dealt && score == 11) return double();
  if (score > 16) return stand();
  
  // Hard Totals
  switch(dealer[1]) {
    case 11 || 10: 
      return hit();
    case 7 || 8 || 9:
      if (dealt && score == 10) return double();
    case 4 || 5 || 6:
      if (score > 11) return stand();
      if (dealt && score > 8) return double();
    case 2 || 3:
      if (score > 12) return stand();
      if (score == 12) return hit();
      if (dealt && score > 9) return double();
    default:
      return hit();
  }
  
  function hit() {
    player.push(shoe.pop());
    return determinePlay(dealer, player);
  }
  
  function double() {
    Player.bet *= 2;
    player.push(shoe.pop());
    console.log('double down', player[player.length - 1]);
    score = evaluateHand(player);
    return determineOutcome(dealer, score);
  }
  
  function stand() {
    return determineOutcome(dealer, score);
  }
}

function determineSplit() {
  // split logic
  
  // return boolean
}

function determineOutcome(dealer, score) {
  console.log(dealer, score);
  
  if (score > 21) return 'LOSE';
  var dealer_score = evaluateHand(dealer);
  if (dealer_score > 21) return 'WIN';
  else if (dealer_score > 16) {
    if (dealer_score > score) return 'LOSE';
    else if (dealer_score == score) return 'TIE';
    else return 'WIN';
  } else {
    dealer.push(shoe.pop());
    return determineOutcome(dealer, score);
  }
}


while (shoe.length > 26) {
  var outcome = playHand();
  console.log(outcome);
  if (outcome == 'WIN') {
    Player.wins++;
    Player.money += Player.bet;
  }
  else if (outcome == 'LOSE') {
    Player.losses++;
    Player.money -= Player.bet;
  }
  else if (outcome == 'BLACKJACK') {
    Player.wins++;
    Player.money += Player.bet * 1.5;
  }
}

console.log(Player);