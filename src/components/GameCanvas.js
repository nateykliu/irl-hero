import React, { useRef, useEffect} from 'react';
import * as PIXI from 'pixi.js';

const GameCanvas = () => {
    const pixiContainer = useRef(null);

    useEffect(() => {

        // On component mount, create a Pixi.js app and append the canvas to the div
        let app = new PIXI.Application({
            width: 1024,
            height: 1024,
            backgroundColor: 0xFFFFFF,
        });

        pixiContainer.current.appendChild(app.view);


        //background
        let background = PIXI.Sprite.from('stage1background.png');
        background.anchor.set(0, 0);
        background.x = 0;
        background.y = 0;
        background.width = 1024;
        background.height = 1024;
        app.stage.addChild(background);

        //sprites
        let downSprite = PIXI.Sprite.from('downsprite.png');
        let upSprite = PIXI.Sprite.from('upsprite.png');
        let leftSprite = PIXI.Sprite.from('leftsprite.png');
        let rightSprite = PIXI.Sprite.from('rightsprite.png');

        //initial sprite movement (start w/ downsprite)
        let currentSprite = downSprite;
        app.stage.addChild(currentSprite);

        downSprite.anchor.set(0.0);
        downSprite.x = app.screen.width / 2;
        downSprite.y = app.screen.height / 2;

        //whiteboard/notepad creation
        let whiteboard = PIXI.Sprite.from('whiteboard.png');
        whiteboard.x = app.screen.width / 3;
        whiteboard.y = app.screen.height / 3;
        app.stage.addChild(whiteboard);

        app.stage.addChild(downSprite); // (!!!load orders matters in pixi.js)

        function changeSprite(newSprite) {
            if (currentSprite !== newSprite) {
                // Store the current position
                const currentX = currentSprite.x;
                const currentY = currentSprite.y;
        
                app.stage.removeChild(currentSprite);
                currentSprite = newSprite;
                currentSprite.anchor.set(0.0);
        
                // Set the new sprite's position to the stored position
                currentSprite.x = currentX;
                currentSprite.y = currentY;
        
                app.stage.addChild(currentSprite);
            }
        }

        const speed = 8;

        function spriteCollision(a, b) {
            return a.x - a.width / 2 < b.x + b.width / 2 &&
                   a.x + a.width / 2 > b.x - b.width / 2 &&
                   a.y - a.height / 2 < b.y + b.height / 2 &&
                   a.y + a.height / 2 > b.y - b.height / 2;
        }

        function moveLeft() {
            currentSprite.x -= speed;
            if (spriteCollision(currentSprite, whiteboard)) {
                currentSprite.x += speed; // stop sprite movement
            }
        }
        
        function moveRight() {
            currentSprite.x += speed;
            if (spriteCollision(currentSprite, whiteboard)) {
                currentSprite.x -= speed;
            }
        }
        
        function moveUp() {
            currentSprite.y -= speed;
            if (spriteCollision(currentSprite, whiteboard)) {
                currentSprite.y += speed;
            }
        }
        
        function moveDown() {
            currentSprite.y += speed;
            if (spriteCollision(currentSprite, whiteboard)) {
                currentSprite.y -= speed;
            }
        }

        function onKeyDown(e) {
            switch(e.code) {
                case 'ArrowLeft':
                    moveLeft();
                    changeSprite(leftSprite);
                    currentSprite = leftSprite;
                    break;
                case 'ArrowRight':
                    moveRight();
                    changeSprite(rightSprite);
                    currentSprite = rightSprite;
                    break;
                case 'ArrowUp':
                    moveUp();
                    changeSprite(upSprite);
                    currentSprite = upSprite;
                    break;
                case 'ArrowDown':
                    moveDown();
                    changeSprite(downSprite);
                    currentSprite = downSprite;
                    break;
                
                case 'Space':
                    if (isNearWhiteboard()) {
                        createModal();
                    }
                    break;

                default:
                    break;
                }   
            }

        window.addEventListener('keydown', onKeyDown);

        function isNearWhiteboard() {
            const proximity = 70; // Adjust this value as needed
            const dx = currentSprite.x - (whiteboard.x + whiteboard.width / 2);
            const dy = currentSprite.y - (whiteboard.y + whiteboard.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            console.log("Distance from Notebook:" + distance);
        
            return distance < proximity;
        }

        async function createModal() {
            // Create a semi-transparent background
            let bg = new PIXI.Graphics();
            bg.beginFill(0x000000, 0.5); // Black with 50% opacity
            bg.drawRect(0, 0, app.screen.width, app.screen.height);
            bg.endFill();
            app.stage.addChild(bg);
        
            // Create a container for the modal
            let modal = new PIXI.Container();
            modal.x = app.screen.width / 4;
            modal.y = app.screen.height / 4;
        
            // Add a background for the modal
            let modalBg = new PIXI.Graphics();
            modalBg.beginFill(0xFFFFFF); // White background
            modalBg.drawRoundedRect(0, 0, 400, 300, 16); // Adjust size as needed
            modalBg.endFill();
            modal.addChild(modalBg);
        
            // Add text to the modal
            let textStyle = new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 24,
                fill: '#000000',
                wordWrap: true,
                wordWrapWidth: 350, // Adjust as needed
            });
        
            let modalText = new PIXI.Text('Loading goals...', textStyle);
            modalText.x = 20;
            modalText.y = 20;
            modal.addChild(modalText);
        
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/goals`);
                const goals = await response.json();
                let goalsText = 'Goals:\n';
                goals.forEach(goal => {
                    goalsText += `${goal.goal} - ${goal.days} days - Completed: ${goal.completed}\n`;
                });
        
                modalText.text = goalsText;
            } catch (error) {
                console.error('Error:', error);
                modalText.text = 'Failed to load goals.';
            }
        
            // Add a close button (or just make the whole modal clickable)
            modal.interactive = true;
            modal.buttonMode = true;
            modal.on('pointerdown', () => {
                app.stage.removeChild(bg);
                app.stage.removeChild(modal);
            });
        
            app.stage.addChild(modal);
        }

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            app.destroy();
        };

    }, []);

    return (
        <div ref={pixiContainer} className="game-canvas-container">
        </div>
    );
};



export default GameCanvas;