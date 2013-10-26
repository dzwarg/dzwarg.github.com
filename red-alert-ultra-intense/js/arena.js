window.Arena = (function arena_js() {
	// Arena class
	//
	// Arena will create two deferred objects that are unresolved; one for loading state
	// and another for unloading state.  When the arena window is loaded and initialized,
	// this._loaded is resolved; when the arena window has shut down all child windows,
	// this._unloaded is resolved.
	//
	// This constructor creates a new proxy window to 'arena.html', which has the canvas
	// for the arena. This object contains the matches and teams that are associated with
	// a single battle.
    var Arena = function Arena(options) {
        console.log('creating new arena');
        
        this._loaded = new $.Deferred();
        this._unloaded = new $.Deferred();
    
        // IF this is called from the app, launch a new arena window
        if (window.name === '') {
            console.log('opening new arena window');
            this.proxy = window.open('arena.html', 'Arena', 'location=no,menubar=no,scrollbars=no,status=no,toolbar=no');
	    // Give Intro Music time to play
            window._init.Arena = $.proxy(function() {
                console.log('arena _init');
                this.initialize(options);
            }, this);
        }
    };

	// prototype methods to add to the 'Arena' class
    var proto = {
    
    	// the teams in the arena
    	teams: [],
    	
    	// the current match
    	match: null,
    	
    	// the height of the arena window
    	height: 0, 
    	
    	// the width of the arena window
    	width: 0,
    	
    	// initialize the Arena
    	//
    	// This is called after the 'onload' event of the child window is called,
    	// and the current document (parent) receives a message that the child document
    	// is ready.
        initialize: function (options) {
            // initialize properties of a new arena:
            //   * matches
            //   * arena window
            
            console.log('initializing arena properties');
            
            this.teams = [];
            this.match = null;
            
            this.height = options.height;
            this.width = options.width;
                    
            // bring up the house lights
            d3.select(this.proxy.document.body).select('#lights')
                .transition()
                .duration(5000)
                .style('opacity', 0.0);

            this._loaded.resolve();
        },
        
        // return a promise for the ready state
        //
        // The object instance will be ready when the child window is loaded, and the
        // initialize function has been called.
        ready: function () {
            return this._loaded.promise();
        },
        
        // start the arena
        //
        // Start a new arena. If there are teams already attached, run a match-up
        // immediately.
        start: function status() {
            console.log('starting up arena'); 
    
            // get players from teams if teams are ready
            if (this.teams.length !== 2) {
            	return;
            }
            
            //setTimeout($.proxy(this.runMatchChain, this), 3000);
            this.runMatchChain();
        },
        
        // run a sequence of matches until there are no more valid players
        //
        // This is a pseudo-recursive function which will invoke itself when
        // valid matches are complete. Matches are complete when one of the teams
        // in the arena is no longer "in the game".
        runMatchChain: function () {
        	console.log('running match chain');
        	
        	var winnerName = '';
        	
        	if (!this.teams[0].inTheGame()) {
        		winnerName = this.teams[0].name;
        	}
        	if (!this.teams[1].inTheGame()) {
        		winnerName = this.teams[1].name;
        	}
        	
        	if (winnerName !== '') {
        		var el = $(this.proxy.document.body).find('#winner');
        		el.text('Congratulations ' + winnerName);
        		el.show();
        		
        		audio.play('cheering');
        		return;
        	}
        	
            this.match = this.startMatch();
            
            // recursive through a deferred!
            // this will keep running through all permutations of matches,
            // until no valid player is found on a team
            this.match.complete().then($.proxy(this.runMatchChain, this));
        },
        
        // start a single match, and return it
        //
        // Starting a match involves getting a random player from each team,
        // and pitting them against each other. The match is started and returned.
        // It is possible to check on the state of the match by observing the promise
        // returned by the 'complete()' method.
        startMatch: function startMatch() {
        	console.log('starting match');
        	
            var players = [
            		this.teams[0].getRandomPlayer(),
            		this.teams[1].getRandomPlayer()
            	],
            	match = new Match({players:players});
            	
            $(match).on('player-update', $.proxy(this.matchUpdate, this));
            $(match).on('players-entered', $.proxy(this.playersEntered, this));
            $(match).on('players-exited', $.proxy(this.playersExited, this));
            
            match.start();
            
            return match;
        },
        
        // An event handler that updates the UI when a match progresses
        //
        // This delegates UI updates to separate team windows.
        matchUpdate: function matchUpdate() {
        	console.log('updating teams in match');
        	
        	this.teams[0].update();
        	this.teams[1].update();
        },
        
        // An event handler that is called when two players are dropped into the arena
        //
        // This will call 'callback' when players have entered, and are ready to do battle.
        playersEntered: function playersEntered(event, players, callback) {
        
        	// play some fanfare when players enter
        	audio.play('playerEnter');
        	
        	var arena = d3.select(this.proxy.document.body);
        	
        	// remove any currently installed avatars
        	arena.selectAll('#arena .avatar')
        		.remove();
        		
        	// add some avatar images, using the avatar.src property of each player
        	arena.selectAll('#arena .avatar')
        		.data(players)
        		.enter()
        		.append('img')
        		.attr('class', 'avatar')
        		.attr('src', function (d,i) { return d.avatar.src; })
        		.classed('avatar-left', function (d,i) { return (i===0); })
        		.classed('avatar-right', function (d,i) { return (i===1); });
        		
        	// the left avatar should be placed backstage to the left, and enter
        	// into the arena stage left
        	arena.selectAll('.avatar-left')
        		.style('left', '-200px')
        		.transition()
        		.style('left', '140px');
        		
        	// the right avatar should be placed backstage to the right, and enter
        	// into the arena stage right
        	arena.selectAll('.avatar-right')
        		.style('right', '-200px')
        		.transition()
        		.style('right', '140px');
        		
            // projectile from both sides
            arena.selectAll('.projectile')
                .data(players)
                .enter()
                .append('img')
                .attr('class', 'projectile')
                .attr('src', $.proxy(function (d,i) { return this.getProjectile(i===0); }, this));

        	// default time for the transitions is 250ms, but our entrance theme song
        	// lasts a little more than a second
        	setTimeout(callback, 1500);
        },
        
        // An event handler that is called when players depart from the arena
        //
        // This will propel the winner up, and drop the loser down
        playersExited: function playersExited(event, players, winner, loser, callback) {
        	var arena = d3.select(this.proxy.document.body);
        
			audio.play('victory');
	
        	// select the loser, and set his/her top position to the bottom of the
        	// document, sending them to purgatory
        	arena.selectAll('#arena .avatar')
        		.data(players)
        		.filter(function (d,i) { return d.name === loser.name; })
        		.transition()
        		.style('top', this.proxy.document.height);
        		
        	// select the winner, and set his/her top position to above the top of
        	// the document, sending them to elysium
        	arena.selectAll('#arena .avatar')
        		.data(players)
        		.filter(function (d,i) { return d.name === winner.name; })
        		.transition()
				.delay(250)
        		.style('top', '-256px');

            // remove projectile
            arena.selectAll('.projectile')
                .remove();
        		
        	// default time for the transitions is 250ms
        	setTimeout(callback, 500);
        },
        
        // stop the arena
        //
        // Stopping an arena stops any matches that are running, as well as stopping
        // any child team windows. This returns a promise for when everything has been
        // stopped.
        stop: function stop() {
            console.log('stopping arena');
            
            // bring down the house lights
            d3.select(this.proxy.document.body).select('#lights')
                .transition()
                .duration(5000)
                .style('opacity', 1.0);
                
            var done = new $.Deferred();
            
            // resolve the deferred when the transition is over
            setTimeout(function() { done.resolve(); }, 5000);
            
            var stopping = [done];

            // if there is a match, stop it; stop teams after match is stopped
            if (this.match !== null) {
            	stopping.push( this.match.stop()
            		.then($.proxy(this.stopTeams, this)));
            }
            else {
            	// no match available, just stop the teams
				stopping.push( this.stopTeams() );
			}
			
			return $.when.apply(this, stopping);
        },
        
        // stop the teams & team windows
        //
        // This initiates the team window shutdown, allowing all players to exit
        // the 'dugouts' in a dignified manner.
        stopTeams: function() {
        	var stoppers = [], stopper;
            for (var i = this.teams.length - 1; i >= 0; i--) {
                console.log('removing team ' + this.teams[i].name);
                
                stopper = this.teams[i].stop();
                stopper = stopper.then($.proxy(function () {
					this.proxy.close();
				}, this.teams[i]));
				
                stoppers.push(stopper);
            }
            
            return $.when.apply(this, stoppers);
        },
    
    	// move the arena to a specific location on the desktop
        moveTo: function moveTo(x, y) {
            // moving the arena moves the proxy window
            this.proxy.moveTo(x, y);
        },
        
        // resize the arena to some specific dimensions
        resizeTo: function resizeTo(w, h) {
            // resizing the arena resizes the proxy window
            this.proxy.resizeTo(w, h);
        },
        
        // add a new team to the arena
        addTeam: function addTeam(team) {
        	// add the team to the arena when the team is ready
        	team.ready().then(function () {
                console.log('adding team ' + team.name + ' to arena');
            });
                        
			this.teams.push(team);
        },

        getProjectile: function (side) {
            // list of gif names
            var gif = [
                "bread",
                "cake",
                "ice-cream",
                "str-short-cake"
            ];

            // random integer between 0-3
            var n = Math.floor((Math.random()*4)+0);

            // animation coming from right or left
            if (side) {
                side = "";
            } else {
                side = "_l";
            }

            // build file path
            return "./img/projectilesinmotion/" + gif[n] + side +".gif" ;
        }
    };
    
    $.extend(Arena.prototype, proto);
    
    return Arena;
})();
