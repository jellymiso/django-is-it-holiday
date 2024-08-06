var django_csrfToken = getCookie('csrftoken');

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function makeWebRequest(url, requestMethod = "GET", {data, contentHeader = "application/x-www-form-urlencoded", onSuccess, onError, onComplete}){

	//
	var xhr = new XMLHttpRequest();
	if(requestMethod == "POST"){
		xhr.open(requestMethod, url, true);
	}
	else{
		xhr.open(requestMethod, url + "?" + data, true);
	}
	if(requestMethod != "POST" && requestMethod != "GET"){
		throw new Error('Request Method is not supported!');
	}
	if(requestMethod == "POST"){
		xhr.setRequestHeader("X-CSRFToken", django_csrfToken); //for Django applications only
		xhr.setRequestHeader('Content-type', contentHeader); //for encoded url data
		// xhr.setRequestHeader('Content-type', "application/x-www-form-urlencoded"); //For urlencoded data
		// xhr.setRequestHeader('Content-type', 'application/json'); //For json data
	}
	//
	//regardless of error or success, as long as there is a change in state
	// xhr.onreadystatechange = function () {
	// 	if (this.readyState == 4 && this.status == 200) {
	// 		console.log(this.responseText);
	// 	}
	// }
	//error
	xhr.onerror = function(){
		// console.log("error: " + this.responseText  );
		if (onError) { onError() }
	}
	//success
	xhr.onload = function(){

		// console.log("success: " + this.responseText );
		if (onSuccess) { onSuccess() }
	}
	//complete, regardless of success of failure
	xhr.onloadend = function(){
		// console.log("completed: " + this.responseText );
		if (onComplete) { onComplete() }
	}
	//
	//for urlencoded use 'data_1=value_1&data_2=value_2' as data
	//for json, use JSON.stringify(params) as data
	if(requestMethod == "GET"){
		xhr.send(); 
	}
	else if(requestMethod == "POST"){
		xhr.send(data); 
	}

	return xhr

}

function makeWebRequestPromise(url, requestMethod = "GET", {data, contentHeader = "application/x-www-form-urlencoded"}){
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		if(requestMethod == "POST"){
			xhr.open(requestMethod, url, true);
		}
		else{
			xhr.open(requestMethod, url + "?" + data, true);
		}
		if(requestMethod != "POST" && requestMethod != "GET"){
			throw new Error('Request Method is not supported!');
		}
		if(requestMethod == "POST"){
			xhr.setRequestHeader("X-CSRFToken", django_csrfToken); //for Django applications only
			xhr.setRequestHeader('Content-type', contentHeader); //for encoded url data
			// xhr.setRequestHeader('Content-type', "application/x-www-form-urlencoded"); //For urlencoded data
			// xhr.setRequestHeader('Content-type', 'application/json'); //For json data
		}
		//error
		xhr.onerror = function(){
			reject({
					status: this.status,
					statusText: xhr.statusText
			});
		}
		//success
		xhr.onload = function(){
			resolve(xhr.response);
		}
		// //complete, regardless of success of failure
		// xhr.onloadend = function(){
		// 	// console.log("completed: " + this.responseText );
		// 	if (onComplete) { onComplete() }
		// }
		//
		//for urlencoded use 'data_1=value_1&data_2=value_2' as data
		//for json, use JSON.stringify(params) as data
		if(requestMethod == "GET"){
			xhr.send(); 
		}
		else if(requestMethod == "POST"){
			xhr.send(data); 
		}

	});
}