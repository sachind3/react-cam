import { useCallback, useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { useHistory } from "react-router";
import { HiArrowLeft } from "react-icons/hi";
import { IoMdHand } from "react-icons/io";
const ScanHand = () => {
  const isComponentMounted = useRef({});
  const vdRef = useRef(null);
  const canRef = useRef(null);
  let currentStream = useRef();
  let history = useHistory();
  const [src, setSrc] = useState(null);
  const photoRef = useRef();
  const [isScan, setIsScan] = useState(false);

  const onResults = useCallback((results) => {
    if (results.multiHandLandmarks.length > 0) {
      setTimeout(() => {
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
          setIsScan(false);
        });
      }, 2000);
    } else {
      alert("Hand not detected");
      setIsScan(false);
    }
  }, []);

  const startCam = useCallback(() => {
    const constraints = {
      video: {
        // width: { ideal: 300 },
        // height: { ideal: 400 },
        facingMode: "environment",
        // aspectRatio: 0.75,
      },
      audio: false,
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        currentStream.current = stream;
        vdRef.current.srcObject = stream;
        console.log(vdRef.current.videoWidth);
        // canRef.current.width = vdRef.current.videoWidth;
        // canRef.current.height = (canRef.current.width / 75) * 100;
        return navigator.mediaDevices.enumerateDevices();
      })
      .then(() => {})
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
    setIsScan(true);
    const ctx = canRef.current.getContext("2d");
    canRef.current.width = vdRef.current.videoWidth;
    canRef.current.height = (canRef.current.width / 75) * 100;
    ctx.drawImage(
      vdRef.current,
      0,
      0,
      vdRef.current.videoWidth,
      vdRef.current.videoHeight
    );
    var data = canRef.current.toDataURL("image/png");
    setSrc(data);
    setTimeout(() => {
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
    }, 1000);
  };

  return (
    <div className="appUi scanPage">
      <div className="scanContainer">
        {/* <div className="capturedImgContainer">
          <img src={HandImg} alt="" className="capturedImg" ref={photoRef} />
        </div> */}
        {src != null && (
          <div
            className={` ${
              isScan ? "scanning capturedImgContainer" : "capturedImgContainer"
            }`}
          >
            <img src={src} alt="" className="capturedImg" ref={photoRef} />
          </div>
        )}
        <canvas id="canvas" width="300" height="400" ref={canRef}></canvas>
        <div id="videoContainer">
          <video
            width="300"
            height="400"
            id="video"
            ref={vdRef}
            autoPlay
            playsInline
            muted
          ></video>
        </div>
      </div>
      <button type="button" onClick={gotoBack} className="backBtn">
        <HiArrowLeft />
      </button>
      <button type="button" onClick={captureImg} className="scanBtn">
        <IoMdHand />
      </button>
      {/* <button type="button" onClick={scanImg} className="btn">
        Scan Img
      </button> */}
    </div>
  );
};

export default ScanHand;
