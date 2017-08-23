/* this JavaScript file should be included in the htm file
	(i.e., the page that is shown by the show text MyFile.,htm action)
	that is similar to exercise Sampler > Robert Frost > Tree 1;
	it provides support for the waveform creation and navigation
	as well as the creation of similar pages in the student mode
 */
			var wavesurfer = null; // this will be the WaveSurfer {} object to hold the audio and waveform references, including the clips and their overlays defined on the fly

			var AutoDefineRegions = false;	//  automatically defining regions/clips of sound between silences doesnt work well for video

			top.LastPlayedRegion = null; // the most-recently-played audio wavesurfer region (clip) (not used when wavesurfer controls vide, as in this js file))

			top.LastClickedRegion = null; //  // the most-recently-clicked audio wavesurfer region (clip) (used when wavesurfer controls vide, as in this js file)
			
			var UserAllowedToSaveClips = true;

			var PageInitialized = false;
			var WavesurferInitialized = false;
			
			var MinVideoClipInterval = 0.5; 	// seconds: this is the minimum interval/gap between defined video clips for the clipsOnly mode to work well in most browsers
			var MinRecordableClipLengthSec = 1;		// seconds; this is the shortest video clips for which we will record a dub; shoprter clips cannot be supported for dubbinmg because of the great granularity (up to 0.5 seconds) of the timeupdated event on the video object
			
			var ClipHasBeenRecorded = false;	// this flag is useful only for RecordingType  "SingleDub"
			var CurrActionIndexBeforePriming = -1; // this var will store the value of top.CurrActionIndex before PrimeForRecording() was called; this wioll allow us to undo the priming if we need to, e.g. when user clicks between clips, thus canceling her intent to record
			
			var ScheduleObjArr = []; // array of objects, each corresponding to a defined wavesurfer region, and each having these properties: start, end, id
			
			var StudentRecordingMarkerObjArr = [];	// array of objects, each corresponding to a portion of the student's recording that corresponds to a video clip, and each having these properties: start, end (in seconds)
			if ( (CurrTimingMarkerList != "") && (CurrTimingMarkerList != "[]") ) {	// CurrTimingMarkerList is set elsewhere from retrieved db value in field TimingMarkerList, and it may have been saved as a JSON.stringify(""), which is "[]"
//console.log("at top of wavesurfer_goldilocks.js, StudentRecordingMarkerObjArr is being set from retrieved string, CurrTimingMarkerList (" + CurrTimingMarkerList + ")");
				try {
					StudentRecordingMarkerObjArr = JSON.parse(CurrTimingMarkerList);
				}
				catch(e) {
					alert("Invalid student recording markers were found (" + CurrTimingMarkerList + ") and have been discarded by wavesurfer_goldilocks_type.");
					ResetStudentRecordingMarkerArr();
				}	// try
//console.log("at top of wavesurfer_goldilocks.js, set from retrieved string, StudentRecordingMarkerObjArr.length=" + StudentRecordingMarkerObjArr.length);
			} else {
console.log("at top of wavesurfer_goldilocks.js, calling ResetStudentRecordingMarkerArr() because retrieved string, CurrTimingMarkerList is blank (" + CurrTimingMarkerList + ")");
				ResetStudentRecordingMarkerArr();				
			}
			
			var RegionColorStr = "rgba(206, 255, 255, 0.6)";
			var RegionHiliteColorStr = "rgba(106, 255, 255, 0.6)";
			var RegionReadyToRecordColorStr = "rgba(255, 180, 180, 0.6)"; 
			

			var WaveformEl;	// set when the wavesurfer object is ready, i.e. fully created
			var	WaveformElLeft;	// set when the wavesurfer object is ready, i.e. fully created
			var WaveformTop;	// set when the wavesurfer object is ready, i.e. fully created
			var WaveformWidth;	// set when the wavesurfer object is ready, i.e. fully created
			var WaveformCursor; // set when the wavesurfer object is ready; default position is set when the "waveform_cursor" div is defined in the mother page; later position is controlled by a function in this file
			var TempTimeoutID = 0; // throw-away timer that's only run one each time

			function UpdateWaveformCursor() {
				/* called continuously as the video plays */
				if ( document.getElementById("waveform_cursor") && (typeof(WaveformCursor) != "undefined") ) {
					if (typeof(CurrVideoObj) != "undefined") {
						if ((typeof(CurrVideoObj.currentTime) != "undefined") && (typeof(CurrVideoObj.duration) != "undefined")) {
							if ( (! isNaN(CurrVideoObj.currentTime)) && (! isNaN(CurrVideoObj.duration)) ) {
								if (CurrVideoObj.duration > 0) {
//console.log(WaveformCursor.style.width);
									var LeftPosInPx = Math.floor(WaveformWidth * (CurrVideoObj.currentTime / CurrVideoObj.duration)) - Math.floor(parseFloat(WaveformCursor.style.width));
									if (LeftPosInPx <= (WaveformElLeft + WaveformWidth) ) {
//console.log(LeftPosInPx);
										var LeftPosStr = LeftPosInPx + "px";
										//WaveformCursor.style.left = "250px";
										WaveformCursor.style.left = LeftPosStr;
										WaveformCursor.style.display = "block";
									}
								}
							}
						}
					}	// if (typeof(CurrVideoObj) != "undefined") {
				}		// if ( document.getElementById("waveform_cursor") && (typeof(WaveformCursor) != "undefined") )
			}	// function UpdateWaveformCursor()
					
			function ShowHTML(HTMLString) {
				/*  called to display HTMLString in HTML_viewer */
				if (document.getElementById("HTML_viewer") ) {
					if (document.getElementById("HTMLViewer_content_box") ) {
						var ViewerContentBoxObj = document.getElementById("HTMLViewer_content_box");
						ViewerContentBoxObj.innerHTML = HTMLString;
						document.getElementById("HTML_viewer").style.display = "block";					
					}
				}	// if (document.getElementById("HTML_viewer"))
			}	// function ShowHTML(HTMLString)

			document.onkeydown = function(event) {
				var key_code = event.keyCode;
				var key_press = String.fromCharCode(event.keyCode);
				var ShiftDown = event.getModifierState("Shift");
// console.log("in onkeydown in wavesurfer_goldilocks-type.js, key_press=" + key_press + " ShiftDown=" + ShiftDown);
			}	// document.onkeydown
	
			document.onkeyup = function(event){
				var key_code = event.keyCode;
				var key_press = String.fromCharCode(event.keyCode);
				var ShiftDown = event.getModifierState("Shift");

			// a tap on the B key is equivalent to clicking BackOne if Shift is up, or BackTwo if Shift is down
console.log(key_press + " was pressed in the iframe");
				switch (key_press) {
					case "P":
						if (typeof(CurrVideoObj) != "undefined") {
							if (CurrVideoObj.paused) {
								CurrVideoObj.play();
							} else {
								CurrVideoObj.pause();
							}
						}
						break;
					case "B":
						if (ShiftDown) {
							if (top.document.getElementById("BackTwo")) {
								if (! top.document.getElementById("BackTwo").disabled) {
									top.document.getElementById("BackTwo").click();	
									//CurrTeacherSoundID=Math.max(1, CurrTeacherSoundID-2); StartOrResumeExercise(CurrTeacherSoundID);
								}
							}
						} else {
							if (top.document.getElementById("BackOne")) {
								if (! top.document.getElementById("BackOne").disabled) {
									top.document.getElementById("BackOne").click();	
									//CurrTeacherSoundID=Math.max(1, CurrTeacherSoundID-1); StartOrResumeExercise(CurrTeacherSoundID);
								}
							}
						}
						break;
					case "D": 	// dubbing video, e.g. Sampler > Goldilocks > Video 2 > Page 5; if recording is paused, resume it and set a timer to 1) pause/stop recording and 2) resume playback, after ClipDurationSec seconds:
						if (top.document.getElementById('html_i_frame').contentWindow) {							
							var VideoPageWindow = top.document.getElementById('html_i_frame').contentWindow;
							if ( (typeof(VideoPageWindow.RecordingType) != "undefined") && (typeof(VideoPageWindow.ScheduleObjArr) != "undefined") && (VideoPageWindow.CurrVideoObj) ) {
								if  (VideoPageWindow.ScheduleObjArr.length > 0) {	// some clips are defined in the video window
									if (VideoPageWindow.WaitingToResumeDub) {
										VideoPageWindow.WaitingToResumeDub = false;
										// which clip is playing in VideoPageWindow?
										var CurrTime = VideoPageWindow.CurrVideoObj.currentTime;
										var CurrClip = -1;
										for (var i=0; i<VideoPageWindow.ScheduleObjArr.length; i++) {
											if ( (CurrTime >= VideoPageWindow.ScheduleObjArr[i].start) && (CurrTime <= VideoPageWindow.ScheduleObjArr[i].end) ) {	// we are playing clip i
												CurrClip = i;
											}	// if ( (CurrTime >= VideoPageWindow.ScheduleObjArr[i].start) && (CurrTime <= VideoPageWindow.ScheduleObjArr[i].end)
										}	// for (var i=0; i<VideoPageWindow.ScheduleObjArr.length; i++)									
										
										if (CurrClip != -1) {
											VideoPageWindow.StudentRecordingMarkerObjArr[CurrClip].start = top.recordingTime();
											resumeRecording();
											ShowMicIcon();											
											var ClipDurationSec = VideoPageWindow.ScheduleObjArr[CurrClip].end - VideoPageWindow.ScheduleObjArr[CurrClip].start;	// start and end values are stored in seconds, with 2 decimals
											var RecordingLengthMS = ClipDurationSec * 1000;
						
											if (CurrClip < VideoPageWindow.ScheduleObjArr.length-1) {	// CurrClip is not the last clip in the video
												setTimeout(function() {
														VideoPageWindow.StudentRecordingMarkerObjArr[CurrClip].end = top.recordingTime();
														VideoPageWindow.CurrTimingMarkerList = JSON.stringify(VideoPageWindow.StudentRecordingMarkerObjArr);
	//console.log("the timer that was set in utility_functions.js after pressing D has now fired, PAUSED recording and set CurrTimingMarkerList to " + VideoPageWindow.CurrTimingMarkerList);
														HideMicIcon();
														pauseRecording(); 
														VideoPageWindow.CurrVideoObj.play();
													}, RecordingLengthMS);		// resume playback when recording is done
											} else {	// CurrClip is the last clip in the video
												setTimeout(function() {
														VideoPageWindow.StudentRecordingMarkerObjArr[CurrClip].end = top.recordingTime();
														VideoPageWindow.CurrTimingMarkerList = JSON.stringify(VideoPageWindow.StudentRecordingMarkerObjArr);
	//console.log("the timer that was set in utility_functions.js after pressing D has now fired, STOPPED recording and set CurrTimingMarkerList to " + VideoPageWindow.CurrTimingMarkerList);
														HideMicIcon();
														StopRecording(); 
														VideoPageWindow.CurrVideoObj.play();
													}, RecordingLengthMS);		// resume playback when recording is done
											}
										}
									}
								}
							}
						}
						break;
					case "G":
						if (top.document.getElementById("ResumeExButton")) {
							if (! top.document.getElementById("ResumeExButton").disabled) {
								document.getElementById("ResumeExButton").click();	
								//StartOrResumeExercise(CurrTeacherSoundID);
							}
						}
						break;
					case "S":
						if (top.document.getElementById("StartExButton")) {
							if (! top.document.getElementById("StartExButton").disabled) {
								top.document.getElementById("StartExButton").click();	
							}
						}
						break;
					case "R":
						if (top.document.getElementById("RepeatExButton")) {
							if (! top.document.getElementById("RepeatExButton").disabled) {
								top.document.getElementById("RepeatExButton").click();	
							}
						}
						break;
				}	// switch
/*
				switch (key_press) {
					case "P":
						if (typeof(CurrVideoObj) != "undefined") {
							if (CurrVideoObj.paused) {
								CurrVideoObj.play();
							} else {
								CurrVideoObj.pause();
							}
						}
						break;
					case "T":
						if (top.document.getElementById("StopExButton")) {
							if (! top.document.getElementById("StopExButton").disabled) {
								top.document.getElementById("StopExButton").click();	
							}
						}
						break;
					}	// switch
*/
			}	// document.onkeyup
			
			function HideLoadingFlag() {
				/* hides the loading message in the parent window */
				if (top.document.getElementById("LoadingFlag")) {
					top.document.getElementById("LoadingFlag").innerHTML = "";
					top.document.getElementById("LoadingFlag").style.display = "none";
					top.ShowActionButtons()
					top.ShowDotButtons();
				}
			}	// function HideLoadingFlag()

			function UpdateLoadingFlag(Message) {
				/* updates the loading message in the parent window with the progress report */
				if (top.document.getElementById("LoadingFlag")) {
					top.document.getElementById("LoadingFlag").innerHTML = Message;
					top.document.getElementById("LoadingFlag").style.display = "inline";
					top.HideActionButtons()
					top.HideDotButtons();
				}
			}	// function UpdateLoadingFlag(Message)
			
			function Init() {
				PageInitialized = false;
				if (AudioURL != "") {

//console.log("in Init (wavesurfer_goldilocks_type.js), MultiClipData retrieved from WALSoundBiteConfig=" + top.SoundBiteObjArr[CurrSoundID].MultiClipData); // e.g. {"Labels":["right","hot 1","hot 2"],"Regions":[{"start":"27.20","end":"30.48"},{"start":"12.88","end":"14.95"},{"start":"20.04","end":"22.47"}]}
					// clean up the Save-clip-definitions links depending on whether the logged-in use is an author (perhaps in addition to being a student or teacher)
					if ( document.getElementById("SaveForStudent") && document.getElementById("SaveForCourse") ) {
						if (top.IsAuthor) {
							if ( document.getElementById("SaveForStudent") && document.getElementById("SaveForCourse") ) {
								document.getElementById("SaveForStudent").style.display = "none";
								document.getElementById("SaveForCourse").style.display = "inline";
							}
						} else {
							if (top.SoundBiteObjArr[CurrSoundID].MultiClipData != "") {	// author did not save any wavesurfer clips for this page
								document.getElementById("SaveForStudent").innerHTML = "Clips are predefined."
								//document.getElementById("SaveForStudent").href = "javascript: alert('You can create your own clips and submit recordings for them, but you cannot save them. The predefined clips will be redisplayed on page refresh.')"
								document.getElementById("SaveForStudent").title = "You can create your own clips and submit recordings for them, but you cannot save them. The predefined clips will be redisplayed on page refresh."
								document.getElementById("SaveForStudent").disabled = true;

								document.getElementById("SaveForCourse").style.cursor = "help";
								setTimeout( function() { document.getElementById("SaveForCourse").disabled = true; }, 500);
								//document.getElementById("SaveForCourse").style.color = "rgb(120, 120, 120)";
								//document.getElementById("SaveForCourse").style.textDecoration = "none";
								UserAllowedToSaveClips = false;
							}
							document.getElementById("SaveForStudent").style.display = "inline";
							document.getElementById("SaveForCourse").style.display = "none";
						}	// if (top.IsAuthor)
					}	// if ( document.getElementById("SaveForStudent") && document.getElementById("SaveForCourse") )

console.log("in Init(), CurrTimingMarkerList=" + CurrTimingMarkerList); // this is set from top.SoundBiteObjArr[CurrSoundID].TimingMarkerList);

					// at this point, CurrTimingMarkerList holds the values that were retrieved from the TimingMarkerList field of the WALStudentSubmissions table and assigned to  top.SoundBiteObjArr[CurrSoundID].TimingMarkerList)
					// e.g., for RecordingType "SingleClip" it may have only one non-zero set of "start" and "end" values: [{"paddingSec":0,"start":0,"end":5.617999999999999,"videoStart":2.94,"videoEnd":6.81},{"paddingSec":0,"start":0,"end":0,"videoStart":0,"videoEnd":0},{"paddingSec":0,"start":0,"end":0,"videoStart":0,"videoEnd":0},{"paddingSec":0,"start":0,"end":0,"videoStart":0,"videoEnd":0}]
					// for other recording types, there will be non-zero values in all "start" and "end" and "videoStarts" and "videoEnd" properties;

					//looks like we don't need to call this here: InitStudentRecordingMarkerArr(); // it is pointless to call it before MakeSchedule() is called
					//InitStudentRecordingMarkerArr();	// restored when investigating on 7/5/17--perhaps we do need it after all? call it after each call to MakeSchedule()?
					
					if (top.SoundBiteObjArr[CurrSoundID].MultiClipData.trim() != "") {	// this string is author's definition of wavesurfer clips, stored in table WALSoundBiteConfig for the current teacher sound (or video),
																																				// e.g. {"Labels":["right","hot 1","hot 2"],"Regions":[{"start":"27.20","end":"30.48"},{"start":"12.88","end":"14.95"},{"start":"20.04","end":"22.47"}]}
						// retrieve and use the clip definitions saved by an author logged in as student; these definitions override any clip definitions potentially saved by the student
						try {
//console.log("in Init (wavesurfer_goldilocks_type.js), restoring AUTHOR's clips");
							ParseRetrievedQuestionResponseList(top.SoundBiteObjArr[CurrSoundID].MultiClipData.trim()); // this function does all waveform and region creation
						}
						catch (e) {
							alert("Error in Init when trying to parse the retrieved author's definitions of wavesurfer clips.");
						}
					} else {
						// since no author-saved definitions were found, retrieve and use the clip definitions saved by a student
console.log("in Init (wavesurfer_goldilocks_type.js), calling StartResponseListDownload to restore STUDENT's clip definitions");
						StartResponseListDownload();	// retrieves previously stored data for the regions defined and saved by student user; (not by one who is also an author! that is retrieved elsewhere) returns true if OK, false if error; 
																			// if non-blank string RetrievedStr is retrieved, displays message in nav bar,
																			// and calls ParseRetrievedQuestionResponseList(RetrievedStr), which may
																			// define the wavesurfer object and possibly clips/regions for it as well
					}	// if (top.SoundBiteObjArr[CurrSoundID].MultiClipData.trim() != "")
				} else {	// hide all controls related to the sound
					if (document.getElementById("waveform_box") ) {
						document.getElementById("waveform_box").style.display = "none";
					}
					if (document.getElementById("clip_controls") ) {
						document.getElementById("clip_controls").style.display = "none";
					}
					if (document.getElementById("help_btn") ) {
						document.getElementById("help_btn").style.display = "none";
					}
				}	// if (AudioURL != "")

				// if this page is at https://, the sound, image, and text must be either local or also at a https:// site, so you can't use http: var ImageURL = "http://photography-by-jennifer.com/2e2bcac0.jpg";
				if (window.location.protocol == "https:") {
					if (AudioURL.indexOf("http://") == 0) {
						AudioURL = AudioURL.replace("http://", "https://");
					}
					if (ImageURL.indexOf("http://") == 0) {
						ImageURL = ImageURL.replace("http://", "https://");
					}
					if (TextURL.indexOf("http://") == 0) {
						TextURL = TextURL.replace("http://", "https://");
					}
				} else {
					if (window.location.protocol == "http:") {
						if (AudioURL.indexOf("https://") == 0) {
							AudioURL = AudioURL.replace("https://", "http://");
						}
						if (ImageURL.indexOf("https://") == 0) {
							ImageURL = ImageURL.replace("https://", "http://");
						}
						if (TextURL.indexOf("https://") == 0) {
							TextURL = TextURL.replace("https://", "http://");
						}
					}
				}
			
				if (typeof(DefaultWarmUpPauseSec) == "undefined") {
					DefaultWarmUpPauseSec = 2;	// should be set in the config js file
				}
			
				if ( top.document.getElementById("pauseBetweenClipsMS") ) {
					top.document.getElementById("pauseBetweenClipsMS").value = DefaultWarmUpPauseSec * 1000; 
				}
				if ( top.document.getElementById("currentPauseMS") ) {
					top.document.getElementById("currentPauseMS").value = DefaultWarmUpPauseSec; 
				}
			

				if (typeof(DefaultPlaybackVolumeWhileDubbing) == "undefined") {
					DefaultPlaybackVolumeWhileDubbing = 0;	// should be set in the config js file
				}

				if ( top.document.getElementById("PlaybackVolumeWhileDubbing") ) {
					top.document.getElementById("PlaybackVolumeWhileDubbing").value = DefaultPlaybackVolumeWhileDubbing;
				}

				if ( top.document.getElementById("currentPlaybackVolumeWhileDubbing") ) {
					top.document.getElementById("currentPlaybackVolumeWhileDubbing").value = DefaultPlaybackVolumeWhileDubbing * 100;
				}
					
				if (top.document.getElementById("recording_time_option") ){
					top.document.getElementById("recording_time_option").disabled = true;
					top.document.getElementById("recording_time_option").style.display = "none";
				}
				if (top.document.getElementById("playback_rate_option") ){
					top.document.getElementById("playback_rate_option").disabled = true;
					top.document.getElementById("playback_rate_option").style.display = "none";
				}
				if (top.document.getElementById("pause_length_option") ){
					top.document.getElementById("pause_length_option").disabled = false;
					top.document.getElementById("pause_length_option").style.display = "block";
				}
				
				if (top.document.getElementById("playback_volume_while_dubbing") ){
					top.document.getElementById("playback_volume_while_dubbing").style.display = "block";
				}

				if (document.getElementById("clip_directions")) {
					document.getElementById("clip_directions").style = top.CurrDirectionsFontCSSString;
					document.getElementById("clip_directions").style.fontSize = "14px";	
				}

				if (document.getElementById("text_frame") ) {
					document.getElementById("text_frame").src = TextURL;
				}
				if (document.getElementById("image") ) {
					document.getElementById("image").src = ImageURL;
				}
				
				if (document.getElementById("add-similar_btn") ) {
					if (top.AllowStudentToAdd) {
						document.getElementById("add-similar_btn").style.display = "block";
					} else {
						document.getElementById("add-similar_btn").style.display = "none";
					}
				}
				
				if (document.getElementById("remove-added_btn") ) {
					if (AllowStudentToAdd && AddedInStudentMode && (Username == AddedByUsername) ) {
						document.getElementById("remove-added_btn").style.display = "block";
					} else {
						document.getElementById("remove-added_btn").style.display = "none";
					}
				}
				
				if (AudioURL == "") {
					HideLoadingFlag();
				}

				PageInitialized = true;
			}	// function Init(); if instead of using the onload trigger in the body element you try to use window.onload, be sure to test with all browsers: some don't call that when the page is assigned as src to an iframe

			/** extractRegions( is ADAPTED FROM katspaugh's http://codepen.io/anon/pen/dXRZGr?editors=1011
			 * Extract regions separated by silence.
			 *
			 * @param {Array} peaks An array of PCM values.
			 * @param {Number} duration Audio duration.
			 * @param {Number} minValue The minimum PCM value that is considered non-slience.
			 * @param {Number} minSeconds The minimum duration of a non-silent region.
			 * @return {Array}
			 */
			function extractRegions(peaks, duration, minValue, minSeconds) {
				// Default params
				minValue = minValue || 0.0015;
				minSeconds = minSeconds || 0.25;
			
				var length = peaks.length;
				var coef = duration / length;
				var minLen = minSeconds / coef;
			
				// Gather silence indeces
				var silences = [];
				Array.prototype.forEach.call(peaks, function (val, index) {
					if (Math.abs(val) <= minValue) {
						silences.push(index);
					}
				});
			
				// Cluster silence values
				var clusters = [];
				silences.forEach(function (val, index) {
					if (clusters.length && val == silences[index - 1] + 1) {
						clusters[clusters.length - 1].push(val);
					} else {
						clusters.push([ val ]);
					}
				});
			
				// Filter silence clusters by minimum length
				var fClusters = clusters.filter(function (cluster) {
					return cluster.length >= minLen;
				});
			
				// Create regions on the edges of silences
				var regions = fClusters.map(function (cluster, index) {
					var next = fClusters[index + 1];
					return {
						start: cluster[cluster.length - 1],
						end: (next ? next[0] : length - 1)
					};
				});
			
				// Add an initial region if the audio doesn't start with silence
				var firstCluster = fClusters[0];
				if (firstCluster && firstCluster[0] != 0) {
					regions.unshift({
						start: 0,
						end: firstCluster[firstCluster.length - 1]
					});
				}
			
				// Filter regions by minimum length
				var fRegions = regions.filter(function (reg) {
					return reg.end - reg.start >= minLen;
				});
			
				// Return time-based regions
				return fRegions.map(function (reg) {
					return {
						start: Math.round(reg.start * coef * 10) / 10,
						end: Math.round(reg.end * coef * 10) / 10
					};
				});
			}	// function extractRegions(peaks, duration, minValue, minSeconds)

			function CreateLabel(region) {
				/* creates HTML element that serves as the editable label for region */
				if (document.getElementById("LabelFieldSet") ) {				
					//create input field
					var FillInFieldsetObj = document.getElementById("LabelFieldSet");
					var InputObj = document.createElement("input");
					InputObj.type = "text";
					InputObj.size = 10;
					InputObj.maxLength = 10;
					InputObj.className = "wavesurfer-label";
					InputObj.id = region.id + "-label";
					InputObj.name = InputObj.id;
					InputObj.addEventListener("keyup", function () {LabelEdited(InputObj.id); }, true);
					InputObj.addEventListener("blur", function () {if (InputObj.value.trim() == "") {InputObj.value = "name?"} }, true);
					FillInFieldsetObj.appendChild(InputObj);	
					
					//create close button
					var ImgObj = document.createElement("img");
					ImgObj.src = "../../../../graphics/disabled/delete_sm.png";
					ImgObj.id = region.id + "-delbtn";
					ImgObj.className = "wavesurfer-delbtn";
					ImgObj.addEventListener("click", function () {DeleteRegionAndLabel(InputObj.id); }, true);
					FillInFieldsetObj.appendChild(ImgObj);
				}
			}	// function CreateLabel(region)

			function UpdateLabel(region, NewLabel) {
				/* sets the value of the input field that serves as the region's label;
					if NewLabel is present, sets the value to it */
				if (document.querySelector('region[data-id="' + region.id + '"]') ) {
					var regionEl = document.querySelector('region[data-id="' + region.id + '"]');
					var RegionWidth = regionEl.clientWidth;
					var RegionLeft = regionEl.offsetLeft;
					if (document.querySelector('#' + region.id + '-label')) {
						var labelEl = document.querySelector('#' + region.id + '-label');
						if (arguments.length >= 2) {
							labelEl.value = NewLabel;
						}
						labelEl.title = labelEl.value;
						labelEl.style.display = 'inline';
						labelEl.style.width = (RegionWidth + 2) + 'px'; 
						labelEl.style.left = RegionLeft + 'px';
					}
					if (document.querySelector('#' + region.id + '-delbtn')) {
						var delbtnEl = document.querySelector('#' + region.id + '-delbtn');
						delbtnEl.title = "clear this clip";
						delbtnEl.style.left = (RegionLeft + RegionWidth - 8) + 'px';
					}
					if (UserAllowedToSaveClips) {
						top.ConfirmOnBeforeUnload = true;	// this will pop up a confirmation dialog when user does something that calls function StartOrResumeExercise() in exercise_flow_functions.js
					}
				}	// if (document.querySelector('region[data-id="' + region.id + '"]') )
			}	// function UpdateLabel(region, NewLabel)

			function DeleteAllRegions() {
				/* called to destroy all region definitions */
				// don't use wavesurfer.clearRegions() instead of this loop
				Object.keys(wavesurfer.regions.list).map(function (id) {
					var region = wavesurfer.regions.list[id];
					region.remove();
				})
				if (UserAllowedToSaveClips) {
					top.ConfirmOnBeforeUnload = true;	// this will pop up a confirmation dialog when user does something that calls function StartOrResumeExercise() in exercise_flow_functions.js
				}
				MakeSchedule();				

				CurrTimingMarkerList = ""; 	// this destroys the clip definitions that were retrieved from the db for the clips previously submitted by the student; the theory is that since she changed clip definitions (even though she has not saved them yet), her previous recordings are of no interest
				ResetStudentRecordingMarkerArr();
//console.log("blanked out CurrTimingMarkerList in DeleteAllRegions");
			}	// function DeleteAllRegions()
			
			function DeleteRegionAndLabel(LabelID) {
				/* called to remove region that is attached to label LabelID; also destroyes the label */
				if (LabelID.indexOf("-label") == (LabelID.length - 6) ) {
					var RegionID = LabelID.substr(0, (LabelID.length - 6) );
					var DelBtnID = LabelID.substr(0, (LabelID.length - 6) ) + "-delbtn";
					if (document.querySelector('region[data-id="' + RegionID + '"]') ) {
						var Zap = confirm("Clear the clip?");
						if (Zap) {
							wavesurfer.regions.list[RegionID].remove();							
							// delete the label
							if (document.getElementById("LabelFieldSet") && document.getElementById(LabelID) && document.getElementById(DelBtnID) ) {					
								var FillInFieldsetObj = document.getElementById("LabelFieldSet");
								var LabelObj = document.getElementById(LabelID);
								FillInFieldsetObj.removeChild(LabelObj);
								var DelBtnObj = document.getElementById(DelBtnID);
								FillInFieldsetObj.removeChild(DelBtnObj);
							}
							if (UserAllowedToSaveClips) {
								top.ConfirmOnBeforeUnload = true;	// this will pop up a confirmation dialog when user does something that calls function StartOrResumeExercise() in exercise_flow_functions.js
							}
							MakeSchedule();
							//added 7/11/17:
							CurrTimingMarkerList = ""; 	// this destroys the clip definitions that were retrieved from the db for the clips previously submitted by the student; the theory is that since she changed clip definitions (even though she has not saved them yet), her previous recordings are of no interest
							ResetStudentRecordingMarkerArr();
//console.log("blanked out CurrTimingMarkerList in DeleteRegionAndLabel");
						}	// if (Zap)
					}	// if (document.querySelector('region[data-id="' + RegionID + '"]') )
				}	// if (LabelID.indexOf("-label") == (LabelID.length - 6) )
			}	// function DeleteRegionAndLabel(LabelID)

			function DeleteAllLabels() {
				/* called to destroy all region labels */
				if (document.getElementById("LabelFieldSet") ) {					
					var FillInFieldsetObj = document.getElementById("LabelFieldSet");
					while (FillInFieldsetObj.childNodes.length > 0) {
						FillInFieldsetObj.removeChild(FillInFieldsetObj.lastChild);
					}
					if (UserAllowedToSaveClips) {
						top.ConfirmOnBeforeUnload = true;	// this will pop up a confirmation dialog when user does something that calls function StartOrResumeExercise() in exercise_flow_functions.js
					}
				}
			}	// function DeleteAllLabels()
			
			function LabelEdited(LabelID) {
				/* called on keyup by input field LabelID; LabelID is RegionID + "_Label" */
				if (UserAllowedToSaveClips) {
					top.ConfirmOnBeforeUnload = true;	// this will pop up a confirmation dialog when user does something that calls function StartOrResumeExercise() in exercise_flow_functions.js
				}
				if (document.getElementById(LabelID) ) {
					if (document.getElementById(LabelID).value == "") {
						// nothing for now /*DeleteRegionAndLabel(LabelID);*/
					} else {
						if (document.getElementById(LabelID).value.indexOf("<") > -1) {
							alert("Character < and HTML markup are not allowed in clip labels.")	
						}
						document.getElementById(LabelID).title = document.getElementById(LabelID).value;
					}
				}
			}	// function LabelEdited(LabelID)

			/* copied from view-source:http://wavesurfer-js.org/example/annotation/app.js; not used here: we save regions and labels to the server */
			 /* Save annotations to localStorage. */
			/*
			function saveRegions() {
				localStorage.regions = JSON.stringify(
					Object.keys(wavesurfer.regions.list).map(function (id) {
						var region = wavesurfer.regions.list[id];
						return {
							start: region.start,
							end: region.end,
							attributes: region.attributes,
							data: region.data
						};
					})
				);
			}
			*/
						
			/* Load regions from localStorage. */
/*
			function loadRegions(regions) {
				var Regions = JSON.parse(localStorage.regions);
				Regions.forEach(function (region) {
					//region.color = randomColor(0.1);
					wavesurfer.addRegion(region);
				});
			}
*/
			/* end of copy from view-source:http://wavesurfer-js.org/example/annotation/app.js */


			
			function PrepareStringToStore() {
				/* returns a string that contains all region and label information, prefixed with key word "SoundClips:" */
				var RetStr = "";
				var CurrID = "";
				var CurrRegion = null;
				var CurrStart = 0;
				var CurrEnd = 0;
				var c = "";
				var CurrDrag = false;
				var Clips = {};	// object that will have two properties, both arrays: Labels () and Regions (array of objects, one of the regions defined for wavesurfer)
				Clips.Labels = []; // array of strings, one for each region
				Clips.Regions = []; // array of objects, one for each region; each with whatever properties are defined for wavesurfer regions
				var RegionIDArr = Object.keys(wavesurfer.regions.list);
				
				if (RegionIDArr.length == 0) {
					return "";
				} else {
					for (var i=0;i<RegionIDArr.length; i++) {
						CurrID = RegionIDArr[i];
						CurrRegion = wavesurfer.regions.list[CurrID];
						CurrStart = 1*parseFloat(CurrRegion.start).toFixed(2);
						CurrEnd = 1*parseFloat(CurrRegion.end).toFixed(2);
						Clips.Regions.push({start: CurrStart, end: CurrEnd});
						if (document.getElementById(CurrID + "-label") ) {
							Clips.Labels.push(document.getElementById(CurrID + "-label").value.trim());
						} else {
							alert("Error in PrepareStringToStore: no label found for clip " + CurrID + ".");
						}
					}				
				}	// if (RegionIDArr.length == 0)

				RetStr = "SoundClips:" + JSON.stringify(Clips);
				if (RetStr.length > 4000) {
					alert("Too many clips, or else their names are too long. Define fewer clips or give them shorter names.");
					return "";
				} else {
					return RetStr;
				}
			}	// function PrepareStringToStore()

			function ParseRetrievedQuestionResponseList(RetrievedStr) {
				/* called when the previously stored clip data RetrievedStr is successfully retrieved;
					clip data is in JSON format, prefixed by the key word "SoundClips:" (including the colon);
					one property of the object is Labels and the other is Regions, both are objects; 
					RetrievedStr is blank if no clip info was ever stored for the current page in the user's account;
					this function does all waveform and region creation */
//console.log("in ParseRetrievedQuestionResponseList A, RetrievedStr=" + RetrievedStr + "=");
				if (RetrievedStr.trim() != "") {	// blank value is legit
					if (RetrievedStr.indexOf("SoundClips:") != 0) {
						alert("The clips saved for this sound on an earlier visit cannot be restored. (" + RetrievedStr + ")");	
						RetrievedStr = "";
					} else {
						RetrievedStr = RetrievedStr.substr(11);
						if (RetrievedStr.trim() != "") {
//console.log("in ParseRetrievedQuestionResponseList B, RetrievedStr=" + RetrievedStr + "=");

							try {
								var RetrievedLabelsObj = JSON.parse(RetrievedStr).Labels;
								var RetrievedRegionsObj = JSON.parse(RetrievedStr).Regions;
							
								if ( (Object.keys(RetrievedLabelsObj).length != Object.keys(RetrievedRegionsObj).length) || (Object.keys(RetrievedLabelsObj).length == 0) ) {
									alert("The retrieved clip definitions are mismatched and will be discarded.");
									RetrievedStr = "";
								}
							}
							
							catch(err) {
								alert("The retrieved clip definitions are invalid and will be discarded." + err);
								RetrievedStr = "";
							}
						}
					}	// RetrievedStr.indexOf("SoundClips:") != 0
				}	// if (RetrievedStr.trim() != "")

				// create wavesurfer object
				wavesurfer = WaveSurfer.create({
					container: '#waveform',
					height: 70,
					normalize: true,
					scrollParent: false
				});

				// provide the callback functions for various events

				wavesurfer.on('loading', function (X, evt) {	// display loading progress
					UpdateLoadingFlag(X + "%");
				});

				wavesurfer.on('pause', function (region) {
					// not useful in the waveform-conbtrolled video: SaveCurrentAudioTime();
				});

				wavesurfer.on('finish', function (region) {
					// not useful in the waveform-controlled video: SaveCurrentAudioTime();
				});

				wavesurfer.on('seek', function (region) {
					// not useful in the waveform-controlled video: SaveCurrentAudioTime();
				});

				wavesurfer.on('region-created', function (region) {
					CreateLabel(region);
					UpdateLabel(region, "clip X");
					MakeSchedule();


					if ( (PageInitialized) && (WavesurferInitialized) ){		// we do not want to destroy CurrTimingMarkerList if the page is just being initialized
						CurrTimingMarkerList = ""; 	// this destroys the clip definitions that were retrieved from the db for the clips previously submitted by the student; the theory is that since she changed clip definitions (even though she has not saved them yet), her previous recordings are of no interest
						ResetStudentRecordingMarkerArr();	// what she has recorded or retrieved from an earlier session doesn't match the clips anymore
console.log("blanked out CurrTimingMarkerList in region-created");
					}
				});

				wavesurfer.on('region-updated', function (region) {
					if (document.getElementById("clipsOnly") ) {
						//document.getElementById("clipsOnly").checked = false;	// this is a cop-out solution the problem I cannot resolve: resizing or creating a clip while clipsOnly is true causes unpredictable behavior in the video player
					}
/* this should be moved to 'region-update-end', but we can't do that because 'region-update-end' is fired when you click a region, for no good reason: */
					UpdateLabel(region);
					MakeSchedule();

//					ProgrammedPausePoint = region.start; // this will cause VideoPlaying() in video_external to pause playback

					if ( (PageInitialized) && (WavesurferInitialized) ){		// we do not want to destroy CurrTimingMarkerList if the page is just being initialized
						CurrTimingMarkerList = ""; 	// this destroys the clip definitions that were retrieved from the db for the clips previously submitted by the student; the theory is that since she changed clip definitions (even though she has not saved them yet), her previous recordings are of no interest
						ResetStudentRecordingMarkerArr();	// what she has recorded or retrieved from an earlier session doesn't match the clips anymore
console.log("blanked out CurrTimingMarkerList in region-update-end");
					}
				});

				wavesurfer.on('region-update-end', function (region) {
					// BUG in wavesurfer? why is this function called when user clicks a region?
					//	Because of that I can't move some stuff from the "region-updated" to here, where it really belongs, see it commented out below;
					// it belongs here because "region-updated" fires continuously as the user drags
					//wavesurfer.seekTo(region.start);
					//this caused a double start of playback, for an unknown reason (bug in wavesurfer): TempTimeoutID = setTimeout(function(){VideoPlayRange(region.start, region.end)}, 500);	// cleared elsewhere

console.log("starting region-update-end");
/*
					if (document.getElementById("clipsOnly") ) {
						document.getElementById("clipsOnly").checked = false;	// this is a cop-out solution the problem I cannot resolve: resizing or creating a clip while clipsOnly is true causes unpredictable behavior in the video player
					}
*/
/*					
					if (CurrVideoObj) {
						try {
							CurrVideoObj.pause();
console.log("in 'region-update-end', tried CurrVideoObj.pause()");
						}
						catch (e) {
							console.log("in 'region-update-end', failed to pause video playback");	
						}
					}
*/
/* the block has been moved to region-updated because this function is called when you click the region, for no good reason
					UpdateLabel(region);
					MakeSchedule();

//					ProgrammedPausePoint = region.start; // this will cause VideoPlaying() in video_external to pause playback

					if ( (PageInitialized) && (WavesurferInitialized) ){		// we do not want to destroy CurrTimingMarkerList if the page is just being initialized
						CurrTimingMarkerList = ""; 	// this destroys the clip definitions that were retrieved from the db for the clips previously submitted by the student; the theory is that since she changed clip definitions (even though she has not saved them yet), her previous recordings are of no interest
						ResetStudentRecordingMarkerArr();	// what she has recorded or retrieved from an earlier session doesn't match the clips anymore
console.log("blanked out CurrTimingMarkerList in region-update-end");
					}
*/
				});

				wavesurfer.on('audioprocess', function () {	// continuosly called as the audio plays, seeks, etc.
/* not useful in the waveform-controlled video: 
					//top.console.log("current time (sec): " + wavesurfer.getCurrentTime());
					if (ScheduleObjArr) {
						if (ScheduleObjArr.length > 0) {
							var currTime = wavesurfer.getCurrentTime();
							var waveformDuration = wavesurfer.getDuration();
							var clipsOnly = document.getElementById("clipsOnly").checked;
							var pauseMS = top.document.getElementById("pauseBetweenClipsMS").value;
							if (currTime < ScheduleObjArr[0].start) {
								if (clipsOnly) {
									var seekToPoint = ScheduleObjArr[0].start/waveformDuration;
									if ( (! isNaN(seekToPoint)) && (seekToPoint >= 0) & (seekToPoint <= 1) ) {
										wavesurfer.seekTo(seekToPoint);
										wavesurfer.play();
									} else {
										alert("Error in audioprocess: invalid destination (" + seekToPoint + ").");	
									}
								} else {
								}
							} else {
								for (var i=0; i<ScheduleObjArr.length; i++) {
									if ( (currTime >= ScheduleObjArr[i].start) && (currTime <= ScheduleObjArr[i].end) ) {	// playing clip i
									} else {
										if (i < (ScheduleObjArr.length - 1)) { // clip i is not the last clip yet
											if ( (currTime > ScheduleObjArr[i].end) && (currTime < ScheduleObjArr[i + 1].start) ) {	// silence after clip i
												if (clipsOnly) {
													wavesurfer.pause();
													var seekToPoint = ScheduleObjArr[i + 1].start/waveformDuration;
													if ( (! isNaN(seekToPoint)) && (seekToPoint >= 0) & (seekToPoint <= 1) ) {
														wavesurfer.seekTo(seekToPoint);	
														wavesurfer.pause();
														setTimeout(function() {wavesurfer.play()}, pauseMS);
													} else {
														alert("Error in audioprocess: invalid destination (" + seekToPoint + ").");	
													}
												}	// if (clipsOnly)
											}	// if ( (currTime > ScheduleObjArr[i].end) && (currTime < ScheduleObjArr[i + 1].start) )
										} else {	// clip i is the last clip
											if 	(currTime > ScheduleObjArr[i].end) {	//beyond the end of last clip
												if (clipsOnly) {
													wavesurfer.pause();
												} else {
//console.log("beyond last clip");	
												}
											}
										}	// if (i < (ScheduleObjArr.length - 1))
									}	// if ( (currTime >= ScheduleObjArr[i].start) && (currTime <= ScheduleObjArr[i].end) )
								}	// for (var i=0; i<ScheduleObjArr.length; i++)
							}	// if (currTime < ScheduleObjArr[0].start)
						}	// if (ScheduleObjArr.length > 0)
					}	// if (ScheduleObjArr)
*/
				});	// wavesurfer.on('audioprocess', function ()


/*
				wavesurfer.on('region-click', function (region, e) {
					if (wavesurfer.isPlaying() ) {
						wavesurfer.pause();
					} else {
						// is Shift key down?
						if (e.shiftKey) { PlayOrStopComparison(3)
//							var ClickedPoint = / e.clientX
//top.console.log(e.clientX);
							//wavesurfer.seek();
							wavesurfer.playPause();
						} else {
							wavesurfer.play(region.start, region.end);
						}
					}
					e.stopPropagation();
				});
*/

				wavesurfer.on('region-click', function (region, e) {
					/* called when user clicks on a region defined in the waveform */
//console.log("region-click started and aborted");
//return false;					
					top.EnableStopButton();
					if (typeof(TempTimeoutID) == "numeric") {
						clearTimeout(TempTimeoutID); // clear the throw-away timeout
					}
					ResetRegionColor();

					if (RecordingType == "SingleDub") {
						SetRegionColorToRecordable(region);
						if (GetRecordableClipIndex() > 0) {	// user clicked a clip and its background indicates that it is now recordable
							if (ClipHasBeenRecorded) {	// a recording has been completed since this page was loaded
								//ClipHasBeenRecorded = false; 
								if (! PrimeForRecording()) {
									alert("Recording canceled.");
								}
//console.log(top.SoundBiteObjArr[CurrSoundID].ActionsArr);
							}	// if (ClipHasBeenRecorded)
						}
					} else {	// not SingleDub exercise
						var regionEl = document.querySelector('region[data-id="' + region.id + '"]');
						regionEl.style.backgroundColor = RegionHiliteColorStr;
					}	// if (RecordingType == "SingleDub")

					var playClipsOnly = false;
					if (document.getElementById("clipsOnly") && wavesurfer.regions.list) {
						if ( (document.getElementById("clipsOnly").checked) && (Object.keys(wavesurfer.regions.list).length > 0) ) {
							playClipsOnly = document.getElementById("clipsOnly").checked;
						}
						if (playClipsOnly) {
							CheckVideoClipIntervals();	// will display a warning if any two clips are too close together	
						}
					}

//console.log("Region starts at " + region.start);
//console.log("Region ends at " + region.end);
//console.log("playClipsOnly is " + playClipsOnly);

					// at what time point did the click land?
					var waveformObj = document.getElementById("waveform");
					var clickedLeft = e.clientX - waveformObj.offsetParent.offsetLeft - waveformObj.offsetLeft;
					var ClickedProgress = (clickedLeft + document.querySelector("#waveform wave").scrollLeft) / document.querySelector("#waveform wave canvas").width; // from 0 to 1
					var ClickedTimepoint = (wavesurfer.getDuration() * ClickedProgress).toFixed(2)*1; // seconds
					
					// is this point within a region/clip?
					
					var WhichClipClicked = -1;	// first clip is number 0
					for (var i=0; i<ScheduleObjArr.length; i++) {
console.log("in 'region-click',  ScheduleObjArr[i].start=" +  ScheduleObjArr[i].start);
console.log("in 'region-click',  ScheduleObjArr[i].end=" +  ScheduleObjArr[i].end);
						CurrRegionStart = ((ScheduleObjArr[i].start)*1).toFixed(2)*1;
						CurrRegionEnd = ((ScheduleObjArr[i].end)*1).toFixed(2)*1;
						if ( (ClickedTimepoint >= CurrRegionStart) && (ClickedTimepoint <= CurrRegionEnd) ) {
							WhichClipClicked = i;
						}
					}
//console.log("You clicked clip " + WhichClipClicked);

					if (! CurrVideoObj.paused) {
						CurrVideoObj.pause();
					} else {
						if (e.shiftKey) {
//console.log("Shift is down");
							// we want the playback to start at the clicked point
							if (playClipsOnly) {	// the "play all clips" box is checked, so continue playback beyond the end of the region, and the "audioprocess" callback function will take over and skip the non-clip portions
								// this timeout business is necessary when we want to play the wavesurfer clip: window.setTimeout(function() {wavesurfer.play(ClickedTimepoint)}, 200); // this timer gets around the time lag while the click on the waveform strats playing, then immediately pauses
								VideoPlayRange(ClickedTimepoint);
							} else {
								VideoPlayRange(ClickedTimepoint, region.end); // play from the clicked point to the end of the clip/region, then pause
							}
						} else { // we want the playback to start at the start of the clip/region
							if (playClipsOnly) {	// the "play all clips" box is checked, so continue playback beyond the end of the region, and the "audioprocess" callback function will take over and skip the non-clip portions
								VideoPlayRange(1*region.start.toFixed(2)); 
							} else {
								VideoPlayRange(1*region.start.toFixed(2), 1*region.end.toFixed(2)); // play from the start of the clip/region to the end of the clip, then pause
							}
						}							
					}
					top.LastClickedRegion = region;

					e.stopPropagation();
				});	// wavesurfer.on('region-click', function (region, e)

				wavesurfer.on('region-dblclick', function (region, e) {
					//top.console.log(region.id + " was double-clicked at " + e.clientX + " " + e.clientY );
				});

				wavesurfer.on('region-mouseenter', function (region, e) {
					//top.console.log("mouse entered " + region.id);
				});

				wavesurfer.on('region-mouseleave', function (region, e) {
					//top.console.log("mouse left " + region.id);
				});

				wavesurfer.on('region-in', function (region) {
					//top.console.log(region.id + " started at " + wavesurfer.getCurrentTime()); // THIS NEEDS TESTING: it seems to always fire twice
					/* this method of changing the color the color resets top.ConfirmOnBeforeUnload, which is not good, so we use an alternative, below
					region.update({
						color: RegionHiliteColorStr
					});
					*/
					var regionEl = document.querySelector('region[data-id="' + region.id + '"]');
					regionEl.style.backgroundColor = RegionHiliteColorStr;

					top.LastPlayedRegion = region;
				});

				wavesurfer.on('region-out', function (region) {
					//top.console.log(region.id + " ended at " + wavesurfer.getCurrentTime());  // THIS NEEDS TESTING: it seeems to always fire twice
					/* this method of changing the color the color resets top.ConfirmOnBeforeUnload, which is not good, so we use an alternative, below
					region.update({
						color: RegionColorStr
					});
					*/
					var regionEl = document.querySelector('region[data-id="' + region.id + '"]');
					regionEl.style.backgroundColor = RegionColorStr;
					top.LastPlayedRegion = null;
				});

				wavesurfer.on('region-play', function (region) {
					//top.console.log(region.id + " playing at " + wavesurfer.getCurrentTime());	// THIS NEEDS TESTING: it doesn't fire
				});

				//load audio file						
				wavesurfer.load(AudioURL);	// load audio
				/* for original region-coding example, see katspaugh's code pen  at http://codepen.io/katspaugh/pen/PzKmVv */
//console.log("RetrievedStr=" + RetrievedStr);
				if (RetrievedStr.trim() == "") {	// stored clip info wasn't retrieved (because of an error or because it had never been stored for this page in this user's account);
					// we'll add regions from scratch, based on the silences in the loaded audio
	
					wavesurfer.on('ready', function () {
						wavesurfer.enableDragSelection({	// enable creating regions by dragging
							color : RegionColorStr,		// bg color for new regions
								drag: false,	// new region draggable?
							slop: 5	// min pixel count for the drag to create a region
						});
						
						WaveformEl = document.getElementById("waveform");
						WaveformTop = WaveformEl.offsetTop - WaveformEl.offsetParent.offsetTop;
						WaveformWidth = WaveformEl.offsetWidth;
						//var	waveformElLeft = e.clientX - waveformEl.offsetParent.offsetLeft - waveformEl.offsetLeft;
						WaveformElLeft = WaveformEl.offsetParent.offsetLeft - WaveformEl.offsetLeft;
						
						WaveformCursor = document.getElementById("waveform_cursor");	// the default position is at left edge of the waveform, set when the element is define in the mother page
						
						// not useful when video playback is controlled by waveform: RestoreCurrentAudioTime();

						/* example of manual definition of a region:
						var region = wavesurfer.addRegion({
							id: 'stanza1',
							start: 28,
							end: 36,
							drag: true,
							color: RegionColorStr
						  });
						*/
						
						if (AutoDefineRegions) {	
							// auto-define regions
							var size = 2000; // the size of the peaks array (affects accuracy)
							var peaks = wavesurfer.backend.getPeaks(size);
	
							// define segments between silences
							var regions = extractRegions(
								peaks, // peaks
								wavesurfer.getDuration(), // duration
								0.005, // minimum amplitude (from 0 to 1)
								0.4 // minimum duration of a region (in seconds)
							);
							// regions is now an array of objects, each with two properties: start and end; these are not yet attached to wavesurfer
	
							for (var i=0; i<regions.length; i++) {
								// add safety margin (in seconds) to each end of each region
								regions[i].start = Math.max(0, (regions[i].start - 0.1) );
								regions[i].end = Math.min( wavesurfer.getDuration(),  (regions[i].end + 0.2) );
		
								// add other properties required for a region when it is created in wavesurfer
								regions[i].color = RegionColorStr;
								regions[i].drag = false;
								// the id for each region will be randomly generated by wavesurfer, but you can also do that here: // regions[i].id = "Region " + i;
								// regions[i] now has four properties: color, drag, start, and end; it is not yet attached to wavesurfer, i.e. it is not yet a region of wavesurfer
	
								var region = wavesurfer.addRegion(regions[i]);	 // callback function triggered by event 'region-created' will create and update an editable label for this new region
	
							}	// now wavesurfer has so many regions attached to it
							//console.log(wavesurfer.regions.list);	// this displays an Object that has as many properties as the number of regions defined above; each property is an Object
						}
						MakeSchedule();

						if ( (PageInitialized) && (WavesurferInitialized) ){		// we do not want to destroy CurrTimingMarkerList if the page is just being initialized
							CurrTimingMarkerList = ""; 	// this destroys the clip definitions that were retrieved from the db for the clips previously submitted by the student; the theory is that since she changed clip definitions (even though she has not saved them yet), her previous recordings are of no interest
							ResetStudentRecordingMarkerArr();	// what she has recorded or retrieved from an earlier session doesn't match the clips anymore
console.log("blanked out CurrTimingMarkerList in AutoDefineRegions");
						}
						//();
				
						/* example of looping over all regions:
						var RegionIDArr = Object.keys(wavesurfer.regions.list); // an array of ids of all regions					
						console.log(RegionIDArr);	// this displays the array of randomly generated strings for all regions in the form "wavesurfer_1qavjpnnc5g"
						for (var i=0;i<RegionIDArr.length; i++) {
							CurrRegion = wavesurfer.regions.list[RegionIDArr[i]];
							top.console.log(CurrRegion.start); // seconds
							top.console.log(CurrRegion.end); // seconds
						}
						*/
						
						/*  here is another way to loop over all regions:
							Object.keys(wavesurfer.regions.list).map(function (id) {
								var region = wavesurfer.regions.list[id];
								top.console.log(region);
							})
						*/	
						
						top.ConfirmOnBeforeUnload = false;	// when reset to true, this will pop up a confirmation dialog when user does something that calls function StartOrResumeExercise() in exercise_flow_functions.js

						HideLoadingFlag();

						wavesurfer.seekTo(1);	// this will cue to the end of the sound
						document.getElementById("waveform").children[0].children[1].style.borderRight = "none"; // this will remove the right border that serves as the audio cursor
					});	// on ready	

				} else {	// clip info was successfully retrieved from the server and is in RetrievedLabelsObj and RetrievedRegionsObj;
					// we'll add regions based on the retrieved clip info

					wavesurfer.on('ready', function () {
						wavesurfer.enableDragSelection({	// enable creating regions by dragging
							color : RegionColorStr,		// bg color for new regions
							drag: false,	// new region draggable?
							slop: 5	// min pixel count for the drag to create a region
						});

						WaveformEl = document.getElementById("waveform");
						WaveformTop = WaveformEl.offsetTop - WaveformEl.offsetParent.offsetTop;
						WaveformWidth = WaveformEl.offsetWidth;
						//var	waveformElLeft = e.clientX - waveformEl.offsetParent.offsetLeft - waveformEl.offsetLeft;
						WaveformElLeft = WaveformEl.offsetParent.offsetLeft - WaveformEl.offsetLeft;
						
						WaveformCursor = document.getElementById("waveform_cursor");	// the default position is at left edge of the waveform, set when the element is define in the mother page

						// not useful when video playback is controlled by waveform: RestoreCurrentAudioTime();
	
						var regions = RetrievedRegionsObj;
						// regions is now an array of objects retrieved from the user's account on the server, each with two properties: start and end; these are not yet attached to wavesurfer
						
						for (var i=0; i<regions.length; i++) {
							// add other properties required for a region when it is created in wavesurfer
							regions[i].color = RegionColorStr;
							regions[i].drag = false;
							// the id for each region will be randomly generated by wavesurfer, but you can also do that here:
							// regions[i].id = "Region " + i; however, the ids given to the new regions that user creates by dragging are beyond our control, so it's better to let wavesurfer control ids;
							// regions[i] now has the four required properties: color, drag, start, and end; it is not yet attached to wavesurfer, i.e. it is not yet a region of wavesurfer

							var region = wavesurfer.addRegion(regions[i]);	 // callback function triggered by event 'region-created' will create and update an editable label for this new region
						}	// now wavesurfer has so many regions attached to it
						//console.log(wavesurfer.regions.list);	// this displays an Object that has as many properties as the number of regions defined above; each property is an Object

						// the labels for the regions (the input fields) were created by the "region-created' callback function with default values; we'll reset them to the labels retrieved from the server
						var RegionIDArr = Object.keys(wavesurfer.regions.list); // an array of ids of all regions
						for (var i=0;i<RegionIDArr.length; i++) {
							//	var CurrRegion = wavesurfer.regions.list[RegionIDArr[i]];
							var CurrRegion = wavesurfer.regions.list[RegionIDArr[i]];
							var CurrLabel = RetrievedLabelsObj[i];	// NOTE: we rely on JSON.stringify() preserving the order of the labels in this array; if this turns out to be different, this code needs to ne changed
							UpdateLabel(CurrRegion, CurrLabel)
						}

						MakeSchedule();
						if ( (PageInitialized) && (WavesurferInitialized) ){		// we do not want to destroy CurrTimingMarkerList if the page is just being initialized
							CurrTimingMarkerList = ""; 	// this destroys the clip definitions that were retrieved from the db for the clips previously submitted by the student; the theory is that since she changed clip definitions (even though she has not saved them yet), her previous recordings are of no interest
console.log("CurrTimingMarkerList blanked out in wavesurfer.on('ready'...");
							ResetStudentRecordingMarkerArr();
						}

						top.ConfirmOnBeforeUnload = false;	// when reset to true, this will pop up a confirmation dialog when user does something that calls function StartOrResumeExercise() in exercise_flow_functions.js

						HideLoadingFlag();

						wavesurfer.seekTo(1);	// this will cue to the end of the sound
						document.getElementById("waveform").children[0].children[1].style.borderRight = "none"; // this will remove the right border that serves as the audio cursor
					
						WavesurferInitialized = true;
					});	// on ready	
				}	// if (RetrievedStr.trim() == "")
//console.log("ParseRetrievedQuestionResponseList is calling InitStudentRecordingMarkerArr; ScheduleObjArr.length=" + ScheduleObjArr.length);
				//this calle doesn't work, it is better to make this call after every MakeSchedule call: InitStudentRecordingMarkerArr();
			}	// function ParseRetrievedQuestionResponseList(RetrievedStr)
			
			function PrimeForRecording() {
				/* adjusts top.CurrActionIndex so the next command after clicking Go On is "record" */
				
				CurrActionIndexBeforePriming =  top.CurrActionIndex;	// store it so we can undo this priming if we need to, e.g. when user clicks between clips, thus canceling her intent to record
				var CurrActionsArr = top.SoundBiteObjArr[CurrSoundID].ActionsArr; // e.g. [undefined × 1, "show text Goldilocks_3.htm", "show directions Watch and understand.", "wait", "show directions Speak while the mic icon is red.", "record 30", "show directions Click Go On.", "wait"]
				// look for the "wait" command that precedes a "record" command
				var WaitIndex = -1;
				var RecordIndex = -1;
				for (var i=1; i<CurrActionsArr.length; i++) {	// the Actions array always has the 0 element unmdefined
					if (CurrActionsArr[i].indexOf("wait") == 0) {
						WaitIndex = i;
					} else { 
						if (CurrActionsArr[i].indexOf("record") == 0) {
							RecordIndex = i;
							if (WaitIndex > 0) {
								top.CurrActionIndex = WaitIndex + 1;	// this will reset the execution stack to just after the "wait" command was executed
								top.Waiting = true;
								top.EnableResumeButton();
								top.ReportActivity("in wavesurfer_goldilocks_type.js, reset CurrActionIndex for a repeat of the recording process");
								break;
							}
						}
					}
				}	// for (var i=1; i<CurrActionsArr; i++)
				if ( (WaitIndex == -1) || (RecordIndex == -1) ) {
					top.ReportActivity("in wavesurfer_goldilocks_type.js, found that there is no wait command before the record command: such scripting does not allow a repeated recording of a SingleDub type");
					return false;
				}
				
				return true;				
			}	// function PrimeForRecording()
	
			function StoreMultiClipData() {
				/* called to start ajax upload of all region data to the sound config table where it will affect the experience of all users of this WAL course;
					this is typically done only when the current user is authorized to author the course--even though she is logged in as a student now;
					for comparison, see function StoreRegions() that uploads clip definitions and stores them as the current student's record in table WALStudentSubmissions;
					 */
				var StringToStore = PrepareStringToStore();
				if (top.IsAuthor) {	// actually this function is called only when the user is an author
					if (StringToStore == "") {	// author is saving no definitions--all clips have been cleared
						alert("Clicking Save with no clips defined will enable all students to save their own clip definitions.");
					} else {
						var OK = confirm("If any students using this WAL course (in any class, any school) saved their own clips, yours will override (archive) theirs. Click Cancel to prevent that. \n\nArchived students' clips can be restored later by clearing your clips and clicking Save.\n\nIf you are not the only author, your clips will permanently override any other author's definitions.");
						if (! OK) {
							alert("You canceled the Save command.");	
							return false;
						}
					}
				} 

				// we'll store StringToStore even if it is blank: that is the way for the user to clear all clips defined and saved previously
				StartMultiClipDataUpload(StringToStore);	// when completed, displays a message in nav bar
				
				return true;
			}
			
			function StoreRegions() {
				/* called to start ajax upload of all region data to user's account for current teacher sound;
					for comparison, see function StoreMultiClipData() that uploads clip definitions and stores them
					as part of the sound config table to affect every student's experience;
				 */
				var StringToStore = PrepareStringToStore();
				if ( (! top.IsAuthor) && (StringToStore == "") ) {	// student is saving no definitions--all clips have been cleared
					var OK = confirm("Clicking Save with no clips defined will purge any clips you may have saved before.");
					if (! OK) {
						alert("You canceled the Save command.");	
						return false;	
					}
				}

				// we'll store StringToStore even if it is blank: that is the way for the user to reset all clips
				StartResponseListUpload(StringToStore);	// when completed, displays a message in nav bar
			}	// function StoreRegions()
			
			function RemoveAdded() {
				/* loads a cfm file to remove the current page, i.e. delete its files from the server and its record from WALSoundBiteConfig  */	
				var Load = confirm("Remove this page that you added to the exercise?");
				if (! Load) {
					return false;
				}
				
				var HTMLFileToRemove = window.location.pathname.split("/")[window.location.pathname.split("/").length - 1];	// this file is in the exercise subfolder of the "texts" tree
				var SoundBiteFileToRemove = CurrSoundfile;	// this file is in the exercise subfolder of the "media" tree
				
				if (TextURL != "undefined") {
					if (TextURL.indexOf("http") == 0) {	// media is on the Web, nothing to remove
						var TextURLFileToRemove = "";
					} else {
						var TextURLFileToRemove = TextURL;	// this file is in the exercise subfolder of the "texts" tree
					}
				} else {
					alert("Error while preparing to remove the page: text file's name is unknown. The page cannot be removed. Sorry.");	
					return false;
				}
				
				if (AudioURL != "undefined") {
					if (AudioURL.indexOf("http") == 0) {	// media is on the Web, nothing to remove
						var AudioFileToRemove = "";
					} else {
						var AudioFileToRemove = AudioURL;	// this file is in the exercise subfolder of the "media" tree
					}
				} else {
					alert("Error while preparing to remove the page: sound file's name is unknown. The page cannot be removed. Sorry.");	
					return false;
				}

				if (ImageURL != "undefined") {
					if (ImageURL.indexOf("http") == 0) {	// media is on the Web, nothing to remove
						var ImageFileToRemove = "";
					} else {
						var ImageFileToRemove = ImageURL;	// this file is in the exercise subfolder of the "media" tree
					}
				} else {
					alert("Error while preparing to remove the page: image file's name is unknown. The page cannot be removed. Sorry.");	
					return false;
				}
				
				if (CurrSoundRecNum != "undefined") {
					var RecNumToRemove = CurrSoundRecNum;
				} else {
					alert("Error while preparing to remove the page: record number for the sound is unknown. The page cannot be removed. Sorry.");
					return false;
				}
				
				/* debugging block:
					top.console.log(HTMLFileToRemove);
					top.console.log(SoundBiteFileToRemove);
					top.console.log(TextURLFileToRemove);
					top.console.log(AudioFileToRemove);
					top.console.log(ImageFileToRemove);
					top.console.log(RecNumToRemove);
					//return false;
					*/

				window.location.assign("../../../../cfm/remove_added_page.cfm?UID=" + UserID + "&RR=" + RecNumToRemove + "&HR=" + HTMLFileToRemove + "&TR=" + TextURLFileToRemove + "&AR=" + AudioFileToRemove + "&IR=" + ImageFileToRemove);
				return true;
			}	// function RemoveAdded()
			
			function AddSimilar() {
				/* loads a form for adding a similar page to the current exercise */
				var Load = confirm("Add a page to this exercise that is identical in structure but has sound, text, and image to be chosen by you?");
				if (! Load) {
					return false;
				}

				if (top.ConfirmOnBeforeUnload) {
					Load = confirm("It appears that you have not saved some changes you made. Proceed anyway?");
					if (! Load) {
						return false;
					}
				}
				
				var CurrHTMLFile = window.location.pathname.split("/")[window.location.pathname.split("/").length - 1];
				// add_similar.cfm requires that this filename be in the format XXXXX_NN.htrm" where NN is a two-digit number (smaller than 99, or else no more pages can be added)
				if (CurrHTMLFile.split(".")[CurrHTMLFile.split(".").length - 1] != "htm") {
					alert("Error: This page's filename is not in the format required for adding similar pages (it must end in '.htm').");
					return false;
				}
				
				if (CurrHTMLFile.indexOf("_") < 1) {
					alert("Error: This page's filename (" + CurrHTMLFile + ") is not in the format required for adding similar pages (it must end in an underscore followed by two digits).");
					return false;
				}
				
				if (CurrHTMLFile.substr(CurrHTMLFile.length - 7, 1) != "_") {
					alert("Error: This page's filename (" + CurrHTMLFile + ") is not in the format required for adding similar pages (it must end in an underscore followed by two digits).");
					return false;
				}
				
				var TwoDigitIndex = CurrHTMLFile.substr(CurrHTMLFile.length - 6, 2);				
				if ( isNaN(TwoDigitIndex.substr(0, 1)) || isNaN(TwoDigitIndex.substr(1, 1)) ) {
					alert("Error: This page's filename is not in the format required for adding similar pages (it must end in a two-digit number).");
					return false;
				}

				window.location.assign("../../../../cfm/add_similar.cfm?UID=" + UserID + "&CF=" + CourseFolder + "&LF=" + LessonFolder + "&EF=" + ExerciseFolder + "&SF=" + CurrSoundfile);
				return true;
			}	// function AddSimilar()
		
			function SaveCurrentAudioTime() {
			/* saves current time to local storage */
				if (typeof(wavesurfer) == "object") {	// this object is initialized when this page is loaded, and event listeners are assigned to it
					if (document.getElementById("save_current_time") ) {
						localStorage.WALAudioDuration = wavesurfer.getDuration();
						if (document.getElementById("save_current_time").checked) {
							localStorage.WALAudioCurrTime = 1*wavesurfer.getCurrentTime().toFixed(2);
						} else {
							localStorage.WALAudioCurrTime = 0;
						}
					}
				}
				return true;
			}	// function SaveCurrentAudioTime()
	
			function RestoreCurrentAudioTime() {
			/* cues video to the time point that was stored for it when leaving the previous page */
				if (typeof(wavesurfer) == "object") {	// this object is initialized when this page is loaded, and event listeners are assigned to it
					if ( localStorage.WALAudioDuration && localStorage.WALAudioCurrTime) {	// Duration is in seconds; curr time is a real, 0 to 1, progress into the sound
						if (localStorage.WALAudioDuration == wavesurfer.getDuration() ) {
							if (wavesurfer.getDuration() ) {
								var Duration =  wavesurfer.getDuration();
								if (Duration > 0) {
									var Progress	= localStorage.WALAudioCurrTime / Duration;
									if ( (Progress >= 0) && (Progress <= 1) ) {
										wavesurfer.seekTo(Progress);
									}
								}
							}
						}
					}
				}
			
			return true;
		}	// function RestoreCurrentAudioTime()

		function InitStudentRecordingMarkerArr() {
			/* init 	StudentRecordingMarkerObjArr array of objects, each describing a portion of the student's recording
				that corresponds to a video clip, and each having these properties: start, end (in seconds) and others;
				the number of elements must match the elements in video clip definitions ScheduleObjArr;
				the actual values (start, end, videoStart, videoEnd, etc.) will be assigned elsewhere; */

			//CurrTimingMarkerList = ""; 	// destroy the values that may have been retrieved for StudentRecordingMarkerObjArr from the db: they are no longer relevant
//console.log("in InitStudentRecordingMarkerArr, CurrTimingMarkerList:");
//console.log(CurrTimingMarkerList);
//console.log("ScheduleObjArr:");
//console.log(ScheduleObjArr);

console.log("at start of InitStudentRecordingMarkerArr, ScheduleObjArr:");
console.log(ScheduleObjArr);
console.log("StudentRecordingMarkerObjArr:")
console.log(StudentRecordingMarkerObjArr);				
console.log("CurrTimingMarkerList=" + CurrTimingMarkerList);
			if (typeof(VisualLatencyPaddingSec) == "undefined") {	// normally defined in the enclosing file
				VisualLatencyPaddingSec = 0;	// used when recording and playing back the student's voice in some of the dubbing exercises
			}
			
			if (StudentRecordingMarkerObjArr && ScheduleObjArr) {	// a blank StudentRecordingMarkerObjArr is created at the top of this file, but it may have been initialized to a retrieved value, so we'll reset it now
				StudentRecordingMarkerObjArr = [];
				// init StudentRecordingMarkerObjArr to the values retrieved from the student submissions db table, if any
				if ( (CurrTimingMarkerList != "") && (CurrTimingMarkerList != "[]") ) {	// CurrTimingMarkerList (a string) was retrieved from the poreviously submitted student recording; it format is, e.g., 
																																				// [{"paddingSec":0,"start":0,"end":0,"videoStart":0,"videoEnd":0},{"paddingSec":0,"start":0,"end":4.90503423216676,"videoStart":27.336740704313854,"videoEnd":30.697479441575826}]
					try {
						StudentRecordingMarkerObjArr = JSON.parse(CurrTimingMarkerList);
						// the two arrays StudentRecordingMarkerObjArr (data for existing student recordings) and ScheduleObjArr (clip definitions) may be different length, so:
						if (ScheduleObjArr.length != StudentRecordingMarkerObjArr.length) {	// more video clips are currently defined than the number of recordings previously submitted, which means the previously submitteed recordings are invalidated
							top.ReportActivity("in InitStudentRecordingMarkerArr, a mismatch was found between currently defined video clips and previously submitted recordings, so the data for latter was discarded (but the sound file is playable)");
							// one line added 7/17/17:
							StudentRecordingMarkerObjArr = [];
							for (var i=0; i<ScheduleObjArr.length; i++) {
								StudentRecordingMarkerObjArr[i] = {};
								StudentRecordingMarkerObjArr[i].paddingSec = VisualLatencyPaddingSec;	// in this version, the value is the same in all elements of the array
								StudentRecordingMarkerObjArr[i].start = 0;
								StudentRecordingMarkerObjArr[i].end = 0;
								StudentRecordingMarkerObjArr[i].videoStart = 0;	// the starting time point, in seconds, for the video clip that corresponds to this student recording
								StudentRecordingMarkerObjArr[i].videoEnd = 0;	// the ending time point, in seconds, for the video clip that corresponds to this student recording
							}	
						}	
					}
					catch(e) {
						alert("Invalid student recording markers (" + CurrTimingMarkerList + ") were found in InitStudentRecordingMarkerArr and have been discarded by wavesurfer_goldilocks_type.");
						for (var i=0; i<ScheduleObjArr.length; i++) {
							StudentRecordingMarkerObjArr[i] = {};
							StudentRecordingMarkerObjArr[i].paddingSec = VisualLatencyPaddingSec;	// in this version, the value is the same in all elements of the array
							StudentRecordingMarkerObjArr[i].start = 0;
							StudentRecordingMarkerObjArr[i].end = 0;
							StudentRecordingMarkerObjArr[i].videoStart = 0;	// the starting time point, in seconds, for the video clip that corresponds to this student recording
							StudentRecordingMarkerObjArr[i].videoEnd = 0;	// the ending time point, in seconds, for the video clip that corresponds to this student recording
						}	
					}	// try-catch
				} else {
					for (var i=0; i<ScheduleObjArr.length; i++) {
						StudentRecordingMarkerObjArr[i] = {};
						StudentRecordingMarkerObjArr[i].paddingSec = VisualLatencyPaddingSec;	// in this version, the value is the same in all elements of the array
						StudentRecordingMarkerObjArr[i].start = 0;
						StudentRecordingMarkerObjArr[i].end = 0;
						StudentRecordingMarkerObjArr[i].videoStart = 0;	// the starting time point, in seconds, for the video clip that corresponds to this student recording
						StudentRecordingMarkerObjArr[i].videoEnd = 0;	// the ending time point, in seconds, for the video clip that corresponds to this student recording
					}	
				}	// if (CurrTimingMarkerList != "")

//console.log("at end of InitStudentRecordingMarkerArr, StudentRecordingMarkerObjArr:");
//console.log(StudentRecordingMarkerObjArr);
	
/*
				for (var i=0; i<ScheduleObjArr.length; i++) {
console.log("in InitStudentRecordingMarkerArr:");
console.log("i=" + i);
console.log("CurrTimingMarkerList.length=" + CurrTimingMarkerList.length);
					if ( i < CurrTimingMarkerList.length) {
						StudentRecordingMarkerObjArr[i] = {};
						StudentRecordingMarkerObjArr[i].paddingSec = CurrTimingMarkerList[i].paddingSec;	// in this version, the value is actually the same in all elements of the array, and it is 0 so can be ignored anyway
						StudentRecordingMarkerObjArr[i].start = CurrTimingMarkerList[i].start;
						StudentRecordingMarkerObjArr[i].end = CurrTimingMarkerList[i].end;
						StudentRecordingMarkerObjArr[i].videoStart = CurrTimingMarkerList[i].videoStart;	// the starting time point, in seconds, for the video clip that corresponds to this student recording
						StudentRecordingMarkerObjArr[i].videoEnd = CurrTimingMarkerList[i].videoEnd;	// the ending time point, in seconds, for the video clip that corresponds to this student recording
console.log("set StudentRecordingMarkerObjArr[i].videoEnd to " + StudentRecordingMarkerObjArr[i].videoEnd);
					} else {
						StudentRecordingMarkerObjArr[i] = {};
						StudentRecordingMarkerObjArr[i].paddingSec = VisualLatencyPaddingSec;	// in this version, the value is the same in all elements of the array
						StudentRecordingMarkerObjArr[i].start = 0;
						StudentRecordingMarkerObjArr[i].end = 0;
						StudentRecordingMarkerObjArr[i].videoStart = 0;	// the starting time point, in seconds, for the video clip that corresponds to this student recording
						StudentRecordingMarkerObjArr[i].videoEnd = 0;	// the ending time point, in seconds, for the video clip that corresponds to this student recording
					}
				}
*/
				// init StudentRecordingMarkerObjArr to default values to match the currently defined video clips, ScheduleObjArr
/*
				for (var i=0; i<ScheduleObjArr.length; i++) {
					StudentRecordingMarkerObjArr[i] = {};
					StudentRecordingMarkerObjArr[i].paddingSec = VisualLatencyPaddingSec;	// in this version, the value is the same in all elements of the array
					StudentRecordingMarkerObjArr[i].start = 0;
					StudentRecordingMarkerObjArr[i].end = 0;
					StudentRecordingMarkerObjArr[i].videoStart = 0;	// the starting time point, in seconds, for the video clip that corresponds to this student recording
					StudentRecordingMarkerObjArr[i].videoEnd = 0;	// the ending time point, in seconds, for the video clip that corresponds to this student recording
				}
*/
			}	// if (StudentRecordingMarkerObjArr && ScheduleObjArr)
console.log("at end of InitStudentRecordingMarkerArr, ScheduleObjArr:");
console.log(ScheduleObjArr);
console.log("StudentRecordingMarkerObjArr:")
console.log(StudentRecordingMarkerObjArr);				
		}	// function InitStudentRecordingMarkerArr()

		function ResetStudentRecordingMarkerArr() {
			/* init 	StudentRecordingMarkerObjArr array of objects, each describing to a portion of the student's recording
				that corresponds to a video clip, and each having these properties: start, end (in seconds);
				the actual values will be assigned in video_external.js; */
console.log("starting ResetStudentRecordingMarkerArr");
			if (typeof(VisualLatencyPaddingSec) == "undefined") {	// normally defined in the enclosing file
				VisualLatencyPaddingSec = 0;	// used when recording and playing back the student's voice in some of the dubbing exercises
			}
			
			if (StudentRecordingMarkerObjArr && ScheduleObjArr) {	// a blank StudentRecordingMarkerObjArr is created at the top of this file, but it may have been initialized to a retrieved value, so we'll reset it now
				StudentRecordingMarkerObjArr = [];
				// init StudentRecordingMarkerObjArr to default values to match the currently defined video clips, ScheduleObjArr
				for (var i=0; i<ScheduleObjArr.length; i++) {
					StudentRecordingMarkerObjArr[i] = {};
					StudentRecordingMarkerObjArr[i].paddingSec = VisualLatencyPaddingSec;	// in this version, the value is the same in all elements of the array
					StudentRecordingMarkerObjArr[i].start = 0;
					StudentRecordingMarkerObjArr[i].end = 0;
					StudentRecordingMarkerObjArr[i].videoStart = 0;	// the starting time point, in seconds, for the video clip that corresponds to this student recording
					StudentRecordingMarkerObjArr[i].videoEnd = 0;	// the ending time point, in seconds, for the video clip that corresponds to this student recording
				}
			}	// if (StudentRecordingMarkerObjArr && ScheduleObjArr)
console.log("at end of ResetStudentRecordingMarkerArr,  StudentRecordingMarkerObjArr is:");
console.log(StudentRecordingMarkerObjArr);

		}	// function ResetStudentRecordingMarkerArr()

		function MakeSchedule() {
			/* sets array RegionIDArr of objects, where each object holds the start, end, and id values of one region (clip) in wavesurfer;
				is called and resets the vallues each time a clip is defined or modified */

			ScheduleObjArr = [];
			if (! wavesurfer) {
				return true;
			}

			var RegionIDArr = Object.keys(wavesurfer.regions.list); // an array of ids of all regions					

			if (RegionIDArr.length == 0) {
				ScheduleObjArr = [];
			} else {
				for (var i=0; i<RegionIDArr.length; i++) {	// why not 
					CurrRegion = wavesurfer.regions.list[RegionIDArr[i]];
					ScheduleObjArr[i] = {};
					ScheduleObjArr[i].start = 1*CurrRegion.start.toFixed(2);
					ScheduleObjArr[i].end = 1*CurrRegion.end.toFixed(2);
					ScheduleObjArr[i].id = CurrRegion.id;
				}
			}
			
			//sort the array on the value of the start property in each element
			ScheduleObjArr.sort(function(a, b) {alc=a.start; blc=b.start; return alc > blc ? 1 : alc < blc ? -1 : a.start > b.start ? 1 : a.start < b.start ? -1 : 0;})
			if ( (CurrTimingMarkerList == "") && ((CurrTimingMarkerList == "[]")) ) {	// if CurrTimingMarkerList is non-blank, some values for StudentRecordingMarkerArr were retrieved from the db, and we don't want to override them
console.log("called ResetStudentRecordingMarkerArr from MakeSchedule");
				ResetStudentRecordingMarkerArr();	// StudentRecordingMarkerObjArr must be recreated each time there is a change in ScheduleObjArr
			}
console.log("at end of MakeSchedule, ScheduleObjArr.length=" + ScheduleObjArr.length + " and CurrTimingMarkerList=" + CurrTimingMarkerList);
			return true;
		}	// function MakeSchedule()

		function waveformClicked(e) {
			/* if regions (clips) are defined, this function is called only when user clicks outside any clip */
			if ( (top.Mode == "Recording") && top.isRecording() ) { 
				return false;	
			}

			top.EnableStopButton();
			// at what time point did the click land?						
			if (document.getElementById("clipsOnly") && wavesurfer.regions.list) {
				if ( (document.getElementById("clipsOnly").checked) && (Object.keys(wavesurfer.regions.list).length == 0) ) {
					alert("No clips are defined. Drag over the waveform to define a clip or uncheck the play-all-clips box.");
					return false;
				} else {
					if (document.getElementById("clipsOnly").checked) {
						CheckVideoClipIntervals();	// will display a warning if any two clips are too close together	
					}					
				}
				ResetRegionColor();
			
				top.LastClickedRegion = null;	// this cancels the possible selection of the clip for the next recording; visually, this is reflected in the pink hiliting being removed
				if (CurrActionIndexBeforePriming != -1) {	// this means that PrimeForRecording() has been called at least once, and this CurrActionIndexBeforePriming holds the value of top.CurrActionIndex as it was before the call to PrimeForRecording
					top.CurrActionIndex = CurrActionIndexBeforePriming;
				}
				
				var waveformObj = document.getElementById("waveform");
				var clickedLeft = e.clientX - waveformObj.offsetParent.offsetLeft - waveformObj.offsetLeft;
				var ClickedProgress = (clickedLeft + document.querySelector("#waveform wave").scrollLeft) / document.querySelector("#waveform wave canvas").width; // from 0 to 1
				var ClickedTimepoint = 1 * (wavesurfer.getDuration() * ClickedProgress).toFixed(2); // seconds

				// ClickedTimepoint value does not depend on timing and on whether the playback is started or paused on click
				//this call is not used when the waveform acts as the video control: wavesurfer.playPause();
				if (CurrVideoObj.paused) {
					CueVideo(ClickedTimepoint);
				} else {
					CurrVideoObj.pause();
				}
			} else {
				alert("Error in waveformClicked: elements missing in the page.");
					return false;					
			}

			return true;					
		}	// function waveformClicked(e)

		function GetRecordableClipIndex() {
			/* returns index (1-based, left to right) of the clip that has been clicked and has a pink background; if none returns -1 */
			var RegionIDArr = Object.keys(wavesurfer.regions.list); // an array of ids of all regions					
			for (var i=0; i<RegionIDArr.length; i++) {
				CurrRegion = wavesurfer.regions.list[RegionIDArr[i]];
				var regionEl = document.querySelector('region[data-id="' + CurrRegion.id + '"]');
				if (regionEl.style.backgroundColor == RegionReadyToRecordColorStr) {
					return RegionIndex(CurrRegion) + 1;
				}
			}
				
			return -1;
		}

		function ResetRegionColor() {
			/* this function may be unused */
			var RegionIDArr = Object.keys(wavesurfer.regions.list); // an array of ids of all regions					
			//console.log(RegionIDArr);	// this displays the array of randomly generated strings for all regions in the form "wavesurfer_1qavjpnnc5g"

			for (var i=0; i<RegionIDArr.length; i++) {
				CurrRegion = wavesurfer.regions.list[RegionIDArr[i]];
				var regionEl = document.querySelector('region[data-id="' + CurrRegion.id + '"]');
				regionEl.style.backgroundColor = RegionColorStr;
			}			

		}	// function ResetRegionColor()		

		function SetRegionColorToRecordable(region) {
			/* this function may be unused */
			//console.log(RegionIDArr);	// this displays the array of randomly generated strings for all regions in the form "wavesurfer_1qavjpnnc5g"
			var regionEl = document.querySelector('region[data-id="' + region.id + '"]');
			regionEl.style.backgroundColor = RegionReadyToRecordColorStr;
		}	// function SetRegionColorToRecordable()	
		
		function RegionIndex(region) {
			/* returns the index (0-based) of region (a wavesurfer object) in the set of all defined regions;
				e.g., 0 is returned if region is the one the lowest value of start */
			var RegionIDArr = Object.keys(wavesurfer.regions.list); // an array of ids of all regions
			var StartValuesArr = [];
			
			if (RegionIDArr.length == 0) {
				return -1;
			} else {
				for (var i=0; i<RegionIDArr.length; i++) {
					CurrRegion = wavesurfer.regions.list[RegionIDArr[i]];
					StartValuesArr.push(CurrRegion.start);
					StartValuesArr.sort( function(a, b) {return a-b} );
				}
				for (var i=0; i<RegionIDArr.length; i++) {
					CurrRegion = wavesurfer.regions.list[RegionIDArr[i]];
					Indx = StartValuesArr.indexOf(region.start);
					return 1*Indx;
				}
			}			
		}	// function RegionIndex(region)

		function GetRecordedMarkerObj(WaveSurferRegion) {
			/* returns a RecordedMarkerObj (an element of RecordedMarkerObjArr)  that corresponds to the
				the sound dub recorded by the student for WaveSurferRegion;
				if none is found, null is returned;
				WaveSurferRegion.end must be greater than 0 */
console.log("in GetRecordedMarkerObj:");
console.log(WaveSurferRegion);
			if (typeof(WaveSurferRegion.end) == "undefined") {
				alert("GetRecordedMarkerObj was called with invalid argument.");
				return null;
			}
			if (WaveSurferRegion.end == 0) {
				alert("GetRecordedMarkerObj was called with zero end value.");
				return null;
			}
			
			var MarkerObjToReturn = null;
			for (var i=0; i<StudentRecordingMarkerObjArr.length; i++) {
				var CurrRecordedMarkerObj = StudentRecordingMarkerObjArr[i];	// has properties like start: 0, end: 3.476, videoStart: 12.92, videoEnd: 15.26 and others
				if (StudentRecordingMarkerObjArr[i].end > 0) {
console.log(i);
console.log(CurrRecordedMarkerObj);
console.log("CurrRecordedMarkerObj.start=" + CurrRecordedMarkerObj.start.toFixed(2));
console.log("CurrRecordedMarkerObj.end=" + CurrRecordedMarkerObj.end.toFixed(2));
console.log("CurrRecordedMarkerObj.videoStart=" + CurrRecordedMarkerObj.videoStart.toFixed(2));
console.log("CurrRecordedMarkerObj.videoEnd=" + CurrRecordedMarkerObj.videoEnd.toFixed(2));
console.log("WaveSurferRegion.start=" + WaveSurferRegion.start.toFixed(2));
console.log("WaveSurferRegion.end=" + WaveSurferRegion.end.toFixed(2));

					if ( (1*CurrRecordedMarkerObj.videoStart.toFixed(2) == 1*WaveSurferRegion.start.toFixed(2)) && (1*CurrRecordedMarkerObj.videoEnd.toFixed(2) == 1*WaveSurferRegion.end.toFixed(2)) ) {
						MarkerObjToReturn = CurrRecordedMarkerObj;
					}
				}
			}
			return MarkerObjToReturn;				
		}	// function GetRecordedMarkerObj()

		function GetRecordedRegion() {
			/* returns a region object for the wavesurfer clip that corresponds to the sound dub recorded to the student	;
				if more than one is recorded, the first one that is found in StudentRecordingMarkerObjArr is returned;
				if none is found, null is returned */

			var RegionToReturn = null;
			for (var i=0; i<StudentRecordingMarkerObjArr.length; i++) {
				if (StudentRecordingMarkerObjArr[i].end > 0) {
					var RegionIDArr = Object.keys(wavesurfer.regions.list); // an array of ids of all regions
					if (RegionIDArr.length > 0) {
						for (var j=0; j<RegionIDArr.length; j++) {
							CurrRegion = wavesurfer.regions.list[RegionIDArr[j]];
//console.log("StudentRecordingMarkerObjArr[i].videoEnd=" + StudentRecordingMarkerObjArr[i].videoEnd);
//console.log("CurrRegion.end=" + CurrRegion.end);
//console.log("StudentRecordingMarkerObjArr[i].end=" + StudentRecordingMarkerObjArr[i].end);
							if ( (1*StudentRecordingMarkerObjArr[i].videoEnd.toFixed(2) == 1*CurrRegion.end.toFixed(2)) && (StudentRecordingMarkerObjArr[i].end > 0) ) {
								RegionToReturn = CurrRegion;
							}
						}
					}
				}
			}
			return RegionToReturn;				
		}	// function GetRecordedRegion()
		
		function HighlightRecordedRegion() {
			/*  changes background color of clip with the property "end" equal to VideoEndValue; 
				useful for the exercise with RecordingType "SingleDub"*/
			ResetRegionColor();	// all regions are returned to the initial bg color

			if (StudentRecordingMarkerObjArr.length == 0) {
				return false;
			}
			
			for (var i=0; i<StudentRecordingMarkerObjArr.length; i++) {
				if (StudentRecordingMarkerObjArr[i].videoEnd > 0) {
					var RegionIDArr = Object.keys(wavesurfer.regions.list); // an array of ids of all regions
					if (RegionIDArr.length == 0) {
						return false;
					} else {
						for (var j=0; j<RegionIDArr.length; j++) {
							CurrRegion = wavesurfer.regions.list[RegionIDArr[j]];
console.log("in HighlightRecordedRegion, StudentRecordingMarkerObjArr[i].videoEnd=" + StudentRecordingMarkerObjArr[i].videoEnd + " (" + StudentRecordingMarkerObjArr[i].videoEnd + ")");
console.log("in HighlightRecordedRegion, CurrRegion.end=" + CurrRegion.end);
							if (
									( StudentRecordingMarkerObjArr[i].videoEnd == CurrRegion.end )
									&&
									(StudentRecordingMarkerObjArr[i].end > 0)
								) {
console.log("match");
								var regionEl = document.querySelector('region[data-id="' + CurrRegion.id + '"]');
								regionEl.style.backgroundColor = RegionHiliteColorStr;
								return true;
							}
						}
					}
				}
			}
			
			return false;
		}	// function HighlightRecordedRegion()

		function CheckVideoClipIntervals() {
			/* called when user clisks waveform or clip with the Play All Clips checked in a page where video playback is controlled by waveform;
			 	because with video, the timeupdate event fires with significant granularity (up to 500 ms apart),
				we can't support the pause-between-clips function when the clips are too close together	*/	
			if (top.document.getElementById("html_i_frame")	) {
				if (top.document.getElementById("html_i_frame").contentWindow.document.getElementById("CurrVideoEl") ) {
					var VideoPageWindow = top.document.getElementById('html_i_frame').contentWindow;
					if (VideoPageWindow.ScheduleObjArr) {
						for (var i=0; i<(VideoPageWindow.ScheduleObjArr.length - 1); i++) {
							var CurrEndSec = 1*VideoPageWindow.ScheduleObjArr[i].end.toFixed(2);
							var NextStart = 1*VideoPageWindow.ScheduleObjArr[i+1].start.toFixed(2);
							var IntervalSec = NextStart - CurrEndSec;
							if (IntervalSec < MinVideoClipInterval) {
								alert("The interval between clips " + (i + 1) + " and " + (i + 2) + " is less than " + MinVideoClipInterval + " seconds\n\nUnless your browser is very fast, playback may not be able to pause between these clips.");
								// user may proceed at her own risk
							}
						}
					}					
				}				
			}
		}	// function CheckVideoClipIntervals()

		function AllClipsRecordable() {
			/* called by the action that initiates studenr recording in a page where video playback is controlled by waveform;
			 	because with video, the timeupdate event fires with significant granularity (up to 500 ms apart),
				we can't support recording when a clip length is too small; 
				returns true if such a clip is found */	
			if (top.document.getElementById("html_i_frame")	) {
				if (top.document.getElementById("html_i_frame").contentWindow.document.getElementById("CurrVideoEl") ) {
					var VideoPageWindow = top.document.getElementById('html_i_frame').contentWindow;
					if (VideoPageWindow.ScheduleObjArr) {
						for (var i=0; i<(VideoPageWindow.ScheduleObjArr.length); i++) {
							var CurrEndSec = VideoPageWindow.ScheduleObjArr[i].end;
							var CurrStartSec = VideoPageWindow.ScheduleObjArr[i].start;
							var CurClipDuration = CurrEndSec - CurrStartSec;
							if (CurClipDuration < MinRecordableClipLengthSec) {
								alert("Clip " + (i + 1)  + " is shorter than " + MinRecordableClipLengthSec + " second(s)\n\nUnless your browser is very fast, your dub for this clip may not be recorded.");
								return false;
								// user may proceed at her own risk
							}
						}
					}					
				}				
			}
			
			return true;
		}	// function CheckVideoClipIntervals()		