/*eslint fp/no-unused-expression: 0, fp/no-nil: 0 */
import { default as Html } from "./html";
import { interrogateKeyState, keys } from "./keystate";
import { List, Map } from "immutable";
import { updateGame } from "./update";
import { createModel, standardBubbles, scores } from "./model";
interrogateKeyState(keys);

window.addEventListener("load", () => {
    // Load the image directly from the public directory
    const benpoImage = new Image();
    benpoImage.src = "/benpo.png";

    const screen = Html.canvas.getContext("2d");

    const drawPlayer = player => {
        // Draw the benpo image instead of a blue rectangle
        if (benpoImage.complete) {
            screen.drawImage(
                benpoImage, 
                player.get("x"), 
                Html.canvas.height - player.get("h"), 
                player.get("w"), 
                player.get("h")
            );
        } else {
            // Fallback to blue rectangle if image not loaded yet
            screen.fillStyle = player.get("color");
            screen.fillRect(player.get("x"), Html.canvas.height - player.get("h"), player.get("w"), player.get("h"));
        }
    };

    const drawBubble = bubble => {
        screen.beginPath();
        screen.arc(bubble.get("x"), bubble.get("y"), bubble.get("radius"), 0, Math.PI * 2, false);
        screen.fillStyle = bubble.get("color"); // eslint-disable-line fp/no-mutation
        screen.fill();
        screen.closePath();
    };

    const drawArrow = arrow => {
        if (arrow === null) {
            return;
        }
        screen.fillStyle = "white"; // eslint-disable-line fp/no-mutation
        screen.fillRect(arrow.get("x"), arrow.get("y"), arrow.get("w"), Html.canvas.height);
    };

    const showScore = score => {
        const scoreElem = document.getElementById("score");
        scoreElem.innerHTML = score; // eslint-disable-line fp/no-mutation
    };

    const showGameOver = (isGameOver) => {
        const banner = document.getElementById("game-over-banner");
        if (isGameOver) {
            banner.style.display = "flex";
        } else {
            banner.style.display = "none";
        }
    };

    const draw = (gameState, Html) => {
        screen.clearRect(0, 0, Html.canvas.width, Html.canvas.height);
        gameState.get("bubbles").map(drawBubble);
        gameState.get("arrows").map(drawArrow);
        drawPlayer(gameState.get("player"));
        showScore(gameState.get("score"));
        showGameOver(gameState.get("isGameOver"));
    };

    let currentGameState = createModel(Html.canvas);
    let lastTime = 0;

    const runGameRenderingCycle = (gameState, standardBubbles, scores, keys, lastTime, Html) => {
        const time = new Date().getTime();
        const deltaInTime = time - (lastTime || time);
        
        // Check for restart
        if (keys.state.get("isRKeyPressed")) {
            currentGameState = createModel(Html.canvas);
            lastTime = time;
        }
        
        currentGameState = updateGame(currentGameState, standardBubbles, scores, keys, Html, deltaInTime);
        draw(currentGameState, Html);
        
        requestAnimationFrame(
            () => runGameRenderingCycle(
                currentGameState, standardBubbles, scores, keys, time, Html
            )
        );
    };

    runGameRenderingCycle(currentGameState, standardBubbles, scores, keys, lastTime, Html);
});
