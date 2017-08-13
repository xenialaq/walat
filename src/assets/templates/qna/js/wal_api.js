/* this should be included in all htm or cfm files in the exercise folders within the "texts" tree that need to use WAL API
	e.g. <script language="JavaScript" src="../../../../js/wa_api.js"></script> */

	var ResponseObjArr = new Array();	// an array of objects that hold various pieces of the ajax (HTTPRequest) process for downloading and uploading student's responses to various questions related to the current sound bite
	var CurrSoundID = AdjustedSoundID(top.CurrTeacherSoundID);

	ResponseObjArr[CurrSoundID] = new Object;
	ResponseObjArr[CurrSoundID].UploadObj = top.getXMLHttpRequestObject();
	ResponseObjArr[CurrSoundID].DownloadObj = top.getXMLHttpRequestObject();
	ResponseObjArr[CurrSoundID].EmailObj = top.getXMLHttpRequestObject();

	ResponseObjArr[CurrSoundID].UploadAbortTimerID = 0;	// to be reset when upload is started
	ResponseObjArr[CurrSoundID].DownloadAbortTimerID = 0;	// to be reset when download is started
	ResponseObjArr[CurrSoundID].EmailAbortTimerID = 0;	// to be reset when email sending is started

	ResponseObjArr[CurrSoundID].UploadInProgress = false;	// to be reset when upload is started
	ResponseObjArr[CurrSoundID].DownloadInProgress = false;	// to be reset when upload is started
	
	var QandAMode = top.QandAMode;	// possible values: "NoneStored" "FirstStored" "LastStored"; this is a general property of the WAL course

	var FName = top.FName;
	var Nickname = top.Nickname;
	var LName = top.LName;
	var UserEmailAddress = top.UserEmailAddress;
	var UserID = top.UserID;
	var Username = top.CurrStudentUName;

	var CurrSoundID = top.CurrTeacherSoundID;
	var CurrSoundfile = top.SoundBiteObjArr[CurrSoundID].SoundFilename;
	var CurrSoundRecNum = top.SoundBiteObjArr[CurrSoundID].RecNum; // RecNum in soundbite config table 

	var CurrTimingMarkerList = top.SoundBiteObjArr[CurrSoundID].TimingMarkerList.trim(); // non-blank in exercises where the student's submiotted recording consists of several distinct parts, e.g. in role-playing/dubbing exercises like Sampler > Goldilocks

//console.log("in wal_api.js, CurrTimingMarkerList=" + CurrTimingMarkerList);
	var CourseFolder = top.SoundBiteObjArr[CurrSoundID].StudentRecordingCourseFolder;
	var LessonFolder = top.SoundBiteObjArr[CurrSoundID].StudentRecordingLessonFolder;
	var ExerciseFolder = top.SoundBiteObjArr[CurrSoundID].StudentRecordingExerciseFolder;

	var AllowStudentToAdd = top.AllowStudentToAdd;	// this exercise allows students to add their own pages
	var AddedInStudentMode = top.SoundBiteObjArr[CurrSoundID].AddedInStudentMode;	// when the page was added by a student, this is true
	var AddedByUsername = top.SoundBiteObjArr[CurrSoundID].AddedByUsername;	// when the page was added by a student, this is her Username, e.g. "LRC-1" otherwise blank

	var TeacherRecordingLengthSec = top.CurrSoundbiteObj.TeacherRecordingLengthSec;

	var RelTeacherRecordingURL = top.SoundBiteObjArr[CurrSoundID].TeacherRecordingPath + CurrSoundfile;	// e.g. ../Sampler/media/API_Demo/demo_1/api_demo_01.mp3
	if (window.location.hostname.indexOf("russlang.as.") > -1) {	// my test server, where WAL is not at the root
		var AbsTeacherRecordingURL = "http://" + window.location.hostname + "/wal/" + CourseFolder + "/media/" + LessonFolder + "/" + ExerciseFolder + "/" + CurrSoundfile // e.g.  http://wal.lrc.cornell.edu/Sampler/media/API_Demo/demo_1/api_demo_01.mp3
	} else {
		var AbsTeacherRecordingURL = "http://" + window.location.hostname + "/" + CourseFolder + "/media/" + LessonFolder + "/" + ExerciseFolder + "/" + CurrSoundfile // e.g.  http://wal.lrc.cornell.edu/Sampler/media/API_Demo/demo_1/api_demo_01.mp3
	}
	if (window.location.protocol == "https:") {
		if (AbsTeacherRecordingURL.indexOf("http://") == 0) {
			AbsTeacherRecordingURL = AbsTeacherRecordingURL.replace("http://", "https://");
		}
	} else {
		if (AbsTeacherRecordingURL.indexOf("http://") == 0) {
			AbsTeacherRecordingURL = AbsTeacherRecordingURL.replace("https://", "http://");
		}
	}

	var RelStudentRecordingURL = "../" + CourseFolder + "_learners/" + Username + "/" + UserID + "/" + LessonFolder + "/" + ExerciseFolder +"/" + CurrSoundfile;	// e.g. ../Sampler_learner/LRC-1/2690/API_Demo/demo_1/api_demo_01.mp3
	if (window.location.hostname.indexOf("russlang.as.") > -1) {	// my test server, where WAL is not at the root
		var AbsStudentRecordingURL = "http://" + window.location.hostname + "/wal/" + CourseFolder + "_learners/" + Username + "/" + UserID + "/" + LessonFolder + "/" + ExerciseFolder +"/" + CurrSoundfile;	// e.g. http://wal.lrc.cornell.edu/Sampler_learner/LRC-1/2690/API_Demo/demo_1/api_demo_01.mp3
	} else {
		var AbsStudentRecordingURL = "http://" + window.location.hostname + "/" + CourseFolder + "_learners/" + Username + "/" + UserID + "/" + LessonFolder + "/" + ExerciseFolder +"/" + CurrSoundfile;	// e.g. http://wal.lrc.cornell.edu/Sampler_learner/LRC-1/2690/API_Demo/demo_1/api_demo_01.mp3
	}
	if (window.location.protocol == "https:") {
		if (AbsStudentRecordingURL.indexOf("http://") == 0) {
			AbsStudentRecordingURL = AbsStudentRecordingURL.replace("http://", "https://");
		}
	} else {
		if (AbsStudentRecordingURL.indexOf("https://") == 0) {
			AbsStudentRecordingURL = AbsStudentRecordingURL.replace("https://", "http://");
		}
	}

	var CurrActionsArray = top.CurrSoundbiteObj.ActionsArr;
	
	if (top.document.getElementById('Directions')) {
		var DirectionsBoxObj = top.document.getElementById('Directions');
	} else {
		var DirectionsBoxObj = null;
	}

	function AdjustedSoundID(SoundID) {
		/* if the actions of sound SoundID include the "record nextQuestion"
			this function returns SoundID+1, othere wise it returns SoundID;
			this is useful, for example, when we need to determine the sound filename
			under which the current response from the student should be stored
			on the server: the same as the current SoundFilename or the same
			as the next one */

		if (top.SoundBiteObjArr[SoundID].RecordNext) {
			var AdjustedSoundID = (1 * SoundID + 1); // the * will convert it to a number
		} else {
			var AdjustedSoundID = 1 * SoundID; // the * will convert it to a number
		}
		
		return AdjustedSoundID
	}	// function AdjustedSoundID(SoundID)
	
/* this is now done in upload_functions.js:	
	function AbortRecordingMarkersUpload() {
		/* aborts ajax call with the ID of RecordingMarkersUploadTimerID 

		clearTimeout(RecordingMarkersUploadTimerID);
		RecordingMarkersUploadTimerID = -1;
		
		try {
			if (RecordingMarkersUploadObj) {
				RecordingMarkersUploadObj.abort();
				
				top.ReportActivity("in AbortRecordingMarkersUpload, asynchronous upload aborted: timeout or error");
			}
		//ResponseObjArr[CurrSoundID].UploadInProgress = false;
		}
		catch (e) {
			top.ReportActivity("AbortRecordingMarkersUpload failed");
		}
	}	// function AbortRecordingMarkersUpload()
*/	
	
	function AbortMultiDataClipUpload(SoundID) {
		/* aborts ajax call with the ID of ResponseObjArr[SoundID].UploadAbortTimerID */

		clearTimeout(ResponseObjArr[SoundID].UploadAbortTimerID);
		ResponseObjArr[SoundID].UploadAbortTimerID = 0;
		
		try {
			if (ResponseObjArr[SoundID].UploadObj) {
				ResponseObjArr[SoundID].UploadObj.abort();
				//ResponseObjArr[SoundID].UploadObj = null;
				
				top.ReportActivity("asynchronous upload aborted for sound " + SoundID + ": timeout or error");
			}
		ResponseObjArr[CurrSoundID].UploadInProgress = false;
		}
		catch (e) {
			top.ReportActivity("AbortMultiDataClipUpload for sound " + SoundID + " failed (because SoundID is unknown--IE limitation?)");
		}
	}	// function AbortMultiDataClipUpload(SoundID)
	
	function AbortResponseListUpload(SoundID) {
		/* aborts ajax call with the ID of ResponseObjArr[SoundID].UploadAbortTimerID */

		clearTimeout(ResponseObjArr[SoundID].UploadAbortTimerID);
		ResponseObjArr[SoundID].UploadAbortTimerID = 0;
		
		try {
			if (ResponseObjArr[SoundID].UploadObj) {
				ResponseObjArr[SoundID].UploadObj.abort();
				//ResponseObjArr[SoundID].UploadObj = null;
				
				top.ReportActivity("asynchronous upload aborted for sound " + SoundID + ": timeout or error");
			}
		ResponseObjArr[CurrSoundID].UploadInProgress = false;
		}
		catch (e) {
			top.ReportActivity("AbortResponseListUpload for sound " + SoundID + " failed (because SoundID is unknown--IE limitation?)");
		}
	}	// function AbortResponseListUpload(SoundID)
	
	function AbortResponseListDownload(SoundID) {
		/* aborts ajax call with the ID of ResponseObjArr[SoundID].DownloadAbortTimerID */

		clearTimeout(ResponseObjArr[SoundID].DownloadAbortTimerID);
		ResponseObjArr[SoundID].DownloadAbortTimerID = 0;
		
		try {
			if (ResponseObjArr[SoundID].DownloadObj) {
				ResponseObjArr[SoundID].DownploadObj.abort();
				//ResponseObjArr[SoundID].DownloadObj = null;
				
				top.ReportActivity("asynchronous download aborted for sound " + SoundID + ": timeout or error");
			}
		ResponseObjArr[CurrSoundID].DownloadInProgress = false;
		}
		catch (e) {
			top.ReportActivity("AbortResponseListDownload for sound " + SoundID + " failed (because SoundID is unknown--IE limitation?)");
		}
	}	// function AbortResponseListDownload(SoundID)
		
	function AbortClassListDownload(SoundID) {
		/* aborts ajax call with the ID of ResponseObjArr[SoundID].DownloadAbortTimerID */

		clearTimeout(ResponseObjArr[SoundID].DownloadAbortTimerID);
		ResponseObjArr[SoundID].DownloadAbortTimerID = 0;
		
		try {
			if (ResponseObjArr[SoundID].DownloadObj) {
				ResponseObjArr[SoundID].DownploadObj.abort();
				//ResponseObjArr[SoundID].DownloadObj = null;
				
				top.ReportActivity("asynchronous class list download aborted for sound " + SoundID + ": timeout or error");
			}
		ResponseObjArr[CurrSoundID].DownloadInProgress = false;
		}
		catch (e) {
			top.ReportActivity("AbortResponseListDownload for sound " + SoundID + " failed (because SoundID is unknown--IE limitation?)");
		}
	}	// function AbortClassListDownload(SoundID)
	
	function StartEmailUpload(EmailText, SendMode) {
		/* does the prep work and initiates ajax process for sending an email message;
			SendMode can be "SendToAll" or "SendToList";
		 */	
		
		if (ResponseObjArr[CurrSoundID].EmailObj == null) {
			alert("Error in StartEmailUpload: email request object could not be created. This feature cannot be used.");
			return false;
		}

		var UploadData = SetUpEmailData(EmailText, SendMode); // returns null if error
		if (UploadData === null) {
			alert("Error in StartEmailUpload: data could not be prepared. This feature cannot be used.");
			return false;
		}
		
		if ((UploadData != null) && (ResponseObjArr[SoundID].EmailObj) ){
			top.ReportActivity("HTTP Request object created");
			ResponseObjArr[SoundID].EmailObj.onreadystatechange = function() {HandleEmailResults(SoundID)};
			ResponseObjArr[SoundID].EmailObj.open("POST", "send_email_to_classmates.cfm?UID=" + UserID);
			top.ReportActivity("HTTP Request channel opened");

			if (typeof FormData != "function") { // browser does not support FormData
				// for browsers that don't support FormData, the setRequestHeader() needs to be sent, and the data needs to be URL encoded
				ResponseObjArr[SoundID].EmailObj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			}

			// set a timer for aborting the attempt	
			ResponseObjArr[SoundID].EmailAbortTimerID = window.setTimeout("AbortEmail", top.AbortIntervalMS, SoundID); 
			ResponseObjArr[SoundID].EmailObj.send(UploadData); 			
			ResponseObjArr[CurrSoundID].EmailInProgress = true;

			top.ReportActivity("asynchronous email request sent for adjusted sound ID " + SoundID);
		}		
	
		return true;
	}	// function StartEmailUpload(EmailText)
	
	function StartMultiClipDataUpload(MultiClipDataStr) {
		/* does the prep work and initiates ajax upload process for the MultiClipDataStr string */
		SoundID = AdjustedSoundID(top.CurrTeacherSoundID);
		if (ResponseObjArr[SoundID].UploadObj == null) {
			alert("Error in StartMultiClipDataUpload: upload request object could not be created. This feature cannot be used.");
			return false;
		}
//console.log("in StartMultiClipDataUpload, MultiClipDataStr=" + MultiClipDataStr);
		var UploadData = SetUpMultiClipUploadData(MultiClipDataStr); // returns null if error
		if (UploadData === null) {
			alert("Error in StartMultiClipDataUpload: upload data could not be prepared. This feature cannot be used.");
			return false;
		}
//console.log("in StartMultiClipDataUpload, UploadData=" + UploadData);
		
		if ((UploadData != null) && (ResponseObjArr[SoundID].UploadObj) ){
			top.ReportActivity("HTTP Request object created in StartMultiClipDataUpload");
			ResponseObjArr[SoundID].UploadObj.onreadystatechange = function() {HandleMultiClipDataUploadResults(SoundID)};
			ResponseObjArr[SoundID].UploadObj.open("POST", "upload_store_multi_clip_data.cfm?UID=" + UserID);
			top.ReportActivity("HTTP Request channel opened in StartMultiClipDataUpload");
			
			top.SoundBiteObjArr[SoundID].MultiClipData = MultiClipDataStr;

			if (typeof FormData != "function") { // browser does not support FormData
				// for browsers that don't support FormData, the setRequestHeader() needs to be sent, and the data needs to be URL encoded
				ResponseObjArr[SoundID].UploadObj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			}

			// set a timer for aborting the upload	
			ResponseObjArr[SoundID].UploadAbortTimerID = window.setTimeout("AbortMultiClipDataUpload", top.AbortIntervalMS, SoundID); 
			ResponseObjArr[SoundID].UploadObj.send(UploadData); 			
			ResponseObjArr[CurrSoundID].UploadInProgress = true;

			top.ReportActivity("in StartMultiClipDataUpload, asynchronous upload request sent for adjusted sound ID " + SoundID);
		}
	
		return true;
	}	// function StartMultiClipDataUpload(MultiClipDataStr)
	
	function StartResponseListUpload(QuestionResponseList) {
		/* does the prep work and initiates ajax upload process for the QuestionResponseList string */	
		SoundID = AdjustedSoundID(top.CurrTeacherSoundID);
		if (ResponseObjArr[SoundID].UploadObj == null) {
			alert("Error in StartResponseListUpload: upload request object could not be created. This feature cannot be used.");
			return false;
		}

		var UploadData = SetUpQuestionResponseUploadData(QuestionResponseList); // returns null if error
		if (UploadData === null) {
			alert("Error in StartResponseListUpload: upload data could not be prepared. This feature cannot be used.");
			return false;
		}

		
		if ((UploadData != null) && (ResponseObjArr[SoundID].UploadObj) ){
			top.ReportActivity("HTTP Request object created in StartResponseListUpload");
			ResponseObjArr[SoundID].UploadObj.onreadystatechange = function() {HandleQuestionResponseUploadResults(SoundID)};
			ResponseObjArr[SoundID].UploadObj.open("POST", "upload_store_question_responses.cfm?UID=" + UserID);
			top.ReportActivity("HTTP Request channel opened in StartResponseListUpload");

			if (typeof FormData != "function") { // browser does not support FormData
				// for browsers that don't support FormData, the setRequestHeader() needs to be sent, and the data needs to be URL encoded
				ResponseObjArr[SoundID].UploadObj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			}

			// set a timer for aborting the upload	
			ResponseObjArr[SoundID].UploadAbortTimerID = window.setTimeout("AbortResponseListUpload()", top.AbortIntervalMS, SoundID);
			ResponseObjArr[SoundID].UploadObj.send(UploadData); 			
			ResponseObjArr[CurrSoundID].UploadInProgress = true;

			top.ReportActivity("in StartResponseListUpload, asynchronous upload request sent for adjusted sound ID " + SoundID);
		}
	
		return true;
	}	// function StartResponseListUpload(QuestionResponseList)
	
	function StartResponseListDownload() {
		/* does the prep work and initiates ajax download process for the QuestionResponseList string;
			HandleQuestionResponseDownloadResults() is called when the ajax call completes */
		SoundID = AdjustedSoundID(top.CurrTeacherSoundID);
		if (ResponseObjArr[SoundID].DownloadObj == null) {
			alert("Error in StartResponseListDownload: download request object could not be created. This page cannot be used.");
			return false;
		}

		var DownloadData = SetUpQuestionResponseDownloadData(); // returns null if error
		if (DownloadData === null) {
			alert("Error in StartResponseListDownload: download data could not be prepared. This page cannot be used.");
			return false;
		}
		
		top.ShowLoadingFlag();
		if ((DownloadData != null) && (ResponseObjArr[SoundID].DownloadObj) ){
			top.ReportActivity("HTTP Request object created");
			ResponseObjArr[SoundID].DownloadObj.onreadystatechange = function() {HandleQuestionResponseDownloadResults(SoundID)};
			ResponseObjArr[SoundID].DownloadObj.open("POST", "get_question_responses.cfm?UID=" + UserID);
			top.ReportActivity("HTTP Request channel opened");

			if (typeof FormData != "function") { // browser does not support FormData
				// for browsers that don't support FormData, the setRequestHeader() needs to be sent, and the data needs to be URL encoded
				ResponseObjArr[SoundID].DownloadObj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			}

			// set a timer for aborting the Download	
			ResponseObjArr[SoundID].DownloadAbortTimerID = window.setTimeout("AbortResponseListDownload()", top.AbortIntervalMS, SoundID); 
			ResponseObjArr[SoundID].DownloadObj.send(DownloadData); 			
			ResponseObjArr[CurrSoundID].DownloadInProgress = true;

			top.ReportActivity("asynchronous Download request sent for adjusted sound ID " + SoundID);
		}		
	
		return true;
	}	// function StartResponseListDownload(QuestionResponseList)
	
	function StartClassListDownload() {
		/* does the prep work and initiates ajax download process for the ClassList string */
		SoundID = AdjustedSoundID(top.CurrTeacherSoundID);
		if (ResponseObjArr[SoundID].DownloadObj == null) {
			alert("Error in StartClassListDownload: download request object could not be created. This feature cannot be used.");
			return false;
		}

		var DownloadData = SetUpClassListDownloadData(); // returns null if error
		if (DownloadData === null) {
			alert("Error in StartClassListDownload: download data could not be prepared. This feature cannot be used.");
			return false;
		}
		
		top.ShowLoadingFlag();
		if ((DownloadData != null) && (ResponseObjArr[SoundID].DownloadObj) ){
			top.ReportActivity("HTTP Request object created");
			ResponseObjArr[SoundID].DownloadObj.onreadystatechange = function() {HandleClassListDownloadResults(SoundID)};
			ResponseObjArr[SoundID].DownloadObj.open("POST", "get_class_list.cfm?UID=" + UserID);
			top.ReportActivity("HTTP Request channel opened");

			if (typeof FormData != "function") { // browser does not support FormData
				// for browsers that don't support FormData, the setRequestHeader() needs to be sent, and the data needs to be URL encoded
				ResponseObjArr[SoundID].DownloadObj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			}

			// set a timer for aborting the Download	
			ResponseObjArr[SoundID].DownloadAbortTimerID = window.setTimeout("AbortClassListDownload", top.AbortIntervalMS, SoundID); 
			ResponseObjArr[SoundID].DownloadObj.send(DownloadData); 
			ResponseObjArr[CurrSoundID].DownloadInProgress = true;

			top.ReportActivity("asynchronous class list Download request sent for adjusted sound ID " + SoundID);
		}		
	
		return true;
	}	// function StartClassListDownload()

	function HandleEmailResults(SoundID) {
		/* called when the ajax email-sending process has a status change */
		//top.ReportActivity(ResponseObjArr[SoundID].EmailObj.status);
		//top.ReportActivity(ResponseObjArr[SoundID].EmailObj.responseText);

			if (ResponseObjArr[SoundID].EmailObj.readyState == 4) {	// done
				// kill the abort timer
				clearTimeout(ResponseObjArr[SoundID].EmailAbortTimerID);
				ResponseObjArr[SoundID].EmailAbortTimerID = 0;
				ResponseObjArr[CurrSoundID].EmailInProgress = false;

				// check the status code:
				if ( (ResponseObjArr[SoundID].EmailObj.status >= 200 && ResponseObjArr[SoundID].EmailObj.status < 300)  || (ResponseObjArr[SoundID].EmailObj.status == 304) ) { // 304 imeans "found in cache"
					var ResponseText = ResponseObjArr[SoundID].EmailObj.responseText;

					var BodyStarts = ResponseText.indexOf("<body");	// taking a chance that there's no a space after the <
					var BodyEnds = ResponseText.indexOf("</body");	// taking a chance that there's no a space after the <
					if ( (BodyStarts > -1) && (BodyEnds > -1) && (BodyEnds > BodyStarts) ) {
						ResponseText = ResponseText.substring(BodyStarts + 6, BodyEnds - 1).trim();
					}

					//top.ReportActivity("email-sending request " + SoundID + " completed, server says: " + ResponseText);
					if (ResponseText.indexOf("[[Message sent successfully.]]") > -1) {
						top.document.getElementById("UploadResult").innerHTML = "message sent for #" + SoundID;
						//top.document.getElementById("UploadSummary").innerHTML = top.GetUploadSummary(); // this function returns the number of sounds submitted, and we currently have no way to count the number of answers submitted by the htm/cfm pages in the exercise because each page is independently loaded
						top.document.getElementById("UploadSummary").innerHTML = "&nbsp;"
					} else {
						top.document.getElementById("UploadError").style.backgroundColor = "rgb(255, 200, 200)";
						top.document.getElementById("UploadError").innerHTML = top.document.getElementById("UploadError").innerHTML + "#" + SoundID + " failed to send message: " + ResponseText + "<br>";
						top.document.getElementById("UploadError").style.display = "block";
					}
				} else { // status error
					top.ReportActivity("email request " + SoundID + " unsuccessful, request object says: " + ResponseObjArr[SoundID].EmailObj.status + " " + ResponseObjArr[SoundID].EmailObj.statusText);
					top.document.getElementById("UploadError").style.backgroundColor = "rgb(255, 200, 200);"
					top.document.getElementById("UploadError").innerHTML = top.document.getElementById("UploadError").innerHTML + "#" + SoundID + " failed to send message; server says: request status: " + ResponseObjArr[SoundID].EmailObj.status + "<br>";
					top.document.getElementById("UploadError").style.display = "block";
					top.ReportActivity("calling AbortEmail because for sound " + SoundID + " server returned status " + ResponseObjArr[SoundID].EmailObj.status);
					AbortEmail(SoundID);
				}
				//ResponseObjArr[SoundID].EmailObj = null;
			}  else { // email request in progress
				top.ReportActivity("email request for sound " + SoundID + " is being processed");
				top.document.getElementById("UploadResult").innerHTML = "sending message for #" + SoundID + "...";
				//top.document.getElementById("UploadSummary").innerHTML = top.GetUploadSummary(); // this function returns the number of sounds submitted, and at this point we do not report the submitted sounds together with submitted responses
				top.document.getElementById("UploadSummary").innerHTML = "&nbsp;"
			}			
	}	// function HandleEmailResults(SoundID)

	function HandleMultiClipDataUploadResults(SoundID) {
		/* called when the ajax upload process has a status change */
		//top.ReportActivity(ResponseObjArr[SoundID].UploadObj.status);
		//top.ReportActivity(ResponseObjArr[SoundID].UploadObj.responseText);

			if (ResponseObjArr[SoundID].UploadObj.readyState == 4) {	// done
				// kill the abort timer
				clearTimeout(ResponseObjArr[SoundID].UploadAbortTimerID);
				ResponseObjArr[SoundID].UploadAbortTimerID = 0;
				ResponseObjArr[CurrSoundID].UploadInProgress = false;

				// check the status code:
				if ( (ResponseObjArr[SoundID].UploadObj.status >= 200 && ResponseObjArr[SoundID].UploadObj.status < 300)  || (ResponseObjArr[SoundID].UploadObj.status == 304) ) { // 304 imeans "found in cache"
					var ResponseText = ResponseObjArr[SoundID].UploadObj.responseText;

					var BodyStarts = ResponseText.indexOf("<body");	// taking a chance that there's no a space after the <
					var BodyEnds = ResponseText.indexOf("</body");	// taking a chance that there's no a space after the <
					if ( (BodyStarts > -1) && (BodyEnds > -1) && (BodyEnds > BodyStarts) ) {
						ResponseText = ResponseText.substring(BodyStarts + 6, BodyEnds - 1).trim();
					}
					
					//top.ReportActivity("upload multi-clip data request " + SoundID + " completed, server says: " + ResponseText);
					if (ResponseText.indexOf("{{Submitted successfully.}}") > -1) {
						top.document.getElementById("UploadResult").innerHTML = "saved for #" + SoundID;
						//top.document.getElementById("UploadSummary").innerHTML = top.GetUploadSummary(); // this function returns the number of sounds submitted, and we currently have no way to count the number of answers submitted by the htm/cfm pages in the exercise because each page is independently loaded
						top.document.getElementById("UploadSummary").innerHTML = "&nbsp;"
						top.ConfirmOnBeforeUnload = false;	// don't ask for confirmation when leaving the page
					} else {
						top.document.getElementById("UploadError").style.backgroundColor = "rgb(255, 200, 200)";
						top.document.getElementById("UploadError").innerHTML = top.document.getElementById("UploadError").innerHTML + "#" + SoundID + " failed to submit multi-clip data: " + ResponseText + "<br>";
						top.document.getElementById("UploadError").style.display = "block";
					}
				} else { // status error
					top.ReportActivity("upload request " + SoundID + " unsuccessful, request object says: " + ResponseObjArr[SoundID].UploadObj.status + " " + ResponseObjArr[SoundID].UploadObj.statusText);
					top.document.getElementById("UploadError").style.backgroundColor = "rgb(255, 200, 200);"
					top.document.getElementById("UploadError").innerHTML = top.document.getElementById("UploadError").innerHTML + "#" + SoundID + " failed to submit multi-clip data; server says: request status: " + ResponseObjArr[SoundID].UploadObj.status + "<br>";
					top.document.getElementById("UploadError").style.display = "block";
					top.ReportActivity("calling AbortUpload because for sound " + SoundID + " server returned status " + ResponseObjArr[SoundID].UploadObj.status);
					AbortMultiClipDataUpload(SoundID);
				}
				//ResponseObjArr[SoundID].UploadObj = null;
			}  else { // upload in progress
				top.ReportActivity("upload request for sound " + SoundID + " is being processed");
				top.document.getElementById("UploadResult").innerHTML = "submitting for #" + SoundID + "...";
				//top.document.getElementById("UploadSummary").innerHTML = top.GetUploadSummary(); // this function returns the number of sounds submitted, and at this point we do not report the submitted sounds together with submitted responses
				top.document.getElementById("UploadSummary").innerHTML = "&nbsp;"
			}			
	}	// function HandleMultiClipDataUploadResults(SoundID)

	function HandleQuestionResponseUploadResults(SoundID) {
		/* called when the ajax upload process has a status change */
		//top.ReportActivity(ResponseObjArr[SoundID].UploadObj.status);
		//top.ReportActivity(ResponseObjArr[SoundID].UploadObj.responseText);

			if (ResponseObjArr[SoundID].UploadObj.readyState == 4) {	// done
				// kill the abort timer
				clearTimeout(ResponseObjArr[SoundID].UploadAbortTimerID);
				ResponseObjArr[SoundID].UploadAbortTimerID = 0;
				ResponseObjArr[CurrSoundID].UploadInProgress = false;

				// check the status code:
				if ( (ResponseObjArr[SoundID].UploadObj.status >= 200 && ResponseObjArr[SoundID].UploadObj.status < 300)  || (ResponseObjArr[SoundID].UploadObj.status == 304) ) { // 304 imeans "found in cache"
					var ResponseText = ResponseObjArr[SoundID].UploadObj.responseText;

					var BodyStarts = ResponseText.indexOf("<body");	// taking a chance that there's no a space after the <
					var BodyEnds = ResponseText.indexOf("</body");	// taking a chance that there's no a space after the <
					if ( (BodyStarts > -1) && (BodyEnds > -1) && (BodyEnds > BodyStarts) ) {
						ResponseText = ResponseText.substring(BodyStarts + 6, BodyEnds - 1).trim();
					}

					//top.ReportActivity("upload request " + SoundID + " completed, server says: " + ResponseText);
					if (ResponseText.indexOf("{{Submitted successfully.}}") > -1) {
						top.document.getElementById("UploadResult").innerHTML = "saved for #" + SoundID;
						//top.document.getElementById("UploadSummary").innerHTML = top.GetUploadSummary(); // this function returns the number of sounds submitted, and we currently have no way to count the number of answers submitted by the htm/cfm pages in the exercise because each page is independently loaded
						top.document.getElementById("UploadSummary").innerHTML = "&nbsp;"
						top.ConfirmOnBeforeUnload = false;	// don't ask for confirmation when leaving the page
					} else {
						top.document.getElementById("UploadError").style.backgroundColor = "rgb(255, 200, 200)";
						top.document.getElementById("UploadError").innerHTML = top.document.getElementById("UploadError").innerHTML + "#" + SoundID + " failed to submit: " + ResponseText + "<br>";
						top.document.getElementById("UploadError").style.display = "block";
					}
				} else { // status error
					top.ReportActivity("upload request " + SoundID + " unsuccessful, request object says: " + ResponseObjArr[SoundID].UploadObj.status + " " + ResponseObjArr[SoundID].UploadObj.statusText);
					top.document.getElementById("UploadError").style.backgroundColor = "rgb(255, 200, 200);"
					top.document.getElementById("UploadError").innerHTML = top.document.getElementById("UploadError").innerHTML + "#" + SoundID + " failed to submit; server says: request status: " + ResponseObjArr[SoundID].UploadObj.status + "<br>";
					top.document.getElementById("UploadError").style.display = "block";
					top.ReportActivity("calling AbortUpload because for sound " + SoundID + " server returned status " + ResponseObjArr[SoundID].UploadObj.status);
					AbortResponseListUpload(SoundID);
				}
				//ResponseObjArr[SoundID].UploadObj = null;
			}  else { // upload in progress
				top.ReportActivity("upload request for sound " + SoundID + " is being processed");
				top.document.getElementById("UploadResult").innerHTML = "submitting for #" + SoundID + "...";
				//top.document.getElementById("UploadSummary").innerHTML = top.GetUploadSummary(); // this function returns the number of sounds submitted, and at this point we do not report the submitted sounds together with submitted responses
				top.document.getElementById("UploadSummary").innerHTML = "&nbsp;"
			}			
	}	// function HandleQuestionResponseUploadResults(SoundID)

	function HandleQuestionResponseDownloadResults(SoundID) {
		/* called when the ajax download process has a status change */
		//top.ReportActivity(ResponseObjArr[SoundID].DownloadObj.status);
		//top.ReportActivity(ResponseObjArr[SoundID].DownloadObj.responseText);

			if (ResponseObjArr[SoundID].DownloadObj.readyState == 4) {	// done
				// kill the abort timer
				clearTimeout(ResponseObjArr[SoundID].DownloadAbortTimerID);
				ResponseObjArr[SoundID].DownloadAbortTimerID = 0;
				ResponseObjArr[CurrSoundID].DownloadInProgress = false;
				top.HideLoadingFlag();
				
				// check the status code:
				if ( (ResponseObjArr[SoundID].DownloadObj.status >= 200 && ResponseObjArr[SoundID].DownloadObj.status < 300)  || (ResponseObjArr[SoundID].DownloadObj.status == 304) ) { // 304 imeans "found in cache"
					var ResponseText = ResponseObjArr[SoundID].DownloadObj.responseText;
					var BodyStarts = ResponseText.indexOf("<body");	// taking a chance that there's no a space after the <
					var BodyEnds = ResponseText.indexOf("</body");	// taking a chance that there's no a space after the <
					if ( (BodyStarts > -1) && (BodyEnds > -1) && (BodyEnds > BodyStarts) ) {
						ResponseText = ResponseText.substring(BodyStarts + 6, BodyEnds - 1).trim();
					}
					//top.ReportActivity("download request " + SoundID + " completed, server says: " + ResponseText);
//console.log("ResponseText=" + ResponseText + "=");
					if ( (ResponseText.indexOf("[[") > -1) && (ResponseText.indexOf("]]") > -1) ) {	// retrieved string (even if blankl) is flanked by [[]]
						var ResponseStarts = ResponseText.indexOf("[[");
						var ResponseEnds = ResponseText.indexOf("]]");

						if ( (ResponseEnds > (ResponseStarts + 1)) ) {
							ResponseText = ResponseText.substring(ResponseStarts + 2, ResponseEnds).trim();
						}
						// commented out 7/11/16: if (ResponseText != "") {	//we think we now have a valid non-blank string of caret-delimited name=value pairs, e.g. Questtion 1=Yes^Qustion 2=No^My personal opinion=This really shines!
							ParseRetrievedQuestionResponseList(ResponseText);
						//}	// else the string is blank because nothing had been stored, and nothing needs to be done
					} else {	// error
						if ( (ResponseText.indexOf("{{") > -1) && (ResponseText.indexOf("}}") > -1) ) {	// error message is flanked by {{}}
							var ResponseStarts = ResponseText.indexOf("{{");
							var ResponseEnds = ResponseText.indexOf("}}");
							if ( (ResponseEnds > (ResponseStarts + 1)) ) {
								ResponseText = ResponseText.substring(ResponseStarts + 2, ResponseEnds).trim();
							}
							top.document.getElementById("UploadError").style.backgroundColor = "rgb(255, 200, 200)";
							top.document.getElementById("UploadError").innerHTML = top.document.getElementById("UploadError").innerHTML + "#" + SoundID + " failed to retrieve: " + ResponseText + "<br>";
							top.document.getElementById("UploadError").style.display = "block";											
						} else {	// unexpected result: no {{}} and no [[]]
							alert("Unexpected response from server in HandleQuestionResponseDownloadResults. Connection error? Try again: click Go to reload this exercise. (" + ResponseText + ")");
						}
					}	// if ( (ResponseText.indexOf("[[") > -1) && (ResponseText.indexOf("]]") > -1) )
				} else { // status error
					top.ReportActivity("download request " + SoundID + " unsuccessful, request object says: " + ResponseObjArr[SoundID].DownloadObj.status + " " + ResponseObjArr[SoundID].DownloadObj.statusText);
					top.document.getElementById("UploadError").style.backgroundColor = "rgb(255, 200, 200);"
					top.document.getElementById("UploadError").innerHTML = top.document.getElementById("DownloadError").innerHTML + "#" + SoundID + " failed to submit; server says: request status: " + ResponseObjArr[SoundID].DownloadObj.status + "<br>";
					top.document.getElementById("UploadError").style.display = "block";
					top.ReportActivity("calling AbortDownload because for sound " + SoundID + " server returned status " + ResponseObjArr[SoundID].DownloadObj.status);
					AbortResponseListDownload(SoundID);
				}	// if ( (ResponseObjArr[SoundID].DownloadObj.status >= 200 && ResponseObjArr[SoundID].DownloadObj.status < 300)  || (ResponseObjArr[SoundID].DownloadObj.status == 304) )
				//ResponseObjArr[SoundID].DownloadObj = null;
			}  else { // download in progress
				top.ReportActivity("download request " + SoundID + " is being processed");
			}	// if (ResponseObjArr[SoundID].DownloadObj.readyState == 4)
	}	// function HandleQuestionResponseDownloadResults(SoundID)

	function HandleClassListDownloadResults(SoundID) {
		/* called when the ajax download process has a status change */
		//top.ReportActivity(ResponseObjArr[SoundID].DownloadObj.status);
		//top.ReportActivity(ResponseObjArr[SoundID].DownloadObj.responseText);

			if (ResponseObjArr[SoundID].DownloadObj.readyState == 4) {	// done
				// kill the abort timer
				clearTimeout(ResponseObjArr[SoundID].DownloadAbortTimerID);
				ResponseObjArr[SoundID].DownloadAbortTimerID = 0;
				ResponseObjArr[CurrSoundID].DownloadInProgress = false;
				top.HideLoadingFlag();
				
				// check the status code:
				if ( (ResponseObjArr[SoundID].DownloadObj.status >= 200 && ResponseObjArr[SoundID].DownloadObj.status < 300)  || (ResponseObjArr[SoundID].DownloadObj.status == 304) ) { // 304 imeans "found in cache"
					var ResponseText = ResponseObjArr[SoundID].DownloadObj.responseText;
					var BodyStarts = ResponseText.indexOf("<body");	// taking a chance that there's no a space after the <
					var BodyEnds = ResponseText.indexOf("</body");	// taking a chance that there's no a space after the <
					if ( (BodyStarts > -1) && (BodyEnds > -1) && (BodyEnds > BodyStarts) ) {
						ResponseText = ResponseText.substring(BodyStarts + 6, BodyEnds - 1).trim();
					}
					//top.ReportActivity("download request " + SoundID + " completed, server says: " + ResponseText);
					if ( (ResponseText.indexOf("[[") > -1) && (ResponseText.indexOf("]]") > -1) ) {	// requested string or blank string is flanked by [[]]
						var ResponseStarts = ResponseText.indexOf("[[");
						var ResponseEnds = ResponseText.indexOf("]]");

						if ( (ResponseEnds > (ResponseStarts + 1)) ) {
							ResponseText = ResponseText.substring(ResponseStarts + 2, ResponseEnds).trim();
						}
						if (ResponseText != "") {	//we think we now have a valid non-blank string of two |-delimited strings: the first one is students, the second one is teachers; both are caret-delimited Nickname=UserID pairs, e.g. Sasha Petrovich=1234567^Masha Petrovna=098765|Slava Paperno=4074^Viktoria Tsimberov=3456
							ParseRetrievedClassList(ResponseText);
						}	// else the string is blank because nothing was stored, and nothing needs to be done
					} else {	// error
						if ( (ResponseText.indexOf("{{") > -1) && (ResponseText.indexOf("}}") > -1) ) {	// error message is flanked by {{}}
							var ResponseStarts = ResponseText.indexOf("{{");
							var ResponseEnds = ResponseText.indexOf("}}");
							if ( (ResponseEnds > (ResponseStarts + 1)) ) {
								ResponseText = ResponseText.substring(ResponseStarts + 2, ResponseEnds).trim();
							}
							top.document.getElementById("UploadError").style.backgroundColor = "rgb(255, 200, 200)";
							top.document.getElementById("UploadError").innerHTML = top.document.getElementById("UploadError").innerHTML + "#" + SoundID + " failed to retrieve: " + ResponseText + "<br>";
							top.document.getElementById("UploadError").style.display = "block";	
						} else {	// unexpected result: no {{}} and not [[]]
							alert("Unexpected response from server in HandleClassListDownloadResults. Connection error? Try again: click Go to reload this exercise.");
						}
					}	// if ( (ResponseText.indexOf("[[") > -1) && (ResponseText.indexOf("]]") > -1) )
				} else { // status error
					top.ReportActivity("class list download request " + SoundID + " unsuccessful, request object says: " + ResponseObjArr[SoundID].DownloadObj.status + " " + ResponseObjArr[SoundID].DownloadObj.statusText);
					top.document.getElementById("UploadError").style.backgroundColor = "rgb(255, 200, 200);"
					top.document.getElementById("UploadError").innerHTML = top.document.getElementById("DownloadError").innerHTML + "#" + SoundID + " failed to submit; server says: request status: " + ResponseObjArr[SoundID].DownloadObj.status + "<br>";
					top.document.getElementById("UploadError").style.display = "block";
					top.ReportActivity("calling AbortDownload because for sound " + SoundID + " server returned status " + ResponseObjArr[SoundID].DownloadObj.status);
					AbortClassListDownload(SoundID);
				}	// if ( (ResponseObjArr[SoundID].DownloadObj.status >= 200 && ResponseObjArr[SoundID].DownloadObj.status < 300)  || (ResponseObjArr[SoundID].DownloadObj.status == 304) )
				//ResponseObjArr[SoundID].DownloadObj = null;
			}  else { // download in progress
				top.ReportActivity("class list download request " + SoundID + " is being processed");
			}	// if (ResponseObjArr[SoundID].DownloadObj.readyState == 4)
	}	// function HandleClassListDownloadResults(SoundID)
	
	function SetUpEmailData(EmailText, SendMode) {
		/* returns data for the email-sending attempt in a format that is acceptable to the ajax request, i.e. either as FormData or urlencoded key-value pairs;
			SendMode can be "SendToAll" or "SendToList";
			NOTE: SoundID needs to be adjusted, i.e. if the recording command had the argument "nextQuestion," then SoundID has already been incremented */
		SoundID = AdjustedSoundID(top.CurrTeacherSoundID);
//alert(SoundID + " " + top.CurrStudentUName + " " + top.UserID + " " + top.CurrStudentPsw + " " + top.SoundBiteObjArr[SoundID].StudentRecordingCourseFolder + " " + top.SoundBiteObjArr[SoundID].StudentRecordingLessonFolder + " " + top.SoundBiteObjArr[SoundID].StudentRecordingExerciseFolder + " " + top.SoundBiteObjArr[SoundID].SoundFilename + " " + EmailText);
		var UserIDList = -1;
		if (SendMode == "SendToList") {
			// for this mode, we must compile a list of UserIDs--a comma-delimited list of integers
			if (! document.getElementById("class_list") ) {
				alert("No element called 'class_list' found, list of recipients is unlknown.");
				return null;	
			} else {
				// has the class list been populated?
				UserIDList = "";
				var ClassListObj = document.getElementById("class_list");
				for (var k=0; k<ClassListObj.childNodes.length; k++) {
					if (ClassListObj.childNodes[k].type) {
						if 	(ClassListObj.childNodes[k].type == "checkbox") {
							if (ClassListObj.childNodes[k].name == "UserID") {
								if (ClassListObj.childNodes[k].checked) {
									if (UserIDList == "") {
										UserIDList = ClassListObj.childNodes[k].value;
									} else {
										UserIDList = UserIDList + "," + ClassListObj.childNodes[k].value;												
									}
								}
							}	// if (ClassListObj.childNodes[k].name == "UserID")
						}	// if 	(ClassListObj.childNodes[k].type == "checkbox")
					}	// if (ClassListObj.childNodes[k].type)
				}	// for (var k=0; k<ClassListObj.childNodes.length; k++)
//top.console.log("=" + UserIDList + "=");
				if (UserIDList == "") {
					alert("No boxes are checked in the class list, list of recipients is unlknown.");
					UserIDList = -1;
					return null;	
				}
			}	// if (! document.getElementById("class_list") )
		}	// if (SendMode == "SendToList")

		if (typeof FormData == "function") { // browser supports this
			//ReportActivity("browser supports FormData, data will be in that format");
			//data to be sent by ajax can be set up as FormData	
			var data = new FormData();
			if (SendMode == "SendToAll") {
				data.append("SendToAll", "Send to all");
			} else {
				if (SendMode == "SendToList") {
					data.append("SendToList", "Send to list");
					if (UserIDList == -1) {
						alert("No boxes are checked in the class list, list of recipients is unlknown.");
						return null;	
					} else {
						data.append("UserIDList", UserIDList);
					}
				} else {
					alert("Error in SetUpEmailData: incorrect arguments.");
					return null;	
				}	// if (SendMode == "SendToList")
			}	// if (SendMode == "SendToAll")
			data.append("EmailSubject", "A message from WAL user of " + LessonFolder + " > " + ExerciseFolder);
			data.append("EmailText", EmailText);
			top.ReportActivity("FormData is set in SetUpEmailData for " + CurrSoundfile);
		} else { // browser doesn't support FormData, e.g. IE 9 or mobile browser
			top.ReportActivity("browser doesn't support FormData, data initialized as key-value pairs");
			
			var data = "";
			if (SendMode == "SendToAll") {
				data = data + "&SendToAll=" + encodeURIComponent("Send to all");
			} else {
				if (SendMode == "SendToList") {
					data = data + "&SendToList=" + encodeURIComponent("Send to list");
					if (UserIDList == -1) {
						alert("No boxes are checked in the class list, list of recipients is unlknown.");
						return null;	
					} else {
						data = data + "&UserIDList=" + encodeURIComponent(UserIDList);
					}
				} else {
					alert("Error in SetUpEmailData: incorrect arguments.");
					return null;	
				}
			}	// if (SendMode == "SendToAll")

			data = data + "&EmailSubject=" + encodeURIComponent("A message from WAL user of " + LessonFolder + " > " + ExerciseFolder);
			data = data + "&EmailText=" + encodeURIComponent(EmailText);
			//top.ReportActivity("in SetUpEmailData, SoundFilename: " +  CurrSoundFile);
			top.ReportActivity("name-value pairs: " + data.substr(0, 200) + "...");
		}	// if (typeof FormData == "function")
		top.ReportActivity("data for sending email for sound " + SoundID + " is initialized");

		return data;
	}	// function SetUpEmailData(EmailText)
	
	
	function SetUpMultiClipUploadData(MultiClipDataStr) {
		/* returns data for the upload in a format that is acceptable to the ajax request, i.e. either as FormData or urlencoded key-value pairs;
			NOTE: SoundID needs to be adjusted, i.e. if the recording command had the argument "nextQuestion," then SoundID has already been incremented */
		SoundID = AdjustedSoundID(top.CurrTeacherSoundID);
//alert(SoundID + " " + top.CurrStudentUName + " " + top.UserID + " " + top.CurrStudentPsw + " " + top.SoundBiteObjArr[SoundID].StudentRecordingCourseFolder + " " + top.SoundBiteObjArr[SoundID].StudentRecordingLessonFolder + " " + top.SoundBiteObjArr[SoundID].StudentRecordingExerciseFolder + " " + top.SoundBiteObjArr[SoundID].SoundFilename + " " + QuestionResponseList);

		if (typeof FormData == "function") { // browser supports this
			//ReportActivity("browser supports FormData, data will be in that format");
			//data to be sent by ajax can be set up as FormData	
			var data = new FormData();
			data.append("Username", top.CurrStudentUName);
			data.append("UserID", top.UserID);
			data.append("Password", top.CurrStudentPsw);
			data.append("CourseFolder", top.SoundBiteObjArr[SoundID].StudentRecordingCourseFolder);
			data.append("LessonFolder", top.SoundBiteObjArr[SoundID].StudentRecordingLessonFolder);
			data.append("ExerciseFolder", top.SoundBiteObjArr[SoundID].StudentRecordingExerciseFolder);
			data.append("SoundFilename", top.SoundBiteObjArr[SoundID].SoundFilename);
			data.append("SoundNum", SoundID);
			data.append("MultiClipData", MultiClipDataStr);
			top.ReportActivity("FormData is set in SetUpMultiClipUploadData for " + CurrSoundfile);
		} else { // browser doesn't support FormData, e.g. IE 9 or mobile browser
			top.ReportActivity("browser doesn't support FormData, multi-clip data initialized as key-value pairs");
			
			var data = "";
			data = data + "&Username=" + encodeURIComponent(top.CurrStudentUName);
			data = data + "&UserID=" + encodeURIComponent(top.UserID);
			data = data + "&Password=" + encodeURIComponent(top.CurrStudentPsw);
			data = data + "&CourseFolder=" + encodeURIComponent(top.SoundBiteObjArr[SoundID].StudentRecordingCourseFolder);
			data = data + "&LessonFolder=" + encodeURIComponent(top.SoundBiteObjArr[SoundID].StudentRecordingLessonFolder);
			data = data + "&ExerciseFolder=" + encodeURIComponent(top.SoundBiteObjArr[SoundID].StudentRecordingExerciseFolder);
			data = data + "&SoundFilename=" + encodeURIComponent(top.SoundBiteObjArr[SoundID].SoundFilename);
			data = data + "&MultiClipData=" + encodeURIComponent(MultiClipDataStr);
			data = data + "&SoundNum=" + encodeURIComponent(SoundID);
			//top.ReportActivity("in SetUpQuestionResponseUploadData, SoundFilename: " +  top.SoundBiteObjArr[SoundID].SoundFilename);
			top.ReportActivity("name-value pairs: " + data.substr(0, 200) + "...");
		}
		top.ReportActivity("multi-clip data for sound " + SoundID + " is initialized for uploading");

		return data;
	}	// function SetUpMultiClipUploadData(MultiClipDataStr)
	
	function SetUpQuestionResponseUploadData(QuestionResponseList) {
		/* returns data for the upload in a format that is acceptable to the ajax request, i.e. either as FormData or urlencoded key-value pairs;
			NOTE: SoundID needs to be adjusted, i.e. if the recording command had the argument "nextQuestion," then SoundID has already been incremented */
		SoundID = AdjustedSoundID(top.CurrTeacherSoundID);
//alert(SoundID + " " + top.CurrStudentUName + " " + top.UserID + " " + top.CurrStudentPsw + " " + top.SoundBiteObjArr[SoundID].StudentRecordingCourseFolder + " " + top.SoundBiteObjArr[SoundID].StudentRecordingLessonFolder + " " + top.SoundBiteObjArr[SoundID].StudentRecordingExerciseFolder + " " + top.SoundBiteObjArr[SoundID].SoundFilename + " " + QuestionResponseList);

		if (typeof FormData == "function") { // browser supports this
			//ReportActivity("browser supports FormData, data will be in that format");
			//data to be sent by ajax can be set up as FormData	
			var data = new FormData();
			data.append("Username", top.CurrStudentUName);
			data.append("UserID", top.UserID);
			data.append("Password", top.CurrStudentPsw);
			data.append("CourseFolder", top.SoundBiteObjArr[SoundID].StudentRecordingCourseFolder);
			data.append("LessonFolder", top.SoundBiteObjArr[SoundID].StudentRecordingLessonFolder);
			data.append("ExerciseFolder", top.SoundBiteObjArr[SoundID].StudentRecordingExerciseFolder);
			data.append("SoundFilename", top.SoundBiteObjArr[SoundID].SoundFilename);
			data.append("SoundNum", SoundID);
			data.append("QuestionResponseList", QuestionResponseList);
			top.ReportActivity("FormData is set in SetUpQuestionResponseUploadData for " + CurrSoundfile);
		} else { // browser doesn't support FormData, e.g. IE 9 or mobile browser
			top.ReportActivity("browser doesn't support FormData, data initialized as key-value pairs");
			
			var data = "";
			data = data + "&Username=" + encodeURIComponent(top.CurrStudentUName);
			data = data + "&UserID=" + encodeURIComponent(top.UserID);
			data = data + "&Password=" + encodeURIComponent(top.CurrStudentPsw);
			data = data + "&CourseFolder=" + encodeURIComponent(top.SoundBiteObjArr[SoundID].StudentRecordingCourseFolder);
			data = data + "&LessonFolder=" + encodeURIComponent(top.SoundBiteObjArr[SoundID].StudentRecordingLessonFolder);
			data = data + "&ExerciseFolder=" + encodeURIComponent(top.SoundBiteObjArr[SoundID].StudentRecordingExerciseFolder);
			data = data + "&SoundFilename=" + encodeURIComponent(top.SoundBiteObjArr[SoundID].SoundFilename);
			data = data + "&QuestionResponseList=" + encodeURIComponent(QuestionResponseList);
			data = data + "&SoundNum=" + encodeURIComponent(SoundID);
			//top.ReportActivity("in SetUpQuestionResponseUploadData, SoundFilename: " +  top.SoundBiteObjArr[SoundID].SoundFilename);
			top.ReportActivity("name-value pairs: " + data.substr(0, 200) + "...");
		}
		top.ReportActivity("data for uploading sound " + SoundID + " is initialized");

		return data;
	}	// function SetUpQuestionResponseUploadData(QuestionResponseList)
	
	function SetUpQuestionResponseDownloadData(QuestionResponseList) {
		/* returns data to be submitted to the server fir retrieving field QuestionResponseList from table WALStudentSubmissions in a format that is acceptable to the ajax request, i.e. either as FormData or urlencoded key-value pairs;
		 */
		SoundID = AdjustedSoundID(top.CurrTeacherSoundID);	// if the recording command had the argument "nextQuestion," then SoundID has already been incremented, otherwise it equals top.CurrTeacherSoundID

		if (typeof FormData == "function") { // browser supports this
			//ReportActivity("browser supports FormData, data will be in that format");
			//data to be sent by ajax can be set up as FormData	
			var data = new FormData();
			data.append("Username", top.CurrStudentUName);
			data.append("UserID", top.UserID);
			data.append("Password", top.CurrStudentPsw);
			data.append("CourseFolder", top.SoundBiteObjArr[SoundID].StudentRecordingCourseFolder);
			data.append("LessonFolder", top.SoundBiteObjArr[SoundID].StudentRecordingLessonFolder);
			data.append("ExerciseFolder", top.SoundBiteObjArr[SoundID].StudentRecordingExerciseFolder);
			data.append("SoundFilename", top.SoundBiteObjArr[SoundID].SoundFilename);
			top.ReportActivity("FormData is set in SetUpQuestionResponseDownloadData for " + CurrSoundfile);
		} else { // browser doesn't support FormData, e.g. IE 9 or mobile browser
			top.ReportActivity("browser doesn't support FormData, data initialized as key-value pairs");
			
			var data = "";
			data = data + "&Username=" + encodeURIComponent(top.CurrStudentUName);
			data = data + "&UserID=" + encodeURIComponent(top.UserID);
			data = data + "&Password=" + encodeURIComponent(top.CurrStudentPsw);
			data = data + "&CourseFolder=" + encodeURIComponent(top.SoundBiteObjArr[SoundID].StudentRecordingCourseFolder);
			data = data + "&LessonFolder=" + encodeURIComponent(top.SoundBiteObjArr[SoundID].StudentRecordingLessonFolder);
			data = data + "&ExerciseFolder=" + encodeURIComponent(top.SoundBiteObjArr[SoundID].StudentRecordingExerciseFolder);
			data = data + "&SoundFilename=" + encodeURIComponent(top.SoundBiteObjArr[SoundID].SoundFilename);
			//top.ReportActivity("in SetUpQuestionResponseDownloadData, SoundFilename: " +  top.SoundBiteObjArr[SoundID].SoundFilename);
			top.ReportActivity("name-value pairs: " + data.substr(0, 200) + "...");
		}
		top.ReportActivity("data for downloading response string for sound " + SoundID + " is initialized");
		return data;
	}	// function SetUpQuestionResponseDownloadData(QuestionResponseList)
	
	function SetUpClassListDownloadData(QuestionResponseList) {
		/* returns data to be submitted to the server for retrieving class list data in a format that is acceptable to the ajax request, i.e. either as FormData or urlencoded key-value pairs;
		 */
		SoundID = AdjustedSoundID(top.CurrTeacherSoundID);	// if the recording command had the argument "nextQuestion," then SoundID has already been incremented, otherwise it equals top.CurrTeacherSoundID

		if (typeof FormData == "function") { // browser supports this
			//ReportActivity("browser supports FormData, data will be in that format");
			//data to be sent by ajax can be set up as FormData	
			var data = new FormData();
			data.append("Username", top.CurrStudentUName);
			data.append("UserID", top.UserID);
			data.append("Password", top.CurrStudentPsw);
			top.ReportActivity("FormData is set in SetUpClassListDownloadData for " + CurrSoundfile);
		} else { // browser doesn't support FormData, e.g. IE 9 or mobile browser
			top.ReportActivity("browser doesn't support FormData, data initialized as key-value pairs");
			
			var data = "";
			data = data + "&Username=" + encodeURIComponent(top.CurrStudentUName);
			data = data + "&UserID=" + encodeURIComponent(top.UserID);
			data = data + "&Password=" + encodeURIComponent(top.CurrStudentPsw);
			//top.ReportActivity("in SetUpClassListDownloadData, SoundFilename: " +  top.SoundBiteObjArr[SoundID].SoundFilename);
			top.ReportActivity("name-value pairs: " + data.substr(0, 200) + "...");
		}
		top.ReportActivity("data for downloading class list for sound " + SoundID + " is initialized");
		return data;
	}	// function SetUpClassListDownloadData(QuestionResponseList)
	
	function AddCheckBox(container, name, id, value, label) {
		var NewCheckbox = document.createElement('input');
		NewCheckbox.type = "checkbox";
		NewCheckbox.name = name;
		NewCheckbox.value = value;
		NewCheckbox.id = id;
		
		var NewLabel = document.createElement('label')
		NewLabel.setAttribute("for", id);
		//NewLabel.htmlFor = id;
		NewLabel.innerHTML = label;		
		
		container.appendChild(NewCheckbox);
		container.appendChild(NewLabel);
		// add a blank line
		container.appendChild(document.createElement("br"));

	}	// function AddCheckBox(container, name, id, value, label)