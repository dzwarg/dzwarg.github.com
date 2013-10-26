window.Team = (function team_js() {
    var Team = function Team(options) {    
        console.log('creating new team');
        
        this._loaded = new $.Deferred();
        this._started = new $.Deferred();
        this._unloaded = new $.Deferred();
        
        // IF this is called from the main window, launch a new team window
        if (window.name === '') {
            console.log('opening new team window');
            
            var winOpts = 'location=no,menubar=no,scrollbars=no,status=no,toolbar=no';
            
            this.proxy = window.open('team.html', options.name, winOpts);
            
            window._init[options.name] = $.proxy(function team_init() {
                console.log('team _init');
                this.initialize(options);
            }, this);
        }
    };

    var proto = {
    	name: '',
    	
    	players: [],
    	
    	width: 0,
    	
        initialize: function initialize(options) {
            // initialize properties of a new team:
            //   * players
            //   * opener window
            
            console.log('initializing team properties');
            
            this.width = options.width;
            this.name = options.name;
            this.players = [];
            
            this._loaded.resolve();
        },
        
        ready: function ready() {
            return this._loaded.promise();
        },
        
        started: function started() {
        	return this._started.promise();
        },
        
        start: function start() {
            console.log('starting up team ' + this.name);
        
            // bring in team members
            var n = Math.round(5 + Math.random() * 5);
            this.players = new Array(n);
            
            for (var i = 0; i < n; i++) {
                this.players[i] = new Player({facing:this.name.indexOf('2') === -1});
            }
            
            this.players.sort(this.sortPlayers);
            
            var team = d3.select(this.proxy.document.body).select('#roster');
            team.append('h2')
                .text(this.name);
            
            audio.play('teamLoad');
    
            team.selectAll('.player-cont')
                .data(this.players)
                .enter()
                .append('div')
                .attr('class', 'player-cont')
                .style('left', this.width + 'px')
                .html(function (d,i) { return d.render(i); })
                .transition()
                .ease('exp-out', 2)
                .duration(1000)
                .delay(function (d,i) { return i * 100; })
                .style('left', '0px');
                
            // set the width of the strength bar, based on the width of this display
            team.selectAll('.player-strength-bar')
                .style('width', (this.width - 103) + 'px'); // 103 based on guessing
                
            setTimeout($.proxy(function() {
            	this._started.resolve();
            }, this), 2000 + this.players.length * 100);
        },
        
        sortPlayers: function(a,b) {
        	return b.strength - a.strength;
        },
        
        update: function update() {
        	var team = d3.select(this.proxy.document.body).select('#roster');
            var players = team.selectAll('.player-cont')
            	.data(this.players)
            	.sort(this.sortPlayers);
            	
            players.select('.player-strength-current')
            	.style('width', function (d,i) {
            		return (100 * d.strength / d.maxStrength).toFixed(2) + '%';
            	});
            	
            players.select('.player-strength-label')
            	.text(function(d,i) { return d.strength; });
            	
            players.select('.player-mug')
            	.select('img')
            	.attr('src', function(d,i) { return d.mug.src; });
            	
            players.select('.player-name')
            	.text(function(d,i) { return d.name; })
            	.classed('player-alive', function(d,i) {
            		return d.strength > 0;
            	})
            	.classed('player-dead', function(d,i) {
            		return d.strength < 1;
            	});
        },
        
        stop: function stop() {
            console.log('stopping team ' + this.name);
            
            for (var i = this.players.length - 1; i--; i >= 0) {
                console.log('removing player ' + this.players[i].name);
                this.players[i] = null;
            }
            
            // do something cool, like: exit stage left
            var team = d3.select(this.proxy.document.body).select('#roster');
            team.selectAll('.player-cont')
            	.transition()
            	.ease('exp-in', 2)
            	.duration(1000)
            	.delay(function (d,i) { return i * 100; })
            	.style('left', '-' + this.width + 'px');
            	
        	var closeTimeout = 1000 + 100 * team.selectAll('.player').size();
        	setTimeout($.proxy(function(){
        		console.log('team ' + this.name + ' stopped');
        		this._unloaded.resolve();
        	}, this), closeTimeout);
        		
        	return this._unloaded.promise();
        },
    
        moveTo: function moveTo(x, y) {
            // moving the team bench moves the proxy window
            this.proxy.moveTo(x, y);
        },
        
        resizeTo: function resizeTo(w, h) {
            // resizing the team bench resizes the proxy window
            this.proxy.resizeTo(w, h);
        },
        
        setPlayers: function setPlayers(players) {
            console.log('adding ' + players.length + ' players to team');
            
            this.players = players;
        },
        
        inTheGame: function inTheGame() {
        	return this.getRandomPlayer() !== null;
        },
        
        getRandomPlayer: function getRandomPlayer() {
        	// get any player that still has 'strength' left
        	var valid = [];
        	for (var i = 0; i < this.players.length; i++) {
        		if (this.players[i] && this.players[i].strength > 0) {
        			valid.push(this.players[i]);
        		}
           	}
           	
           	if (valid.length === 0) {
           		return null;
           	}
           	
        	return valid[Math.floor(Math.random() * valid.length)];
        }
    };
    
    $.extend(Team.prototype, proto);
    
    return Team;
})();
