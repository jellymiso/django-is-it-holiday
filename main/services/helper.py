import base64
import random

import requests


def getImageAsDataURL(dataToProcess, source_type):
    if len(dataToProcess) == 0:
        return {"status": "error", "error_msg": "No images available"}

    print("source_type: " + str(source_type))
    if source_type not in ["google", "brave", "hugging_face"]:
        return {"status": "error", "error_msg": "Unknown type"}

    # clone the original data to allow retries
    originalData = dataToProcess

    if source_type == "hugging_face":
        # dataToProcess is already raw bytes
        try:
            dataImage = "data:image/jpeg;base64," + base64.b64encode(dataToProcess).decode("utf-8")
            return {"status": "success", "data": {"data_image_string": dataImage}}
        except Exception as e:
            return {"status": "error", "error_msg": f"ImageProcessingError: {str(e)}"}


    randomIndex = random.randint(0, len(dataToProcess) - 1)
    match source_type:
        case "google":
            dataToProcess = dataToProcess["items"]
            print("\n\rchosen item data: " + str(dataToProcess[randomIndex]))
            imageURL = dataToProcess[randomIndex]["link"]
        case "brave":
            dataToProcess = dataToProcess["results"]
            print("\n\rchosen item data: " + str(dataToProcess[randomIndex]))
            imageURL = dataToProcess[randomIndex]["properties"]["url"]
    try:
        response = requests.get(imageURL)
        imageData = response.content
        dataImage = "data:image/jpeg;base64," + base64.b64encode(imageData).decode('utf-8')
        print("\n\rdataImage: " + str(dataImage))
        return {"status": "success", "data": {"data_image_string": dataImage}}

    except requests.exceptions.RequestException as e:
        # remove the failed item and retry
        originalData.pop(randomIndex)
        return getImageAsDataURL(originalData, source_type)
