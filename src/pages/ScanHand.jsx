import { useCallback, useEffect, useRef } from "react";
import { Hands } from "@mediapipe/hands";
import * as hands from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { useHistory } from "react-router";
const ScanHand = () => {
  const isComponentMounted = useRef({});
  const vdRef = useRef(null);
  const canRef = useRef(null);
  let currentStream = useRef();
  let history = useHistory();

  const onResults = useCallback((results) => {
    let videoWidth = null;
    let videoHeight = null;
    if (vdRef != null) {
      videoWidth = vdRef.current.videoWidth;
      videoHeight = vdRef.current.videoHeight;
    }

    canRef.current.width = videoWidth;
    canRef.current.height = videoHeight;

    const canvasElement = canRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, landmarks, hands.HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 2,
        });
        drawLandmarks(canvasCtx, landmarks, { color: "#00ffd0", lineWidth: 1 }); //#5d0db8 purple
      }
    }
    canvasCtx.restore();
  }, []);

  const startCam = useCallback(() => {
    const constraints = {
      video: {
        facingMode: "environment",
      },
      audio: false,
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        currentStream.current = stream;
        vdRef.current.srcObject = stream;
        return navigator.mediaDevices.enumerateDevices();
      })
      .then(() => {
        const hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });
        hands.setOptions({
          maxNumHands: 2,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        hands.onResults(onResults);

        const camera = new cam.Camera(vdRef.current, {
          onFrame: async () => {
            await hands.send({ image: vdRef.current });
          },
        });
        camera.start();
      })
      .catch((error) => {
        console.error(error);
      });
  }, [onResults]);

  function stopMediaTracks(stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }
  useEffect(() => {
    if (isComponentMounted.current) {
      if (typeof currentStream.current !== "undefined") {
        stopMediaTracks(currentStream.current);
      }
      startCam();
    }
    return () => {
      isComponentMounted.current = false;
    };
  }, [startCam]);

  const gotoBack = useCallback(() => {
    vdRef.current.pause();
    vdRef.current.src = "";
    history.push("/");
  }, [vdRef, history]);

  return (
    <div className="appUi scanPage">
      <div className="scanContainer">
        <canvas id="canvas" width="360" height="640" ref={canRef}></canvas>
        <div id="videoContainer">
          <video
            width="360"
            height="640"
            id="video"
            ref={vdRef}
            autoPlay
            playsInline
            muted
          ></video>
        </div>
        <button type="button" onClick={gotoBack} className="btn">
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ScanHand;
