"""
VisionCare — CNN Training Script
==================================
Model:   MobileNetV3-Small (fast, works on 4GB VRAM)
Dataset: EYES-DEFY-ANEMIA (India + Italy conjunctiva images)
Labels:  Hgb >= 11.5 → Normal | 9.0-11.5 → Mild | <9.0 → Severe

Run:
  python train.py

Output:
  model/visioncare_model.pth
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from torchvision import transforms, models
from PIL import Image
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

# ─────────────────────────────────────────
# CONFIG — edit paths if needed
# ─────────────────────────────────────────
DATA_DIRS = {
    "India": r"c:\Users\chari\OneDrive\Desktop\ss\sehatsetu\dataset anemia\India",
    "Italy": r"c:\Users\chari\OneDrive\Desktop\ss\sehatsetu\dataset anemia\Italy",
}
XLSX_FILES = {
    "India": r"c:\Users\chari\OneDrive\Desktop\ss\sehatsetu\dataset anemia\India\India.xlsx",
    "Italy": r"c:\Users\chari\OneDrive\Desktop\ss\sehatsetu\dataset anemia\Italy\Italy.xlsx",
}
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "model", "visioncare_model.pth")

BATCH_SIZE   = 8      # safe for RTX 2050 4GB VRAM
EPOCHS       = 15
LR           = 0.0005
IMAGE_SIZE   = 224
DEVICE       = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ─────────────────────────────────────────
# LABEL MAPPING
# ─────────────────────────────────────────
CLASS_NAMES = ["Normal", "Mild Anemia", "Moderate Anemia"]

def get_label(hgb: float) -> int:
    """
    WHO anemia thresholds (adults):
      Normal:   Hgb >= 11.5
      Mild:     9.0 <= Hgb < 11.5
      Moderate: Hgb < 9.0
    """
    if hgb >= 11.5:
        return 0
    elif hgb >= 9.0:
        return 1
    else:
        return 2


# ─────────────────────────────────────────
# DATASET
# ─────────────────────────────────────────
class ConjunctivaDataset(Dataset):
    def __init__(self, data_list, transform=None):
        self.data_list = data_list  # list of (img_path, label)
        self.transform = transform

    def __len__(self):
        return len(self.data_list)

    def __getitem__(self, idx):
        img_path, label = self.data_list[idx]
        img = Image.open(img_path).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, label


def prepare_data() -> list:
    """
    Load all images from both countries.
    Uses ALL images per patient folder (3 slices + eye photo = up to 4 samples).
    Fix: handles European decimal format (15,1 → 15.1).
    """
    all_data = []

    for country in ["India", "Italy"]:
        df = pd.read_excel(XLSX_FILES[country])
        base_dir = DATA_DIRS[country]

        # Fix European decimal format in Hgb column
        df["Hgb"] = df["Hgb"].astype(str).str.replace(",", ".")
        df["Hgb"] = pd.to_numeric(df["Hgb"], errors="coerce")  # '_' and bad values → NaN
        df = df.dropna(subset=["Hgb"])  # drop those rows
        skipped = 0
        for _, row in df.iterrows():
            patient_id = str(int(row["Number"]))
            hgb = float(row["Hgb"])
            label = get_label(hgb)

            patient_dir = os.path.join(base_dir, patient_id)
            if not os.path.exists(patient_dir):
                skipped += 1
                continue

            # Collect and VERIFY images in folder
            corrupt_skipped = 0
            for img_name in os.listdir(patient_dir):
                if img_name.lower().endswith((".jpg", ".jpeg", ".png", ".bmp")):
                    img_path = os.path.join(patient_dir, img_name)
                    try:
                        # Attempt to open to verify file integrity
                        with Image.open(img_path) as img:
                            img.verify() 
                        all_data.append((img_path, label))
                    except Exception:
                        corrupt_skipped += 1
                        continue

            if corrupt_skipped > 0:
                print(f"    - Skipped {corrupt_skipped} corrupt images in patient {patient_id}")

        print(f"  {country}: {len(df) - skipped} patients loaded, {skipped} skipped")

    # Print class distribution
    labels = [d[1] for d in all_data]
    for i, name in enumerate(CLASS_NAMES):
        count = labels.count(i)
        print(f"  {name}: {count} images ({count/len(labels)*100:.1f}%)")

    print(f"  Total: {len(all_data)} images")
    return all_data


# ─────────────────────────────────────────
# TRANSFORMS
# ─────────────────────────────────────────
train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(15),
    # Color jitter simulates different phone cameras + lighting
    transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

val_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


# ─────────────────────────────────────────
# CLASS BALANCING
# ─────────────────────────────────────────
def make_sampler(data_list):
    """
    WeightedRandomSampler — gives rare classes equal chance.
    Important because dataset may have more Normal than Severe.
    """
    labels = [d[1] for d in data_list]
    class_counts = np.bincount(labels, minlength=3)
    class_weights = 1.0 / (class_counts + 1e-6)
    sample_weights = [class_weights[l] for l in labels]
    return WeightedRandomSampler(sample_weights, len(sample_weights), replacement=True)


# ─────────────────────────────────────────
# MODEL
# ─────────────────────────────────────────
def build_model():
    """
    MobileNetV3-Small: lightweight, fast, works on 4GB VRAM.
    Replace final classifier for 3-class output.
    Fine-tune all layers (small dataset needs full fine-tuning).
    """
    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_features, 3)
    return model.to(DEVICE)


# ─────────────────────────────────────────
# TRAIN + EVAL
# ─────────────────────────────────────────
def train_epoch(model, loader, optimizer, criterion):
    model.train()
    total_loss, correct, total = 0.0, 0, 0

    for imgs, labels in loader:
        imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
        optimizer.zero_grad()
        out = model(imgs)
        loss = criterion(out, labels)
        loss.backward()
        optimizer.step()

        total_loss += loss.item()
        correct += (out.argmax(1) == labels).sum().item()
        total += labels.size(0)

    return total_loss / len(loader), correct / total


def eval_epoch(model, loader, criterion):
    model.eval()
    total_loss, correct, total = 0.0, 0, 0
    all_preds, all_labels = [], []

    with torch.no_grad():
        for imgs, labels in loader:
            imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
            out = model(imgs)
            loss = criterion(out, labels)

            total_loss += loss.item()
            preds = out.argmax(1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    return total_loss / len(loader), correct / total, all_preds, all_labels


# ─────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────
def train():
    print("=" * 60)
    print("🚀 VisionCare — CNN Training")
    print(f"   Device : {DEVICE}")
    if DEVICE.type == "cuda":
        print(f"   GPU    : {torch.cuda.get_device_name(0)}")
        print(f"   VRAM   : {torch.cuda.get_device_properties(0).total_memory/1e9:.1f} GB")
    print("=" * 60)

    # Data
    print("\n📂 Loading dataset...")
    all_data = prepare_data()

    # Split: 70% train, 15% val, 15% test
    labels_all = [d[1] for d in all_data]
    train_data, temp_data = train_test_split(
        all_data, test_size=0.30, random_state=42, stratify=labels_all
    )
    labels_temp = [d[1] for d in temp_data]
    val_data, test_data = train_test_split(
        temp_data, test_size=0.50, random_state=42, stratify=labels_temp
    )
    print(f"\n📦 Split: train={len(train_data)} | val={len(val_data)} | test={len(test_data)}")

    # Loaders
    train_ds = ConjunctivaDataset(train_data, train_transform)
    val_ds   = ConjunctivaDataset(val_data,   val_transform)
    test_ds  = ConjunctivaDataset(test_data,  val_transform)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE,
                              sampler=make_sampler(train_data), num_workers=2)
    val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE, shuffle=False, num_workers=2)
    test_loader  = DataLoader(test_ds,  batch_size=BATCH_SIZE, shuffle=False, num_workers=2)

    # Model
    model     = build_model()
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LR)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.5)

    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"\n🧠 Model: MobileNetV3-Small | Trainable params: {trainable:,}")

    # Training loop
    best_val_acc  = 0.0
    best_model_path = MODEL_SAVE_PATH
    os.makedirs(os.path.dirname(best_model_path), exist_ok=True)

    print("\n" + "─" * 60)
    for epoch in range(1, EPOCHS + 1):
        train_loss, train_acc = train_epoch(model, train_loader, optimizer, criterion)
        val_loss, val_acc, _, _ = eval_epoch(model, val_loader, criterion)
        scheduler.step()

        saved = ""
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), best_model_path)
            saved = " ← saved ✅"

        print(f"Epoch {epoch:02d}/{EPOCHS} | "
              f"Train loss: {train_loss:.3f} acc: {train_acc:.3f} | "
              f"Val loss: {val_loss:.3f} acc: {val_acc:.3f}{saved}")

    # Final test evaluation
    print("\n" + "─" * 60)
    print("📊 Final Test Results (best model):")
    model.load_state_dict(torch.load(best_model_path))
    _, test_acc, preds, true_labels = eval_epoch(model, test_loader, criterion)

    print(f"\n   Test Accuracy: {test_acc*100:.1f}%")
    print(f"\n{classification_report(true_labels, preds, target_names=CLASS_NAMES)}")
    print(f"\nConfusion Matrix:")
    print(confusion_matrix(true_labels, preds))

    print(f"\n✅ Model saved → {best_model_path}")
    print(f"\n💬 Tell judges:")
    print(f"   Architecture : MobileNetV3-Small (transfer learning)")
    print(f"   Dataset      : EYES-DEFY-ANEMIA (India + Italy conjunctiva images)")
    print(f"   Test Accuracy: {test_acc*100:.1f}%")
    print(f"   Classes      : Normal / Mild Anemia / Moderate Anemia")


if __name__ == "__main__":
    train()