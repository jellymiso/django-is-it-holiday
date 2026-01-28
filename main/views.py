# from .models import Main
import json
import base64
import random
import requests 
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotAllowed, JsonResponse
from django.template import loader
from django.conf import settings
from .services.google_image_fetcher import getGoogleImageResults
from .services.brave_image_fetcher import getBraveImageResults
from .services.hugging_face_image_generator import generateHuggingFaceImage
from .services.helper import getImageAsDataURL

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
    api_errors = []

    if request.method != 'GET':
        return HttpResponseNotAllowed(['GET'])

    holiday = request.GET.get("hname")
    country = request.GET.get("cname")
    code = request.GET.get("ccode")
    year = request.GET.get("year")

  # --- Try Google first ---
    googleImageData = getGoogleImageResults(holiday, country, code, year)
    if googleImageData["status"] == "success":
        print("google search succeeded")
        print("\n\rgoogleImageData: ") 
        print(googleImageData)
        result = getImageAsDataURL(googleImageData['data'], googleImageData['type'])
        if result["status"] == "success":
            print("google image processing succeeded")
            return JsonResponse({
                "status": "success",
                "data": {"imageURL": result["data"]["data_image_string"]},
                "remarks": ""
            })
        else:
            print("google image processing failed")
            api_errors.append("GoogleImageLoadError: " + result["error_msg"])
    else:
        print("google search failed")
        api_errors.append("GoogleImageFetchError: " + googleImageData["error_msg"])


  # --- Fallback to Brave Search --- 
    braveImageData = getBraveImageResults(holiday, country, year) 
    if braveImageData["status"] == "success": 
      print("\n\rbraveImageData: ") 
      print(braveImageData)
      print("brave search succeeded")
      result = getImageAsDataURL(braveImageData['data'], braveImageData['type']) 
      if result["status"] == "success": 
        print("brave image processing succeeded")
        return JsonResponse({ 
          "status": "success", 
          "data": {"imageURL" : result["data"]["data_image_string"]},
          "remarks": "The following error(s) were encounted:", 
          "error_chunks": api_errors 
        }) 
      else: 
        print("brave image processing failed")
        api_errors.append("BraveImageLoadError: " + result["error_msg"]) 
    else:
      print("brave search failed")
      api_errors.append("BraveImageFetchError: " + braveImageData["error_msg"])


  # --- Fallback to Hugging Face AI ---
    huggingFaceData = generateHuggingFaceImage(holiday, country, year)
    if huggingFaceData["status"] == "success":
        print("hugging face generation succeeded")
        result = getImageAsDataURL(huggingFaceData["data"], huggingFaceData["type"])
        if result["status"] == "success":
            print("hugging face image processing succeeded")
            return JsonResponse({
                "status": "success",
                "data": {"imageURL": result["data"]["data_image_string"]},
                "remarks": "The following error(s) were encountered:",
                "error_chunks": api_errors
            })
        else:
            print("hugging face image processing failed")
            api_errors.append("HuggingFaceImageLoadError: " + result["error_msg"])
    else:
        print("hugging face generation failed")
        api_errors.append("HuggingFaceFetchError: " + huggingFaceData["error_msg"])

    # --- If all fail ---
    print("All failed")
    return JsonResponse({
        "status": "error",
        "error_msg": "The following error(s) were encountered:",
        "error_chunks": api_errors
    })
  

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