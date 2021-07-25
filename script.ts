class Car {
    model: string;
    price: number;
    engine: string;
    color: string;
    doors: number;
    constructor(model: string, price: number) {
        this.model = model;
        this.price = price;
    }
    setColor(color: string) {
        this.color = color;
        this.price += 500;
    }
    setDoors(doorsCount: number) {
        this.doors = doorsCount;
        this.price += 300;
    }
    setEngine(engineType: string) {
        if (engineType === 'Hybrid'){
            this.engine = 'Hybrid';
            this.price += 1000;
        } else {
            this.engine = 'Oil';
            this.price += 700;
        }
    }
    log() {
        console.log(`Your Configuration: \n Model: ${this.model}, \n Color: ${this.color}, \n Doors: ${this.doors}, \n Engine: ${this.engine}, \n The Price For Your Config Is ${this.price}`); 
    }
}

const bmw = new Car('BMW M5', 95000);
bmw.setColor('Black')
bmw.setDoors(5)
bmw.setEngine('Oil')
bmw.log()