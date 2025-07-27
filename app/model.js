import { List, Map } from "immutable";
import { createBubble } from "./helpers";

// createModel :: Canvas -> (Map<Model>)
const createModel = (canvas) => {
    const midX = canvas.width/2;
    const midY = canvas.height/2;
    return Map({
        bubbles: List.of(createBubble(midX, midY, 100, 200, "red"), createBubble(midX, midY, -100, 200, "green")),
        player: Map({
            x: midX,
            w: 45,
            h: 60,
            y: canvas.height - 60,
            color: "blue"
        }),
        arrows: List.of(),
        isGameOver: false,
        score: 0
    });
};

const standardBubbles = List.of(
    Map({
        // size === 0
        vy_init: -200,
        radius: 10
    }),
    Map({
        // size === 1
        vy_init: -300,
        radius: 20
    }),
    Map({
        // size === 2
        vy_init: -400,
        radius: 30
    }),
    Map({
        // size === 3
        vy_init: -550,
        radius: 45
    })
);

const scores = List.of(
    5,
    10,
    15,
    20
);

export { createModel, standardBubbles, scores};
