# myapp/services/brave_image_fetcher.py

import requests
import json
from django.conf import settings

def getBraveImageResults(holiday, country, year):
    """
    Fetch images from Brave Search API using the exact same string concatenation style as Google fetcher.
    """
    fetchURL = (
        "https://api.search.brave.com/res/v1/images/search?q=" + holiday + "%20" + country + "%20" + year +
        "&country=ALL&search_lang=en&count=20&safesearch=off&spellcheck=false"
    )

    headers = {
        "X-Subscription-Token": settings.BRAVE_SEARCH_APIKEY
    }

    try:
        response = requests.get(fetchURL, headers=headers, timeout=3)
        print(fetchURL)
        response.raise_for_status()

        if response.content.decode("utf-8") == "":
            print("no data, check xhr response")
            return {"status": "error", "error_msg": "Unknown Error."}
        else:
            print("data loaded")
            data = json.loads(response.content)
            return {"status": "success", "data": data, "type": "brave"}

    except requests.exceptions.RequestException as e:
        print("error, check xhr response")
        return {"status": "error", "error_msg": "RequestException: " + str(e)}

