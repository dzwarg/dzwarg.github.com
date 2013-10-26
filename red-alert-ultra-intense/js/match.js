window.Match = (function match_js() {
	// Match class
	//
	// Match will create two deferred objects that are unresolved; one for completed state
	// and another for cancelled state.  When the match has completed all 'actions'
	// successfully, this._completed is resolved; when the match is cancelled externally,
	// this._canceled is resolved.
	//
	// This constructor does not create any new windows, and initializes the match with
	// the provided options.
    var Match = function Match(options) {
    	console.log('creating new match');
    	
    	this._completed = new $.Deferred();
    	this._canceled = new $.Deferred();
    	
    	this.initialize(options);
    };

    var proto = {
    	// which round is this match at
    	round: 0,
    	
    	// an interval clock, assigned from 'setInterval'
    	clock: null,
    	
    	// the players with the gentlemen's/ladies disagreement
    	players: [],
    	
    	// initialize this match object
        initialize: function (options) {
        	this.round = 0;
        	this.players = options.players;
        	this.clock = null;
        },
        
        // this match is running if the clock is set
        running: function () {
        	return this.clock !== null;
        },
        
        // get a promise object that resolves when the match is complete
        complete: function () {
        	return this._completed.promise();
        },
        
        // start a match
        //
        // This method does nothing if two players are not available. This triggers the 
        // 'players-entered' event, and provides a callback for when players have
        // completely entered.
        start: function () {
        	console.log('starting match!');
        	
        	if (this.players[0] === null || this.players[1] === null) {
        		this.clock = null;
        		return;
        	}
        	
        	// Bring in players to the arena
        	// since this is a trigger, pass the callback to be invoked when the players
        	// have fully entered the arena
        	$(this).trigger('players-entered', [this.players, $.proxy(function() {
				
				// TODO: add projectile animations to arena
				
            	this.clock = setInterval($.proxy(this.doRound, this), 100);
        	}, this)]);
        },
        
        // execute a single round of battle
        //
        // This is the 'tick' function that performs an action for each step in a battle.
        //
        // When the battle is complete, this.clock is cleared. If the battle continues,
        // the round count is incremented. Each time the round progresses, a 
        // 'player-update' event is triggered, indicating that the UI can update the state
        // of the player/team. In addition, if the match is complete, the 'players-exited'
        // event is triggered to remove the players from the arena.
        doRound: function () {
			console.log('battling round ' + (this.round + 1));
        	// calculate the 'battle' rounds creatively!
        	// TODO: add some randomization in here
        	
        	var loser = null, winner = null;
        	
        	// FIXME: this just takes one off the strength of a player per round
        	for (var i = 0; i < this.players.length; i++) {
        		this.players[i].strength -= 1;
        		
        		if (this.players[i].strength < 1) {
					loser = this.players[i];
        			winner = this.players[1 - i];
        		}
        	}
        	
        	audio.play('hit1');
        	        	
        	$(this).trigger('player-update');

        	if (loser === null && winner === null) {
        		this.round += 1;
        		return;
        	}
        	
        	// TODO: remove projectile animations
        	
        	clearInterval(this.clock);
        	
        	audio.play('win1');
        	
        	console.log('the winner of this match is: ' + winner.name + ' after ' + (this.round + 1) + ' rounds');
        	
        	$(this).trigger('players-exited', [this.players, winner, loser, this._completed.resolve]);
	    },
	    
	    // stop a match
	    //
	    // This stops a match in progress. It returns a promise object that resolves when
	    // the match is cancelled.
	    stop: function() {
	    	console.log('stopping match!');
	    	
	    	clearInterval(this.clock);
	    	
	    	this._canceled.resolve();
        	
        	return this._canceled.promise();
	    }
    };
    
    $.extend(Match.prototype, proto);
    
    return Match;
})();
