// an example of using this file can be found in  Sampler/texts/Robert_Frost/Video_2/Frost_Questions.htm

		// initialize globals for this page
		var AttemptCount = 0;	// this counts the number of clicks on button SubmitOrCheck since the has loaded; it may also be affected by the discovery of previously submitted responses
		var CorrectAnswersSubmitted = false; 	// if QandAMode is "FirstStored" or "LastStored" this is reset to true after correct answers have been submitted

		/* function Init() was moved to each Questions/htm file */

/* this no longer works in modern browsers--considered security hole
		window.onbeforeunload = function(event) {
			event.returnValue = "You have not submitted your answers. Do you still want to leave this page?";
		};
*/

		function UpdateFooter() {
			/* called to update the innerHTML of question_footer */
			if (document.getElementById("questions_footer")) {
				switch (QandAMode) {
					case "LastStored" :
						document.getElementById("questions_footer").innerHTML = "If you submit more than once, only your last set of answers is saved for the teacher."
						if (CorrectAnswersSubmitted) {
							if (TypedSet.Question == "") {	// nothing else to submit
								document.getElementById("questions_footer").innerHTML = "You have submitted correct answers."
							}
						}
						break;
					case "FirstStored" :
						if (AttemptCount <= 0) {
							document.getElementById("questions_footer").innerHTML = "Think carefully before submitting: your first attempt is saved for the teacher."
						} else {
							document.getElementById("questions_footer").innerHTML = "Your answers have been saved for the teacher."
							var RadioButtAnsIncorr = ( (RadioButtonSet.Question != "") && (! EvaluateRadioButtonAnswer() ) );
							var CheckBoxAnsIncorr = ( (CheckBoxSet.Question != "") && (! EvaluateCheckBoxAnswers() ) );
							var FillInAnsIncorr = ( (FillInSet.Question != "") && (! EvaluateFillInAnswers() ) );
							if (  (! CorrectAnswersSubmitted) && ( (RadioButtAnsIncorr) || (CheckBoxAnsIncorr) || (FillInAnsIncorr)  )  ) {
								document.getElementById("questions_footer").innerHTML = "You may try to find the correct answers, but they won't be saved. [<a href='javascript: ShowAnswers(); '>Show them!</a>]"
							}
						}
						break;
					case "NoneStored" :
							if ( ( (RadioButtonSet.Question != "") && (! EvaluateRadioButtonAnswer()) ) || ( (CheckBoxSet.Question != "") && (! EvaluateCheckBoxAnswers()) ) || ( (FillInSet.Question != "") && (! EvaluateFillInAnswers()) ) ) {
								document.getElementById("questions_footer").innerHTML = "This page is purely for practice: your answers are not saved. [<a href='javascript: ShowAnswers(); '>Show answers!</a>]"
							} else {
								document.getElementById("questions_footer").innerHTML = "This page is purely for practice: your answers are not saved.";
							}
						break;
					default :
						alert("Unexpected Q&A mode in UpdateFooter.");
						break;				
				}	// switch (QandAMode)
			}	// if (document.getElementById("questions_footer"))
		}	// function UpdateFooter()
		
		function ValidateData() {
			/* validates syntactic validity of the textual data*/	
			if ( ! ( (RadioButtonSet.Answers.length == RadioButtonSet.Comments.length) && (RadioButtonSet.Answers.length == RadioButtonSet.CorrectIncorrect.length) ) ) {
				alert("Incorrect format of radio-button question and answers: length mismatch.");	
				return false;
			}
			if ( ! ( (CheckBoxSet.Answers.length == CheckBoxSet.Comments.length) && (CheckBoxSet.Answers.length == CheckBoxSet.CorrectIncorrect.length) ) ) {
				alert("Incorrect format of check-box question and answers: length mismatch.");	
				return false;
			}
			
			if ( (RadioButtonSet.Question.indexOf("^") > -1) || (RadioButtonSet.Question.indexOf("=") > -1) ) {
				alert("Characters ^ and = must not be used anywhere in the RadioButtonSet.");
				return false;
			}
			
			if ( (CheckBoxSet.Question.indexOf("^") > -1) || (CheckBoxSet.Question.indexOf("=") > -1) ) {
				alert("Characters ^ and = must not be used anywhere in the CheckBoxSet.");
				return false;
			}
			
			if ( (FillInSet.Question.indexOf("^") > -1) || (FillInSet.Question.indexOf("=") > -1) ) {
				alert("Characters ^ and = must not be used anywhere in the FillInSet.");
				return false;
			}
			
			if ( (FillInSet.Question.indexOf("^") > -1) || (FillInSet.Question.indexOf("=") > -1) ) {
				alert("Characters ^ and = must not be used anywhere in the FillInSet.");
				return false;
			}
			
			if ( (TypedSet.Question.indexOf("^") > -1) || (TypedSet.Question.indexOf("=") > -1) ) {
				alert("Characters ^ and = must not be used anywhere in the TypedSet.");
				return false;
			}
			
			return true;
		}	// function ValidateData()

		function SetUpRadioFieldset () {
			/*  creates and initializes all elements for the RadioButtonSet of Q&A */
			if (! document.getElementById("RadioFieldset")) {
				alert("Radio field set not found");
				return false;
			}
			
			// remove all contents from RadioFieldset
			var RadioFieldsetObj = document.getElementById("RadioFieldset");
			while (RadioFieldsetObj.hasChildNodes()) {
				RadioFieldsetObj.removeChild(RadioFieldsetObj.lastChild);
			}

			if (RadioButtonSet.Answers.length == 0) {
				RadioFieldsetObj.style.display = "none";
				return true;
			}

			// create required elements for all parts of RadioFieldset
			// create label for the question
			var NewLabel = document.createElement("label");
			NewLabel.id = "RadioSetQuestion";
			NewLabel.innerHTML = RadioButtonSet.Question;
			NewLabel.style = "font-weight: bold; ";
			RadioFieldsetObj.appendChild(NewLabel);

			// add a blank line
			RadioFieldsetObj.appendChild(document.createElement("br"));

			for (var i=0; i<RadioButtonSet.Answers.length; i++) {
				// add radio input element
				var NewInputObj = document.createElement("input");
				NewInputObj.type = "radio";
				NewInputObj.name = "RadioButton";
				NewInputObj.id = "RadioButton_" + i;
				NewInputObj.style = "margin-right: 6px; ";
				NewInputObj.value = RadioButtonSet.CorrectIncorrect[i];
				NewInputObj.addEventListener("change", function() { ResetRadioButtonLabels(); UpdateFooter(); }, true);
				RadioFieldsetObj.appendChild(NewInputObj);

				// add hidden input element
				var NewInputObj = document.createElement("input");
				NewInputObj.type = "hidden";
				NewInputObj.id = "RadioComment_" + i;
				NewInputObj.value = RadioButtonSet.Comments[i];
				RadioFieldsetObj.appendChild(NewInputObj);

				// add label element
				var NewLabel = document.createElement("label");
				NewLabel.setAttribute("for", "RadioButton_" + i);
				NewLabel.id = "RadioSetAnswer_" + i;
				NewLabel.innerHTML = RadioButtonSet.Answers[i];
				NewLabel.className = "neutral_answer";
				NewLabel.style = "";
				NewLabel.title = "";
				NewLabel.addEventListener("click", function() { ResetRadioButtonLabels(); }, true);
				RadioFieldsetObj.appendChild(NewLabel);

				// add a blank line
				RadioFieldsetObj.appendChild(document.createElement("br"));				
			}	// for (var i=0; i<RadioButtonSet.Answers.length; i++)
			
			return true;
		}	// function SetUpRadioFieldset ()

		function SetUpFillInFieldset() {
			/*  creates and initializes all elements for the FillInFieldset of Q&A */
			if (! document.getElementById("FillInFieldset")) {
				alert("Fill-In field set not found");
				return false;
			}
			
			// remove all contents from FillInFieldset
			var FillInFieldsetObj = document.getElementById("FillInFieldset");
			while (FillInFieldsetObj.hasChildNodes()) {
				FillInFieldsetObj.removeChild(FillInFieldsetObj.lastChild);
			}

			if (FillInSet.Question.trim().length == 0) {
				FillInFieldsetObj.style.display = "none";
				return true;
			}
			
			// FillInSet is defined as an Object in the mother page
			// FillInSet.Question is initialized in FillInSet.js, e.g. "3. Fill in the blanks."
			// FillInSet.Text is initialized in FillInSet.js, e.g.  "I'm one of those \"cheats\" who must always look words up.";
			// FillInSet.Answers is defined as an array in the mother page and will be defined here
			// FillInSet.Text is HTML text that contains strings enclosed in square brackets;
			// these must be displayed to the student as blank input fields;
			// array FillInSet.Answers will hold the actual strings
			var FillInTempText = FillInSet.Text; // this will be mangeld up as we go
			if ( (FillInTempText.indexOf("^") > -1) || (FillInTempText.indexOf("|") > -1) || (FillInTempText.indexOf("<") > -1) || (FillInTempText.indexOf("{{") > -1) || (FillInTempText.indexOf("}}") > -1) ) {
				alert("Error in the question definition: caret ^, less-than sign <, double curly brackets {{...}}, and vertical line | are not allowed in the text. The fill-in-the-blanks question for this page cannot be displayed.");
				return false;	
			}
			if ( (FillInTempText.indexOf("[") == -1) || (FillInTempText.indexOf("]") == -1) ) {
				alert("Error in the question definition: no blanks are defined. The fill-in-the-blanks question for this page cannot be displayed.");
				return false;	
			}
			
			var FillInTextArr = new Array(0);	// this will hold the strings that precede and follow the bracketed parts
																			// while array FillInSet.Answers will hold the contents of the bracketed parts;
																			// the brackets themselves will be discarded
			var BlankCounter = 0;	// the first blank will have this value at 1, not 0

			while (FillInTempText.indexOf("[") > -1) {
				var BlankStarts = FillInTempText.indexOf("[");
				var BlankEnds = FillInTempText.indexOf("]");
				if ( (BlankStarts > -1) && (BlankEnds > -1) && (BlankEnds > (BlankStarts + 1) ) ) {
					var CurrPrefix = FillInTempText.substring(0, BlankStarts - 1).trim();
					var CurrBlankContent = FillInTempText.substring(BlankStarts + 1, BlankEnds).trim();
					FillInTempText = FillInTempText.substring(BlankEnds + 1,  FillInTempText.length).trim();
					if (CurrBlankContent != "")  {
						BlankCounter++;
					}
					FillInTextArr[BlankCounter] = CurrPrefix;// element 0 remains undefined
					FillInSet.Answers[BlankCounter] = CurrBlankContent; // this may contain a forward slash separating several legitimate correct answers; element 0 remains undefined
				}	// if ( (BlankStarts > -1) && (BlankEnds > -1) && (BlankEnds > (BlankStarts + 1) ) )
			}

			// create required elements for all parts of FillInFieldset
			var NewLabel = document.createElement("label");
			NewLabel.id = "FillInSetQuestion";
			NewLabel.innerHTML = FillInSet.Question;
			NewLabel.style = "font-weight: bold; display: block; margin-bottom: 0px; ";
			FillInFieldsetObj.appendChild(NewLabel);

			// add a blank line
			FillInFieldsetObj.appendChild(document.createElement("br"));
			
			// add the text with embedded input fields
			for (var i=1; i<FillInSet.Answers.length; i++) {
				var SpanObj = document.createElement("span");
				var SpanText = document.createTextNode(FillInTextArr[i] + " ");
				SpanObj.appendChild(SpanText);
				
				var InputObj = document.createElement("input");
				InputObj.type = "text";
				InputObj.size = BlankLength(FillInSet.Answers[i]);
				InputObj.maxLength = BlankLength(FillInSet.Answers[i]);
				InputObj.value = "";
				InputObj.style = "border: none; border-bottom: 1px solid rgb(80, 80, 80); ";
				InputObj.id = "blank_" + i;
				InputObj.name = "blank_" + i;
				InputObj.addEventListener("keyup", function () {this.className='neutral_answer'; UpdateFooter(); }, true);
				FillInFieldsetObj.appendChild(SpanObj);
				FillInFieldsetObj.appendChild(InputObj);
				// add a space
				var SpanObj = document.createElement("span");
				var SpanText = document.createTextNode(" ");
				SpanObj.appendChild(SpanText);
				FillInFieldsetObj.appendChild(SpanObj);
			}	// for (var i=0; i<FillInSet.Answers.length)
			// now append the tail end of FillInTempText
			var SpanObj = document.createElement("span");
			var SpanText = document.createTextNode(FillInTempText);
			SpanObj.appendChild(SpanText);
			FillInFieldsetObj.appendChild(SpanObj);

			return true;
		}	// function SetUpFillInFieldset()
		
		function BlankLength(Str) {
			/* returns an integer, the length of the input field to be used for user to type Str;
				because we don't want the length of the field to suggest the length of the expected string,
				this will be a number that is 2 to 5 greater (randomly) than the length of Str */
				var longestSubStr = ""; // Str may be a series of strings separated with forward slashed; we have to accommodate the longest of them
				if (Str.indexOf("/") > -1) {
					StrArr = Str.split("/");
					for (var i=0; i<StrArr.length; i++) {
						if (longestSubStr.trim().length < StrArr[i].length) {
							longestSubStr = StrArr[i].trim();
						}
					}
					Str = longestSubStr;
				}
				return (1 + Math.floor((Math.random() * 4) + Str.length) );
		}	// function BlankLength(Str)
		
		function SetUpCheckBoxFieldset() {
			/*  creates and initializes all elements for the CheckBoxFieldset of Q&A */
			if (! document.getElementById("CheckBoxFieldset")) {
				alert("Check box field set not found");
				return false;
			}
			
			// remove all contents from CheckBoxFieldset
			var CheckBoxFieldsetObj = document.getElementById("CheckBoxFieldset");
			while (CheckBoxFieldsetObj.hasChildNodes()) {
				CheckBoxFieldsetObj.removeChild(CheckBoxFieldsetObj.lastChild);
			}

			if (CheckBoxSet.Answers.length == 0) {
				CheckBoxFieldsetObj.style.display = "none";
				return true;
			}
			
			// create required elements for all parts of CheckBoxFieldset
			// create label for the question
			var NewLabel = document.createElement("label");
			NewLabel.id = "CheckBoxSetQuestion";
			NewLabel.innerHTML = CheckBoxSet.Question;
			NewLabel.style = "font-weight: bold; ";
			CheckBoxFieldsetObj.appendChild(NewLabel);

			// add a blank line
			CheckBoxFieldsetObj.appendChild(document.createElement("br"));

			for (var i=0; i<CheckBoxSet.Answers.length; i++) {
				// add check box input element
				var NewInputObj = document.createElement("input");
				NewInputObj.type = "checkbox";
				NewInputObj.name = "CheckBoxButton_" + i;
				NewInputObj.id = "CheckBoxButton_" + i;
				NewInputObj.style = "margin-right: 6px; ";
				NewInputObj.value = CheckBoxSet.CorrectIncorrect[i];
				NewInputObj.addEventListener("change", function() { ResetCheckBoxLabels(); UpdateFooter(); }, true);
				CheckBoxFieldsetObj.appendChild(NewInputObj);

				// add hidden input element
				var NewInputObj = document.createElement("input");
				NewInputObj.type = "hidden";
				NewInputObj.id = "CheckBoxComment_" + i;
				NewInputObj.value = CheckBoxSet.Comments[i];
				CheckBoxFieldsetObj.appendChild(NewInputObj);

				// add label element
				var NewLabel = document.createElement("label");
				NewLabel.setAttribute("for", "CheckBoxButton_" + i);
				NewLabel.id = "CheckBoxSetAnswer_" + i;
				NewLabel.innerHTML = CheckBoxSet.Answers[i];
				NewLabel.className = "neutral_answer";
				NewLabel.style = "";
				NewLabel.title = "";
				NewLabel.addEventListener("click", function() { ResetCheckBoxLabels(); }, true);
				CheckBoxFieldsetObj.appendChild(NewLabel);

				// add a blank line
				CheckBoxFieldsetObj.appendChild(document.createElement("br"));				
			}	// for (var i=0; i<CheckBoxSet.Answers.length; i++)
			
			return true;
		}	// function SetUpCheckBoxFieldset ()

		function SetUpTypedFieldset() {
			/*  creates and initializes all elements for the SetUpTypedFieldset of Q&A */
			if (! document.getElementById("TypedFieldset")) {
				alert("Type-in box field set not found");
				return false;
			}
			
			// remove all contents from TypedFieldset
			var TypedFieldsetObj = document.getElementById("TypedFieldset");
			while (TypedFieldsetObj.hasChildNodes()) {
				TypedFieldsetObj.removeChild(TypedFieldsetObj.lastChild);
			}

			if (TypedSet.Question.trim() == "") {
				TypedFieldsetObj.style.display = "none";
				return true;
			}
			
			// create required elements for all parts of TypedFieldset
			// create label for the question
			var NewLabel = document.createElement("label");
			NewLabel.id = "TypedSetQuestion";
			NewLabel.innerHTML = TypedSet.Question;
			NewLabel.style = "font-weight: bold; ";
			NewLabel.title = "";
			TypedFieldsetObj.appendChild(NewLabel);

			// add a blank line
			TypedFieldsetObj.appendChild(document.createElement("br"));

			// add text input element
/* use this if you want a one-line box
			var NewInputObj = document.createElement("input");
			NewInputObj.type = "text";
			NewInputObj.size = "70";
			NewInputObj.maxLength = "250";
			NewInputObj.style = "padding: 0px 2px 0px 6px; width: 90%; ";
*/
/* use this if you want a multi-line box */
			var NewInputObj = document.createElement("textarea");
			NewInputObj.type = "text";
			NewInputObj.cols = "70";	// most browsers obey dimensions set in style and don't need this, but Safari on Mac OSX requires it
			NewInputObj.rows = "4";
			NewInputObj.maxLength = "500";
			NewInputObj.style = "padding: 0px 2px 0px 6px; width: " + TextBoxWidth + "; height: " + TextBoxHeight + "; margin-bottom: 0px; ";
/* end of the specific multi-line box properties */

			NewInputObj.name = "TypedInputField_" + 0;
			NewInputObj.id = "TypedInputField_" + 0;
			NewInputObj.value = "";
			NewInputObj.onkeyup = function() {if (this.value.length > (this.maxLength - 1) ) alert("You have reached the limit of " + this.maxLength + " characters."); top.ConfirmOnBeforeUnload = true; }; // true for ConfirmOnBeforeUnload will ask for confirmation when leaving the page
			TypedFieldsetObj.appendChild(NewInputObj);

			// add hidden input element
			var NewInputObj = document.createElement("input");
			NewInputObj.type = "hidden";
			NewInputObj.id = "TypedSetComment_" + 0;
			NewInputObj.value = TypedSet.Comments[0];
			TypedFieldsetObj.appendChild(NewInputObj);
			
			return true;
		}	// function SetUpTypedFieldset ()
		
		function ValidateQuestions() {
			/* checks the syntactic validity of the questions displayed on this page */	
			if ( document.getElementById("RadioSetQuestion") ) {
				if 	( (document.getElementById("RadioSetQuestion").innerText.indexOf("^") > -1) ||  (document.getElementById("RadioSetQuestion").innerText.indexOf("|") > -1)  ||  (document.getElementById("RadioSetQuestion").innerText.indexOf("=") > -1)) {
					alert("Characters ^ = | (equal sign, caret, and vertical line) are not allowed in questions. Correct the radio button question.");
					return false;
				}
			}

			if ( document.getElementById("CheckBoxSetQuestion") ) {
				if 	( (document.getElementById("CheckBoxSetQuestion").innerText.indexOf("^") > -1) ||  (document.getElementById("CheckBoxSetQuestion").innerText.indexOf("|") > -1)  ||  (document.getElementById("CheckBoxSetQuestion").innerText.indexOf("=") > -1)) {
					alert("Characters ^ = | (equal sign, caret, and vertical line) are not allowed in questions. Correct the check box question.");
					return false;
				}
			}

			if ( document.getElementById("TypedSetQuestion") ) {
				if 	( (document.getElementById("TypedSetQuestion").innerText.indexOf("^") > -1) ||  (document.getElementById("TypedSetQuestion").innerText.indexOf("|") > -1)  ||  (document.getElementById("TypedSetQuestion").innerText.indexOf("=") > -1)) {
					alert("Characters ^ = | (equal sign, caret, and vertical line) are not allowed in questions. Correct the type-in question.");
					return false;
				}
			}

			if ( document.getElementById("FillInSetQuestion") ) {
				if 	( (document.getElementById("FillInSetQuestion").innerText.indexOf("^") > -1) ||  (document.getElementById("FillInSetQuestion").innerText.indexOf("|") > -1)  ||  (document.getElementById("FillInSetQuestion").innerText.indexOf("=") > -1)) {
					alert("Characters ^ = | (equal sign, caret, and vertical line) are not allowed in questions. Correct the fill-in question.");
					return false;
				}
			}

			return true;
		}	// function ValidateQuestions()
		
		function ValidateAnswers() {
			/* checks the syntactic validity of the possible answers displayed on this page */	

			if (RadioButtonSet.Answers.length > 0) {
				for (var i=0; i<RadioButtonSet.Answers.length; i++) {
					if ( ! document.getElementById("RadioSetAnswer_" + i) ) {
						alert("A radio button for an answer is missing.");
						return false;
					} else {
						if ( (document.getElementById("RadioSetAnswer_" + i).innerText.indexOf("^") > -1) || (document.getElementById("RadioSetAnswer_" + i).innerText.indexOf("|") > -1) || (document.getElementById("RadioSetAnswer_" + i).innerText.indexOf("=") > -1) ) {
							alert("Characters ^ = | (equal sign, caret, and vertical line) are not allowed in possible answers. Correct answers to radio-button questions.");
							return false;
						}
					}
				}	// for (var i=0; i<RadioButtonSet.length; i++)
			}	// if (RadioButtonSet.Answers.length > 0)

			if (CheckBoxSet.Answers.length > 0) {
				for (var i=0; i<CheckBoxSet.Answers.length; i++) {
					if ( ! document.getElementById("CheckBoxSetAnswer_" + i) ) {
						alert("A check-box is missing for " + CheckBoxSet.Answers[i]);
						return false;
					} else {
						if ( (document.getElementById("CheckBoxSetAnswer_" + i).innerText.indexOf("^") > -1) || (document.getElementById("CheckBoxSetAnswer_" + i).innerText.indexOf("|") > -1) || (document.getElementById("CheckBoxSetAnswer_" + i).innerText.indexOf("=") > -1) || (document.getElementById("CheckBoxSetAnswer_" + i).innerText.indexOf("/") > -1) ) {
							alert("Characters ^ = | / (equal sign, caret, vertical line, and forward slash) are not allowed in possible answers. Correct answers to check-box questions.");
							return false;
						}
					}
				}	// for (var i=0; i<CheckBoxSet.length; i++)
			}	// if (CheckBoxSet.Answers.length > 0)

			if (FillInSet.Answers.length > 0) {
				for (var i=1; i<FillInSet.Answers.length; i++) {	// the first blank is field "blank_1"
					if ( ! document.getElementById("blank_" + i) ) {
						alert("A fill-in blank is missing for " + FillInSet.Answers[i]);
						return false;
					}
				}	// for (var i=0; i<CheckBoxSet.length; i++)
			}	// if (FillInSet.Answers.length > 0)
			
			return true;
		}	// function ValidateAnswers()
		
		function ValidateCorectIncorrect() {
			/* checks the syntactic validity of the CorrectIncorrect values stored on this page */	

			if (RadioButtonSet.Answers.length > 0) {
				for (var i=0; i<RadioButtonSet.Answers.length; i++) {
					if ( ! document.getElementById("RadioButton_" + i) ) {
						alert("A radio button corrrect-incorrect field is missing.");
						return false;
					} else {
						if ( (document.getElementById("RadioButton_" + i).value != "Correct") && (document.getElementById("RadioButton_" + i).value != "Incorrect") ) {
							alert("Unexpected value in the correct-incorrect field. Fix radio-button questions.");
							return false;
						}
					}
				}	// for (var i=0; i<RadioButtonSet.length; i++)
			}	// if (RadioButtonSet.Answers.length > 0)

			if (CheckBoxSet.Answers.length > 0) {
				for (var i=0; i<CheckBoxSet.Answers.length; i++) {
					if ( ! document.getElementById("CheckBoxButton_" + i) ) {
						alert("A check-box button corrrect-incorrect field is missing.");
						return false;
					} else {
						if ( (document.getElementById("CheckBoxButton_" + i).value != "Correct") && (document.getElementById("CheckBoxButton_" + i).value != "Incorrect") ) {
							alert("Unexpected value in the correct-incorrect field. Fix check-box questions.");
							return false;
						}
					}
				}	// for (var i=0; i<CheckBoxSet.length; i++)
			}	//	 if (CheckBoxSet.Answers.length > 0)
			
			return true;
		}	// function ValidateCorectIncorrect()

		function SubmitButtonClicked() {
			/* called when button SubmitOrCheckButton is clicked; action depends on QandAMode and AttemptCount */	

			switch (QandAMode) {
				case "LastStored" :
					if (ValidateResponses() ) {
						if (PrepareResponseList() !='') {
							Evaluate();
							StoreResponseList();
							AttemptCount++;
						}
					}
					break;
				case "FirstStored" :
					if (AttemptCount <= 0) {
						if (ValidateResponses() ) {
							if (PrepareResponseList() !='') {
								Evaluate();
								StoreResponseList();
								AttemptCount++;
							}	// if (ValidateResponses()
							UpdateSubmitButton();
							UpdateFooter();
						}
					} else {
						Evaluate();
					}
					break;
				case "NoneStored" :
					top.ConfirmOnBeforeUnload = false;	// don't ask for confirmation when leaving the page
					Evaluate();
					break;
				default :
					alert("Unexpected Q&A mode in UpdateSubmitButton.");
					break;				
			}	// switch (QandAMode)
		}	// function SubmitButtonClicked()

		function UpdateSubmitButton() {
			/* called to change the label and the onclick action for the button */
			if (! document.getElementById("SubmitOrCheckButton"))	 {
				alert("Error in page: Submit button not found.");
			} else {
				var SubmitButtonObj = document.getElementById("SubmitOrCheckButton");

				switch (QandAMode) {
					case "LastStored" :
						SubmitButtonObj.innerHTML = "Submit";
						break;
					case "FirstStored" :
						if (AttemptCount == 0) {
							SubmitButtonObj.innerHTML = "Submit";
						} else {
							if (CorrectAnswersSubmitted) {
								SubmitButtonObj.innerHTML = "";
								SubmitButtonObj.style.display	 = "none";
							} else {
								if ( ( (RadioButtonSet.Question != "") && (! EvaluateRadioButtonAnswer()) ) || ( (CheckBoxSet.Question != "") && (! EvaluateCheckBoxAnswers()) ) || ( (FillInSet.Question != "") && (! EvaluateFillInAnswers()) ) ) {
									SubmitButtonObj.innerHTML = "Check";
								} else {
									SubmitButtonObj.innerHTML = "";								
									SubmitButtonObj.style.display	 = "none";
								}
							}
						}
						break;
					case "NoneStored" :
							if ( ( (RadioButtonSet.Question != "") && (! EvaluateRadioButtonAnswer()) ) || ( (CheckBoxSet.Question != "") && (! EvaluateCheckBoxAnswers()) ) || ( (FillInSet.Question != "") && (! EvaluateFillInAnswers()) ) ) {
								SubmitButtonObj.innerHTML = "Check";
							} else {
								SubmitButtonObj.innerHTML = "";								
								SubmitButtonObj.style.display	 = "none";
							}
						break;
					default :
						alert("Unexpected Q&A mode in UpdateSubmitButton.");
						break;				
				}	// switch (QandAMode)
			}	// if (! document.getElementById("SubmitOrCheckButton"))
		}	// function UpdateSubmitButton()

		function UpdateRadioButtonSet(RadioQuestionText, RadioAnswerText, RadioAnswerCorrect) {
			/* called to display the retrieved values for the radio button question, RadioQuestionText, RadioAnswerText;
				RadioAnswerCorrect (true/false) indicates whether the answer is correct */
			if (document.getElementById("RadioSetQuestion") ) {
				if (document.getElementById("RadioSetQuestion").innerHTML != RadioQuestionText) {
					alert("The radio-button question has been edited since you answered it, but we will display your answer anyway.");
				}
				for (var i=0; i<RadioButtonSet.Answers.length; i++) {
					if (document.getElementById("RadioSetAnswer_" + i).innerText == RadioAnswerText) {
						document.getElementById("RadioButton_" + i).checked = true;
						if (RadioAnswerCorrect) {
							document.getElementById("RadioSetAnswer_" + i).className = "correct_answer";
						} else {
							document.getElementById("RadioSetAnswer_" + i).className = "incorrect_answer";
						}
						//document.getElementById("RadioSetAnswer_" + i).title = RadioButtonSet.Comments[i];
					}
				}	// for (var i=0; i<RadioButtonSet.Answers.length; i++)
			}	 // if (document.getElementById("RadioSetQuestion")
		}	// function UpdateRadioButtonSet(RadioQuestionText, RadioAnswerText)
		
		function UpdateFillInSet(FillInQuestionText, FillInAnswerText, FillInAnswerCorrect) {
			/* called to display the retrieved values for the fill-in question, i.e. FillInQuestionText and FillInAnswerText;
				FillInAnswerCorrect (true/false) indicates whether all the answers are correct (which is not useful in this function:
				we want to know if each item is correct or not) */
			
			if (document.getElementById("FillInSetQuestion") ) {
				if (document.getElementById("FillInSetQuestion").innerHTML != FillInQuestionText) {
					alert("The fill-in question has been edited since you answered it, but we will display your answer anyway.");
				} 
				
				// the text for the fill-in question is already displayed; we need to display the values of the retrieved answers
				// in the input fields "blank_1", "blank_2", etc.
				
				//in FillInAnswerText, the answers that were submitted by the student are flanked by {{...}} characters;
				// convert them to an array
				var RetrievedAnsArr = new Array(0);
				var BlankCounter = 0;
				while ( (FillInAnswerText.indexOf("{{") > -1 ) && (BlankCounter < 500) ) {
					BlankCounter++;	// first blank will go into field "blank_1" (0 is not used)
					var BlankStarts = FillInAnswerText.indexOf("{{");
					var BlankEnds = FillInAnswerText.indexOf("}}", BlankStarts + 1);
					if ( (BlankStarts > -1) && (BlankEnds > -1) && (BlankEnds > BlankStarts) ) {
						var BlankText = FillInAnswerText.substring(BlankStarts + 2, BlankEnds).trim();
						RetrievedAnsArr[BlankCounter] = BlankText;
						FillInAnswerText = FillInAnswerText.substr(BlankEnds + 2).trim();
					}
				}	// while ( (FillInAnswerText.indexOf("{{") > -1 ) && (BlankCounter < 500) )
				// we have an array of retrieved answers, RetrievedAnsArr
				
				if (FillInSet.Answers.length != RetrievedAnsArr.length) {
					alert("It appears that the fill-in-the-blanks question has been revised since you submitted your answers for it. We'll display what we can. (The number of answers retrieved from your account does not match the number of blanks in the text.)");
				}
				
				for (var i=1; i<RetrievedAnsArr.length; i++) {
					if (document.getElementById("blank_" + i) ) {
						var CurrRetrievedAns = RetrievedAnsArr[i];
						if (i < FillInSet.Answers.length) {
							var CurrCorrectAns = 	FillInSet.Answers[i];	// this may be a series of possible correct answers separated by /
							document.getElementById("blank_" + i).value = CurrRetrievedAns;
							if (MatchOneFillIn(CurrRetrievedAns, CurrCorrectAns)) {	// this answer is correct
								document.getElementById("blank_" + i).className = "correct_answer";
							} else {
								document.getElementById("blank_" + i).className = "incorrect_answer";									
							}
						}	//if (i < FillInSet.Answers.length)
					}	// if (document.getElementById("blank_" + i) )
				}	// for (var i=0; i<FillInSet.Answers.length; i++)
			}	// if (document.getElementById("FillInSetQuestion") )
		}	// function UpdateFillInSet(FillInQuestionText, FillInAnswerText, FillInAnswerCorrect)
		
		function UpdateCheckBoxSet(CheckBoxSetQuestionText, CheckBoxSetAnswerText, CheckBoxAnswerCorrect) {
			/* called to display the retrieved values for the check-box question, CheckBoxSetQuestionText, CheckBoxSetAnswerText;
				CheckBoxAnswerCorrect (true/false) indicates whether all the answers are correct (which is not useful in this function:
				we want to know if each item is correct or not) */
			if (document.getElementById("CheckBoxSetQuestion") ) {
				if (document.getElementById("CheckBoxSetQuestion").innerHTML != CheckBoxSetQuestionText) {
					alert("The check-box question has been edited since you answered it, but we will display your answer anyway.");
				} 
				var CheckBoxSetAnswerArr = CheckBoxSetAnswerText.split("/");
				
				// loop over existing checkbox texts and when a match is found to an element in CheckBoxSetAnswerArr, check the box
				for (var i=0; i<CheckBoxSet.Answers.length; i++) {
					var CurrDisplayedAnswer = CheckBoxSet.Answers[i]; // this is the current check-box text that is already displayed
	
					//var CurrRetrievedAnswer = document.getElementById("CheckBoxSetAnswer_" + i).innerText.trim(); 
					// loop over the retrieved strings
					for (var j=0; j<CheckBoxSetAnswerArr.length; j++) {
						var CurrRetrievedAnswer = CheckBoxSetAnswerArr[j].trim();
						if (CurrDisplayedAnswer == CurrRetrievedAnswer) {
							document.getElementById("CheckBoxButton_" + i).checked = true;	
						}
					}
				}	// for (var i=0; i<CheckBoxSet.Answers.length; i++)			
				
				// now that the right boxes are checked, go over them all and mark their correctness/incorrectness,
				// i.e. if the box was correctly checked by the student, hilite it as correct; if it was incorrectly 
				// checked by the student, mark it as incorrect; if it wasn't checked, leave it unmarked
				
				// loop over all checkboxes
				for (var i=0; i<CheckBoxSet.Answers.length; i++) {
					var CurrDisplayedAnswer = CheckBoxSet.Answers[i]; // this is the current check-box text that is already displayed
					var CurrBoxChecked = document.getElementById("CheckBoxButton_" + i).checked;
					var CurrBoxShouldBeChecked = (CheckBoxSet.CorrectIncorrect[i] == "Correct");
					if (CurrBoxChecked == CurrBoxShouldBeChecked) {
						if (CurrBoxChecked) {
							document.getElementById("CheckBoxSetAnswer_" + i).className = "correct_answer";
						} else {
							document.getElementById("CheckBoxSetAnswer_" + i).className = "neutral_answer";
						}
					} else {
						if (CurrBoxChecked) {
							document.getElementById("CheckBoxSetAnswer_" + i).className = "incorrect_answer";
						} else {
							document.getElementById("CheckBoxSetAnswer_" + i).className = "neutral_answer";
						}
					}
					//document.getElementById("CheckBoxSetAnswer_" + i).title = CheckBoxSet.Comments[i]
				}	// for (var i=0; i<CheckBoxSet.Answers.length; i++)
			}	// if (document.getElementById("CheckBoxSetQuestion") )				
		}	// function UpdateCheckBoxSet(CheckBoxSetQuestionText, CheckBoxSetAnswerText)

		function UpdateTypedSet(TypedQuestionText, TypedAnswerText) {
			/* called to display the retrieved values for thetype-in question, TypedQuestionText, TypedAnswerText */
			if (document.getElementById("TypedSetQuestion") ) {
				if (TypedSet.Question != "") {
					if (document.getElementById("TypedSetQuestion").innerText != TypedQuestionText) {
						alert("The type-in question has been edited since you answered it, but we will display your answer anyway.");
					}
				
					if (! document.getElementById("TypedInputField_0")) {
						alert("Error: the field for your typed-in question is missing.");
					} else {
						document.getElementById("TypedInputField_0").value = TypedAnswerText;
					}
				}	// if (TypedSet.Question != "")
			}	// (document.getElementById("TypedSetQuestion") )
		} 	// function UpdateTypedSet(TypedQuestionText, TypedAnswerText)
		
		function ParseRetrievedQuestionResponseList(ResponseText) {
			/* automatically called when the previously submitted responses for this screen are retrieved from the server;
				ResponseText is a caret-delimited list of name=value pairs, e.g.
				Question 1=Yes^Question 2=No^My personal opinion?=This really shines!
				
				the number of such name=value pairs must match the number of question sets displayed in this page;
				since we allow one radio-button question, plus one check-box question, plus one type-in question per page,
				and they are all optional, that number can be 0 to 3; (actually, if it is 0, we never get to this point)
				
				each of the ^-delimited lists is preceded by a keyword that flags its type:
				"RadioButtonSet:"
				"CheckBoxSet:"
				"FillInSet:"
				"TypedSet:"
				the first three keywords are followed by the digit 1 or 0; 1 if the question was answered correctly, 0 otherwise;
				there's no such info for the TypedSet, as there is no correct or incorrect answer there;
				
				note that the retrieval is done, or at least attempted, in wal_api.js even when QandAMode is "NoneStored";
				this is because the same routines are used for storing and retrieving column QuestionResponseList
				in all sorts of situations, not just for questions-and-answers, as here; and we don't want to fracture and multiply our routines;
			 */
			if (ResponseText == "") {		// not an error: nothing was stored on any previous visit
						return false;
			}

			 if (QandAMode != "NoneStored") {		// even if the answers have been previously stored in this student's account, and are now retreved, they are not displayed in this mode
				 var ExpectedNameValuePairsCount = 0;
				 if (RadioButtonSet.Answers.length != 0) {
					 ExpectedNameValuePairsCount++;
				 }
				 if (CheckBoxSet.Answers.length != 0) {
					 ExpectedNameValuePairsCount++;
				 }
				 if (TypedSet.Comments.length != 0) {
					 ExpectedNameValuePairsCount++;
				 }
				 if (FillInSet.Question.length != 0) {
					 ExpectedNameValuePairsCount++;
				 }
	
				if (ResponseText != "") {
					var TheForm = document.getElementById("QandAForm");
					var FieldsetColl = document.getElementsByTagName("fieldset");
					if ( (FieldsetColl == null) || (TheForm == null) ){
						alert("Error in page: crucial element not found.");
						return false;
					}
				}	// ResponseText may legitimately be blank (although then this function should not have been called)
				
				var ResponseTextArr = ResponseText.split("^");
				if (ResponseTextArr.length == 0) {
					alert("Your previously submitted responses could not be retrieved.");
					return false;
				}
	
				// Each name=value pair begins with a keyword that indicates which question type it belongs to:
				// "RadioButtonSet:" or "CheckBoxSet:" or "TypedSet:"

				for (var k=0; k<ResponseTextArr.length; k++) {
					var CurrPair = ResponseTextArr[k];
					var KeyStr = CurrPair.split(":")[0];
					switch (KeyStr) {
						case "RadioButtonSet" :
							var RadioAnswerCorrect = (CurrPair.substr(15, 1) == "1");
							CurrPair = CurrPair.substr(16, CurrPair.length-16); // remove the prefix, which is "RadioButtonSet:1" if the retrieved answer is correct or "RadioButtonSet:0" otherwise
							var RadioQuestionText = CurrPair.split("=")[0].trim();
							var RadioAnswerText = CurrPair.split("=")[1].trim();
							UpdateRadioButtonSet(RadioQuestionText, RadioAnswerText, RadioAnswerCorrect);				
							break;
						case "CheckBoxSet" :
							var CheckBoxAnswerCorrect = (CurrPair.substr(12, 1) == "1");
							CurrPair = CurrPair.substr(13, CurrPair.length-13); // remove the prefix, which is "CheckBoxSet:1" if the retrieved answer is correct or "CheckBoxSet:0" otherwise
							var CheckBoxSetQuestionText = CurrPair.split("=")[0].trim();
							var CheckBoxSetAnswerText = CurrPair.split("=")[1].trim();	// if more than one check-box was submitted, the multiple values are separated by forward slash
							UpdateCheckBoxSet(CheckBoxSetQuestionText, CheckBoxSetAnswerText, CheckBoxAnswerCorrect);					
							break;
						case "TypedSet" :
							CurrPair = CurrPair.substr(9, CurrPair.length-9);
							var TypedQuestionText = CurrPair.split("=")[0].trim();
							var TypedAnswerText = CurrPair.split("=")[1].trim();
							UpdateTypedSet(TypedQuestionText, TypedAnswerText);
							break;
						case "FillInSet" :
							var FillInAnswerCorrect = (CurrPair.substr(10, 1) == "1");
							CurrPair = CurrPair.substr(11, CurrPair.length-10);
							var FillInQuestionText = CurrPair.split("=")[0].trim();
							var FillInAnswerText = CurrPair.split("=")[1].trim();
							UpdateFillInSet(FillInQuestionText, FillInAnswerText, FillInAnswerCorrect);
							break;
						default :
							alert("Error when parsing the retrieved answers: unknown question type (" + KeyStr + "). Your previously saved answers cannot be displayed.");
							k = ResponseTextArr.length;
							return false;
					}	// switch (KeyStr)
				}	// for (var k=0; k<ResponseTextArr.length; k++)
			}	//  if (QandAMode != "NoneStored")

			// if we are here, the retieval was successful, and if QandAMode is "FirstStored", no more attempts are allowed
			if (QandAMode == "FirstStored") {
				AttemptCount++;
				UpdateSubmitButton();
				UpdateFooter();
			}
			return true;
		}	// function ParseRetrievedQuestionResponseList(ResponseText)
		
		function ValidateResponses() {
			/* validates the user's selection for all questions; returns false after displaying an error message
				if a question hasn't been answered, and doesn't look beyond that question (lazy validation)*/
			
			var TheForm = document.getElementById("QandAForm");
			if (TheForm == null) {
				alert("Error in page: crucial element not found.");
				return false;
			}
						
			if (document.getElementById("RadioSetQuestion")) {
				var RadioQuestionText = document.getElementById("RadioSetQuestion").innerHTML.trim();
			} else {
				var RadioQuestionText = "";	// this is not an error
			}
			if (document.getElementById("CheckBoxSetQuestion")) {
				var CheckBoxQuestionText = document.getElementById("CheckBoxSetQuestion").innerHTML.trim();
			} else {
				var CheckBoxQuestionText = "";	// this is not an error
			}
			if (document.getElementById("TypedSetQuestion")) {
				var TypedQuestionText = document.getElementById("TypedSetQuestion").innerHTML.trim();
			} else {
				var TypedQuestionText = "";	// this is not an error
			}						
			if (document.getElementById("FillInSetQuestion")) {
				var FillInSetQuestionText = document.getElementById("FillInSetQuestion").innerHTML.trim();
			} else {
				var FillInSetQuestionText = "";	// this is not an error
			}

			var RadioText = ""; // if RadioQuestionText is non-blank, this also must be non-blank
			var CheckBoxText = ""; // if CheckBoxQuestionText is non-blank, this also must be non-blank
			var TypedText = ""; // if TypedQuestionText is non-blank, this also must be non-blank
			var FillInText = ""; // if FillInQuestionText is non-blank, this also must be non-blank
						
			// check the answer to radio button question
			if (RadioQuestionText != "") {
				// look for the checked radio button	
				var RadioIndexChecked = -1;
				for (var i=0; i<TheForm.elements["RadioButton"].length; i++) {
					if (TheForm.elements["RadioButton_" + i].checked) {
						RadioIndexChecked = i; 
					}
				}
				if (RadioIndexChecked < 0) {
					alert("Select an answer to the radio-button question.");	
				return false;
				} 				
			}	// if (RadioQuestionText != "")
						
			// check the answers to the checked boxes
			if (CheckBoxQuestionText != "") {
				CheckBoxAnswered = false;
				for (var i=0; i<CheckBoxSet.Answers.length; i++) {
					if (TheForm.elements["CheckBoxButton_" + i].checked) {
						CheckBoxAnswered = true;
					}
				}
				if (! CheckBoxAnswered) {
					alert("Mark at least one check box to answer the question.");	
					return false;
				}
			}	// if (CheckBoxSetQuestion != "")			
						
			// check the answer to the typed-in question
			if (TypedQuestionText != "") {
				TypedAnswerText = TheForm.elements["TypedInputField_0"].value.trim();
				if (TypedAnswerText == "") {
					alert("Provide an answer to the type-in question.");
					return false;
				}
			}	// if (TypedQuestionText != "")

			// check the answer to the fill-in question
			if (FillInSetQuestionText != "") {
				FillInAnswerText = "";
				for (var i=1; i<FillInSet.Answers.length; i++) {

					if (document.getElementById("blank_" + i) ) {
						if (document.getElementById("blank_" + i).value.trim() == "") {
							alert("Provide an answer in each fill-in-the-blanks box. There are no 'trick' boxes: each box must have some text.");	
							document.getElementById("blank_" + i).focus();
							return false;	
						} else {
							FillInAnswerText = FillInAnswerText + document.getElementById("blank_" + i).value.trim();
						}
					} else {
						alert("Program error: fill-in-the-blank box 'blank_'" + i + " not found.");
						return false;	
					}	// if (document.getElementById("blank_" + i) )
				}	// for (var i=1; i<FillInSet.Answers.length; i++)
				if ( (FillInAnswerText.indexOf("^") > -1) || (FillInAnswerText.indexOf("=") > -1) || (FillInAnswerText.indexOf("|") > -1) || (FillInAnswerText.indexOf("<") > -1) || (FillInAnswerText.indexOf("{{") > -1) || (FillInAnswerText.indexOf("}}") > -1) ) {
					alert("Characters ^ = | {{ }} < (caret, equal sign, vertical line, double curly brackets, and less-than sign) are not expected (or even allowed) in the fill-in-the-blanks boxes. Sorry.");
					return false;	
				}
			}	// if (FillInSetQuestionText != "")

			return true;
		}	// function ValidateResponses()
				
		function PrepareResponseList() {
			/* collects bits of data from this page and puts them into caret-delimited name=value pairs that
				are concatenated into one string, QuestionResponseList, of the following format:
				"Question 1=Yes^Question2=No^Your opinion=I have always liked her!"
				Each name=value pair begins with a keyword that indicates which question type it belongs to:
				"RadioButtonSet:" or "CheckBoxSet:" or "TypedSet:" or "FillInSet:, e.g.
				"RadioButtonSet:How old are <i>you</i>?=Older that you \"think\"!"
				
				if any of the expected bits are not found, returns "" without looking for the rest of the answers;
				 */
			
			var QuestionResponseList = "";
			var TheForm = document.getElementById("QandAForm");
			var FieldsetColl = document.getElementsByTagName("fieldset");
			if ( (FieldsetColl == null) || (TheForm == null) ){
				alert("Error in page: crucial element not found.");
				return "";
			}

			if (FieldsetColl.length == 0) {
				alert("Error in page: no questions found.");
				return "";
			}
						
			if (document.getElementById("RadioSetQuestion")) {
				var RadioQuestionText = document.getElementById("RadioSetQuestion").innerHTML.trim();
			} else {
				var RadioQuestionText = "";	// this is not an error
			}
			if (document.getElementById("CheckBoxSetQuestion")) {
				var CheckBoxQuestionText = document.getElementById("CheckBoxSetQuestion").innerHTML.trim();
			} else {
				var CheckBoxQuestionText = "";	// this is not an error
			}
			if (document.getElementById("TypedSetQuestion")) {
				var TypedQuestionText = document.getElementById("TypedSetQuestion").innerHTML.trim();
			} else {
				var TypedQuestionText = "";	// this is not an error
			}
			if (document.getElementById("FillInSetQuestion")) {
				var FillInSetQuestionText = document.getElementById("FillInSetQuestion").innerHTML.trim();
			} else {
				var FillInSetQuestionText = "";	// this is not an error
			}

			var RadioText = ""; // if RadioQuestionText is non-blank, this also must be non-blank
			var CheckBoxText = ""; // if CheckBoxQuestionText is non-blank, this also must be non-blank
			var TypedText = ""; // if TypedQuestionText is non-blank, this also must be non-blank
			var FillInText = ""; // if FillInQuestionText is non-blank, this also must be non-blank
						
			// get the answer to radio button question
			if (RadioQuestionText != "") {
				// look for the checked radio button	
				var RadioIndexChecked = -1;
				for (var i=0; i<TheForm.elements["RadioButton"].length; i++) {
					if (TheForm.elements["RadioButton_" + i].checked) {
						RadioIndexChecked = i; 
					}
				}
				if (RadioIndexChecked < 0) {
					alert("Select an answer to the radio-button question.");	
					return "";
				} else {
					RadioAnswerText = document.getElementById("RadioSetAnswer_" + RadioIndexChecked).innerText.trim();
				}
				var RadioButtonAnswersCorrect = EvaluateRadioButtonAnswer(); // this is 1 for correct or 0 for incorrect

				RadioText = "RadioButtonSet:" + RadioButtonAnswersCorrect + RadioQuestionText + "=" + RadioAnswerText;
			}	// if (RadioQuestionText != "")
						
			// get the answers to the checked boxes
			if (CheckBoxQuestionText != "") {
				CheckBoxAnswerText = "";
				for (var i=0; i<CheckBoxSet.Answers.length; i++) {
					if (TheForm.elements["CheckBoxButton_" + i].checked) {
						if (CheckBoxAnswerText == "") {
							CheckBoxAnswerText = document.getElementById("CheckBoxSetAnswer_" + i).innerText.trim(); 
						} else {
							CheckBoxAnswerText = CheckBoxAnswerText + " / " + document.getElementById("CheckBoxSetAnswer_" + i).innerText.trim(); 
						}
					}
				}
				if (CheckBoxAnswerText == "") {
					alert("Mark at least one check box to answer the question.");	
					return "";
				} else {
					var CheckBoxAnswersCorrect = EvaluateCheckBoxAnswers(); // this is 1 for correct or 0 for incorrect
					CheckBoxText = "CheckBoxSet:" + CheckBoxAnswersCorrect + CheckBoxQuestionText + "=" + CheckBoxAnswerText;
				}
			}	// if (CheckBoxSetQuestion != "")			
						
			// get the answer to the typed-in question
			if (TypedQuestionText != "") {
				TypedAnswerText = TheForm.elements["TypedInputField_0"].value.trim();
				if (TypedAnswerText == "") {
					alert("Provide an answer to the type-in question.");
					return "";
				} else {
					if ( (TypedAnswerText.indexOf("^") > -1) || (TypedAnswerText.indexOf("=") > -1) || (TypedAnswerText.indexOf("|") > -1) || (TypedAnswerText.indexOf("<") > -1) ) {
						alert("Characters ^ = | < (caret, equal sign, vertical line, and less-than sign) are not allowed in the type-in answer. Sorry.");
						return "";
					} else {
						TypedText = "TypedSet:" + TypedQuestionText + "=" + TypedAnswerText;
					}
				}
			}	// if (TypedQuestionText != "")
			// we now have RadioText, CheckBoxText, and TypedText, at least one of which is non-blank; we'll concatenate them into a ^-delimited string

			// check the answer to the fill-in question
			if (FillInSetQuestionText != "") {
				FillInAnswerText = "";
				for (var i=1; i<FillInSet.Answers.length; i++) {
					if (document.getElementById("blank_" + i) ) {
						if (document.getElementById("blank_" + i).value.trim() == "") {
							alert("Provide an answer in each fill-in-the-blanks box. There are no 'trick' boxes: each box must have some text.");	
							document.getElementById("blank_" + i).focus();
							return false;	
						} else {
							FillInAnswerText = FillInAnswerText + document.getElementById("blank_" + i).value.trim();
						}
					} else {
						alert("Program error: fill-in-the-blank box 'blank_'" + i + " not found.");
						return false;	
					}	// if (document.getElementById("blank_" + i) )
				}	// for (var i=1; i<FillInSet.Answers.length; i++)
				
				if ( (FillInAnswerText.indexOf("^") > -1) || (FillInAnswerText.indexOf("=") > -1) || (FillInAnswerText.indexOf("|") > -1) || (FillInAnswerText.indexOf("<") > -1) || (FillInAnswerText.indexOf("{{") > -1) || (FillInAnswerText.indexOf("}}") > -1) ) {
					alert("Characters ^ = | {{ }} < (caret, equal sign, vertical line, double curly brackets, and less-than sign) are not expected (or even allowed) in the fill-in-the-blanks boxes. Sorry.");
					return false;	
				}
				
				// if we are here, all fill-in input fields have legitimate non-blank values
			
				var FillInTextArr = new Array(0);	// this will hold the strings that precede te blanks
				var BlankCounter = 0;	// the first blank will have this value at 1, not 0
	
				var FillInTempText = FillInSet.Text; // this will be mangeld up as we go
				while (FillInTempText.indexOf("[") > -1) {
					var BlankStarts = FillInTempText.indexOf("[");
					var BlankEnds = FillInTempText.indexOf("]");
					if ( (BlankStarts > -1) && (BlankEnds > -1) && (BlankEnds > (BlankStarts + 1) ) ) {
						var CurrPrefix = FillInTempText.substring(0, BlankStarts - 1).trim();
						var CurrBlankContent = FillInTempText.substring(BlankStarts + 1, BlankEnds).trim();
						FillInTempText = FillInTempText.substring(BlankEnds + 1,  FillInTempText.length).trim();
						if (CurrBlankContent != "")  {
							BlankCounter++;
						}
						FillInTextArr[BlankCounter] = CurrPrefix;// element 0 remains undefined
					}	// if ( (BlankStarts > -1) && (BlankEnds > -1) && (BlankEnds > (BlankStarts + 1) ) )
				}
				// we now have array of prefixes FillInTextArr and the tail end of the text in var FillInTempText;
				// we also have the strings typed by the student in all fill-in input fields;
				// these two sets must be merged to create a flowing text intended by the author;
				// while merging them, we will preserve the boundaries by flanking each filled-in Answer with {{...}}; this will help us parse the stored string when it is retrieved
				
				for (var i=1; i<FillInTextArr.length; i++)	 {
					FillInText = FillInText + FillInTextArr[i] + " {{" + document.getElementById("blank_" + i).value.trim() + "}} ";
				}	// for (var i=1; i<FillInTextArr.length;i++)	
				FillInText = FillInText + FillInTempText; 

				// get rid of spaces before punctuation (I hear this beats the peformance of regexp)
				FillInText = FillInText.split(" .").join(".");
				FillInText = FillInText.split(" !").join("!");
				FillInText = FillInText.split(" ?").join("?");
				FillInText = FillInText.split(" ;").join(";");
				FillInText = FillInText.split(" :").join(":");
				
				var FillInAnswersCorrect = EvaluateFillInAnswers(); // this is 1 for correct or 0 for incorrect
				FillInText = "FillInSet:" + FillInAnswersCorrect + FillInSetQuestionText + "=" + FillInText;
			}	// if (FillInSetQuestionText != "")
						
			QuestionResponseList = RadioText + "^" + CheckBoxText + "^" + TypedText + "^" + FillInText;
			QuestionResponseList = QuestionResponseList.split("^^").join("^");	// global replacement in lieu regexp
			while ( (QuestionResponseList.indexOf("^") == 0) || (QuestionResponseList.indexOf("=") == 0)){
				QuestionResponseList = QuestionResponseList.substr(1, QuestionResponseList.length-1);
			}
			while ( (QuestionResponseList.substr(QuestionResponseList.length-1, 1) == "^") || (QuestionResponseList.substr(QuestionResponseList.length-1, 1) == "=") ) {
				QuestionResponseList = QuestionResponseList.substr(0, QuestionResponseList.length-1);
			}
			while ( (QuestionResponseList.indexOf("^") == 0) || (QuestionResponseList.indexOf("=") == 0)){
				QuestionResponseList = QuestionResponseList.substr(1, QuestionResponseList.length-1);
			}

			return QuestionResponseList;
		}	// function PrepareResponseList()
		
		function StoreResponseList() {
			/* sends the list of responses to the server to be stored in the user's account */
			var ResponseList = PrepareResponseList();
			if (ResponseList != "") {
				StartResponseListUpload(ResponseList);  // when this call completes, the message "answers submitted for #N" is displayed in the sidebar
			}
		}	// function StoreResponseList()
		
		function MatchOneFillIn(CurrAnswer, CorrectAnswer) {
			/* CurrAnswer is a string typed by the student in a fill-in blank;
				CorrectAnswer is the expected string; if more than one string is correct, it lists all variants, separated by /;
				returns true if string CurrAnswer matches CorrectAnswer or one of its variants;
				returns false otherwise */

			// clean the params
			CurrAnswer = CurrAnswer.trim();
			while (CurrAnswer.indexOf("  ") > -1) {
				CurrAnswer = CurrAnswer.replace(/  /g, " ");
			}
			CorrectAnswer = CorrectAnswer.trim();
			while (CorrectAnswer.indexOf("  ") > -1) {
				CorrectAnswer = CorrectAnswer.replace(/  /g, " ");
			}
			
			// do the matching
			if (CorrectAnswer.indexOf("/") > -1) {
				var CorrAnsArr = CorrectAnswer.split("/");
				var CorrFound = false;
				for (var k=0; k<CorrAnsArr.length; k++) {
					var CurrCorrAns = CorrAnsArr[k].trim();
					if (CurrCorrAns.toLowerCase() == CurrAnswer.toLowerCase()) {
						return true;
					}
				}	// for (var k=0; k<CorrAnsArr.length; k++)
			} else {
				return ( CurrAnswer.toLowerCase() == CorrectAnswer.toLowerCase() );
			}	// if (CurrCorrectAns.indexOf("/") > -1)
			
			return false;
		}	// function MatchOneFillIn(CurrAnswer, CorrectAnswer)

		function EvaluateFillInAnswers() {
			/*  returns 1 if the answers to all fill-ins are correct,;
				returns 0 otherwise; */
			var AllFillInsCorrect = true;	// will become false if any incorrect answer was typed by the student
			if (FillInSet.Question != "") {
				// make sure there is no msimatch between the number of fill-in input fields
				// and the number of defined elements in array FillInSet.Answers
				var InputColl = document.getElementsByTagName("input");
				for (var i=0; i<InputColl.length; i++) {
					if (InputColl[i].id.indexOf("blank_") == 0) { // this is a blank to be filled in
						if (InputColl[i].value.trim() == "") {
							if (QandAMode != "NoneStored") {
								alert("All blanks must be filled in: there are no 'trick' blanks.");
							}
							AllFillInsCorrect = false;
							break;
						} else {
							var j = InputColl[i].id.substr(6, InputColl[i].id.length - 6);	// this is the index of the corresponding element in FillInSet.Answers
							if (! FillInSet.Answers[j]) {
								alert("Error in provided correct answers: no answer exists for blank number " + j + ".");
								AllFillInsCorrect = false;
								break;
							} else {
								var CurrCorrAnswer = FillInSet.Answers[j];
								var CurrStudentAnswer = InputColl[i].value;

								if (! MatchOneFillIn(CurrStudentAnswer, CurrCorrAnswer)) {	// this answer is incorrect
									document.getElementById("blank_" + j).className = "incorrect_answer";
									AllFillInsCorrect = false;
									// don't break out of i loop: we need to evaliate and mark all non-blank answers
								} else{
									document.getElementById("blank_" + j).className = "correct_answer";
								}
							}
						}	// if (InputColl[i].value.trim() == "")
					}	// if (InputColl[i].id.indexOf("blank_") == 0)
				}	// for (var i=1; i<FillInSet.Answers.length; i++)
			} 	// if (FillInSetQuestion != "")

			if (AllFillInsCorrect) {				
				return 1;	
			} else {
				return 0;
			}
		}

		function EvaluateCheckBoxAnswers() {
			/*  returns 1 if the answers to all check-boxes are correct,
				i.e. if all the boxes that should be checked are checked, and none of others are;
				returns 0 otherwise; */

			var CheckBoxCorrect = true;
			var NothingChecked = true;
			
			if (CheckBoxSet.Answers.length > 0) {
				for (var i=0; i<CheckBoxSet.Answers.length; i++) {
					if (document.getElementById("CheckBoxButton_" + i).checked) {
						NothingChecked = false;
						if (document.getElementById("CheckBoxButton_" + i).value == "Correct") {
							document.getElementById("CheckBoxSetAnswer_" + i).className = "correct_answer";
							//document.getElementById("CheckBoxSetAnswer_" + i).title = "Correct! " + CheckBoxSet.Comments[i];
						} else {
							document.getElementById("CheckBoxSetAnswer_" + i).className = "incorrect_answer";
							CheckBoxCorrect = false;
							//document.getElementById("CheckBoxSetAnswer_" + i).title = "Incorrect. " + CheckBoxSet.Comments[i];
						}
					} else { // the box is not checked
						if (document.getElementById("CheckBoxButton_" + i).value == "Incorrect") {
							/* don't hilite a box that is correctly left unchecked
							document.getElementById("CheckBoxSetAnswer_" + i).title = "Correct! " + CheckBoxSet.Comments[i]; */
							document.getElementById("CheckBoxSetAnswer_" + i).className = "neutral_answer";
						} else {	// the box should have been checked
							/* don't hilite a box that is incorrectly left unchecked
							document.getElementById("CheckBoxSetAnswer_" + i).title = "Incorrect. " + CheckBoxSet.Comments[i];*/
							document.getElementById("CheckBoxSetAnswer_" + i).className = "neutral_answer";
							 CheckBoxCorrect = false;
						}
					}	// if (document.getElementById("CheckBoxButton_" + i).checked)
				}	// for (var i=0; i<CheckBoxSet.Answers.length; i++)			
			}	// if (CheckBoxSet.Answers.length > 0)
			
			if (CheckBoxCorrect && (! NothingChecked) ) {
				return 1;
			} else {
				return 0;
			}
		}	// function EvaluateCheckBoxAnswers()

		function ClearFillInAnswers() {
			/*  called  to clear the answers in all fill-in blanks */

			if (FillInSet.Answers.length > 0) {
				for (var i=1; i<FillInSet.Answers.length; i++) { // the first answer is element 1; the 0 element is not used
					if (document.getElementById("blank_" + i) ) {
						document.getElementById("blank_" + i).value = "";
						document.getElementById("blank_" + i).className = "neutral_answer";
					}	// if (document.getElementById("blank_" + i) )
				}	// for (var i=1; i<FillInSet.Answers.length; i++)
			}	// if (FillInSet.Answers.length > 0)
		}	// function ClearFillInAnswers()

		function ShowFillInAnswers() {
			/*  called  to show correct answers for all fill-in blanks */

			if (FillInSet.Answers.length > 0) {
				for (var i=1; i<FillInSet.Answers.length; i++) { // the first answer is element 1; the 0 element is not used
					if (document.getElementById("blank_" + i) ) {
						if (FillInSet.Answers[i].indexOf("/") > -1) {	// more than one correct varian is provided; we'll show the first one and display all in the tooltip
							var AnswerToShow = FillInSet.Answers[i].split("/")[0].trim();
							document.getElementById("blank_" + i).title = "More than one answer is possible: " +  FillInSet.Answers[i].trim();
							document.getElementById("blank_" + i).style.cursor = "help";
						} else {
							var AnswerToShow = FillInSet.Answers[i].trim();
						}
						document.getElementById("blank_" + i).value = AnswerToShow;
						document.getElementById("blank_" + i).className = "correct_answer";
					} else {
						alert("Error in page: no blank is found for answer " + FillInSet.Answers[i]);
					}	// if (document.getElementById("blank_" + i) )
				}	// for (var i=1; i<FillInSet.Answers.length; i++)
			}	// if (FillInSet.Answers.length > 0)
		}	// function ShowFillInAnswers()

		function ClearCheckBoxAnswers() {
			/*  called  to clear the answers for all check boxes */

			if (CheckBoxSet.Answers.length > 0) {
				for (var i=0; i<CheckBoxSet.Answers.length; i++) {
					if (document.getElementById("CheckBoxButton_" + i) ) {
						document.getElementById("CheckBoxButton_" + i).checked = false;
						document.getElementById("CheckBoxSetAnswer_" + i).className = "neutral_answer";
					}
				}	// for (var i=0; i<CheckBoxSet.Answers.length; i++)			
			}	// if (CheckBoxSet.Answers.length > 0)
		}	// function ClearCheckBoxAnswers()

		function ShowCheckBoxAnswers() {
			/*  called  to show correct answers for all check boxes */

			if (CheckBoxSet.Answers.length > 0) {
				for (var i=0; i<CheckBoxSet.Answers.length; i++) {
					if (document.getElementById("CheckBoxButton_" + i).value == "Correct") {
						document.getElementById("CheckBoxButton_" + i).checked = true;
						document.getElementById("CheckBoxSetAnswer_" + i).className = "correct_answer";
					} else {
						document.getElementById("CheckBoxButton_" + i).checked = false;
						document.getElementById("CheckBoxSetAnswer_" + i).className = "neutral_answer";
					}	// 

					if ( document.getElementById("CheckBoxSetAnswer_" + i) && document.getElementById("CheckBoxComment_" + i) ) {
						document.getElementById("CheckBoxSetAnswer_" + i).title = document.getElementById("CheckBoxComment_" + i).value;
						document.getElementById("CheckBoxSetAnswer_" + i).style.cursor = "help";
					}			
				}	// for (var i=0; i<CheckBoxSet.Answers.length; i++)			
			}	// if (CheckBoxSet.Answers.length > 0)
		}	// function ShowCheckBoxAnswers()

		function ResetCheckBoxLabels() {
			/* called to reset the style of all radio button labels to neutral */

			for (var i=0; i<CheckBoxSet.Answers.length; i++) {
				if (document.getElementById("CheckBoxSetAnswer_" + i) ) {
					document.getElementById("CheckBoxSetAnswer_" + i).className = "neutral_answer";
				}
			}

			if (QandAMode != "NoneStored" ) {
				top.ConfirmOnBeforeUnload = true;	// ask for confirmation when leaving the page
			}
		}	// function ResetCheckBoxLabels()

		function EvaluateRadioButtonAnswer() {
			/*  returns 1 if all answers in the check-box question are correct;
				returns 0 otherwise; */

			var RadioCorrect = true;
			var NothingChecked = true;
			
			if (RadioButtonSet.Answers.length > 0) {
				for (var i=0; i<RadioButtonSet.Answers.length; i++) {
					if (document.getElementById("RadioButton_" + i).checked) {
						NothingChecked = false;
						if (document.getElementById("RadioButton_" + i).value == "Correct")	 {
							document.getElementById("RadioSetAnswer_" + i).className = "correct_answer";
							//document.getElementById("RadioSetAnswer_" + i).title = "Correct! " + RadioButtonSet.Comments[i];
						} else {
							document.getElementById("RadioSetAnswer_" + i).className = "incorrect_answer";
							//document.getElementById("RadioSetAnswer_" + i).title = " Incorrect. " + RadioButtonSet.Comments[i];
							RadioCorrect = false;
						}
					} else {
						document.getElementById("RadioSetAnswer_" + i).className = "neutral_answer";	
					}// if (document.getElementById("RadioButton_" + i).checked)
				}
			}// if (RadioButtonSet.Answers.length > 0)
			
			if (RadioCorrect && (! NothingChecked) ) {
				return 1;
			} else {
				return 0;
			}						
		}	// function EvaluateRadioButtonAnswer()

		function ClearRadioButtonAnswer() {
			/*  called to clear the answer to the radio button question */

			if (RadioButtonSet.Answers.length > 0) {
				for (var i=0; i<RadioButtonSet.Answers.length; i++) {
					if ( document.getElementById("RadioSetAnswer_" + i) ) {
						document.getElementById("RadioButton_" + i).checked = false;
						document.getElementById("RadioSetAnswer_" + i).className = "neutral_answer";
					}			
				}
			}// if (RadioButtonSet.Answers.length > 0)
		}	// function ClearRadioButtonAnswer()

		function ShowRadioButtonAnswer() {
			/*  called to display the correct answer to the radio button question */

			if (RadioButtonSet.Answers.length > 0) {
				for (var i=0; i<RadioButtonSet.Answers.length; i++) {
					if ( document.getElementById("RadioSetAnswer_" + i) ) {
						if (document.getElementById("RadioButton_" + i).value == "Correct")	 {
							document.getElementById("RadioButton_" + i).checked = true;
							document.getElementById("RadioSetAnswer_" + i).className = "correct_answer";
						} else {
							document.getElementById("RadioButton_" + i).checked = false;
							document.getElementById("RadioSetAnswer_" + i).className = "neutral_answer";	
						}	// if (document.getElementById("RadioButton_" + i).value == "Correct")
	
						if ( document.getElementById("RadioSetAnswer_" + i) && document.getElementById("RadioComment_" + i) ) {
							document.getElementById("RadioSetAnswer_" + i).title = document.getElementById("RadioComment_" + i).value;
							document.getElementById("RadioSetAnswer_" + i).style.cursor = "help";
						}			
					}	// if ( document.getElementById("RadioSetAnswer_" + i) )
				}
			}// if (RadioButtonSet.Answers.length > 0)
		}	// function ShowRadioButtonAnswer()
		
		function ClearTypedAnswer() {
			/*  called to attach Comment to the type-in answer */
			if ( document.getElementById("TypedInputField_0") ) {
				document.getElementById("TypedInputField_0").value = "";
			}			
		}	// ClearTypedAnswer
		
		function ShowTypedAnswer() {
			/*  called to attach Comment to the type-in answer */
			if ( document.getElementById("TypedInputField_0") && document.getElementById("TypedSetComment_0") ) {
				document.getElementById("TypedInputField_0").title = document.getElementById("TypedSetComment_0").value;
			}			
		}	// ShowTypedAnswer()

		function ClearAllAnswers() {
			/* called to clear al answers */
			ClearRadioButtonAnswer();			
			ClearCheckBoxAnswers();
			ClearTypedAnswer();
			ClearFillInAnswers();
			UpdateFooter();
		}	// function ClearAllAnswers()

		function ShowAnswers() {
			/* called to display correct answers and all comments, if any */

			ShowRadioButtonAnswer();			
			ShowCheckBoxAnswers();
			ShowTypedAnswer();
			ShowFillInAnswers();
/* changed my mind about this after providing the "Clear all answers" link
			if (document.getElementById("SubmitOrCheckButton"))	 {
				var SubmitButtonObj = document.getElementById("SubmitOrCheckButton");
				SubmitButtonObj.innerHTML = "";								
				SubmitButtonObj.style.display	 = "none";
			}
*/			
			if (document.getElementById("questions_footer")) {
				document.getElementById("questions_footer").innerHTML = "Hold the mouse over each answer to see more (if provided)."
			}
		}	// function ShowAnswers()

		function ResetRadioButtonLabels() {
			/* called to reset the style of all radio button labels to neutral */
			for (var i=0; i<RadioButtonSet.Answers.length; i++) {
				if (document.getElementById("RadioSetAnswer_" + i) ) {
					document.getElementById("RadioSetAnswer_" + i).className = "neutral_answer";
				}
			}

			if (QandAMode != "NoneStored" ) {
				top.ConfirmOnBeforeUnload = true;	// ask for confirmation when leaving the page
			}
		}	// function ResetRadioButtonLabels()

		function Evaluate() {
			/*  returns true if all answers in radio-button, fill-ins, and check-box questions are correct;
				returns false otherwise;
				ignores type-in question, if any; */
				
			var RadioButtAnsCorr = EvaluateRadioButtonAnswer();	// don't try to combine this line with the next because we need both functions to run
			var CheckBoxAnsCorr = EvaluateCheckBoxAnswers();	// don't try to combine this line with the preceding one
			var FillInAnsCorr = EvaluateFillInAnswers();

			if ( RadioButtAnsCorr && CheckBoxAnsCorr && FillInAnsCorr ) {				
				CorrectAnswersSubmitted = true; // this is a global!
			}
			
			return ( (RadioButtAnsCorr && CheckBoxAnsCorr && FillInAnsCorr) );	// don't try to return CorrectAnswersSubmitted instead: CorrectAnswersSubmitted is a global that is NOT set to false here

		}	// function Evaluate()
