import { useCallback, useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
// import HandImg from "../images/hand.jpg";
// import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { useHistory } from "react-router";
const ScanHand = () => {
  const isComponentMounted = useRef({});
  const vdRef = useRef(null);
  const canRef = useRef(null);
  let currentStream = useRef();
  let history = useHistory();
  const [src, setSrc] = useState(null);
  const photoRef = useRef();

  const onResults = useCallback((results) => {
    console.log(results.multiHandLandmarks[0]);
    if (results.multiHandLandmarks[0].length) {
      results.multiHandLandmarks[0].forEach((mark, index) => {
        // console.log(mark);
        let point = document.createElement("div");
        point.classList.add("point");
        point.style.left = `${
          Number(mark.x).toFixed(2) * photoRef.current.width
        }px`;
        point.style.top = `${
          Number(mark.y).toFixed(2) * photoRef.current.height
        }px`;
        document.querySelector(".capturedImgContainer").appendChild(point);
      });
    }
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
      .catch((error) => {
        console.error(error);
      });
  }, []);

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

  const captureImg = () => {
    const ctx = canRef.current.getContext("2d");
    ctx.drawImage(
      vdRef.current,
      0,
      0,
      vdRef.current.videoWidth,
      vdRef.current.videoHeight
    );
    var data = canRef.current.toDataURL("image/png");
    setSrc(data);
  };

  const scanImg = () => {
    console.log("scaning");
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
    async function load() {
      hands.onResults(onResults);
      hands.send({ image: photoRef.current });
    }
    load();
  };

  return (
    <div className="appUi scanPage">
      <div className="scanContainer">
        {/* <div className="capturedImgContainer">
          <img src={HandImg} alt="" className="capturedImg" ref={photoRef} />
        </div> */}
        {src != null ? (
          <div className="capturedImgContainer">
            <img src={src} alt="" className="capturedImg" ref={photoRef} />
          </div>
        ) : (
          <canvas id="canvas" width="360" height="640" ref={canRef}></canvas>
        )}

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
        <button type="button" onClick={captureImg} className="btn">
          Capture Img
        </button>
        <button type="button" onClick={scanImg} className="btn">
          Scan Img
        </button>
      </div>
    </div>
  );
};

export default ScanHand;
