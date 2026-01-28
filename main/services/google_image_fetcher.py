# myapp/services/google_image_fetcher.py

import requests
import json
from django.conf import settings

def getGoogleImageResults(holiday, country, code, year):
    fetchURL = (
        "https://www.googleapis.com/customsearch/v1?key=" + settings.G_CSE_APIKEY +
        "&cx=" + settings.G_CSE_CX +
        "&imgType=photo&searchType=image" +
        "&siteSearch=facebook.com%20instagram.com%20linkedin.com%20yahoo.com" +
        "&cr=country" + code +
        "&siteSearchFilter=e" +
        "&q=:%22" + holiday + "%22%20" + country + "%20" + year +
        "%20-calendar%20-travel%20-tour%20-package%20-deals%20-store"
    )

    try:
        response = requests.get(fetchURL, timeout=3)
        print(fetchURL)
        response.raise_for_status()
        if(response.content.decode("utf-8") == ""):
            print("no data, check xhr response")
            return {"status": "error", "error_msg": "Unknown Error."}
        else:
            print("data loaded")
            data = json.loads(response.content)
            return {"status": "success", "data": data, "type": "google"}
        
    except requests.exceptions.RequestException as e:  
        print("error, check xhr response")
        return {"status": "error", "error_msg": "RequestException: " + str(e)}
