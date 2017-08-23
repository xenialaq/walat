	/* these functions are used, and this file is embedded, in those htm and cfm webpages that use their own scripting and styling, e.g. BRTF;
		this file is not used when a video mp4 file is in the media subtree (which is the simplest way to use video inWAL */
				
		var CurrVideoObj; // defined in window.onload
		
		var ScheduleObjArr = [];	// this holds video clip definitions; not applicable to pages with no wavesurfer loaded, but needs to be initialized anyway

		var ThrowAwayPlaybackTimerID0 = -1;
		var ThrowAwayRecordingTimerID1 = -1;
		var PlayClipsOnlyTimer = -1;
		
		if (typeof(VideoRangeStartSec) == "undefined") VideoRangeStartSec = 0;
		if (typeof(VideoRangeEndSec) == "undefined") VideoRangeEndSec = 0;
		
		var ProgrammedPausePoint = 0; // if set to a non-zero value (in seconds), this is the timeline point at which the playing video needs to be paused
		var EffectiveVideoDurationSec = 0;	// used in the playback progress bar updates and the display of the total duration of the video
		var EffectiveCurrentTimeSec = 0;	// used in the playback progress bar updates and the display of the total duration of the video

		var ClipStartedFlagsArr = [];	// array of flags that will prevent function VideoPlaying() from calling function ClipStarted() more than once during this recording session; it is initialized in StartStudentRecording()
		var ClipEndedFlagsArr = [];	// array of flags that will prevent function VideoPlaying() from calling function ClipEnded() more than once during this recording session; it is initialized in StartStudentRecording()
			
		var MultiClipPlaybackInProgress = false;	// set to true in playback_functions.js when a multi-clip student recording (e.g. a dub) is playing in coordination with video

		var UserVideoVolume	 = 1;	// used to store the volume level set by user
		var MarginOfErrorSec = 0.5;	// seconds; we assume that the videoplayer fires the timeudate event (and calls function VideoPlaying() at least every 300ms, but occasionally the interval may be greater;  if it is greater than 0.5 sec in a particular browser or OS, we'll see problems

		var CurrSoundtrackVolume = 0.75;	// this is the default; we'll store the actual value later so we can restore
		
		var VisualLatencyPaddingSec = 0;	// seconds; some of the dubbing modes are very time sensitive, and this padding attempts to compensate for the visual delay that exists
																		// between the moment the recording is stopped/paused and the moment when the user realizes that
																		// from looking at the events on the screen, e.g. at the red line and the video cursor;
																		// the effect of this is that in the Precise Dub modes, the recording  is started and paused/stopped 
																		// this many seconds later than it would in the ideal world; we'll see how well this value works, and it can be adjusted;
																		// when playing the student recording back in sync with the original video, we will cut off this many seconds from the beginning of each clip in her recording;
																		// it is possible that this constant does more harm than good; the largest value I tested was 0.5

		var WaitingToResumeDub = false;	// set to true when the dubbing mode is EasyPreciseDub and the video is paused at the beginning of the next clip to dub.

		function UpdateProgressBar() {
		/* adjusts the width of the playback progress bar */

			if ( (typeof(VideoRangeStartSec) != "undefined") && (typeof(VideoRangeEndSec) != "undefined")) {	// these are global vars set in the mother page, e.g. Sampler > Goldilocks > Video 1 > Video_2.htm
				if ( (VideoRangeStartSec > 0) && (VideoRangeEndSec > 0) && (VideoRangeEndSec > VideoRangeStartSec) ) {
					EffectiveVideoDurationSec = VideoRangeEndSec - VideoRangeStartSec;
					EffectiveCurrentTimeSec = CurrVideoObj.currentTime - VideoRangeStartSec;
				} else {
					EffectiveVideoDurationSec = (CurrVideoObj.duration.toFixed(2))*1;
					EffectiveCurrentTimeSec = (CurrVideoObj.currentTime.toFixed(2))*1;
				}
			}

			if (document.getElementById("video_progress_bar")) {
				if (CurrVideoObj) {
					if ((typeof(EffectiveCurrentTimeSec) != "undefined") && (typeof(EffectiveVideoDurationSec) != "undefined")){
						if ( (! isNaN(EffectiveCurrentTimeSec)) && (! isNaN(EffectiveVideoDurationSec)) ) {
							if (EffectiveVideoDurationSec !=0) {
								document.getElementById("video_progress_bar").style.width = (EffectiveCurrentTimeSec * 100 / EffectiveVideoDurationSec) + "%";
								//console.log(CurrVideoObj.currentTime.toFixed(2) * 100 / CurrVideoObj.duration);
							}
						}
					}
				}
			}		
		}	// function UpdateProgressBar()
		
		function AdjustedRecordingPauseSec(InitialPauseSec) {
			/* returns a length of the pause that we offer to the student for her recording, in seconds,
				expanded and padded	according to our formula;
				InitialPauseSec is usually the duration of the model recording that the student is asked to imitate */
			var PauseSec = InitialPauseSec * top.AuthoredPauseFactor; 
			if (top.document.getElementById("PauseFactor")) {
				var UserSelectablePauseFactor = parseInt(top.document.getElementById("PauseFactor").value) / 100;
				PauseSec = ((PauseSec * UserSelectablePauseFactor).toFixed(2))*1;  // this is the user-selectable PauseFactor, set in a form field of that name
			}

			PauseSec = (PauseSec + (top.PausePaddingSec.toFixed(2))*1)*1;
			
			if (PauseSec < 1) {
				PauseSec = 1; // very short recordings don't work well for dubbing
			}

			if (PauseSec > (top.MaxRecordingDurationSec.toFixed(2))*1) {
				var ErrorDisplayPauseSec = PauseSec;
				PauseSec = (top.MaxRecordingDurationSec.toFixed(2))*1; // set in application.cfm
				top.ReportActivity("<span style='color: red; '>adjusted recording time</span> (" +  ErrorDisplayPauseSec + " sec) of sound " + top.CurrTeacherSoundID + " was over the limit and has been reduced to " + topMaxRecordingDurationSec + " seconds");
			}

			return PauseSec;
		}

		function ClipStarted(CurrClip) {
			/* called if the exercise is one of the role-playing (aka dubbing) types,
				the recording was started and is now paused,
				and the video playhead is at the clip's starting point;
				because of the unknown granularity of the browser's timeupdate event firing,
				we may actually be up to MarginOfErrorSec (0.3 to 0.5 sec  or so) into the clip;
				CurrClip is the clip's index in ScheduleObjArr, from 0 to ScheduleObjArr.length-1
			 */
			 if ( (CurrClip < 0) || (CurrClip > ScheduleObjArr.length-1) ) {
				 alert("Error in ClipStarted: invalid clip number (" + CurrClip + ").");
				 return false;
			 }
			if ( top.document.getElementById("PlaybackVolumeWhileDubbing") ) {
				var PlaybackVolumeWhileDubbing = (top.document.getElementById("PlaybackVolumeWhileDubbing").value);
			} else {
				var PlaybackVolumeWhileDubbing = DefaultPlaybackVolumeWhileDubbing;	// 0 to 1; user can override this in User Options; DefaultPlaybackVolumeWhileDubbing is set in the enclosing page
			}
//console.log("set volume to PlaybackVolumeWhileDubbing=" + PlaybackVolumeWhileDubbing);
//console.log("started playing video clip " + CurrClip);
//console.log("exact start is at " + ScheduleObjArr[CurrClip].start)
//console.log("currentTime is " + CurrVideoObj.currentTime.toFixed(2));
//console.log("RecordingType=" + RecordingType);
			switch (RecordingType) {	// set in the enclosing page, e.g. Goldilocks_1.htm
				case "ListenAndRepeat":	// the recording has been started and paused; now we play each video clip and resume the student recording as soon as the clip is done playing so the student can record his repetition
					// actually, as it is now, this function is not even called for this recording type
				case "EasyDub":
					 CurrVideoObj.volume = PlaybackVolumeWhileDubbing;
//					StudentRecordingMarkerObjArr[CurrClip].videoStart = CurrVideoObj.currentTime;
					StudentRecordingMarkerObjArr[CurrClip].start = (top.recordingTime().toFixed(2))*1;
					top.resumeRecording();
					top.ShowMicIcon();
					top.ReportActivity("Started dubbing for video clip " + CurrClip + ".");
					break;
				case "PreciseDub":
					CurrVideoObj.volume = PlaybackVolumeWhileDubbing;
					// StudentRecordingMarkerObjArr[CurrClip].videoStart = ScheduleObjArr[CurrClip].start;
					StudentRecordingMarkerObjArr[CurrClip].start = 1*top.recordingTime().toFixed(2);
					top.resumeRecording();
					top.ShowMicIcon();
					top.ReportActivity("Started dubbing for video clip " + CurrClip + ".");
//console.log("started/resumed recording for " + RecordingType + " for video clip " + CurrClip + ".");
					break;
				case "EasyPreciseDub":
					//StudentRecordingMarkerObjArr[CurrClip].videoStart = ScheduleObjArr[CurrClip].start;
					//StudentRecordingMarkerObjArr[CurrClip].start = top.recordingTime();
					CurrVideoObj.pause();	// pause playback until the recording is done, then resume from the same point, which will be done by a timer
					WaitingToResumeDub = true;
					// a keyboard watcher in utility_functions.js will wait for D to be pressed, and then will resume recording and set a timer to 1) pause/stop recording and 2) resume playback, after ClipDurationSec seconds:

					top.ReportActivity("Waiting for keypress to start/resume dubbing for video clip " + CurrClip + ".");
//console.log("in ClipStarted, set the flag for waiting for keypress to start/resume dubbing for video clip " + CurrClip + ".");
					break;
				default:
					// to be added
					break;
			}	// switch (RecordingType)
			 
			 return true;
		}	// function ClipStarted(CurrClip)

		function ClipEnded(CurrClip) {
			/* called if the exercise is one of the role-playing (aka dubbing) types,
				the recording 
				and the video playhead is at the clip's ending point;
				because of the unknown granularity of the browser's timeupdate event firing,
				we may actually be up to MarginOfErrorSec (0.3 to 0.5 sec  or so) before the clip's end;
				CurrClip is the clip's index in ScheduleObjArr, from 0 to ScheduleObjArr.length-1
			 */
//console.log("starting ClipEnded");
			 if ( (CurrClip < 0) || (CurrClip > ScheduleObjArr.length-1) ) {
				 alert("Error in ClipEnded: invalid clip number (" + CurrClip + ").");
				 return false;
			 }
//console.log("ended clip " + CurrClip);
//console.log("exact end is at " + ScheduleObjArr[CurrClip].end)
//console.log("currentTime is " + CurrVideoObj.currentTime.toFixed(2));
//console.log("RecordingType=" + RecordingType);
			if (RecordingType == "EasyPreciseDub") {
				CurrVideoObj.volume = CurrSoundtrackVolume;	// restore volume to what it was when this clip was set up
//				StudentRecordingMarkerObjArr[CurrClip].videoEnd = CurrVideoObj.currentTime;
			}
			 
			 return true;
		}	// function ClipEnded(CurrClip)

		function SetUpPlaybackForDubbing(ClipIndex) {
			/* launches the process of recording clip ClipIndex and sets up a scheme for continuing with the next clip;
				ClipIndex is 0 for the first clip to ScheduleObjArr.length - 1 for the last one;
			 */
//console.log("SetUpPlaybackForDubbing is setting up for clip " + ClipIndex + " for " + RecordingType);

			if (ClipIndex == 0) {	// this is the first call after the user launched the recording/dubbing process, i.e. after function StartStudentRecording() in recording_functions.js was called by the "record" command in the sound-bite's script
				CurrSoundtrackVolume = CurrVideoObj.volume;	// store it so we can restore when needed
			}

				switch (RecordingType) {	// set in the enclosing page, e.g. Goldilocks_1.htm
					case "ListenAndRepeat":	// the recording has been started and paused; now we play each video clip and resume the student recording as soon as the clip is done playing so the student can record his repetition
						// this function is not even called for this recording type, but we'll keep this here for future needs
					case "EasyDub":	// figure out where to start and where to end the playback of the current video clip
						if ( top.document.getElementById("pauseBetweenClipsMS") ) {
							var IdealWarmUpPauseSec = ((top.document.getElementById("pauseBetweenClipsMS").value / 1000).toFixed(2))*1; 
							// we'll try to start the playback this many seconds before the  clip's beginning so the student has a short warm-up period to get ready
						} else {
							var IdealWarmUpPauseSec = (DefaultWarmUpPauseSec.toFixed(2))*1; 	//  seconds; we'll try to start the playback this many seconds before the  first clip; DefaultWarmUpPauseSec is set in the enclosing page
						}
						var IdealPlaybackStartSec = 1*ScheduleObjArr[ClipIndex].start.toFixed(2) - 1*IdealWarmUpPauseSec.toFixed(2);
						if (ClipIndex == 0) {		// playing the 1st clip
							var PlaybackStartSec = (Math.max(0, IdealPlaybackStartSec).toFixed(2))*1;		// if we don't have IdealWarmUpPauseSec of video before the start of the clip, we use a shorter warm-up period 
						} else {
							var PlaybackStartSec = (Math.max(ScheduleObjArr[ClipIndex-1].end.toFixed(2))*1, (ScheduleObjArr[ClipIndex].start.toFixed(2))*1 - (IdealWarmUpPauseSec.toFixed(2))*1 );	// if we don't have IdealWarmUpPauseSec of video before the start of the clip, we use a shorter warm-up period 
						}
						var ActualWarmUpPauseSec = ((ScheduleObjArr[ClipIndex].start*1 - PlaybackStartSec*1).toFixed(2) )*1;	// we'll start the recording session  need this many seconds after we start the playback, to coincide with the beginning of the first video clip
						var ActualWarmUpPauseMS = ActualWarmUpPauseSec * 1000;
						var PlaybackEndSec = (ScheduleObjArr[ClipIndex].end.toFixed(2))*1;
						break;
					case "PreciseDub":	// play the whole video from beginning to end
						var PlaybackStartSec = 0;
						var PlaybackEndSec = (CurrVideoObj.duration.toFixed(2))*1;
						if ( document.getElementById("playFromStart") ) {
							if (! document.getElementById("playFromStart").checked ) {
								if ( top.document.getElementById("currentPauseMS") ) {
									PlaybackStartSec = (Math.max(0, ScheduleObjArr[0].start.toFixed(2))*1 - (top.document.getElementById("currentPauseMS").value.toFixed(2))*1); 	// despite the MS in the name, currentPauseMS is seconds
									PlaybackEndSec = (ScheduleObjArr[ScheduleObjArr.length - 1].end.toFixed(2))*1 + (top.document.getElementById("currentPauseMS").value.toFixed(2))*1;
									PlaybackEndSec = (Math.min(CurrVideoObj.duration, PlaybackEndSec).toFixed(2))*1; // in case the last clip ends very close to the end of the whole video
								}
							}
						}
						break;
					case "EasyPreciseDub":	// play the whole video from beginning to end or from the warm-up start to the point  a bit beyond the end of the last clip
						var PlaybackStartSec = 0;
						var PlaybackEndSec = (CurrVideoObj.duration.toFixed(2))*1;
						if ( document.getElementById("playFromStart") ) {
							if (! document.getElementById("playFromStart").checked ) {
								if ( top.document.getElementById("currentPauseMS") ) {
									PlaybackStartSec = Math.max(0, ((1*ScheduleObjArr[0].start).toFixed(2))*1 - ( (1*top.document.getElementById("currentPauseMS").value).toFixed(2) )*1); 	// despite the MS in the name, currentPauseMS is seconds
									PlaybackEndSec = ((1*ScheduleObjArr[ScheduleObjArr.length - 1].end).toFixed(2))*1 + ( (1*top.document.getElementById("currentPauseMS").value).toFixed(2) )*1;
									PlaybackEndSec = Math.min(CurrVideoObj.duration, 1*PlaybackEndSec).toFixed(2); // in case the last clip ends very close to the end of the whole video
								}
							}
						}
						// added when troubleshooting 7/23/17 WaitingToResumeDub = true
						break;
					default:
						// to be added
						break;
				}	// switch (RecordingType)

			// launch the playback for video clip ClipIndex, with a short warm-up before it; the recording will be launched in ClipStarted() and paused in ClipEnded()
			CurrVideoObj.volume = CurrSoundtrackVolume; 	// play video at user-selected volume during warm-up; the volume will be reduced by function ClipStarted()
			VideoPlayRange(PlaybackStartSec, PlaybackEndSec);	// this will play video from our warm-up point to the end of clip ClipIndex

		}	// function SetUpPlaybackForDubbing(ClipIndx)

		function VideoPlaying() {
			/* called when the playhead moves in CurrVideoObj; called continuously by the timeupdate event while video plays */	

			if (typeof(CurrVideoObj) != "object") {	// this object is initialized when this page is loaded, and event listeners are assigned to it  (this might be done in html_head.cfm)
				alert("Error in function VideoPlaying in video_external.js: video object is missing.");
				return false;
			}

			top.EnableStopButton();	// Stop button can be used to stop the video

			if (top.PlaybackTimersWaitingToBeSet) {	// this flag is set in playback_functions.js to cause the call to SetUpPlaybackTimers(PlaybackStartSec) as soon as the video playback gets going; this is done here to minimize the skewed calculations cause by the start-up and seek delays
				top.PlaybackTimersWaitingToBeSet = false;
				var PlaybackStartSec = (CurrVideoObj.currentTime.toFixed(2))*1; // Math.min(VideoPageWindow.CurrVideoObj.duration, PlaybackEndSec); // in case the last clip ends very close to the end of the whole video
//console.log("in VideoPlaying(), calling SetUpPlaybackTimers() with start time " + PlaybackStartSec);
/*
				if (! document.getElementById("playFromStart").checked ) {
					if ( top.document.getElementById("currentPauseMS") ) {
						PlaybackStartSec = Math.max(0, VideoPageWindow.ScheduleObjArr[0].start - 1*top.document.getElementById("currentPauseMS").value); 	// despite the MS in the name, currentPauseMS is seconds
					}
				}
*/
				top.SetUpPlaybackTimers(PlaybackStartSec)
			}
			
			var clipsOnly = false;
			
			if (ScheduleObjArr) {	// this may be true when video is controlled by a waveform, e.g. Sample > Goldilocks > Video 2;
				if (ScheduleObjArr.length > 0) {	// this is true when clips/regions are defined in the waveform, e.g. Sample > Goldilocks > Video 2;
					if (document.getElementById("clipsOnly")) {
						clipsOnly = document.getElementById("clipsOnly").checked;
					}	// if (document.getElementById("clipsOnly"))
				}	// if (ScheduleObjArr.length > 0)
			}	// if (ScheduleObjArr)

			// the block below is used during one of the role-playing or dubbing exercises; the sound recording is switched on, though the rcorder may have been paused, in which case top.isPaused() will return true
			if ( (top.Mode == "Recording") && top.isRecording() ) { // startRecording() has been called by the "record" command in the sound bite's command script
				document.getElementById("clipsOnly").checked = false;
				clipsOnly = false;
				if (ScheduleObjArr) {	// this may be true when video is controlled by a waveform, e.g. Sample > Goldilocks > Video 2; ScheduleObjArr holds sata for surrently defined video clips
					if (ScheduleObjArr.length > 0) {	// this is true when at least one clip/region is defined, e.g. Sample > Goldilocks > Video 2;
						var currTime = (CurrVideoObj.currentTime.toFixed(2))*1;
						// find out which clip is being played, and whether we happen to be within MarginOfErrorSec seconds of the clip's beginning or end;
						// browsers vary in how often the "timeudate" even is fired and this function is called: from every frame (every 33 to 40 ms) to every 250 ms;
						var currClip = -1;
						var ClipJustStarted = false;
						var ClipAlmostEnded = false;
//console.log(currTime.toFixed(2));
						for (var i=0; i<ScheduleObjArr.length; i++) {
							if ( (currTime >= (ScheduleObjArr[i].start.toFixed(2))*1) && (currTime <= (ScheduleObjArr[i].end.toFixed(2))*1) ) {	// we are playing clip i
								currClip = i;
								if ( currTime > ( (ScheduleObjArr[i].end.toFixed(2))*1 - (MarginOfErrorSec.toFixed(2))*1 ) )  { // we are within  MarginOfErrorSec seconds of the clip's end
									ClipAlmostEnded = true;
								} else {
									if ( currTime < ( (ScheduleObjArr[i].start.toFixed(2))*1 + (MarginOfErrorSec.toFixed(2))*1 ) )  { // we are within  MarginOfErrorSec seconds of the clip's end
										ClipJustStarted = true;
									}	// 
								}
							}	// if ( (currTime >= ScheduleObjArr[i].start) && (currTime <= ScheduleObjArr[i].end)
						}	// for (var i=0; i<ScheduleObjArr.length; i++)
						
						if (RecordingType != "ListenAndRepeat") {	// e.g. it is "EasyDub" or "PreciseDub" or something else
							if (ClipJustStarted) {
								if (! ClipStartedFlagsArr[currClip]) {
									ClipStartedFlagsArr[currClip] = true;	// this flag prevents repeated calls to ClipStarted()
									ClipStarted(currClip);
								}
							} else {
								if (ClipAlmostEnded) {
									if (! ClipEndedFlagsArr[currClip]) {
										ClipEndedFlagsArr[currClip] = true;	// this flag prevents repeated calls to ClipEnded()
										ClipEnded(currClip);
									}
								}
							}
						} else {	// RecordingType is not "ListenAndRepeat"
							if (RecordingType != "PreciseDub") {	// for PreciseDub, recording is turned on and off by timers set in recording_fnctions.js
								for (var i=0; i<ScheduleObjArr.length; i++) {
									if ( (currTime >= 1*ScheduleObjArr[i].start.toFixed(2)) && (currTime <= 1*ScheduleObjArr[i].end.toFixed(2)) ) {	// we are playing clip i
	//console.log(StudentRecordingMarkerObjArr[i].videoStart);
	//console.log(StudentRecordingMarkerObjArr[i].videoEnd);
	//									StudentRecordingMarkerObjArr[i].videoStart = ScheduleObjArr[i].start;	// record current video clip start and end for storin in the db
	//									StudentRecordingMarkerObjArr[i].videoEnd = ScheduleObjArr[i].end;	// record current video clip start and end for storin in the db
	//console.log("in VideoPlaying, i=" + i + "; currTime=" + currTime + "; top.recordingTime()=" + top.recordingTime() + "; top.isRecording=" + top.isRecording() + "; top.isPaused()=" + top.isPaused());
										if ( (currTime >= 1*ScheduleObjArr[i].end.toFixed(2)) && (top.isRecording()) && (top.isPaused()) ) { // pause video and resume recording
	//console.log("about to pause video and resume recording");
											CurrVideoObj.pause();
											StudentRecordingMarkerObjArr[i].start = 1*top.recordingTime().toFixed(2);
											top.resumeRecording();
											top.ShowMicIcon();
											// calculate the recording's expected length and set a timeout to pause it and to strat playing the next video clip
											var ClipDurationSec = 1*((ScheduleObjArr[i].end - ScheduleObjArr[i].start).toFixed(2));
											ClipDurationSec = 1*AdjustedRecordingPauseSec(ClipDurationSec).toFixed(2);	// this is usually an extended and slightly padded value because the student needs more time to say things than the actor in the video
											var ClipDurationMS = ClipDurationSec * 1000;
											var CurrMarkerObj = StudentRecordingMarkerObjArr[i];
											if (ThrowAwayRecordingTimerID1 == -1) {
												if (i < (ScheduleObjArr.length - 1) ) {	// clip i is not the last clip yet, so pause the recording when the time is up
													ThrowAwayRecordingTimerID1 = setTimeout(function() { CurrMarkerObj.end = 1*top.recordingTime().toFixed(2); top.HideMicIcon(); top.pauseRecording(); ThrowAwayRecordingTimerID1 = -1; }, ClipDurationMS) ;// this will pause the student recording after ClipDuration seconds
												} else {	// clip i is the last clip, so stop the recording when the time is up
													ThrowAwayRecordingTimerID1 = setTimeout(function() { CurrMarkerObj.end = 1*top.recordingTime().toFixed(2); top.HideMicIcon(); top.StopRecording(); ThrowAwayRecordingTimerID1 = -1; }, ClipDurationMS) ;// this will stop recording after the imitation of the last clip has been recorded
												}
											}
											if (i < (ScheduleObjArr.length - 1) ) {	// clip i is not the last clip
												if ( (! isNaN(ScheduleObjArr[i+1].start)) && (! isNaN(ScheduleObjArr[i+1].end)) ) {
													if ( 1*ScheduleObjArr[i+1].end.toFixed(2) > 1*ScheduleObjArr[i+1].start.toFixed(2) ) {
														var VideoClipStartSec = 1*ScheduleObjArr[i+1].start.toFixed(2);
														var VideoClipEndSec = 1*ScheduleObjArr[i+1].end.toFixed(2);
														if (ThrowAwayPlaybackTimerID0 == -1) {	// it hasn't been set yet
															ThrowAwayPlaybackTimerID0 = setTimeout(function() { VideoPlayRange(VideoClipStartSec, VideoClipEndSec); ThrowAwayPlaybackTimerID0 = -1}, ClipDurationMS + 300) ;// this will start playing the next video clip
														}
													}
												}
											}
										}	// if (currTime >= ScheduleObjArr[i].end)
									}	// if ( (currTime >= ScheduleObjArr[i].start) && (currTime <= ScheduleObjArr[i].end) )
								}	// for (var i=0; i<ScheduleObjArr.length; i++)
							}	// if (RecordingType != "PreciseDub")
						}	// if (RecordingType != "ListenAndRepeat")
					}	// if (ScheduleObjArr.length > 0)
				}	//  if (ScheduleObjArr)
			} else {	// we are not recording
				if (MultiClipPlaybackInProgress) {	// user clicked the current student dot-button, and that launched the playback of video; we will now watch the current video time and at key moments will start/pause the matching clips in the student's recording
					if (ScheduleObjArr) {	// this may be true when video is controlled by a waveform, e.g. Sample > Goldilocks > Video 2; ScheduleObjArr holds data for currently defined video clips
						if (ScheduleObjArr.length > 0) {	// this is true when at least one clip/region is defined, e.g. Sample > Goldilocks > Video 2;
							// what volume are we to use while playing a video clip?
							if (typeof(DefaultPlaybackVolumeWhileDubbing) == "undefined") {
								DefaultPlaybackVolumeWhileDubbing = 0;		// normally set (0 to 1) in video_external.js; user can override this in User Options; 
							}
							if ( top.document.getElementById("PlaybackVolumeWhileDubbing") ) {
								PlaybackVolumeWhileDubbing = (top.document.getElementById("PlaybackVolumeWhileDubbing").value);
							} else {
								PlaybackVolumeWhileDubbing = DefaultPlaybackVolumeWhileDubbing;
							}
							
							// where are we in the video?
							var currTime = 1*CurrVideoObj.currentTime.toFixed(2);
//console.log(currTime.toFixed(2));
							// find out which clip is being played, and whether we happen to be within MarginOfErrorSec seconds of the clip's beginning or end;
							// browsers vary in how often the "timeudate" event is fired and this function is called: from every frame (every 33 to 40 ms) to every 250 ms;

							for (var i=0; i<ScheduleObjArr.length; i++) {
								var currClip = -1;
								var ClipJustStarted = false;
								var ClipAlmostEnded = false;
								if ( (currTime >= 1*ScheduleObjArr[i].start.toFixed(2)) && (currTime <= 1*ScheduleObjArr[i].end.toFixed(2)) ) {	// we are playing clip i
									currClip = i;
									if (currTime >= (1*ScheduleObjArr[i].end.toFixed(2) - 1*MarginOfErrorSec.toFixed(2)))  { // we are within  MarginOfErrorSec seconds of the clip's end
										ClipAlmostEnded = true;
									} else {
										if ( currTime <= (1*ScheduleObjArr[i].start.toFixed(2) + 1*MarginOfErrorSec.toFixed(2)) )  { // we are within  MarginOfErrorSec seconds of the clip's start
											ClipJustStarted = true;
										}	// 
									}
									
									if (ClipJustStarted) {
//console.log("in VideoPlaying (video_external.js), clip " + currClip + " just started");
										CurrVideoObj.volume = PlaybackVolumeWhileDubbing;
										
										if (top.CurrStudentPlaybackSound.paused) {
											top.CurrStudentPlaybackSound.currentTime = 1*StudentRecordingMarkerObjArr[i].start.toFixed(2);	// cue student recording
											top.CurrStudentPlaybackSound.play();	// start/resume the playback of student recording
										}
									} else {
										if (ClipAlmostEnded) {
//console.log("in VideoPlaying (video_external.js), clip " + currClip + " just ended");
											// this could be done in ShowStudentPlaybackProgress() (display_function.js): 
											top.CurrStudentPlaybackSound.currentTime = 1*StudentRecordingMarkerObjArr[i].end.toFixed(2);	// cue student recording
											// this could be done in ShowStudentPlaybackProgress() (display_function.js):
											top.CurrStudentPlaybackSound.pause();	// pause the playback of student recording
											
											CurrVideoObj.volume = UserVideoVolume;
											if (i == ScheduleObjArr.length - 1) {	// last video clip ended
												MultiClipPlaybackInProgress = false;
											}
										}
									}
								}	// if ( (currTime >= ScheduleObjArr[i].start) && (currTime <= ScheduleObjArr[i].end)
							}	// for (var i=0; i<ScheduleObjArr.length; i++)
						}	// if (ScheduleObjArr.length > 0)
					}	// if (ScheduleObjArr)					
				}	// if (MultiClipPlaybackInProgress)
			}	// if ( top.isRecording() )

			if (clipsOnly) {	// user wants all clips starting with the current clip (or the first clip after the clicked point) to be played in sequence, with a pre-defined pause between them; all video between clips is skipped
				var currTime = 1*CurrVideoObj.currentTime.toFixed(2);
				var waveformDuration = 1*CurrVideoObj.duration.toFixed(2);
				if ( isNaN(currTime) ) {
					alert("Error in function VideoPlaying in video_external.js: currTime is invalid.");
					return false;
				}
				if ( isNaN(waveformDuration) ) {
					alert("Error in function VideoPlaying in video_external.js: waveformDuration is invalid.");
					return false;
				}
				if (! top.document.getElementById("pauseBetweenClipsMS") ) {
					alert("Error in function VideoPlaying in video_external.js: pause length is undefined.");
					return false;
				}
				var pauseMS = top.document.getElementById("pauseBetweenClipsMS").value;
				if (currTime < 1*ScheduleObjArr[0].start.toFixed(2)) {	// the playhead is somewhere before the start of the first clip
					var seekToPoint = 1*ScheduleObjArr[0].start.toFixed(2);
//console.log("in VideoPlaying(), playhead is before the start of the first clip, seekToPoint=" + seekToPoint);
					if ( (! isNaN(seekToPoint)) && (seekToPoint >= 0) & (seekToPoint <= 1*waveformDuration.toFixed(2)) ) {
/*
console.log("in VideoPlaying, about to pause video and cue to " + seekToPoint);
						while (! CurrVideoObj.paused) {
							try {
								CurrVideoObj.pause();
							}
							catch(e) {
console.log("in VideoPlaying Z, tried and failed CurrVideoObj.pause()");
							}
						}	// while
*/
						CurrVideoObj.currentTime = seekToPoint;
						if (CurrVideoObj.paused) {
							CurrVideoObj.play();
//console.log("VideoPlaying() just reset currentTime to " + seekToPoint + " and called CurrVideoObj.play()");
						}
//console.log("in VideoPlaying(), the playhead is at " + 1*CurrVideoObj.currentTime.toFixed(2));
						//setTimeout(function() { CueVideo(seekToPoint); }, 300) // this will move the playhead and start playback;
						UpdateProgressBar();
						UpdateTimeDisplay(currTime, 1*waveformDuration.toFixed(2));
						UpdateWaveformCursor();	// this function is in wavesurfer_goldilocks_type.js, used when video is controlled by the waveform for its sound track
					} else {
						alert("Error in function VideoPlaying in video_external.js: invalid destination A: (" + seekToPoint + ").");	
					}
				} else {	// user clicked within the first clip or anywhere beyond that
					for (var i=0; i<ScheduleObjArr.length; i++) {
						if ( (currTime >= 1*ScheduleObjArr[i].start.toFixed(2)) && (currTime <= 1*ScheduleObjArr[i].end.toFixed(2)) ) {	// playing clip i
							// let it play
						} else {	// we are outside any clip
							if (i < (ScheduleObjArr.length - 1)) { // clip i was not the last clip
								if ( (currTime > 1*ScheduleObjArr[i].end.toFixed(2)) && (currTime < 1*ScheduleObjArr[i + 1].start.toFixed(2)) ) {	// playhead is in the portion we should skip after clip i
									try {
										CurrVideoObj.pause();
									}
									catch(e) {
//console.log("in VideoPlaying A, tried and failed CurrVideoObj.pause()");
									}
									var seekToPoint = 1*ScheduleObjArr[i + 1].start.toFixed(2);
									if ( (! isNaN(seekToPoint)) && (seekToPoint >= 0) & (seekToPoint <= 1*waveformDuration.toFixed(2)) ) {
//console.log("in VideoPlaying, about to seek to " + seekToPoint + " sec");
										CurrVideoObj.currentTime = 1*seekToPoint.toFixed(2); // this will move the playhead the beginning of next clip (and playback will be started after pauseMS by the timer we'll set now)
										//CueVideo(seekToPoint); // this will move the playhead the beginning of next clip (and start playback);

						while (! CurrVideoObj.paused) {
							try {
								CurrVideoObj.pause();
//console.log("in VideoPlaying Z-1, just tried CurrVideoObj.pause()");
							}
							catch(e) {
//console.log("in VideoPlaying Z-2, tried and failed CurrVideoObj.pause()");
							}
						}	// while
//console.log("in VideoPlaying Z-3, CurrVideoObj.paused=" + CurrVideoObj.paused);

//console.log("in VideoPlaying, setting timer PlayClipsOnlyTimer");
										PlayClipsOnlyTimer = setTimeout(function() {
//console.log("in timer that was set in VideoPlaying, CurrVideoObj.paused=" + CurrVideoObj.paused);
														if (CurrVideoObj.paused) {
															try {
																CurrVideoObj.play();
															}
															catch(e) {
//console.log("in timer that was set in VideoPlaying, tried and failed CurrVideoObj.play()");
															}
														}
													}, pauseMS);
//console.log("in VideoPlaying, finished setting timer PlayClipsOnlyTimer");
									} else {
										alert("Error in function VideoPlaying in video_external.js: invalid destination B: (" + seekToPoint + ").");
									}
								}	// if ( (currTime > ScheduleObjArr[i].end) && (currTime < ScheduleObjArr[i + 1].start) )
							} else {	// clip i is the last clip
								if (currTime > 1*ScheduleObjArr[i].end.toFixed(2)) {	// the playhead is beyond the end of last clip
									clearTimeout(PlayClipsOnlyTimer);
//console.log("in VideoPlaying, cleared ClipsOnly timeout " + PlayClipsOnlyTimer);
									try {
										CurrVideoObj.pause();
//console.log("in VideoPlaying, called CurrVideoObj.pause()");
									}
									catch(e) {
//console.log("in VideoPlaying Y, failed to call CurrVideoObj.pause()");
									}
									CurrVideoObj.currentTime = 1*ScheduleObjArr[i].end.toFixed(2);
//console.log("in VideoPlaying, reset CurrVideoObj.currentTime to " + 1*CurrVideoObj.currentTime.toFixed(2));
								}
							}	// if (i < (ScheduleObjArr.length - 1))
						}	// if ( (currTime >= ScheduleObjArr[i].start) && (currTime <= ScheduleObjArr[i].end) )
						UpdateProgressBar();
						UpdateTimeDisplay(currTime, 1*waveformDuration.toFixed(2));
						UpdateWaveformCursor();	// this function is in wavesurfer_goldilocks_type.js, used when video is controlled by the waveform for its sound track
					}	// for (var i=0; i<ScheduleObjArr.length; i++)
				}	// if (currTime < ScheduleObjArr[0].start)
			} else {	// clipsOnly is false, play just the clip that was clicked or otherwise requested, or (if user clicked outside any clip) play the whole video ingoring all clips
				if ( (typeof(VideoRangeStartSec) != "undefined") && (typeof(VideoRangeEndSec) != "undefined")) {	// these are global vars set in the mother page, e.g. Sampler > Goldilocks > Video 1 > Video_2.htm
					if ( (VideoRangeStartSec > 0) && (VideoRangeEndSec > 0) && (VideoRangeEndSec > VideoRangeStartSec) ) {	// we are playing the requested range
						EffectiveVideoDurationSec = (VideoRangeEndSec - 1*VideoRangeStartSec).toFixed(2);
						EffectiveCurrentTimeSec = (CurrVideoObj.currentTime - 1*VideoRangeStartSec).toFixed(2);
					} else {	// we are playing  video continuously, ignoring the clips, if any
						EffectiveVideoDurationSec = 1*CurrVideoObj.duration.toFixed(2);
						EffectiveCurrentTimeSec = 1*CurrVideoObj.currentTime.toFixed(2);
					}
				}
	
				if (typeof(EffectiveCurrentTimeSec) != "undefined") {
					UpdateProgressBar();
					UpdateTimeDisplay(EffectiveCurrentTimeSec, EffectiveVideoDurationSec);
					if (typeof(wavesurfer) != "undefined") {
						UpdateWaveformCursor();	// this function is in wavesurfer_goldilocks_type.js, used when video is controlled by the waveform for its sound track
					}
//console.log("in VideoPlaying, ProgrammedPausePoint=" + ProgrammedPausePoint);
					if (typeof(ProgrammedPausePoint) == "number") {	// this is a global var, see above
						if (ProgrammedPausePoint > 0) {
							if (1*CurrVideoObj.currentTime.toFixed(2) >= 1*ProgrammedPausePoint.toFixed(2)) {
// if you watch the numbers below (in the console), you'll see that occasionally the CurrVideoObj.currentTime is greater than ProgrammedPausePoint by as much as 400 ms; this means that the granularity of the player's timeupdate events that call VideoPlaying() is not fine enough to pause the video exactly where we want it 
//console.log("ProgrammedPausePoint=" + ProgrammedPausePoint);
//console.log("CurrVideoObj.currentTime.toFixed(2)=" + CurrVideoObj.currentTime.toFixed(2));
								CurrVideoObj.currentTime = 1*ProgrammedPausePoint.toFixed(2);
								CurrVideoObj.pause();
								top.EnableResumeButton();
//console.log("in VideoPlaying, paused video at ProgrammedPausePoint (" + ProgrammedPausePoint.toFixed(2) + "), currtime=" +  CurrVideoObj.currentTime.toFixed(2));
								UpdateWaveformCursor();
								SaveCurrentTime();
								ProgrammedPausePoint = 0; 

								if (top.MultiClipComparisonInProgress) {	// flag defined and set in playback_functions.js; true when a comparison is playing for a multi-clip student recording e.g. dubs as in Goldilocks > Video 2
									if (typeof(top.ComparisonStudentSoundIndex) != "number") {
										alert("Program error in VideoPlaying: unknown ComparisonStudentSoundIndex. Sorry.");
										return false;
									}			
									if (top.ComparisonStudentSoundIndex < 0) {
										alert("Program error A in VideoPlaying: invalid ComparisonStudentSoundIndex. Sorry.");
										return false;
									}
									if (top.ComparisonStudentSoundIndex > (StudentRecordingMarkerObjArr.legth -1) ) {
										alert("Program error in VideoPlaying: ComparisonStudentSoundIndex is too large. Sorry.");
										return false;
									}
									if (top.ComparisonStudentSoundIndex == (StudentRecordingMarkerObjArr.length -1) ) {	// last video clip ended
										top.SetCompareButtonToEnabled(top.CurrTeacherSoundID);
										top.MultiClipComparisonInProgress = false;
										top.ComparisonStudentSoundIndex = -1;										
									} else {
										top.ComparisonStudentSoundIndex++;
										top.ComparisonStudentSoundProgrammedPauseSec = StudentRecordingMarkerObjArr[top.ComparisonStudentSoundIndex].end;
										if (top.ComparisonStudentSoundProgrammedPauseSec > 0) {
											top.CurrComparisonStudentPlaybackSound.play();
//console.log("in VideoPlaying, resumed sound and set it to pause at " + top.ComparisonStudentSoundProgrammedPauseSec);
										}
									}
								}	// if (MultiClipComparisonInProgress)


							}
						}
					}
					
					if (typeof(VideoRangeStartSec) != "undefined") {	// this is a global var set in the mother page, e.g. Sampler > Goldilocks > Video 1 > page 2
						if (VideoRangeStartSec > 0) {
							if (1*CurrVideoObj.currentTime.toFixed(2) < 1*VideoRangeStartSec.toFixed(2)) {
								CurrVideoObj.currentTime = 1*VideoRangeStartSec.toFixed(2);
								CurrVideoObj.pause();
							}								
						}
					}
	
					if (typeof(VideoRangeEndSec) != "undefined") {	// this is a global var set in the mother page, e.g. Sampler > Goldilocks > Video 1 > page 2
						if (VideoRangeEndSec > 0) {
							if (1*CurrVideoObj.currentTime.toFixed(2) > 1*VideoRangeEndSec.toFixed(2)) {
								CurrVideoObj.currentTime = 1*VideoRangeEndSec.toFixed(2);
//console.log("in VideoPlaying, paused video at VideoRangeEndSec");
								CurrVideoObj.pause();
							}								
						}
					}
				} else {
					UpdateTimeDisplay(0, 0);
				}	// if (typeof(EffectiveCurrentTimeSec) != "undefined")
			}	// if (clipsOnly)
			
			return true;
		}	// function VideoPlaying()
		
		function UpdateTimeDisplay(CurrSecs, DurationSecs) {
			/* updates current time display in the video controls bar */

			CurrSecs = Math.floor(CurrSecs);
			DurationSecs = Math.floor(DurationSecs);
			if (document.getElementById("cue_point")) {
				if ( (CurrSecs == 0) || (DurationSecs == 0) ) {
					var TimeStr = "&nbsp;";
				} else {
					var TimeStr = TimeDisplayStr(CurrSecs) ;
				}	// if ( (CurrSecs == 0) || (DurationSecs == 0) )
				document.getElementById("cue_point").innerHTML = TimeStr;
			}			

			if (document.getElementById("total_duration")) {
				if ( (CurrSecs == 0) || (DurationSecs == 0) ) {
					var TimeStr = "&nbsp;";
				} else {
					var TimeStr = "/ " + TimeDisplayStr(DurationSecs);
				}	// if ( (CurrSecs == 0) || (DurationSecs == 0) )
				document.getElementById("total_duration").innerHTML = TimeStr;
			}			
		}	// function UpdateTimeDisplay(CurrSecs, DurationSecs)
		
		function TimeDisplayStr(TimeIntegerSecs) {
			var CurrMins = Math.floor(TimeIntegerSecs / 60);
			var CurrHours = Math.floor(CurrMins / 60);
			CurrMins = CurrMins - (CurrHours * 60);
			var CurrSecs = Math.floor(TimeIntegerSecs - (CurrMins * 60));
			if (CurrHours < 1) {
				var TimeStr = TimeSegmentStr(CurrMins) + ":" + TimeSegmentStr(CurrSecs);				
			} else {
				var TimeStr = TimeSegmentStr(CurrHours) + ":" + TimeSegmentStr(CurrMins) + ":" + TimeSegmentStr(CurrSecs);				
			}
			return TimeStr;
		}	// function TimeDisplayStr(TimeINtegerSec)
		
		function TimeSegmentStr(TimeInteger) {
			/* returns TimeInteger as a two-character string, padded with leading zero is needed */	
			if (TimeInteger > 99) {
				var RetStr = "??";	
			} else {
				if (TimeInteger > 9) {
					var RetStr = TimeInteger + "";	
				} else {
					var RetStr = "0" + TimeInteger;	
				}
			}
			
			return RetStr;
		}	// function TimeStr(TimeInteger)
		
		function VideoPlay() {
		/* called when user clicks "rewind_button" */
			if (typeof(CurrVideoObj) == "object") {	// this object is initialized when this page is loaded, and event listeners are assigned to it (this might be done in html_head.cfm)
				// the in-page video player or image viewer may be obscuring the video; hide them
				if ( document.getElementById("in-page_image_viewer") && document.getElementById("image_viewer_div") ) {
					var ImageViewerDiv = document.getElementById("image_viewer_div");
					ImageViewerDiv.style.display = "none";
				}
				if ( document.getElementById("in-page_video_player") && document.getElementById("video_player_div") ) {
					var VideoPlayerDiv = document.getElementById("video_player_div");	
					VideoPlayerDiv.style.display = "none";
				}

				if (CurrVideoObj.paused) {
					CurrVideoObj.play();
				}
			}
		}	// function VideoPlay()
		
		function VideoPlayRange(StartPointSec, EndPointSec) {
			/* if present, StartPointSec, EndPointSec are the time points, in seconds, where the video is expected to start and stop */
			if (arguments.length < 1) {
				alert("VideoPlayRange() was called with no arguments.");
				return false; 
			}

			if (isNaN(StartPointSec) || (StartPointSec < 0) ) {
				alert("VideoPlayRange() was called with a bad argument.");
				return false; 
			}
			
			if (arguments.length < 2) {
				EndPointSec = 0; // this essentially means that the video will play to the end
			}
			ProgrammedPausePoint = 1*(EndPointSec*1).toFixed(2); // ProgrammedPausePoint is a global that is used in function VideoPlaying() if set to non-zero value
//console.log("in VideoPlayRange, ProgrammedPausePoint=" + ProgrammedPausePoint);
/*
			// this block controls the student recording whn doing the role-play or dubbing exercises
			if ( top.isRecording() ) { // startRecording() has been called, and recording is still in progress, though it may be paused, in which case top.isPaused() can be used to find that out
				if (ScheduleObjArr) {	// this must be true when video is controlled by a waveform, e.g. Sample > Goldilocks > Video 2;
					if (ScheduleObjArr.length > 0) {	// this is true when clips/regions are defined, e.g. Sample > Goldilocks > Video 2;
						var currTime = StartPointSec;
						for (var i=0; i<ScheduleObjArr.length; i++) {
							if ( (currTime >= ScheduleObjArr[i].start) && (currTime <= ScheduleObjArr[i].end) ) {	// we are playing clip i
								var currClip = i;
								break;
							}	// if ( (currTime >= ScheduleObjArr[i].start) && (currTime <= ScheduleObjArr[i].end) )
						}	// for (var i=0; i<ScheduleObjArr.length; i++)
					}	// if (ScheduleObjArr.length > 0)
				}	// if (ScheduleObjArr.length > 0)
			}	// if ( top.isRecording() )
*/

			CueVideo(StartPointSec); // this will start playback; it will be paused by function VideoPlaying() when ProgrammedPausePoint is reached
			
			return true;
		}	// function VideoPlayRange()
		
		function VideoPause() {
		/* called when user clicks "pause_button" */
			if (typeof(CurrVideoObj) == "object") {	// this object is initialized when this page is loaded, and event listeners are assigned to it  (this might be done in html_head.cfm)
				if (! CurrVideoObj.paused) {
					CurrVideoObj.pause();
				}
//console.log("in VideoPause, CurrVideoObj.paused is " + CurrVideoObj.paused);
				SaveCurrentTime();
			}			
		}	// function VideoPause()
		
		function VideoRepeat() {
		/* called when user clicks "repeat_button" */
			if (typeof(CurrVideoObj) == "object") {	// this object is initialized when this page is loaded, and event listeners are assigned to it  (this might be done in html_head.cfm)
				if (CurrVideoObj.currentTime != "undefined") {
					if (! isNaN(CurrVideoObj.currentTime)) {
						var DesiredTime = 1*Math.max(0, CurrVideoObj.currentTime - 2).toFixed(2); // seconds
						CueVideo(DesiredTime);
					}
				}
			}
		}	// function VideoRepeat()
		
		function CueVideo(DesiredTime) {
		/* DesiredTime is in seconds */
//console.log("starting CueVideo with " + DesiredTime);
			if (typeof(CurrVideoObj) == "object") {	// this object is initialized when this page is loaded, and event listeners are assigned to it (this might be done in html_head.cfm)
				if (typeof(CurrVideoObj.currentTime) != "undefined") {
					DesiredTime = DesiredTime * 1;	// we expect seconds, but it may be a string
					if (! isNaN(DesiredTime)) {
						//CurrVideoObj.pause(); // this was causing a strange effect in IE 9 (but not  any other browser):  the timeupdate message was no longer fired after the call to this function

						CurrVideoObj.currentTime = DesiredTime.toFixed(2); // seconds		

//console.log("in CueVideo, about to test CurrVideoObj.paused");
						if (CurrVideoObj.paused) {
//console.log("in CueVideo, CurrVideoObj.paused is true, now about to call CurrVideoObj.play()");
						try {
							CurrVideoObj.play();
//console.log("in CueVideo, called CurrVideoObj.play()");
						}
						catch(e) {
//console.log("in CueVideo, a call to CurrVideoObj.play() caused this error: " + e.message);
						}
						}
//						}
					}
				}
			}
		}	// function CueVideo(DesiredTime)
		
		function SaveCurrentTime() {
		/* saves current time to local storage */
			if (typeof(CurrVideoObj) == "object") {	// this object is initialized when this page is loaded, and event listeners are assigned to it (this might be done in html_head.cfm)
				if (document.getElementById("save_current_time") ) {
					localStorage.WALVideoSrc = CurrVideoObj.currentSrc;
					if (document.getElementById("save_current_time").checked) {
						localStorage.WALVideoCurrTime = CurrVideoObj.currentTime.toFixed(2);
					} else {
						localStorage.WALVideoCurrTime = 0;
					}
				}
			}
			return true;
		}	// function SaveCurrentTime()

		function RestoreCurrentTime() {
		/* cues video to the time point that was stored for it when leaving the previous page */
			if (typeof(CurrVideoObj) == "object") {	// this object is initialized when this page is loaded, and event listeners are assigned to it (this might be done in html_head.cfm)
				if (localStorage.WALVideoSrc) {
					if (localStorage.WALVideoSrc == CurrVideoObj.currentSrc) {
						if (localStorage.WALVideoCurrTime) {
							 if ( (CurrVideoObj.seekable.start(0) <= localStorage.WALVideoCurrTime) && (CurrVideoObj.seekable.end(0) >= localStorage.WALVideoCurrTime) )  {
								CurrVideoObj.currentTime = localStorage.WALVideoCurrTime.toFixed(2);
								CurrVideoObj.removeEventListener("canplay", RestoreCurrentTime); // without this, the video may be cued to the same point over and over again in the browsers that keep firing "canplay" continuously
							 }
						}
					}
				}
			}
			
			return true;
		}	// function RestoreCurrentTime()