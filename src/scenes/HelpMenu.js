class HelpMenu extends Phaser.Scenes{}{
    constructor(){
        super("helpScene");
    }
    create(){
        let menuConfig = {
            fontFamily: 'Courier', 
            fontSize: '28px', 
            backgroundColor: '#F3B141', 
            color: '#843605', 
            align: 'right', 
            padding: {top: 5, bottom: 5,}, 
            fixedWidth: 0
        }
        this.add.text(game.config.width/2)
    }
}