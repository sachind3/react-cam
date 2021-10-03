import { useCallback, useEffect, useRef } from "react";

const ScanHand = () => {
  const vdRef = useRef(null);
  const canRef = useRef(null);
  let currentStream = useRef();

  function stopMediaTracks(stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

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
      .then()
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (typeof currentStream.current !== "undefined") {
      stopMediaTracks(currentStream.current);
    }
    startCam();
  }, [startCam]);

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
      </div>
    </div>
  );
};

export default ScanHand;
