var Car = /** @class */ (function () {
    function Car(model, price) {
        this.model = model;
        this.price = price;
    }
    Car.prototype.setColor = function (color) {
        this.color = color;
        this.price += 500;
    };
    Car.prototype.setDoors = function (doorsCount) {
        this.doors = doorsCount;
        this.price += 300;
    };
    Car.prototype.setEngine = function (engineType) {
        if (engineType === 'Hybrid') {
            this.engine = 'Hybrid';
            this.price += 1000;
        }
        else {
            this.engine = 'Oil';
            this.price += 700;
        }
    };
    Car.prototype.log = function () {
        console.log("Your Configuration: \n Model: " + this.model + ", \n Color: " + this.color + ", \n Doors: " + this.doors + ", \n Engine: " + this.engine + ", \n The Price For Your Config Is " + this.price);
    };
    return Car;
}());
var bmw = new Car('BMW M5', 95000);
bmw.setColor('Black');
bmw.setDoors(5);
bmw.setEngine('Oil');
bmw.log();
