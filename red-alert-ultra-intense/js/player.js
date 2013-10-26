window.Player = (function player_js() {
	randomizeName = function() {
		/*
		var chars = new Array(26*2),
			i,
			n,
			name = '';
		for (i = 0; i < 26; i++) {
			// upper case letters
			chars[i] = String.fromCharCode(65+i);
			// lower case letters
			chars[i+26] = String.fromCharCode(97+i);
		}
		
		n = Math.round(5 + Math.random() * 10);
		for (i = 0; i < n; i++) {
			name += chars[Math.floor(Math.random() * 26 * 2)];
		}
		*/
		
		var name = 'IMGCSI-' + Math.round(Math.random() * 1000);
		return name;
	};
	
	randomizeStrength = function() {
		return Math.round(5 + Math.random() * 10);
	};
	
	randomizeAvatar = function(closeup, facing) {
		return String.fromCharCode(65 + Math.floor(3 * Math.random())) + '1' + 
			(closeup? '-mug' : '') + facing + '.png';
	};

    var Player = function Player(options) {
        this.initialize(options);
    };

    var proto = {
    	name: '',
    	
    	strength: 0,
    	
    	maxStrength: 0,
    	
    	mug: null,
    	
    	avatar: null,
    	
    	facing: '',
    	
        initialize: function (options) {
            this.name = randomizeName();
            this.maxStrength = randomizeStrength();
            this.mug = new Image();
            this.avatar = new Image();
            this.strength = this.maxStrength;
            this.facing = options.facing ? '-l' : '-r';
            
            this.mug.src = 'img/avatars/' + randomizeAvatar(true, this.facing);
            this.avatar.src = 'img/avatars/' + randomizeAvatar(false, this.facing);
            
        	console.log('creating player ' + this.name);
        },
        
        render: function (idx) {
        	return '<div class="player">' +
        		'<div class="player-mug"><img src="' + this.mug.src + '"/></div>' +
        		'<div class="player-name">' + this.name + '</div>' +
        		'<div class="player-strength-label">' + 
        			this.strength + 
        		'</div>' + this.renderStrengthBar() + '</div>';
        },
        
        renderStrengthBar: function () {
        	return '<div class="player-strength-bar">' +
        		'<div class="player-strength-current"></div>' +
        		'</div>';
        }
    };
    
    $.extend(Player.prototype, proto);
    
    return Player;
})();
