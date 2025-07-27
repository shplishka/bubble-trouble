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

    // Mobile detection and touch controls
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     ('ontouchstart' in window) || 
                     (window.innerWidth <= 768);
    
    // Always show mobile controls on small screens or touch devices
    const mobileControls = document.querySelector('.mobile-controls');
    if (mobileControls && (isMobile || window.innerWidth <= 768)) {
        mobileControls.style.display = 'flex';
        mobileControls.style.flexDirection = 'column';
        mobileControls.style.alignItems = 'center';
    }
        
    // Touch controls (setup regardless of mobile detection)
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const shootBtn = document.getElementById('shoot-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    if (leftBtn && rightBtn && shootBtn && restartBtn) {
        
        // Left button
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys.state = keys.state.set('isLeftKeyPressed', true);
        });
        
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys.state = keys.state.set('isLeftKeyPressed', false);
        });
        
        // Right button
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys.state = keys.state.set('isRightKeyPressed', true);
        });
        
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys.state = keys.state.set('isRightKeyPressed', false);
        });
        
        // Shoot button
        shootBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys.state = keys.state.set('isSpaceKeyPressed', true);
        });
        
        shootBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys.state = keys.state.set('isSpaceKeyPressed', false);
        });
        
        // Restart button
        restartBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys.state = keys.state.set('isRKeyPressed', true);
            setTimeout(() => {
                keys.state = keys.state.set('isRKeyPressed', false);
            }, 100);
        });
        
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    // Add mouse support for desktop users
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const shootBtn = document.getElementById('shoot-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    if (leftBtn && rightBtn && shootBtn && restartBtn) {
        // Left button mouse events
        leftBtn.addEventListener('mousedown', () => {
            keys.state = keys.state.set('isLeftKeyPressed', true);
        });
        
        leftBtn.addEventListener('mouseup', () => {
            keys.state = keys.state.set('isLeftKeyPressed', false);
        });
        
        leftBtn.addEventListener('mouseleave', () => {
            keys.state = keys.state.set('isLeftKeyPressed', false);
        });
        
        // Right button mouse events
        rightBtn.addEventListener('mousedown', () => {
            keys.state = keys.state.set('isRightKeyPressed', true);
        });
        
        rightBtn.addEventListener('mouseup', () => {
            keys.state = keys.state.set('isRightKeyPressed', false);
        });
        
        rightBtn.addEventListener('mouseleave', () => {
            keys.state = keys.state.set('isRightKeyPressed', false);
        });
        
        // Shoot button mouse events
        shootBtn.addEventListener('mousedown', () => {
            keys.state = keys.state.set('isSpaceKeyPressed', true);
        });
        
        shootBtn.addEventListener('mouseup', () => {
            keys.state = keys.state.set('isSpaceKeyPressed', false);
        });
        
        shootBtn.addEventListener('mouseleave', () => {
            keys.state = keys.state.set('isSpaceKeyPressed', false);
        });
        
        // Restart button mouse events
        restartBtn.addEventListener('mousedown', () => {
            keys.state = keys.state.set('isRKeyPressed', true);
            setTimeout(() => {
                keys.state = keys.state.set('isRKeyPressed', false);
            }, 100);
        });
    }

    const screen = Html.canvas.getContext("2d");
    
    // Responsive canvas scaling for mobile
    const resizeCanvas = () => {
        const canvas = Html.canvas;
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        const maxWidth = Math.min(800, containerWidth - 20);
        const scale = maxWidth / 800;
        
        canvas.style.width = maxWidth + 'px';
        canvas.style.height = (600 * scale) + 'px';
    };
    
    // Initial resize and window resize handling
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

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
