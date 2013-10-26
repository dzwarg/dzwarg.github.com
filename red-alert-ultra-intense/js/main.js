$(function () {    
    var arena,
    	team1,
    	team2,
    	width = window.screen.availWidth,
    	height = window.screen.availHeight,
    	options = {height:468, width:700},
    	teamWidth = (width-options.width)/2,
    	topMargin = 100;
	
    // initialize the audio system
	audio.boot();
	audio.add('hit1');
	audio.add('win1');
	audio.add('enter1');
	audio.add('playerDefeat');
	audio.add('welcome');
	audio.add('cheering');
	audio.add('attack');
	audio.add('defend');
	audio.add('teamLoad');
	audio.add('exit');
	audio.add('victory');
	audio.add('playerEnter');
	audio.add('playerAdded');
	audio.add('teamVictory');

	// start an arena
    var startArena = function startArena() {
    	// create a new arena
        arena = new Arena(options);
        
        // position the arena where we want it
        arena.resizeTo(options.width, options.height);
        arena.moveTo(teamWidth, topMargin);
        
        // save a global reference to the arena
        //window.arena = arena;
        
        // when the arena is ready
        arena.ready().then(function() {
            console.log('arena ready');
            
            // create two new teams
            team1 = new Team({name:'Team 1', width:teamWidth}),
            team2 = new Team({name:'Team 2', width:teamWidth});
                
            // resize and position the new team1
            team1.resizeTo(teamWidth,height-topMargin);
            team1.moveTo(0,topMargin);
            
            // resize and position the new team2
            team2.resizeTo(teamWidth,height-topMargin);
            team2.moveTo(width-teamWidth,topMargin);
            
            // add new teams to arena
            arena.addTeam(team1);
            arena.addTeam(team2);

			// when team1 is ready
            team1.ready().then(function () {
                console.log('team 1 ready!');
                
                team1.start();
            });
            
            // when team2 is ready
            team2.ready().then(function () {
                console.log('team 2 ready!');
                
                team2.start();
            });
        })
        .then(function() {
        	// join the team1 and team2 ready checkpoints
            return $.when(team1.started(), team2.started());
        })
        .then(function() {
        	// teams are ready, start up the arena
            arena.start();
        });
        
		//audio.play('teamVictory');
    };
    
    // stop the arena
    var stopArena = function stopArena() {
        if (arena) {
        	// initiate a stop event
            arena.stop().then(function() {
            	// when the stop event is resolved, close the arena
            	arena.proxy.close();
            });
        }
    };
    
    // store all of the cross-window initialization events here
    window._init = {};
    
    // wire up click on start button
    $('#start').on('click', startArena);
    $('#stop').on('click', stopArena);
});
