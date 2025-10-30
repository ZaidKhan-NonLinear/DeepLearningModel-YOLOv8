from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import uvicorn
import tempfile
import os

app = FastAPI(title="YOLO Inference API")

try:
    model = YOLO("model/best.pt")
except Exception as e:
    model = None
    load_error = str(e)
else:
    load_error = None


@app.get("/")
def health_check():
    if model is None:
        raise HTTPException(status_code=500, detail={"status": "error", "message": f"Model failed to load: {load_error}"})
    return {"status": "ok"}


@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail=f"Model failed to load: {load_error}")

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    suffix = os.path.splitext(file.filename)[1] or ".jpg"
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name

        results = model.predict(source=tmp_path, save=False)

        predictions = []
        for r in results:
            boxes = []
            if hasattr(r, "boxes") and r.boxes is not None:
                xyxy = r.boxes.xyxy.tolist()
                conf = r.boxes.conf.tolist() if getattr(r.boxes, "conf", None) is not None else [None] * len(xyxy)
                cls = r.boxes.cls.tolist() if getattr(r.boxes, "cls", None) is not None else [None] * len(xyxy)
                names = getattr(r, "names", {}) or {}
                for i in range(len(xyxy)):
                    boxes.append({
                        "bbox": xyxy[i],
                        "confidence": conf[i],
                        "class_id": cls[i],
                        "class_name": names.get(int(cls[i])) if cls[i] is not None and int(cls[i]) in names else None,
                    })
            predictions.append({
                "boxes": boxes,
                "img_shape": getattr(r, "orig_shape", None),
            })

        return JSONResponse(content={"predictions": predictions})
    finally:
        try:
            if 'tmp_path' in locals() and os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            pass


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)