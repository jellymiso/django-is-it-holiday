import json
import requests
from django.conf import settings

TEXT_TO_IMAGE_MODEL = "black-forest-labs/FLUX.1-schnell"
API_URL = f"https://router.huggingface.co/hf-inference/models/{TEXT_TO_IMAGE_MODEL}"

def generateHuggingFaceImage(holiday, country, year, steps=4):
    """
    Generates an image using Hugging Face Inference API.
    Returns bytes on success, or a dict with error info on failure.
    """
    headers = {
        "Authorization": f"Bearer {settings.HUGGING_FACE_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    prompt = (
        f"{holiday} {country} {year}, minimalist background scene, "
        "wide angle, soft focus, bokeh, cinematic lighting, "
        "clean composition, high resolution, 4k"
    )

    payload = {
        "inputs": prompt,
        "parameters": {
            "num_inference_steps": steps,
            #"output_format": "image"  # ensures we get image bytes back
        }
    }
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=5)
        print("HF response:", response.__dict__)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        return {"status": "error", "error_msg": f"RequestException: {str(e)}"}

    # Check if response is JSON without try/except
    content_str = response.content.decode("utf-8", errors="ignore").strip()
    is_json = content_str.startswith("{") or content_str.startswith("[")
    if is_json:
        data_json = json.loads(content_str)
        if "error" in data_json:
            return {"status": "error", "error_msg": f"APIError: {data_json['error']}"}

    # Otherwise treat it as raw image bytes
    return {"status": "success", "data": response.content, "type": "hugging_face"}