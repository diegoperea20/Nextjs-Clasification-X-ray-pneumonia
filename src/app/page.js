"use client";
import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import './card.css';
import Link from 'next/link';

export default function Home() {
  const [model, setModel] = useState(null);
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);

  // Cargar el modelo al montar el componente
  useEffect(() => {
    async function loadModel() {
      const modelUrl = `${window.location.origin}/model/model.json`;
      const model = await tf.loadLayersModel(modelUrl);
      setModel(model);
      console.log('Modelo cargado');
    }
    loadModel();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const classifyImage = async () => {
    if (!model || !image) return;

    const imgElement = document.createElement('img');
    imgElement.src = image;
    imgElement.onload = async () => {
      let tensor = tf.browser.fromPixels(imgElement)
        .resizeNearestNeighbor([150, 150])
        .toFloat()
        .expandDims();

      tensor = tensor.div(255.0);  // Normalizar la imagen
      const prediction = await model.predict(tensor).data();
      setPrediction(prediction);
      console.log(prediction);
    };
  };

  const getResult = () => {
    if (prediction) {
      return prediction[0] < 0.5 ? "Normal" : "Pneumonia";
    }
    return "";
  };

  return (
    <div>
      <h1>Clasification XRAY Pneumonia</h1>
      <div className="e-card playing">
        <div className="wave"></div>

        <div className="infotop">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {image && <img src={image} alt="Uploaded" width="224" height="224" />}
          <br />
          <button onClick={classifyImage}>Classify</button>
          {prediction && <div>Result: {getResult()}</div>}
          <br />
        </div>
      </div>
      <div className="project-github">
        <p>This project is in </p>
        <Link href="https://github.com/diegoperea20/Nextjs-Clasification-X-ray-pneumonia">
          <img width="96" height="96" src="https://img.icons8.com/fluency/96/github.png" alt="github"/>
        </Link>
      </div>
    </div>
  );
}
