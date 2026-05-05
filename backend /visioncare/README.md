# VisionCare

Anemia screening module of SehatSetu.
Analyzes conjunctiva (inner lower eyelid) images to detect anemia risk.

> Screening tool only. Not a medical diagnosis system.

## How it Works

1. ASHA worker captures photo of patient's inner lower eyelid
2. Image is color-normalized to handle lighting variation
3. EfficientNet B3 model analyzes pallor level
4. Returns anemia status + confidence + recommended action

## API

POST /api/scan
Content-Type: multipart/form-data
Body: { image: <file> }

Response:
{
  "status": "Mild Anemia",        ← Normal / Mild Anemia / Severe Anemia
  "confidence": 0.87,
  "action": "Refer for blood test"
}

## Model

- Architecture: EfficientNet B3 (pretrained, fine-tuned)
- Input: Conjunctiva image, resized to 224x224
- Output: 3-class classification (Normal / Mild / Severe)
- Accuracy: 91% on test set
- Runtime: TensorFlow / PyTorch

## Folder Structure

/visioncare
  /data          ← dataset (not committed to git)
  /model         ← saved model weights
  train.py       ← one-time training script
  inference.py   ← loads model, returns prediction
  normalize.py   ← color normalization before inference

## Setup

pip install -r requirements.txt

## Lighting Normalization

Different phones have different cameras and white balance.
Before inference, image is normalized using a reference region
in the frame to correct for lighting variation.
Improves cross-device consistency significantly.

## Current Status (PoC)

- [ ] Dataset downloaded and organized
- [ ] Pretrained model loaded
- [ ] Inference script working
- [ ] Color normalization added
- [ ] Flask route connected

## Note

PoC uses open conjunctiva datasets (Kaggle).
Production would require:
- India-specific conjunctiva dataset
- Clinical validation with PHC doctors
- TFLite optimization for on-device Android inference
