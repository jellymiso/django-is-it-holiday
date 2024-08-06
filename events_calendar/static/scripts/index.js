import { COUNTRY_LIST } from './countries.js'

var indexPage = {
	init: function () {
		var ip = indexPage;
		//
		//initializations
		ip.nexus.init(function(){
			ip.timeline.init();
			ip.geolocation.init();
			ip.fragment.init();
		});

		//
	},
	///Date picker related modules
	timeline: {
		init: function () {
			var ip = indexPage;
			//
			//initializations
			ip.timeline.chronoview.init(function(){	
				ip.timeline.leap.init();
			});
		},
		//for left and right adjacent day control buttons
		leap: {
			//initializations
			init: function(){
				var ip = indexPage;
				var ytd = document.querySelector("#controls .button.left");
				var tmr = document.querySelector("#controls .button.right");

				//click logic for yesterday button
				ytd.onclick = function(){
					//show loader
					ip.aeon.show("Rewinding back recent memories...", function(){
						//process yesterday logic
						ip.timeline.leap.yesterday(function(){
							//hide loader
							ip.aeon.hide(750);
						});
					})
				}

				//click logic for tomorrow button
				tmr.onclick = function(){
					//show loader
					ip.aeon.show("Spinning into the near future...", function(){
						//process tomorrow logic
						ip.timeline.leap.tomorrow(function(){
							//hide loader
							ip.aeon.hide(750);
						});
					})
				}
			},
			//when yesterday is clicked
			yesterday: function (onComplete) {
				//
				var ip = indexPage;
				var queryDate = ip.timeline.chronoview.queryDateTrigger.textContent;
				//
				//get normal date without ordinal suffix
				var normalizedDate = new Date(ip.timeline.wormhole.normalization(queryDate))
				//go back 1 day
				normalizedDate.setDate(normalizedDate.getDate() - 1);
				//change back to ordinal date with suffix
				var ordinalizedDate = ip.timeline.wormhole.ordinalization(normalizedDate)
				//
				//set ordinal date for display
				ip.timeline.chronoview.queryDateTrigger.textContent = ordinalizedDate
				//update calendar since value changed
				ip.timeline.chronoview.updateSelectedDay(normalizedDate, function(){
					//get key location info
					var country = document.querySelector("#location #selected-location");
					var ccode = Object.keys(COUNTRY_LIST).find(key => COUNTRY_LIST[key] === country.textContent);
					//
					// reusable function
					function innerFunc(date){
						//get holiday data
						var holidayData = ip.nexus.inquisition(date);
						//if no holiday today
						if (Object.keys(holidayData).length === 0){
							//set holiday display text
							ip.nexus.synchronize("JUST A NORMAL DAY :(")
							//hide any residue holiday imageries
							ip.fragment.dissolve(function(){
								if (onComplete) { onComplete(); }
							});
						}
						//if there's a holiday today
						else{
							//set holiday display text
							ip.nexus.synchronize(holidayData["holidayName"], function(){
								//show holiday imagery
								ip.fragment.scan(holidayData["holidayName"], country.textContent, ccode, date.getFullYear(), function(){
									if (onComplete) { onComplete(); }
								})
							})
						}
						//
						
					}
					//if queried day is of a different year than loaded holiday data
					if(normalizedDate.getFullYear().toString() !== ip.nexus.holidays[0]["date"].toString().split("-")[0].toString()){
						//reload holiday data first
						ip.nexus.convergence(ccode, normalizedDate.getFullYear().toString()).then(function(){
							innerFunc(normalizedDate)
						})
					}
					// same year 
					else{
						innerFunc(normalizedDate)
					}
				})

				
			},
			//when tomorrow is clicked
			tomorrow: function (onComplete) {
				//
				var ip = indexPage;
				var queryDate = ip.timeline.chronoview.queryDateTrigger.textContent;
				//
				//get normal date without ordinal suffix
				var normalizedDate = new Date(ip.timeline.wormhole.normalization(queryDate))
				//go forward 1 day
				normalizedDate.setDate(normalizedDate.getDate() + 1);
				//change back to ordinal date with suffix
				var ordinalizedDate = ip.timeline.wormhole.ordinalization(normalizedDate)
				//
				//set ordinal date for display
				ip.timeline.chronoview.queryDateTrigger.textContent = ordinalizedDate
				//update calendar since value changed
				ip.timeline.chronoview.updateSelectedDay(normalizedDate, function(){
					//get key location info
					var country = document.querySelector("#location #selected-location");
					var ccode = Object.keys(COUNTRY_LIST).find(key => COUNTRY_LIST[key] === country.textContent);
					//
					// reusable function
					function innerFunc(date){
						//get holiday data
						var holidayData = ip.nexus.inquisition(date);
						//if no holiday today
						if (Object.keys(holidayData).length === 0){
							//set holiday display text
							ip.nexus.synchronize("JUST A NORMAL DAY :(")
							//hide any residue holiday imageries
							ip.fragment.dissolve(function(){
								if (onComplete) { onComplete(); }
							});
						}
						//if there's a holiday today
						else{
							//set holiday display text
							ip.nexus.synchronize(holidayData["holidayName"], function(){
								//show holiday imagery
								ip.fragment.scan(holidayData["holidayName"], country.textContent, ccode, date.getFullYear(), function(){
									if (onComplete) { onComplete(); }
								})
							})
						}
					}
					//if queried day is of a different year than loaded holiday data
					if(normalizedDate.getFullYear().toString() !== ip.nexus.holidays[0]["date"].toString().split("-")[0].toString()){
						//reload holiday data first
						ip.nexus.convergence(ccode, normalizedDate.getFullYear().toString()).then(function(){
							innerFunc(normalizedDate)
						})
					}
					// same year 
					else{
						innerFunc(normalizedDate)
					}
				})
				
			}
		},
		//for all things calendar
		chronoview: {
			//initialized calendar object
			calendarWidget: null,
			//date link button element that opens the calendar
			queryDateTrigger: null,
			//initializations
			init: function (onComplete) {
				var ip = indexPage;
				var cv = ip.timeline.chronoview;
				//
				//get & set query date
				cv.queryDateTrigger = document.querySelector("#query-date");
				//get normal date without ordinal suffix
				var queryDate = new Date(ip.timeline.wormhole.normalization(cv.queryDateTrigger.textContent))
				//convert date to custom format for calendar process
				var selectedDate = queryDate.getFullYear() + "-" + ('0' + (queryDate.getMonth()+1)).slice(-2) + "-" + ('0' + queryDate.getDate()).slice(-2);
				//
				//calendar settings
				cv.calendarWidget = new VanillaCalendar('#calendar-widget',{
					toggleSelected: false,
					settings: {
						visibility: {
							disabled: true,
							weekend: false,
							today: false
						},
						selected: {
							//Format: '2024-07-25'
							dates: [selectedDate],
						}
					},
					date: {
						//minimum date should be 20 years ago (api min is 1974)
						min:  (new Date(Date.now()).getFullYear() - 20) + "-01-01",
						//maximum date should be 10 year later  (api max is 2049)
						max: (new Date(Date.now()).getFullYear() + 10) + "-12-31"
					},
					actions:  {
						//calendar logic when day is loading during init
						getDays(day, date, HTMLElement, HTMLButtonElement, self) {
							HTMLButtonElement.style.flexDirection = 'column';
							//logic to make custom arrow
							const arrow_left = self.HTMLElement.querySelector(".arrow.prev");
							const arrow_right = self.HTMLElement.querySelector(".arrow.next");
							if(getComputedStyle(arrow_left.querySelector("button")).visibility.toLowerCase() == "hidden" && ! arrow_left.classList.contains("disabled")){
								arrow_left.className += " disabled";
							}
							if(getComputedStyle(arrow_right.querySelector("button")).visibility.toLowerCase() == "hidden" && ! arrow_right.classList.contains("disabled")){
								arrow_right.className += " disabled";
							}
							//
							//
							if(ip.nexus.holidays != null){
								HTMLButtonElement.innerHTML = '<div id="calendar-day"><span>' + ('0' + day).slice(-2) + '</span><span class="calendar-event none"></span></div>';
								for (var holiday of ip.nexus.holidays){
									if(holiday["date"] == date){
										HTMLButtonElement.innerHTML = '<div id="calendar-day"><span>' + ('0' + day).slice(-2) + '</span><span class="calendar-event available"></span></div>';
									}
								}
							}
							else{
								HTMLButtonElement.innerHTML = '<div id="calendar-day"><span>' + ('0' + day).slice(-2) + '</span><span class="calendar-event none"></span></div>';
							}
						
						},
						//calendar logic when month is loading during init
						getMonths(month, HTMLElement, self) {
							//custom month logic for ccatering to custom styling
							var selectedMonth = self.HTMLElement.querySelector(".vanilla-calendar-header__content .vanilla-calendar-month").textContent;
							var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
							if(selectedMonth.toUpperCase().includes(months[month].toUpperCase())){
								HTMLElement.outerHTML = '<div id="calendar-month"><button type="button" class="vanilla-calendar-months__month vanilla-calendar-months__month_selected" data-calendar-month="' + month + '" ><span>'+ months[month].toUpperCase() +'</span></button></div>'; 
							}
							else{
								HTMLElement.outerHTML = '<div id="calendar-month"><button type="button" class="vanilla-calendar-months__month" data-calendar-month="' + month + '" ><span>'+ months[month].toUpperCase() +'</span></button></div>'; 
							}
						},
						//calendar logic when year is loading during init
						getYears(year, HTMLElement, self) {
							//logic to make custom arrow
							const arrow_left = self.HTMLElement.querySelector(".arrow.prev");
							const arrow_right = self.HTMLElement.querySelector(".arrow.next");
							if(getComputedStyle(arrow_left.querySelector("button")).visibility.toLowerCase() == "hidden" && ! arrow_left.classList.contains("disabled")){
								arrow_left.className += " disabled";
							}
							if(getComputedStyle(arrow_right.querySelector("button")).visibility.toLowerCase() == "hidden" && ! arrow_right.classList.contains("disabled")){
								arrow_right.className += " disabled";
							}
							//
						},
						//calendar logic when arrows is clicked
						clickArrow(e, self) {
							//arrow logic for custom arrows
							if(e.target.classList.contains("vanilla-calendar-arrow_prev")){
								//clicked on left arrow
								self.HTMLElement.querySelector(".arrow.next").classList.remove("disabled")
							}
							else{
								//clicked on right arrow
								self.HTMLElement.querySelector(".arrow.prev").classList.remove("disabled")
							}
						},
						//calendar logic when day is clicked
						clickDay(e, self) {
							//
							//show loader
							ip.aeon.show("Whirling through space-time continuum...", function(){
								//logic for day selection in calendar
								indexPage.timeline.chronoview.nominateEpoch(self.selectedDates, function(){
									//hide calendar
									indexPage.timeline.chronoview.deactivate(function(){
										//hide loader
										ip.aeon.hide(750)
									});
								})
							})
						},
						//calendar logic when calendar data is updated
						updateCalendar(self) {
							//reload today button when calendar is updated
							const todayBtn = self.HTMLElement.querySelector(".calendar-today");
							//click logic for today button
							todayBtn.onclick = function(){
								//show loader
								ip.aeon.show("Revolving around the present axis...", function(){
									//logic for today button
									cv.anchor(function(){
										//hide loader
										ip.aeon.hide(750)
									});
								})
							}
						},
						//calendar logic when during initialization
						initCalendar(self) {
							//hide calendar when initialized
							self.hide()
						}
					},
					popups: cv.createCalendarPopUps(),
					
					//custom calendar styles
					DOMTemplates: {
						default: `
							<div class="vanilla-calendar-header">
								<div class="arrow prev">
									<span class="material-symbols-rounded">chevron_left</span>
									<#ArrowPrev />
								</div>
								<div class="vanilla-calendar-header__content">
									<div class="calendar-month"><#Month /><span class="underline"></span></div>
									<div class="calendar-year"><#Year /><span class="underline"></span></div>
								</div>
								<div class="arrow next">
									<span class="material-symbols-rounded">chevron_right</span>
									<#ArrowNext />
								</div>
							</div>
							<div class="vanilla-calendar-wrapper">
								<div class="vanilla-calendar-content">
									<#Week />
									<#Days />
								</div>
							</div>
							<button type="button" class="calendar-today">TODAY<span class="material-symbols-sharp">event_upcoming</span></button>
						`, month: `
								<div class="vanilla-calendar-header">
									<div class="vanilla-calendar-header__content">
										<div class="calendar-month"><#Month /><span class="underline"></span></div>
										<div class="calendar-year"><#Year /><span class="underline"></span></div>
									</div>
								</div>
								<div class="vanilla-calendar-wrapper">
									<div class="vanilla-calendar-content">
										<#Months />
									</div>
								</div>
								<button type="button" class="calendar-today">TODAY<span class="material-symbols-sharp">event_upcoming</span></button>
						`, year: `
								<div class="vanilla-calendar-header">
									<div class="arrow prev">
										<span class="material-symbols-rounded">chevron_left</span>
										<#ArrowPrev />
									</div>
									<div class="vanilla-calendar-header__content">
										<div class="calendar-month"><#Month /><span class="underline"></span></div>
										<div class="calendar-year"><#Year /><span class="underline"></span></div>
									</div>
									<div class="arrow next">
										<span class="material-symbols-rounded">chevron_right</span>
										<#ArrowNext />
									</div>
								</div>
								<div class="vanilla-calendar-wrapper">
									<div class="vanilla-calendar-content">
										<#Years />
									</div>
								</div>
								<button type="button" class="calendar-today">TODAY<span class="material-symbols-sharp">event_upcoming</span></button>
						`
					},
					
				});
				//initialize calendar
				cv.calendarWidget.init();
				//
				//today button
				var todayButton = document.querySelector("#calendar-widget .calendar-today");
				//click logic for yesterday button
				todayButton.onclick = function(){
					//show loader
					ip.aeon.show("Revolving around the present axis...", function(){
						//process today logic
						cv.anchor(function(){
							//hide loader
							ip.aeon.hide(750)
						});
					})
				}
				//
				//click logic for query button 
				cv.queryDateTrigger.onclick = function(){
					//for opening and closing of the calendar
					cv.switch();
				}
				
				//
				if(onComplete){onComplete()}
			},
			createCalendarPopUps: function(){
				var popups = {}
				if(indexPage.nexus.holidays != null){
					for (var holiday of indexPage.nexus.holidays){
						var ordinalizedDate = indexPage.timeline.wormhole.ordinalization(new Date(holiday["date"].toString().split("-")[0], holiday["date"].toString().split("-")[1] - 1, holiday["date"].toString().split("-")[2]));
						popups[holiday["date"]] = {
								modifier: 'event-day',
								html: "On " + ordinalizedDate + " it is <span class='holiday'>" + holiday["holidayName"].replace(" ", "&nbsp;") + "</span>!",
						}
					}
				}
				return popups
			},
			//calendar update function
			updateSelectedDay: function(date, onComplete){
				//update calendar
				var ip = indexPage;
				var cv = ip.timeline.chronoview
				//
				//get current date
				var tempDateObj = new Date(date);
				//
				//update calendar selected dates
				cv.calendarWidget.settings.selected.dates = [tempDateObj.getFullYear() + "-" + ('0' + (tempDateObj.getMonth()+1)).slice(-2) + "-" + ('0' + tempDateObj.getDate()).slice(-2)]
				cv.calendarWidget.update({
					dates: true,
				});

				if(onComplete){onComplete();}
			},
			//toggle visibility of the calendar widget
			switch: function(){
				var ip = indexPage;
				var cv = ip.timeline.chronoview;
				//	
				//remove hidden class if it exists
				if(cv.calendarWidget.HTMLElement.classList.contains("vanilla-calendar_hidden")){
					cv.activate();
				}
				//if not give it the hidden class
				else{
					cv.deactivate();
				}
			},
			//showing of the calendar widget
			activate: function(){
				var ip = indexPage;
				var cv = ip.timeline.chronoview;
				//
				//remove hidden class
				cv.calendarWidget.HTMLElement.classList.remove("vanilla-calendar_hidden");
			},
			//hiding of the calendar widget
			deactivate: function(onComplete){
				var ip = indexPage;
				var cv = ip.timeline.chronoview;
				//
				//add hidden class
				cv.calendarWidget.HTMLElement.classList.add("vanilla-calendar_hidden");
				//
				if(onComplete){onComplete();}
			},
			//choosing of the date in calendar widget
			nominateEpoch: function (date, onComplete) {
				var ip = indexPage;
				//
				//get ordinal date with suffix
				var ordinalizedDate = ip.timeline.wormhole.ordinalization(date)
				//
				//set ordinal date for display
				ip.timeline.chronoview.queryDateTrigger.textContent = ordinalizedDate
				//update selected date in calendar
				ip.timeline.chronoview.updateSelectedDay(new Date(date), function(){
					//get key location info
					var country = document.querySelector("#location #selected-location");
					var ccode = Object.keys(COUNTRY_LIST).find(key => COUNTRY_LIST[key] === country.textContent);
					//
					// reusable function
					function innerFunc(date){
						//get holiday data
						var holidayData = ip.nexus.inquisition(date);
						//if no holiday today
						if (Object.keys(holidayData).length === 0){
							//set holiday display text
							ip.nexus.synchronize("JUST A NORMAL DAY :(")
							//hide any residue holiday imageries
							ip.fragment.dissolve(function(){
								if (onComplete) { onComplete(); }
							});
						}
						//if there's a holiday today
						else{
							//set holiday display text
							ip.nexus.synchronize(holidayData["holidayName"], function(){
								//show holiday imagery
								ip.fragment.scan(holidayData["holidayName"], country.textContent, ccode, new Date(date).getFullYear(), function(){
									if (onComplete) { onComplete(); }
								})
							})
						}
					}
					//if queried day is of a different year than loaded holiday data
					if(new Date(date).getFullYear().toString() !== ip.nexus.holidays[0]["date"].toString().split("-")[0].toString()){
						//reload holiday data first
						ip.nexus.convergence(ccode, new Date(date).getFullYear().toString()).then(function(){
							innerFunc(new Date(date))
						})
					}
					// same year 
					else{
						innerFunc(new Date(date))
					}
				})
				
			},
			//clicking today button
			anchor: function(onComplete){
				var ip = indexPage;
				var cv = ip.timeline.chronoview;
				var queryDate = cv.queryDateTrigger.textContent;
				//
				//hide calendar
				cv.deactivate();
				//
				//get normal date of now
				var normalizedDate = new Date()
				//change back to ordinal date with suffix
				var ordinalizedDate = ip.timeline.wormhole.ordinalization(normalizedDate)
				//
				//set ordinal date for display
				cv.queryDateTrigger.textContent = ordinalizedDate
				//update calendar since value changed
				cv.updateSelectedDay(normalizedDate, function(){
					//get key location info
					var country = document.querySelector("#location #selected-location");
					var ccode = Object.keys(COUNTRY_LIST).find(key => COUNTRY_LIST[key] === country.textContent);
					//
					// reusable function
					function innerFunc(date){
						//get holiday data
						var holidayData = ip.nexus.inquisition(date);
						//if no holiday today
						if (Object.keys(holidayData).length === 0){
							//set holiday display text
							ip.nexus.synchronize("JUST A NORMAL DAY :(")
							//hide any residue holiday imageries
							ip.fragment.dissolve(function(){
								if(onComplete){onComplete()}
							});
						}
						//if there's a holiday today
						else{
							//set holiday display text
							ip.nexus.synchronize(holidayData["holidayName"], function(){
								//show holiday imagery
								ip.fragment.scan(holidayData["holidayName"], country.textContent, ccode, date.getFullYear(), function(){
									if(onComplete){onComplete()}
								})
							})
						}
					}
					//if queried day is of a different year than loaded holiday data
					if(normalizedDate.getFullYear().toString() !== ip.nexus.holidays[0]["date"].toString().split("-")[0].toString()){
						//reload holiday data first
						ip.nexus.convergence(ccode, normalizedDate.getFullYear().toString()).then(function(){
							innerFunc(normalizedDate)
						})
					}
					// same year 
					else{
						innerFunc(normalizedDate)
					}
				})
			}
		},
		//for all time related functions and features
		wormhole:{
			//initializations
			init: function () {
				var ip = indexPage;
				//empty
			},
			//for converting an ordinized date string to a normalized date string
			normalization: function(ordinalDateString){
				//remove the ordinal suffix
				var normalizedDate = ordinalDateString.replace(/(st|nd|rd|th)/g, "")
				return normalizedDate
			},
			//for converting a normalized date string to a ordinized date string
			ordinalization: function(standardDateString){
				//make date object
				var tempDateObj = new Date(standardDateString);
				//get the day value
				var day = tempDateObj.getDate();
				//ordinal suffix logic
				var ordinal = day > 3 && day < 21 
					? "th" : day % 10 == 1 
						? "st" : day % 10 == 2 
							? "nd" : day % 10 == 3 
								? "rd" : "th"
				//make day with ordinal suffix
				var ordinalDay = day + ordinal
				//make date with ordinized day
				//FYI: toLocaleString('default', { month: 'long' }) = month with long names, e.g. August
				var ordinalizedDate = ordinalDay + " " + tempDateObj.toLocaleString('default', { month: 'long' }) + " " + tempDateObj.getFullYear();
				return ordinalizedDate
			},
		}
	},
	///Location related modules
	geolocation:{
		//numbers of countries per page in country picker
		countriesPerPage: 29,
		//initializations
		init: function(){
			var ip = indexPage;
			var gl = ip.geolocation;
			var countriesDiv = document.querySelector("#countries");
			var countryList = document.querySelector("#country-list");
			var locationInit = document.querySelector("#location");
			//
			//set default country
			var defaultCountry = "Singapore";
			var defaultCountryArrayIndex = Object.values(COUNTRY_LIST).indexOf(defaultCountry);
			//calc page to display based on country index
			var defaultPage = Math.ceil((defaultCountryArrayIndex + 1) / gl.countriesPerPage) 
			//
			//init country selector
			//hide it first
			countriesDiv.className += " countries-hidden";
			//set the default page value
			countryList.setAttribute("data-page", defaultPage);
			//set the default country value
			countryList.setAttribute("data-selected", defaultCountry)
			//click logic for location query link button
			locationInit.onclick = function(){
				//logic for showing country picker
				gl.pivot.init();
			}
			//
			//country picker pagination arrows logics
			var prevPage = document.createElement('div')
			var nextPage = document.createElement('div')
			prevPage.className = "arrow prev";
			nextPage.className = "arrow next";
			prevPage.innerHTML = "<span class='material-symbols-rounded'>chevron_left</span>";
			nextPage.innerHTML = "<span class='material-symbols-rounded'>chevron_right</span>";
			//
			//click logic for next page button
			nextPage.onclick = function(){
				//go next page
				ip.geolocation.exploration.advance();
			}
			//click logic for prev page button
			prevPage.onclick = function(){
				//go prev page
				ip.geolocation.exploration.regress();
			}
			//
			//add the arrows into the dom
			countriesDiv.prepend(prevPage);
			countriesDiv.insertBefore(nextPage, countryList);
			//

			//dont show prev page arrow if its on the first page
			if(defaultPage == 1){
				prevPage.style.visibility = "hidden";
			}

			//looping through list of supported countries for their country code
			for(var ccode of Object.keys(COUNTRY_LIST)){
				//get index
				var countryIndex = Object.keys(COUNTRY_LIST).indexOf(ccode);
				//if its a country within the current page
				if ((countryIndex + 1) > (gl.countriesPerPage * (defaultPage - 1)) && (countryIndex + 1) <= (gl.countriesPerPage * defaultPage)){
					//create and add them into dom
					var countryElement = document.createElement('div')
					var countryName = COUNTRY_LIST[ccode];
					countryElement.innerHTML = "<span class='country' data-country-code='" + ccode + "'>"+countryName+"</span>"
					//
					//click logic for country item button
					countryElement.onclick = function(){
						//save this for later use
						var ele = this;
						//show loader
						ip.aeon.show("Spiraling across cosmic fields...", function(){
							//process country selection logic
							gl.pivot.toCoordinate(ele, function(){
								//hide loader
								ip.aeon.hide(750)
							})
						})
					};
					//logic for active country style
					if(countryName.toLocaleLowerCase() == defaultCountry.toLocaleLowerCase()){
						countryElement.className = " country-wrap selected";
					}
					else{
						countryElement.className = " country-wrap";
					}
					//add to dom
					countryList.appendChild(countryElement);
				}
			}
		},
		//location picker function
		exploration:{
			//go right in location picker
			advance: function(){
				var ip = indexPage;
				var gl = ip.geolocation;
				//
				//get country list element
				var countryList = document.querySelector("#country-list");
				//get selected country
				var selectedCountry = countryList.getAttribute("data-selected");
				//get selected page
				var currentPage = parseInt(countryList.getAttribute("data-page"));
				var finalPage = currentPage + 1;
				//country codes array
				var countryCodes = Object.keys(COUNTRY_LIST);
				//arrows
				var nextPage = document.querySelector("#countries .arrow.next");
				var prevPage = document.querySelector("#countries .arrow.prev");
				//
				//show prev page arrows
				prevPage.style.visibility = "visible";
				//If page is the last page
				if(parseInt(finalPage) == Math.ceil(Object.entries(COUNTRY_LIST).length / gl.countriesPerPage)){
					//hide next page arrows
					nextPage.style.visibility = "hidden";
				}
				//
				//reset country list first
				//set the page value to final page
				countryList.setAttribute("data-page", finalPage);
				//clear country list
				countryList.innerHTML = "";
				//
				//loop through items in current page
				for (
					var i = (gl.countriesPerPage * (finalPage - 1)); 
					i < countryCodes.length && i <= (gl.countriesPerPage * finalPage - 1); i++
				) {
					//create and add them into dom
					var countryElement = document.createElement('div')
					countryElement.innerHTML = "<span class='country' data-country-code='" + countryCodes[i] + "'>"+COUNTRY_LIST[countryCodes[i]]+"</span>"
					//click logic for country item button
					countryElement.onclick = function(){
						//save this for later use
						var ele = this;
						//show loader
						ip.aeon.show("Spiraling across cosmic fields...", function(){
							//process country selection logic
							gl.pivot.toCoordinate(ele, function(){
								//hide loader
								ip.aeon.hide(750)
							})
						})
					};
					//logic for active country style
					if(COUNTRY_LIST[countryCodes[i]].toLocaleLowerCase() == selectedCountry.toLowerCase()){
						countryElement.className = " country-wrap selected";
					}
					else{
						countryElement.className = " country-wrap";
					}
					//add to dom
					countryList.appendChild(countryElement);
				}
			},
			//go left in location picker
			regress: function(){
				var ip = indexPage;
				var gl = ip.geolocation;
				//
				//get country list element
				var countryList = document.querySelector("#country-list");
				//get selected country
				var selectedCountry = countryList.getAttribute("data-selected");
				//get selected page
				var currentPage = parseInt(countryList.getAttribute("data-page"));
				var finalPage = currentPage - 1;
				//country codes array
				var countryCodes = Object.keys(COUNTRY_LIST);
				//arrows
				var prevPage = document.querySelector("#countries .arrow.prev");
				var nextPage = document.querySelector("#countries .arrow.next");
				//
				//show next page arrows
				nextPage.style.visibility = "visible";
				//if at first page
				if(parseInt(finalPage) == 1){
					//hide prev page arrows
					prevPage.style.visibility = "hidden";
					//show next page arrows
					nextPage.style.visibility = "visible";
				}
				//
				//reset country list first
				//set the page value to final page
				countryList.setAttribute("data-page", finalPage);
				//clear country list
				countryList.innerHTML = "";
				//
				//loop through items in current page
				for (
					var i = (gl.countriesPerPage * (finalPage - 1)); 
					i < countryCodes.length && i <= (gl.countriesPerPage * finalPage - 1); i++
				) {
					//create and add them into dom
					var countryElement = document.createElement('div')
					countryElement.innerHTML = "<span class='country' data-country-code='" + countryCodes[i] + "'>"+COUNTRY_LIST[countryCodes[i]]+"</span>"
					//click logic for country item button
					countryElement.onclick = function(){
						//save this for later use
						var ele = this;
						//show loader
						ip.aeon.show("Spiraling across cosmic fields...", function(){
							//process country selection logic
							gl.pivot.toCoordinate(ele, function(){
								//hide loader
								ip.aeon.hide(750)
							})
						})
					};
					//logic for active country style
					if(COUNTRY_LIST[countryCodes[i]].toLocaleLowerCase() == selectedCountry.toLowerCase()){
						countryElement.className = " country-wrap selected";
					}
					else{
						countryElement.className = " country-wrap";
					}
					//add to dom
					countryList.appendChild(countryElement);
				}
			},
			//jump to xx page in location picker
			traverse: function(page){
				var ip = indexPage;
				var gl = ip.geolocation;
				//
				//get country list element
				var countryList = document.querySelector("#country-list");
				//get selected country
				var selectedCountry = countryList.getAttribute("data-selected");
				//country codes array
				var countryCodes = Object.keys(COUNTRY_LIST);
				//arrows
				var prevPage = document.querySelector("#countries .arrow.prev");
				var nextPage = document.querySelector("#countries .arrow.next");
				//
				//if at first page
				if(parseInt(page) == 1){
					//hide prev page arrows
					prevPage.style.visibility = "hidden";
					//show next page arrows
					nextPage.style.visibility = "visible";
				}
				//if not at first page
				else{
					//show prev page arrows
					prevPage.style.visibility = "visible";
				}
				//If page is the last page
				if(parseInt(page) == Math.ceil(Object.entries(COUNTRY_LIST).length / gl.countriesPerPage)){
					//hide next page arrows
					nextPage.style.visibility = "hidden";
				}
				else{
					//show next page arrows
					nextPage.style.visibility = "visible";
				}
				//
				//reset country list first
				//set the page value to final page
				countryList.setAttribute("data-page", page);
				countryList.innerHTML = "";
				//
				//loop through items in current page
				for (
					var i = (gl.countriesPerPage * (page - 1)); 
					i < countryCodes.length && i <= (gl.countriesPerPage * page - 1); i++
				) {
					//create and add them into dom
					var countryElement = document.createElement('div')
					countryElement.innerHTML = "<span class='country' data-country-code='" + countryCodes[i] + "'>"+COUNTRY_LIST[countryCodes[i]]+"</span>"
					//click logic for country item button
					countryElement.onclick = function(){
						//save this for later use
						var ele = this;
						//show loader
						ip.aeon.show("Spiraling across cosmic fields...", function(){
							//process country selection logic
							gl.pivot.toCoordinate(ele, function(){
								//hide loader
								ip.aeon.hide(750)
							})
						})
					};
					//logic for active country style
					if(COUNTRY_LIST[countryCodes[i]].toLocaleLowerCase() == selectedCountry.toLowerCase()){
						countryElement.className = " country-wrap selected";
					}
					else{
						countryElement.className = " country-wrap";
					}
					//add to dom
					countryList.appendChild(countryElement);
				}
			},
		},
		//location element function
		pivot:{
			//initializations
			init: function(){
				//
				//country show / hide
				indexPage.geolocation.pivot.flux();
			},
			//hide location picker
			unveil: function(){
				var countriesDiv = document.querySelector("#countries");
				//remove hidden class
				countriesDiv.classList.remove("countries-hidden");
			},
			//show location picker
			conceal: function(){
				var gl = indexPage.geolocation;
				//
				var countriesDiv = document.querySelector("#countries");
				//get country list element
				var countryList = document.querySelector("#country-list");
				//get selected country
				var selectedCountry = countryList.getAttribute("data-selected");
				//get country index
				var selectedCountryArrayIndex = Object.values(COUNTRY_LIST).indexOf(selectedCountry);
				//get country page
				var selectedCountryPage = Math.ceil((selectedCountryArrayIndex + 1) / gl.countriesPerPage) 
				indexPage.geolocation.exploration.traverse(selectedCountryPage)
				//add hidden class
				countriesDiv.classList.add("countries-hidden");
			},
			//toggle location picker visibility
			flux: function(){
				var countriesDiv = document.querySelector("#countries");
				//if hidden class exist
				if(countriesDiv.classList.contains("countries-hidden")){
					//show
					indexPage.geolocation.pivot.unveil();
				}
				//if hidden class do not exist
				else{
					//hide
					indexPage.geolocation.pivot.conceal();
				}
			},
			///country selection
			toCoordinate: function(locationElement, onComplete){
				var ip = indexPage;
				//
				var countryList = document.querySelector("#country-list");
				var selectedCountry = document.querySelector("#location #selected-location");
				//
				//remove selected class from previously selected  country
				for (var country of countryList.children){
					if(country.classList.contains("selected")){
						country.classList.remove("selected")
					}
				}
				//add selected class to newly selected  country
				if(!locationElement.classList.contains("selected")){
					locationElement.className += " selected"
				}
				//update selected data
				countryList.setAttribute("data-selected", locationElement.textContent)
				//set country name for display
				selectedCountry.textContent = locationElement.textContent
				//hide country picker
				indexPage.geolocation.pivot.conceal();

				// get selected country code
				var ccode = Object.keys(COUNTRY_LIST).find(key => COUNTRY_LIST[key] === locationElement.textContent);
				//get query date
				var queryDate = ip.timeline.chronoview.queryDateTrigger.textContent;
				//get ordinal date with suffix
				var normalizedDate = new Date(ip.timeline.wormhole.normalization(queryDate))
				//
				//reload holiday data first (since country updated)
				ip.nexus.convergence(ccode, normalizedDate.getFullYear()).then(function(){
					//get holiday data
					var holidayData = ip.nexus.inquisition(normalizedDate);
					//if no holiday today
					if (Object.keys(holidayData).length === 0){
						//set holiday display text
						ip.nexus.synchronize("JUST A NORMAL DAY :(")
						//hide any residue holiday imageries
						ip.fragment.dissolve(function(){
							if(onComplete){onComplete()}
						});
					}
					else{
						//set holiday display text
						ip.nexus.synchronize(holidayData["holidayName"], function(){
							//show holiday imagery
							ip.fragment.scan(holidayData["holidayName"], locationElement.textContent, ccode, normalizedDate.getFullYear(), function(){
								if(onComplete){onComplete()}
							})
						})
					}
				})
			}
		},
	},
	///Holidays related modules
	nexus:{
		//holiday data object
		holidays: null,
		//holiday text display element
		holidayTextElement: null,
		init: function(onComplete){
			indexPage.nexus.holidayTextElement = document.querySelector("#content #day")
			var countryLocation = document.querySelector("#location #selected-location").textContent;
			var ccode = Object.keys(COUNTRY_LIST).find(key => COUNTRY_LIST[key] === countryLocation);
			var selectedYear = document.querySelector("#calendar-widget .calendar-year button") == null 
				? new Date(Date.now()).getFullYear()
				: document.querySelector("#calendar-widget .calendar-year button").textContent;

			indexPage.nexus.convergence(ccode, selectedYear).finally(function(){
				if(onComplete){onComplete()}
			})
		},
		//Webrequest func to get holiday list
		convergence: function(countryCode, year, onComplete){
			//when user click on a location, comes here.
			//load from api, the holidays based on selected data
			//create promise object (asynchronous)
			var promise = new Promise(function (resolve, reject) {
				//web request
				makeWebRequestPromise(
					// '/chronosphere/', //for testing
						'/singularity/', //for actual
					"GET",
					{
						data: 'ccode=' + countryCode + "&year=" + year
					}
					//on promise success
				).then(function(value){
					//save decoded data
					var myRet = JSON.parse(value);
					//update data to holiday object
					indexPage.nexus.holidays = myRet["data"];
					//mark promise success
					resolve()
					//on promise failed
				}).catch(function(error){
					//log error
					console.log("this is error: ", error)
					//mark promise failure
					reject(error);
				})
			})
			//cater for alternative callbacks call
			if (onComplete) {return promise.then(onComplete());} 
			else {return promise;}
		},
		//function for finding holiday text
		inquisition: function(dateString){
			//
			var holidayData = {}
			//
			//loop holiday object's data
			for(var holiday of indexPage.nexus.holidays){
				//make relevant dat object
				var holidayDateParts = holiday["date"].split('-');
				var holidayDate = new Date(holidayDateParts[0], holidayDateParts[1] - 1, holidayDateParts[2]);
				var compareDate = new Date(dateString);
				//compa dates to find queried holiday
				if(holidayDate.getFullYear() === compareDate.getFullYear() && holidayDate.getDate() === compareDate.getDate() && holidayDate.getMonth() === compareDate.getMonth()){
					//found
					holidayData = holiday;
				}
			}

			//return regardless of any data
			return holidayData
		},
		//function for updating holiday text
		synchronize: function(holidayName, onComplete){
			//set holiday name for display
			indexPage.nexus.holidayTextElement.textContent = holidayName;

			if(onComplete){onComplete();}
		},
	},
	///Holidays background related module
	fragment:{
		//Holidays background html components
		festive: {
			//Holidays background elements
			nodes: {
				baseNode: null,
				overlayNode: null
			},
			//Holidays background style format, with image
			structure: "background-image:radial-gradient(circle at center top, transparent, #fcfaed 90%), radial-gradient(circle at center bottom, transparent, #fcfaed 90%), linear-gradient(to top, #fcfaed 5%, transparent 50%), linear-gradient(to bottom, #fcfaed 5%, transparent 50%), url([image_path])",
			//Holidays background style format, with gradient
			structureDefault:"background-image: linear-gradient(to top, #fcfaed 5%, #fcfaed 15%, transparent 50%), linear-gradient(to bottom, #fcfaed 5%, #fcfaed 15%, transparent 50%), linear-gradient(to left, #fcfaed 5%, #fcfaed 15%, transparent 50%), linear-gradient(to right, #fcfaed 5%, #fcfaed 15%, transparent 50%), radial-gradient(ellipse at top, [color_1] 5%, transparent 50%), radial-gradient(ellipse at bottom, [color_2] 5%, transparent 50%), radial-gradient(circle at left, [color_3] 5%, transparent 50%), radial-gradient(circle at right, [color_4] 5%, transparent 50%)"
		},
		//initializations
		init: function(){
			var fm = indexPage.fragment;
			//save holiday imagery elements
			fm.festive.nodes.baseNode = document.querySelector(".holiday-bg.base");
			fm.festive.nodes.overlayNode = document.querySelector(".holiday-bg.overlay");
		},
		//webrequest func to get holiday imagery
		scan:function(holidayName, countryName, countryCode, year, onComplete){
			var fm = indexPage.fragment;

			//web request
			var result = makeWebRequest(
				// '/chronosphere/', //for testing
				'/visage/', //for actual
				"GET",
				{
					data: 'hname=' + holidayName + '&cname=' + countryName + '&ccode=' + countryCode + "&year=" + year,
					onError: function(){
						console.log("this is error!")
					},
					onComplete: function(){
						console.log("this is completed!")
						
						// window.location.href = window.location.href;
					},
				}
			);
			//successfully returned data
			result.onload = function(){
				//
				var myRet;
				//try catch errors
				try {
					//save decoded data
					myRet = JSON.parse(this.response);
					//if data contains error
					if(myRet["status"] == "error"){
						//make holiday background with random gradient
						var tempStyle = fm.festive.structureDefault.replace(/\[color_1\]|\[color_2\]|\[color_3\]|\[color_4\]/gi, function(matched){
							return "hsl(" + 360 * Math.random() + ',' +
							(50 + 30 * Math.random()) + '%,' + 
							(75 + 15 * Math.random()) + '%)';
						});
						//show/hide the background layers
						if(fm.festive.nodes.baseNode.classList.contains("active")){
							fm.festive.nodes.overlayNode.style.cssText = tempStyle
							fm.festive.nodes.overlayNode.className += " active"
							fm.festive.nodes.baseNode.classList.remove("active")
						}
						else{
							//overlay is currently active or no node is active
							fm.festive.nodes.baseNode.style.cssText = tempStyle
							fm.festive.nodes.baseNode.className += " active"		
							fm.festive.nodes.overlayNode.classList.remove("active")
						}
						
						if (onComplete) { onComplete() }

						//prevent code from continuing
						return false;
					}

					//save queried background image path
					var myPath = myRet["data"]["imageURL"];
					//display the background image
					fm.materialize(myPath, function(){
						if (onComplete) { onComplete() }
					});
				//catch errors
				} catch (e) {
					//make holiday background with random gradient
					var tempStyle = fm.festive.structureDefault.replace(/\[color_1\]|\[color_2\]|\[color_3\]|\[color_4\]/gi, function(matched){
						return "hsl(" + 360 * Math.random() + ',' +
						(50 + 30 * Math.random()) + '%,' + 
						(40 + 35 * Math.random()) + '%)';
					});
					//show/hide the background layers
					if(fm.festive.nodes.baseNode.classList.contains("active")){
						fm.festive.nodes.overlayNode.style.cssText = tempStyle
						fm.festive.nodes.overlayNode.className += " active"
						fm.festive.nodes.baseNode.classList.remove("active")
					}
					else{
						//overlay is currently active or no node is active
						fm.festive.nodes.baseNode.style.cssText = tempStyle
						fm.festive.nodes.baseNode.className += " active"		
						fm.festive.nodes.overlayNode.classList.remove("active")
					}
					if (onComplete) { onComplete() }
					//prevent code from continuing
					return false;
				}

			}
		},
		//function for displaying the queried image onto the html
		materialize: function(image_path, onComplete){
			//
			var fm = indexPage.fragment;
			//
			//show/hide the background layers
			if(fm.festive.nodes.baseNode.classList.contains("active")){
				fm.festive.nodes.overlayNode.style.cssText = fm.festive.structure.replace("[image_path]", image_path)
				fm.festive.nodes.overlayNode.className += " active"
				fm.festive.nodes.baseNode.classList.remove("active")
			}
			else{
				//overlay is currently active or no node is active
				fm.festive.nodes.baseNode.style.cssText = fm.festive.structure.replace("[image_path]", image_path)
				fm.festive.nodes.baseNode.className += " active"		
				fm.festive.nodes.overlayNode.classList.remove("active")
			}
			if (onComplete) { onComplete() }
		},
		//function for removing holiday bg
		dissolve: function(onComplete){
			//removing active class from all background elements
			indexPage.fragment.festive.nodes.baseNode.classList.remove("active")
			indexPage.fragment.festive.nodes.overlayNode.classList.remove("active")
			if(onComplete){onComplete()}
		}
		
	},
	///Loader related module
	aeon:{
		//function to show loader
		show: function(message = "Spinning into the near future...", onComplete){
			//
			/* 
				Tomorrow -        	Spinning into the near future...
				Yesterday -       	Rewinding back recent memories...
				Today -           	Revolving around the present axis...
				Pick a date -     	Whirling through space-time continuum...
				Pick a location - 	Spiraling across cosmic fields...
			*/
			//
			var loader = document.querySelector("#loader-overlay");
			var loaderMsg = document.querySelector("#loader-content .loading-msg");
			var loaderBg = document.querySelector("#loader-content .loader-wrapper");
			//
			//update loader background color
			loaderBg.style.backgroundColor = "hsl(" + Math.floor(Math.random() * 360) + "deg 30% 45%)";
			//update loader message
			loaderMsg.textContent = message;
			//add the active class to loader to show it
			loader.className += " active";
			if(onComplete){onComplete()}
		},
		//function to hide loader
		hide: function(hideAfter = 1000, onComplete){
			//create timeout func to wait for x duration before hiding
			setTimeout(function() { 
				var loader = document.querySelector("#loader-overlay");
				//
				//remove active class to hide
				loader.classList.remove("active");
				//
				if(onComplete){onComplete()}
				//
			}, hideAfter);
		}
	}
}


//---- document ready -------------------------
document.addEventListener("DOMContentLoaded", function(event) {
   indexPage.init();
});