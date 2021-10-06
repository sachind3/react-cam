import { useCallback, useEffect, useRef, useState } from "react";
import turfproLogo from "./../images/turfproLogo.png";
import { Hands } from "@mediapipe/hands";
import { useHistory } from "react-router";
import { HiArrowLeft, HiOutlineHome } from "react-icons/hi";
import { mobileAndTabletCheck } from "./../helpers/Utils";
import scanBtn from "../images/scanBtn.png";
import cleanBtn from "../images/cleanBtn.png";
import wash from "../images/wash.gif";
import giphy from "../images/giphy.gif";
const ScanHand = () => {
  const isComponentMounted = useRef({});
  const vdRef = useRef(null);
  const canRef = useRef(null);
  const vidBorderRef = useRef(null);
  let currentStream = useRef();
  let history = useHistory();
  const [src, setSrc] = useState(null);
  const [scanDone, setScanDone] = useState(false);
  const [cleanDone, setCleanDone] = useState(false);
  const [allClean, setAllClean] = useState(false);
  const photoRef = useRef();
  const [isScan, setIsScan] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const onResults = useCallback((results) => {
    if (results.multiHandLandmarks.length > 0) {
      setTimeout(() => {
        results.multiHandLandmarks[0].forEach((mark, index) => {
          let point = document.createElement("div");
          point.classList.add("point");
          point.classList.add(`point-${index}`);
          point.style.left = `${
            Number(mark.x).toFixed(2) * photoRef.current.width
          }px`;
          point.style.top = `${
            Number(mark.y).toFixed(2) * photoRef.current.height
          }px`;
          document.querySelector(".capturedImgContainer").appendChild(point);
          setIsScan(false);
        });
        let pointPalm = document.createElement("div");
        pointPalm.classList.add("point");
        pointPalm.classList.add(`point-palm`);
        let palm0X =
          Number(results.multiHandLandmarks[0][0].x).toFixed(2) *
          photoRef.current.width;
        let palm9X =
          Number(results.multiHandLandmarks[0][9].x).toFixed(2) *
          photoRef.current.width;
        let palm0y =
          Number(results.multiHandLandmarks[0][0].y).toFixed(2) *
          photoRef.current.height;
        let palm9y =
          Number(results.multiHandLandmarks[0][9].y).toFixed(2) *
          photoRef.current.height;
        pointPalm.style.left = `${(palm0X - palm9X) / 2 + palm9X}px`;
        pointPalm.style.top = `${(palm0y - palm9y) / 2 + palm9y}px`;

        document.querySelector(".capturedImgContainer").appendChild(pointPalm);
        vidBorderRef.current.remove();
        photoRef.current.classList.add("blur");
        setScanDone(true);
      }, 2000);
    } else {
      setShowAlert(true);
      // alert("Hand not detected");
      setIsScan(false);
      const ctx = canRef.current.getContext("2d");
      ctx.clearRect(0, 0, canRef.current.width, canRef.current.height);
      setSrc(null);
    }
  }, []);

  const startCam = useCallback(() => {
    let constraints = null;
    if (!mobileAndTabletCheck()) {
      // alert("desktop");
      constraints = {
        video: {
          width: 360,
          height: 480,
          aspectRatio: 0.75,
        },
        audio: false,
      };
    } else {
      // alert("mobile");
      constraints = {
        video: {
          facingMode: "environment",
        },

        audio: false,
      };
    }
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        currentStream.current = stream;
        vdRef.current.srcObject = stream;
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
    ctx.clearRect(0, 0, canRef.current.width, canRef.current.height);
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
  const cleanImg = () => {
    setCleanDone(true);
    cleanHand();
  };
  function cleanHand() {
    setTimeout(() => {
      setCleanDone(false);
      setAllClean(true);
      setTimeout(() => {
        document.querySelector(".cleanHand").classList.remove("show");
      }, 2000);
    }, 2000);
    document.querySelectorAll(".point").forEach((item) => {
      item.remove();
    });
    photoRef.current.classList.remove("blur");
  }

  return (
    <div className="appUi scanPage">
      <div className="header">
        {allClean ? (
          <button
            type="button"
            onClick={() => history.push("/")}
            className="backBtn"
          >
            <HiOutlineHome />
          </button>
        ) : (
          <button type="button" onClick={gotoBack} className="backBtn">
            <HiArrowLeft />
          </button>
        )}

        <img src={turfproLogo} alt="turfproLogo" className="turfproLogo" />
      </div>
      {showAlert && (
        <div className="alert">
          <div className="alertBody">
            <p>Hand not detected</p>
            <button onClick={() => setShowAlert(false)}>Try Again</button>
          </div>
        </div>
      )}
      <div className="scanContainer">
        <div className={`${allClean ? "cleanHand show" : "cleanHand"}`}>
          <img src={giphy} alt="giphy" />
        </div>
        <div className={`${cleanDone ? "washHand show" : "washHand"}`}>
          <img src={wash} alt="wash" />
        </div>

        <div className="videoBorder" ref={vidBorderRef}></div>
        {src != null && (
          <div
            className={` ${
              isScan ? "scanning capturedImgContainer" : "capturedImgContainer"
            }`}
          >
            <img src={src} alt="" className="capturedImg" ref={photoRef} />
          </div>
        )}
        <canvas id="canvas" width="360" height="480" ref={canRef}></canvas>
        <div id="videoContainer">
          <video
            width="360"
            height="480"
            id="video"
            ref={vdRef}
            autoPlay
            playsInline
            muted
          ></video>
        </div>
      </div>
      {!scanDone && !allClean && (
        <button type="button" onClick={captureImg} className="scanBtn">
          <img src={scanBtn} alt="scanBtn" />
        </button>
      )}
      {scanDone && !allClean && (
        <button type="button" onClick={cleanImg} className="cleanBtn">
          <img src={cleanBtn} alt="cleanBtn" />
        </button>
      )}

      {allClean && (
        <div className="hero">
          Regular hand washing can help avoid conditions like diarrhoea which
          may happen due to accidental ingestion of harmful bacteria.
        </div>
      )}
      {!allClean && (
        <p className="desc">
          Disclaimer: This is just for demostration purpose.
        </p>
      )}
    </div>
  );
};

export default ScanHand;
