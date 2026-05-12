# Label Studio Setup — SANO Skin Conditions v1

Label Studio is where KATH dermatologists and volunteers label skin images
to build the training dataset. Runs completely locally via Docker.

---

## Setup (one-time)

### Step 1 — Install Docker Desktop
Download from: https://www.docker.com/products/docker-desktop
Start Docker Desktop before continuing.

### Step 2 — Start Label Studio
```bash
docker run -it -p 8080:8080 \
  -v $(pwd)/label-studio-data:/label-studio/data \
  heartexlabs/label-studio
```

Open **http://localhost:8080**

### Step 3 — Create account
- Email: use your work email
- Password: any secure password
- This account stays local — nothing is sent to Label Studio cloud

### Step 4 — Create project
1. Click **"Create Project"**
2. Name: `SANO Skin Conditions v1`
3. Description: `Skin condition labelling for SANO AI training — Fitzpatrick IV–VI focus`
4. Click **"Labeling Setup"**
5. Select **"Custom template"**
6. Clear the default XML
7. Paste the full contents of `skin_labelling_config.xml`
8. Click **"Save"**

### Step 5 — Import images
1. Click **"Import"**
2. Choose your cold-start volunteer photos (JPEG/PNG)
3. OR import from local storage: select folder → Label Studio copies files in

### Step 6 — Share with dermatologist partner
1. Go to **Settings → Members**
2. Click **"Add Member"**
3. They receive a login link
4. Share the Label Studio URL on your local network (or use ngrok for remote access):
   ```bash
   ngrok http 8080
   ```
   Share the ngrok URL with your dermatologist.

---

## Labelling workflow

Each image requires:
1. **Conditions** — select all that apply (multi-select)
2. **Fitzpatrick** — skin tone I–VI
3. **Severity** — rate 1–10
4. **Quality** — reject blurry/bad-lit/non-skin images immediately
5. **Body area** — where on the body
6. **Notes** — optional free text for edge cases

Target: **label 50 images before first model training run**

---

## Exporting labels

1. Go to your project
2. Click **Export**
3. Choose **JSON** format
4. Save to `sano-ai/data/labels/batch_001.json`

---

## Data pipeline

```
Volunteer photos → Label Studio → Exported JSON → training/preprocess.py → model fine-tune
```

The `scan_data` analytics events with `queued_for_label: true` are the images
that the model was uncertain about — prioritise these for labelling.

---

## Tips

- Minimum 30 images per condition for meaningful model improvement
- Prioritise Fitzpatrick IV–VI (Types I–III are already well-represented in public datasets)
- Reject any image where the skin condition is ambiguous — clean data beats more data
- Have the dermatologist review at least 20% of volunteer labels for quality control
