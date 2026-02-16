import { Engine } from "@babylonjs/core/Engines/engine";
import { Game } from "./game";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true, {
	preserveDrawingBuffer: true,
	stencil: true,
});

const game = new Game(engine);

// Start on first click (required for Web Audio API)
const startOverlay = document.createElement("div");
Object.assign(startOverlay.style, {
	position: "absolute",
	inset: "0",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	background: "rgba(0, 0, 0, 0.9)",
	color: "#ccc",
	fontFamily: "monospace",
	fontSize: "24px",
	cursor: "pointer",
	zIndex: "20",
});
startOverlay.textContent = "CLICK TO START";
document.body.appendChild(startOverlay);

startOverlay.addEventListener(
	"click",
	async () => {
		startOverlay.remove();
		await game.start();
	},
	{ once: true },
);

// Inspector toggle button
const inspectorBtn = document.createElement("button");
inspectorBtn.textContent = "Inspector";
Object.assign(inspectorBtn.style, {
	position: "absolute",
	top: "10px",
	right: "10px",
	zIndex: "30",
	padding: "6px 14px",
	background: "#333",
	color: "#ccc",
	border: "1px solid #555",
	fontFamily: "monospace",
	fontSize: "13px",
	cursor: "pointer",
});
document.body.appendChild(inspectorBtn);

let inspectorVisible = false;
inspectorBtn.addEventListener("click", async () => {
	// Full core import needed for inspector compatibility
	await import("@babylonjs/core");
	const { Inspector } = await import("@babylonjs/inspector");
	const scene = game.getScene();
	if (inspectorVisible) {
		Inspector.Hide();
		inspectorVisible = false;
	} else {
		Inspector.Show(scene, {});
		inspectorVisible = true;
	}
});

engine.runRenderLoop(() => {
	game.getScene().render();
});

window.addEventListener("resize", () => {
	engine.resize();
});
