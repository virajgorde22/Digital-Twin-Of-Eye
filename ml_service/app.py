import os
import io

import torch
import torch.nn as nn
import timm

from PIL import Image
from torchvision import transforms

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="RETFound Eye Disease Detection API",
    description="AI service for retinal disease prediction using RETFound",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# CONFIGURATION
# ============================================================

PROJECT_ROOT = os.path.dirname(
    os.path.abspath(__file__)
)

RFMiD_MODEL_PATH = os.path.join(
    PROJECT_ROOT,
    "saved_models",
    "retfound_rfimd_model.pth"
)

ODIR_MODEL_PATH = os.path.join(
    PROJECT_ROOT,
    "saved_models",
    "retfound_rfimd_odir_model.pth"
)


NUM_CLASSES = 8

CLASS_NAMES = [
    "Diabetic Retinopathy",
    "Glaucoma",
    "Cataract",
    "Age-related Macular Degeneration",
    "Hypertension",
    "Myopia",
    "Other Diseases",
    "Normal"
]

DEFAULT_THRESHOLD = 0.50


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print(f"Using device: {DEVICE}")


# ============================================================
# RETFOUND MODEL
# ============================================================

class RETFoundDiseaseClassifier(nn.Module):

    def __init__(self, num_classes=8):

        super().__init__()

        self.backbone = timm.create_model(
            "vit_base_patch16_224.augreg_in21k",
            pretrained=False,
            num_classes=0
        )

        feature_dim = self.backbone.num_features

        self.classifier = nn.Linear(
            feature_dim,
            num_classes
        )

    def forward(self, x):

        features = self.backbone(x)

        output = self.classifier(features)

        return output


# ============================================================
# CHECKPOINT LOADER
# ============================================================

def load_checkpoint(model_path):

    if not os.path.exists(model_path):

        raise FileNotFoundError(
            f"Model file not found: {model_path}"
        )

    model = RETFoundDiseaseClassifier(
        num_classes=NUM_CLASSES
    )

    checkpoint = torch.load(
        model_path,
        map_location=DEVICE,
        weights_only=False
    )

    # --------------------------------------------------------
    # Handle different checkpoint formats
    # --------------------------------------------------------

    if isinstance(checkpoint, dict):

        if "model_state_dict" in checkpoint:

            state_dict = checkpoint["model_state_dict"]

        elif "state_dict" in checkpoint:

            state_dict = checkpoint["state_dict"]

        elif "model" in checkpoint:

            state_dict = checkpoint["model"]

        else:

            state_dict = checkpoint

    else:

        state_dict = checkpoint


    # --------------------------------------------------------
    # Remove DataParallel prefix
    # --------------------------------------------------------

    cleaned_state_dict = {}

    for key, value in state_dict.items():

        new_key = key

        if new_key.startswith("module."):

            new_key = new_key[7:]

        cleaned_state_dict[new_key] = value


    # --------------------------------------------------------
    # Load weights
    # --------------------------------------------------------

    missing, unexpected = model.load_state_dict(
        cleaned_state_dict,
        strict=False
    )

    if missing:

        print("Missing keys:")

        for key in missing:

            print(" ", key)


    if unexpected:

        print("Unexpected keys:")

        for key in unexpected:

            print(" ", key)


    model = model.to(DEVICE)

    model.eval()

    return model


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

transform = transforms.Compose([

    transforms.Resize((224, 224)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================================
# LOAD MODELS
# ============================================================

print("Loading RFMiD model...")

rfmid_model = load_checkpoint(
    RFMiD_MODEL_PATH
)

print("RFMiD model loaded successfully.")


print("Loading RFMiD → ODIR model...")

odir_model = load_checkpoint(
    ODIR_MODEL_PATH
)

print("RFMiD → ODIR model loaded successfully.")


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict(model, image):

    image_tensor = transform(image)

    image_tensor = image_tensor.unsqueeze(0)

    image_tensor = image_tensor.to(DEVICE)

    with torch.no_grad():

        logits = model(image_tensor)

        probabilities = torch.sigmoid(logits)

    probabilities = (
        probabilities[0]
        .detach()
        .cpu()
        .numpy()
    )

    return probabilities


# ============================================================
# CONVERT PROBABILITIES TO DICTIONARY
# ============================================================

def probabilities_to_dict(probabilities):

    result = {}

    for i, disease in enumerate(CLASS_NAMES):

        result[disease] = float(
            probabilities[i]
        )

    return result


# ============================================================
# GET TOP PREDICTION
# ============================================================

def get_top_prediction(probabilities):

    top_index = int(
        probabilities.argmax()
    )

    return {
        "disease": CLASS_NAMES[top_index],
        "confidence": float(
            probabilities[top_index]
        )
    }


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "RETFound Eye Disease Detection API",
        "status": "running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "device": str(DEVICE),
        "rfmid_model_loaded": rfmid_model is not None,
        "odir_model_loaded": odir_model is not None
    }


# ============================================================
# PREDICTION ENDPOINT
# ============================================================

@app.post("/predict")
async def predict_eye_disease(
    file: UploadFile = File(...)
):

    # --------------------------------------------------------
    # Validate file type
    # --------------------------------------------------------

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
        "image/bmp"
    ]

    if file.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail="Only retinal image files are allowed."
        )


    # --------------------------------------------------------
    # Read image
    # --------------------------------------------------------

    try:

        image_bytes = await file.read()

        image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=f"Invalid image: {str(e)}"
        )


    # --------------------------------------------------------
    # Run RFMiD model
    # --------------------------------------------------------

    try:

        rfmid_probabilities = predict(
            rfmid_model,
            image
        )


        # ----------------------------------------------------
        # Run RFMiD → ODIR model
        # ----------------------------------------------------

        odir_probabilities = predict(
            odir_model,
            image
        )


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


    # --------------------------------------------------------
    # Prepare response
    # --------------------------------------------------------

    rfmid_results = probabilities_to_dict(
        rfmid_probabilities
    )

    odir_results = probabilities_to_dict(
        odir_probabilities
    )


    rfmid_top = get_top_prediction(
        rfmid_probabilities
    )

    odir_top = get_top_prediction(
        odir_probabilities
    )


    # --------------------------------------------------------
    # Return JSON
    # --------------------------------------------------------

    return {

        "filename": file.filename,

        "rfmid": rfmid_results,

        "odir": odir_results,

        "rfmidTopPrediction": rfmid_top,

        "odirTopPrediction": odir_top

    }


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=False
    )