import tensorflow as tf
import os

print("Loading Keras model from models/DermaAI.keras...")
try:
    model = tf.keras.models.load_model('models/DermaAI.keras')
except Exception as e:
    print(f"Error loading model: {e}")
    print("Trying with absolute path...")
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, 'models', 'DermaAI.keras')
    model = tf.keras.models.load_model(model_path)

print("Converting to TFLite with optimizations...")
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

print("Saving TFLite model...")
out_path = os.path.join(base_dir, 'models', 'DermaAI.tflite')
with open(out_path, 'wb') as f:
    f.write(tflite_model)

print(f"Done! Saved as {out_path}")
print(f"Original size: {os.path.getsize(os.path.join(base_dir, 'models', 'DermaAI.keras')) / 1024 / 1024:.2f} MB")
print(f"Compressed size: {os.path.getsize(out_path) / 1024 / 1024:.2f} MB")
