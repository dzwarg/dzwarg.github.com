    ///////////////
   //           //
  //   Audio   //
 //           //
///////////////

var audio =
{
	enabled:    false,
	possible:   false,
	tags:       false,
	objects:    false,
	canPlayOgg: false,
	canPlayMp3: false,
	canPlayWav: false,
	canPlayMid: false,

	boot: function()
	{
		audio.tags = !!( document.createElement( "audio" ).canPlayType );
		try
		{
			audioTestObj  = new Audio( "" );
			audio.objects = !!( audioTestObj.canPlayType );
			if( audio.objects )
			{
				audio.canPlayMp3 = ( "no" != audioTestObj.canPlayType( "audio/mp3"  )) && ( "" != audioTestObj.canPlayType( "audio/mp3"  ));
				audio.canPlayMpg = ( "no" != audioTestObj.canPlayType( "audio/mpeg" )) && ( "" != audioTestObj.canPlayType( "audio/mpeg" ));
				audio.canPlayOgg = ( "no" != audioTestObj.canPlayType( "audio/ogg"  )) && ( "" != audioTestObj.canPlayType( "audio/ogg"  ));
				audio.canPlayWav = ( "no" != audioTestObj.canPlayType( "audio/wav"  )) && ( "" != audioTestObj.canPlayType( "audio/wav"  ));
				audio.canPlayMid = ( "no" != audioTestObj.canPlayType( "audio/midi" )) && ( "" != audioTestObj.canPlayType( "audio/midi" ));
				if( audio.canPlayMpg )  audio.canPlayMp3 = true;
				if( audio.canPlayMp3 || audio.canPlayOgg || audio.canPlayWav ) audio.possible = true;
			};
		}
		catch( e )
		{
			audio.objects = false;
		};
		if( audio.possible ) audio.enable();
		else audio.disable();
	},
	enable: function()
	{
		audio.enabled = true;
		//$( ".buttons .b_sound" ).addClass( "active" );
		//$( "#audio_status" ).html( "Sound is ON" );		
	},
	disable: function()
	{
		audio.enabled = false;
		audio.stop();
		//$( ".buttons .b_sound" ).removeClass( "active selected hover" );
		//$( "#audio_status" ).html( "Sound is OFF" );
	},
	toggle: function()
	{
		if( audio.possible )
		{
			if( audio.enabled ) audio.disable();
			else audio.enable();
		};
	},
	add: function( id )
	{
		if( audio.possible )
		{
			var src = "med/wav/" + id + ".wav";
			//if( audio.canPlayMp3 )      src += "mp3/" + id + ".mp3";
			//else if( audio.canPlayOgg ) src += "ogg/" + id + ".ogg";
			//else if( audio.canPlayWav ) src += "wav/" + id + ".wav";
			$( new Audio( src )).attr({
				"id" : id,
				"controls" : false,
				"loop" : false,
				"autobuffer" : true,
				"autoplay" : false
			}).appendTo( "#audio" );
			$( "audio#" + id ).trigger( "load" );
		};
	},
	play: function( id )
	{
		//  This was a life-saver:
		//  http://www.whatwg.org/specs/web-apps/current-work/#audio
		//  To view the Console enter this in URL bar: javascript:$("#console").toggle()
		//  Unfortunately Chrome and FireFox don't fully support media.currentTime
		
		if( audio.possible && audio.enabled )
		{

			//  Log the audio file's name

			$( "audio#"+ id ).trigger( "pause" );
			//$( "#console .pad" ).prepend( "<br />" );


			//  Log the intended startTime
			//  Currently returns "undefined" in FireFox

			var startTime = $( "audio#"+ id ).attr( "startTime" );
			//$( "#console .pad" ).prepend( "StartTime: " + startTime +"<br />" );


			//  Attempt to reset the playhead to zero

			var currentTime = $( "audio#"+ id ).attr( "currentTime" );
			//$( "#console .pad" ).prepend( "currentTime Original: " + currentTime +"<br />" );
			if( currentTime != 0 )
			{
				try
				{
					$( "audio#"+ id ).attr( "currentTime", 0 );
					currentTime = $( "audio#"+ id ).attr( "currentTime" );
					//$( "#console .pad" ).prepend( "currentTime Reset?: " + currentTime +"<br />" );
				}
				catch( e )
				{
					//$( "#console .pad" ).prepend( "Sorry, failed to reset timeline.<br />" );
				};
			};


			//  Ok, the playhead should be reset to zero but it doesn't work in Chrome or FireFox
			//  Chrome pretends the currentTime is set to zero, but it isn't
			//  and FireFox just gives up and refuses to assign values to currentTime

			//$( "#console .pad" ).prepend( $( "audio#"+ id ).attr( "src" ) +"<br />" );			
			$( "audio#"+ id ).trigger( "play" );
		};
	},
	stop: function()
	{
		$( "audio" ).trigger( "pause" );
		$( "audio" ).attr( "currentTime", 0 );
	}
};

