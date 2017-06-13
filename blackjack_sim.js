// Add surrendering, and soft total logic


// Game configuration

var shoe_size = 6;
var DAS = true;
var initial_bet = 10;
var COUNT = 0;

var Player = {
  wins: 0,
  losses: 0,
  money: 0,
  bet: initial_bet,
  bet_scheme: {
    1: 20,
    2: 20,
    3: 50,
    4: 50
  }
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



function playHand() {
  var dealer = [], player = [];
  // Deal cards
  // get_card(dealer); get_card(player);
  // get_card(dealer); get_card(player);
  dealer = [10, 6]; player = [8, 8];
  
  var bet = initial_bet;
  
  if (player[0] == player[1]) return determineSplit(dealer, player, false);
  return determinePlay(dealer, player);
  
  function get_card(player) {
    var new_card = shoe.pop();
    player.push(new_card);
    // Change logic here for counting system
    if (new_card < 7) COUNT++;
    if (new_card > 9) COUNT--;
  }
  
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
  
  function determineSplit(dealer, player, been_split) {
    // In case of second splits
    if (player[0] != player [1]) return determinePlay(dealer, player);
    
    // split logic
    var card = player[0];
    var show_card = dealer[1];
    switch(card) {
      case 2:
        if (show_card < 8) return split(dealer, player[0], player[1], been_split);
      case 8:
        return split(dealer, player[0], player[1], been_split);
    }
    
    function split(dealer, first_card, second_card, been_split) {
      console.log('SPLIT');
      var first_hand, second_hand;
      var h1 = [first_card]; get_card(h1);
      var h2 = [second_card]; get_card(h2);
      if (been_split) {
        first_hand = determinePlay(dealer.slice(), h1);
        second_hand = determinePlay(dealer.slice(), h2);
        return [first_hand, second_hand];
      }
      first_hand = determineSplit(dealer.slice(), h1, true);
      second_hand = determineSplit(dealer.slice(), h2, true);
      return [first_hand, second_hand];
    }
  }
  
  function determinePlay(dealer, player) {
    console.log(dealer, player);
    var score = evaluateHand(player);
    var dealt = player.length == 2;
    
    if (dealt && score == 21) {
      if (dealer[0] + dealer[1] == 21) return 'TIE';
      else return 'BLACKJACK';
    }
    else if (score > 21) return ['LOSE', bet];
    
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
      var dbet = bet *= 2;
      player.push(shoe.pop());
      console.log('double down', player[player.length - 1]);
      score = evaluateHand(player);
      return determineOutcome(dealer, score, dbet);
    }
    
    function stand() {
      return determineOutcome(dealer, score);
    }
  }
  
    
  
  function determineOutcome(dealer, score, fbet) {
    console.log(dealer, score);
    if (!fbet) fbet = bet;
    
    if (score > 21) return ['LOSE', fbet];
    var dealer_score = evaluateHand(dealer);
    if (dealer_score > 21) return ['WIN', fbet];
    else if (dealer_score > 16) {
      if (dealer_score > score) return ['LOSE', fbet];
      else if (dealer_score == score) return 'TIE';
      else return ['WIN', fbet];
    } else {
      dealer.push(shoe.pop());
      return determineOutcome(dealer, score);
    }
  }
}

  


function playShoe() {
  while (shoe.length > 300) {
    var outcome = playHand();
    console.log(outcome);
    check(outcome);
  }
  
  function check(result) {
    if (!result[0]) return;
    
    else if (typeof result[0] != 'string') {
      result.forEach(function(el) {
        check(el);
      });
    } else {
      var game = result[0];
      var bet = result[1];
    }
    
    if (game == 'WIN') {
      Player.wins++;
      Player.money += bet;
    }
    else if (game == 'LOSE') {
      Player.losses++;
      Player.money -= bet;
    }
    else if (game == 'BLACKJACK') {
      Player.wins++;
      Player.money += bet * 1.5;
    }
  }
}

playShoe();
console.log(Player);