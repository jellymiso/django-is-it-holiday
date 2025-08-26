# from .models import Main
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotAllowed, JsonResponse
from django.template import loader
from django.conf import settings
import json
import base64
import requests
import random

@ensure_csrf_cookie
def home(request):
  # mainObjects = Main.objects.all().values()
  template = loader.get_template('index.html')
  days_to_add = int(request.session.get('days_to_add')) if 'days_to_add' in request.session else 0
  context = {
    # 'mainObjects': mainObjects,
    'days_to_add': days_to_add,
  }
  return HttpResponse(template.render(context, request))

#used for testing post/get requests
def chronosphere(request):
  if request.method =='POST':
    return HttpResponse("hello world | data: " + str(request.POST.urlencode()) + " | Bye")
  else: #GET
    return HttpResponse("hello world")

#update focused day
def wormhole(request):
  if request.method =='POST':
    if 'days_to_add' in request.session:
      request.session['days_to_add'] = int(request.session['days_to_add']) + int(request.POST.get("daysFromNow")) 
    else:
      request.session['days_to_add'] = request.POST.get("daysFromNow") 
      
    return JsonResponse({"status": "success"})
  else: #GET
    return HttpResponseNotAllowed(['POST'])

def visage(request):
  if request.method =='GET':
    holiday = request.GET.get("hname")
    country = request.GET.get("cname")
    code = request.GET.get("ccode")
    year = request.GET.get("year")
    
    def getGoogleImageResults(holiday, country, code, year):
      fetchURL = "https://www.googleapis.com/customsearch/v1?key=" + settings.G_CSE_APIKEY + "&cx=" + settings.G_CSE_CX + "&imgType=photo&searchType=image&siteSearch=facebook.com%20instagram.com%20linkedin.com%20yahoo.com&cr=country" + code + "&siteSearchFilter=e"  + "&q=:%22" + holiday + "%22%20" + country  + "%20" + year + "%20-calendar%20-travel%20-tour%20-package%20-deals%20-store"

      try:
        response = requests.get(fetchURL)
        print(fetchURL)
        response.raise_for_status()
        if(response.content.decode("utf-8") == ""):
          #no data 
          return {"status": "error", "error_msg": "Unknown Error."}
        else:
          data = json.loads(response.content)
          return {"status": "success", "data": data}


      except requests.exceptions.RequestException as e:  
        return {"status": "error", "error_msg": str(e)}

    fetchedData = getGoogleImageResults(holiday, country, code, year)

    def getImageAsDataURL(dataToProcess):
      if (len(dataToProcess) - 1) == 0:
        return {"status": "error", "error_msg": "No images available"}
      randomIndex = random.randint(0, len(dataToProcess) - 1)
      imageURL = dataToProcess[randomIndex]["link"]
      #
      try:
        response = requests.get(imageURL)
        response.raise_for_status()
        imageData = response.content
        print("\n\rchosen item data: " + str(dataToProcess[randomIndex]))
        print("\n\rimageData: " + str(imageData))
        dataImage ="data:image/jpeg;base64," + base64.b64encode(imageData).decode('utf-8')
        print("\n\dataImage: " + str(dataImage))
        return {"status": "success", "data": {"data_image_string": dataImage}}

      except requests.exceptions.RequestException as e:  
        #error due to permission, remove image from array
        dataToProcess.pop(randomIndex)
        getImageAsDataURL(dataToProcess)
        #try again

    if fetchedData["status"] == "success":
      print("\n\rfetchedData: ")
      print(fetchedData)
      if "error" in fetchedData:
        return JsonResponse({"status": "error", "error_msg": "There seems to be a problem with the Google API server, or you may be sending requests too quickly. Please try again later."})

      result = getImageAsDataURL(fetchedData['data']["items"])
      print("\n\rresult: ")
      print(result)  
      if result["status"] == "success":
        return JsonResponse({"status": "success", "data": {"imageURL" : result["data"]["data_image_string"]}})
      else:
        return JsonResponse({"status": "error", "error_msg": result["error_msg"]})
    else:
      return JsonResponse({"status": "error", "error_msg": fetchedData["error_msg"]})
    

    


    
    

  else: #GET
    return HttpResponseNotAllowed(['GET'])
  

#get country holiday of a specific year
def singularity(request):
  if request.method =='GET':
    holidays = []
    countryCode = request.GET.get("ccode")
    requestedYear = request.GET.get("year")
    apiKey_url2 = settings.CALENDARIFIC_APIKEY
    apiKey_url3 = settings.APSTRACTAPI_HOLIDAYS_APIKEY
    fetchUrl1 = "https://date.nager.at/api/v3/PublicHolidays/" + requestedYear +"/" + countryCode
    fetchUrl2 = "https://calendarific.com/api/v2/holidays?&api_key=" + apiKey_url2 + "&country=" +countryCode +"&year=" + requestedYear
    fetchUrl3_singleDayOnly = "https://holidays.abstractapi.com/v1/?api_key="+ apiKey_url3 + "&country=" + countryCode + "&year=" + requestedYear + "&month=01&day=01"

    try:
      response = requests.get(fetchUrl1)  
      response.raise_for_status()
      if(response.content.decode("utf-8") == ""):
        #no data in url 1, check url 2
        try:
          response = requests.get(fetchUrl2)  
          response.raise_for_status()
          if(response.content.decode("utf-8") == ""):
            #no data in url 1, check url 2
            print("Error: The country selected is not supported.")
          else:
            public_holidays = json.loads(response.content)["response"]["holidays"]
            for public_holiday in public_holidays:
              holidayDate = public_holiday["date"]["datetime"]
              holidays.append({
                "holidayName":public_holiday["name"],
                "holidayType": "public" if not "season".casefold() in (holidayType.casefold() for holidayType in public_holiday["type"]) else "observance",
                "date": str(holidayDate["year"]) + "-" + str(holidayDate["month"]).zfill(2) + "-" + str(holidayDate["day"]).zfill(2),
              })

        except requests.exceptions.RequestException as e:  
          print("error: " + str(e))
      else:
        public_holidays = json.loads(response.content)
        for public_holiday in public_holidays:
          holidays.append({
            "holidayName":public_holiday["name"],
            "holidayType": "public" if "public".casefold() in (holidayType.casefold() for holidayType in public_holiday["types"]) else "observance",
            "date":public_holiday["date"],
          })

    except requests.exceptions.RequestException as e:  
      print("error: " + str(e))



    return JsonResponse({"status": "success", "data": holidays})
  else: #POST
    return HttpResponseNotAllowed(['GET'])


def session_store(request, session_name, session_value):
    index = loader.get_template('index.html')

    request.session[session_name] = session_value
       
    context = {
       'session_name': session_name, 
       'session_value': session_value, 
    }
    return HttpResponse(index.render(context, request))