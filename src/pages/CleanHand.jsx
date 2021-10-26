// clean click wash hand gif run
//

import { useCallback, useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { mobileAndTabletCheck } from "./../helpers/Utils";
import { HiArrowLeft, HiOutlineHome } from "react-icons/hi";
import { useHistory } from "react-router";
// import turfproLogo from "./../images/turfproLogo.png";
import scanBtn from "../images/scanBtn.png";
import giphy from "../images/giphy.gif";
import Logo from "./../images/logo.svg";
const CleanHand = () => {
  const isComponentMounted = useRef({});
  const vdRef = useRef(null);
  const canRef = useRef(null);
  const vidBorderRef = useRef(null);
  let currentStream = useRef();
  const [src, setSrc] = useState(null);
  const [scanDone, setScanDone] = useState(false);
  let history = useHistory();
  const photoRef = useRef();
  const [isScan, setIsScan] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const gotoBack = useCallback(() => {
    vdRef.current.pause();
    vdRef.current.src = "";
    history.push("/");
  }, [vdRef, history]);

  const onResults = useCallback((results) => {
    if (results.multiHandLandmarks.length > 0) {
      setTimeout(() => {
        // console.log(results.multiHandLandmarks[0]);
        // results.multiHandLandmarks[0].forEach((mark, index) => {
        //   let point = document.createElement("div");
        //   point.classList.add("point");
        //   point.classList.add(`point-${index}`);
        //   point.style.left = `${
        //     Number(mark.x).toFixed(2) * photoRef.current.width
        //   }px`;
        //   point.style.top = `${
        //     Number(mark.y).toFixed(2) * photoRef.current.height
        //   }px`;
        //   document.querySelector(".capturedImgContainer").appendChild(point);
        // });
        let pointPalm1 = document.createElement("div");
        let pointPalm2 = document.createElement("div");
        pointPalm1.classList.add("point");
        pointPalm2.classList.add("point");
        pointPalm1.classList.add(`point-palm1`);
        pointPalm2.classList.add(`point-palm2`);
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
        pointPalm1.style.left = `${(palm0X - palm9X) / 2 + palm9X}px`;
        pointPalm1.style.top = `${(palm0y - palm9y) / 2 + palm9y}px`;
        pointPalm2.style.left = `${
          Number(results.multiHandLandmarks[0][5].x).toFixed(2) *
          photoRef.current.width
        }px`;
        pointPalm2.style.top = `${
          Number(results.multiHandLandmarks[0][5].y).toFixed(2) *
          photoRef.current.height
        }px`;

        document.querySelector(".capturedImgContainer").appendChild(pointPalm1);
        document.querySelector(".capturedImgContainer").appendChild(pointPalm2);
        setIsScan(false);
        setScanDone(true);
        vidBorderRef.current.remove();
        setTimeout(() => {
          document.querySelector(".cleanHand").remove();
        }, 2000);
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
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.3.1630010197/${file}`;
          // return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
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
      <div className="header">
        {scanDone ? (
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

        <img src={Logo} alt="turfproLogo" className="turfproLogo" />
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
        <div className={`${scanDone ? "cleanHand show" : "cleanHand"}`}>
          <img src={giphy} alt="giphy" />
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
      {!scanDone && (
        <button type="button" onClick={captureImg} className="scanBtn">
          <img src={scanBtn} alt="scanBtn" />
        </button>
      )}
      {scanDone && (
        <>
          <div className="hero">
            Regular hand washing can help avoid conditions like diarrhoea which
            may happen due to accidental ingestion of harmful bacteria.
          </div>
          {/* <p className="desc">
            Disclaimer: This is just for demostration purpose.
          </p> */}
        </>
      )}
      <div className="desc2">
        Disclaimer : This is a dramatization/creative visual representation of
        hand scan, to spread the awareness about hand washing.
      </div>
    </div>
  );
};

export default CleanHand;
