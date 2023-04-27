//Spaceship prefab
class Spaceship extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y, texture, frame, pointValue){
        super(scene, x,y,texture,frame);
        scene.add.existing(this);
        this.points = pointValue;
        this.moveSpeed = game.settings.spaceshipSpeed;
        this.direction = Math.floor(Math.random()*2);
    }
    update(){
        if(this.direction == 0){
            this.x += this.moveSpeed;
        }
        else if(this.direction == 1){
            this.x -= this.moveSpeed;
        }

        if(this.direction == 1 && this.x<=0 - this.width){
            this.x = game.config.width;
        }
        if(this.direction == 0 && this.x >= game.config.width){
            this.x = 0
        }
    }
    reset(){
        this.x = game.config.width;
    }
}