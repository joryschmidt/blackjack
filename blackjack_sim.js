// Add count play deviations, insurance, dealer showing ten with 21 
// split 21s not blackjack 



// Game configuration

var shoe_size = 6;
var shoes = 10;
var DAS = true;
var COUNT = 0;

var Player = {
  hands_played: 0,
  won: 0,
  tied: 0,
  wins: {},
  losses: {},
  money: 0,
  bets: {
    0: 10,
    1: 20,
    2: 20,
    3: 20,
    4: 20,
    5: 20,
    6: 50,
    7: 50,
    8: 50,
    9: 50,
    10: 50
  }
};

// Create the shoe and shuffle it

var vals = [11,10,10,10,10,9,8,7,6,5,4,3,2];
var deck = [];
for (var i=0; i<4; i++) { deck = deck.concat(vals); }
var shoe = [];

function createShoe() {
  for (var i=0; i<shoe_size; i++) { shoe = shoe.concat(deck); }
  
  function shuffle(cards) {
    for (var i = cards.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = cards[i];
        cards[i] = cards[j];
        cards[j] = temp;
    }
    return cards;
  }
  
  shoe = shuffle(shoe);
}

// Gameplay functions

function true_count(count) {
  var decks_left = Math.floor(shoe.length/52);
  return Math.floor(count/decks_left);
}

function playHand() {
  var bet;
  var tru = true_count(COUNT);
  if (tru < 0) {
    bet = Player.bets[0];
  } else if (tru > 10) {
    bet = Player.bets[10];
  }
  else {
    bet = Player.bets[tru];
  }
  
  var dealer = [], player = [];
  // Deal cards
  get_card(dealer); get_card(player);
  get_card(dealer); get_card(player);
  
  
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
      case 2 || 3:
        if (show_card < 8) return split(dealer, player[0], player[1], been_split);
      case 4:
        if (show_card == 5 || show_card == 6) return split(dealer, player[0], player[1], been_split);
      case 6:
        if (show_card < 7) return split(dealer, player[0], player[1], been_split);
      case 7:
        if (show_card < 8) return split(dealer, player[0], player[1], been_split);
      case 8:
        return split(dealer, player[0], player[1], been_split);
      case 9:
        if (show_card == 9 || show_card == 8 || show_card < 7) return split(dealer, player[0], player[1], been_split);
      case 11:
        return split(dealer, player[0], player[1], been_split);
      default:
        return determinePlay(dealer, player);
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
    var show_card = dealer[1];
    console.log(show_card, player);
    var score = evaluateHand(player);
    var soft = false;
    for (var i=0; i<player.length; i++) {
      if (player[i] == 11) soft = true; break;
    }
    var tru = true_count(COUNT);
    
    
    var dealt = player.length == 2;
    
    if (score > 21) return ['LOSE', bet];
    
    if (dealt) {
      if (score == 21) {
        if (dealer[0] + dealer[1] == 21) return 'TIE';
        else return ['BLACKJACK', bet];
      }
      else if (score == 11) {
        return double();
      }
    }
    
    if (soft) {
      // Soft Totals
      if (dealt && score == 19 && show_card == 6) return double();
      if (score > 18) stand();
      switch(show_card) {
        case 7 || 8:
          if (score == 18) return stand();
        case 5 || 6:
          if (dealt) return double();
          else if (score == 18) return stand();
        case 4:
          if (dealt && score < 14) return double();
          else if (score == 18) return stand();
        case 3:
          if (dealt && score < 16) return double();
          else if (score == 18) return stand();
        case 2:
          if (score == 18) {
            if (dealt) return double();
            else return stand();
          }
        default:
          return hit();
      }
      
    } else {
    // Hard Totals
      if (dealt) {
        if (score == 16) {
          if (show_card == 9 || show_card == 10 || show_card == 11) return ['SURRENDER', bet];
        }
        else if (score == 15){
          if (show_card == 10) return ['SURRENDER', bet];
        }
      }
      if (score > 16) return stand();
      switch(show_card) {
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
    }
    
    function hit() {
      get_card(player);
      return determinePlay(dealer, player);
    }
    
    function double() {
      get_card(player);
      console.log('double down', player[player.length - 1]);
      score = evaluateHand(player);
      return determineOutcome(dealer, score, bet * 2);
    }
    
    function stand() {
      return determineOutcome(dealer, score, bet);
    }
  }
  
  function determineOutcome(dealer, score, bet) {
    console.log(dealer, score);
    
    if (score > 21) return ['LOSE', bet];
    var dealer_score = evaluateHand(dealer);
    if (dealer_score > 21) return ['WIN', bet];
    else if (dealer_score > 16) {
      if (dealer_score > score) return ['LOSE', bet];
      else if (dealer_score == score) return 'TIE';
      else return ['WIN', bet];
    } else {
      get_card(dealer);
      return determineOutcome(dealer, score, bet);
    }
  }
}

function playShoe() {
  while (shoe.length > 78) {
    var outcome = playHand();
    console.log(outcome, COUNT);
    var tru = true_count(COUNT);
    check(outcome);
  }
  
  
  function check(result) {
    
    if (typeof result[0] != 'string') {
      result.forEach(function(el) {
        check(el);
      });
    } else {
      var game = result[0];
      var bet = result[1];
      Player.hands_played++;
    }
    
    if (!Player.wins[tru]) Player.wins[tru] = 0; 
    if (!Player.losses[tru]) Player.losses[tru] = 0;
    
    if (game == 'WIN') {
      Player.won++;
      Player.wins[tru]++;
      Player.money += bet;
    }
    else if (game == 'LOSE') {
      Player.losses[tru]++;
      Player.money -= bet;
    }
    else if (game == 'SURRENDER') {
      Player.losses[tru]++;
      Player.money -= bet * 0.5;
    }
    else if (game == 'BLACKJACK') {
      Player.won++;
      Player.wins[tru]++;
      Player.money += bet * 1.5;
    }
    else if (result == 'TIE') {
      Player.tied++;
    }
  }
}

while (shoes > 0) {
  createShoe();
  playShoe();
  shoes--;
}

var pos_wins = 0, neg_wins = 0, pos_losses = 0, neg_losses= 0;
// Stats
for (var c in Player.wins) {
  if (c > 0) {
    pos_wins += Player.wins[c];
    pos_losses += Player.losses[c];
  } else {
    neg_wins += Player.wins[c];
    neg_losses += Player.losses[c];
  }
}

for (var c in Player.wins) {
  Player.wins[c] = (Player.wins[c]/(Player.wins[c] + Player.losses[c])).toPrecision(2) * 100;
  if (isNaN(Player.wins[c])) delete Player.wins[c];
}


console.log('WON', (Player.won/Player.hands_played).toPrecision(2) * 100, '% of');
console.log(Player.hands_played + ' HANDS');
console.log('TIED', (Player.tied/Player.hands_played).toPrecision(2) * 100, '%');
console.log('POSITIVE WINS', (pos_wins/(pos_wins+pos_losses)).toPrecision(2) * 100, '%');
console.log('NEGATIVE WINS', (neg_wins/(neg_wins+neg_losses)).toPrecision(2) * 100, '%');
console.log('POSITIVE LOSSES', (pos_losses/(pos_wins+pos_losses)).toPrecision(2) * 100, '%');
console.log('NEGATIVE LOSSES', (neg_losses/(neg_wins+neg_losses)).toPrecision(2) * 100, '%');
console.log('MONEY:', Player.money);
