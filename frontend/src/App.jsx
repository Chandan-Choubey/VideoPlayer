import "./App.css";
import { VideoPlayer } from "./VideoPlayer";
import { useRef } from "react";

function App() {
  const playerRef = useRef(null);

  const videoPlayerOptions = {
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: "http://localhost:3000/uploads/courses/fa643998-047f-4010-a11f-628a5e1c6f0f/index.m3u8",
        type: "application/x-mpegURL",
      },
    ],
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };
  return (
    <>
      <div>
        <h1>Video Player</h1>
      </div>

      <VideoPlayer options={videoPlayerOptions} onReady={handlePlayerReady} />
    </>
  );
}

export default App;
