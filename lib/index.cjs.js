'use strict';

var Operator;
(function (Operator) {
    Operator[Operator["add"] = 1] = "add";
    Operator[Operator["minus"] = 2] = "minus";
    Operator[Operator["multiply"] = 3] = "multiply";
    Operator[Operator["division"] = 4] = "division";
})(Operator || (Operator = {}));
var Equation = /** @class */ (function () {
    function Equation(options) {
        this.options = options;
    }
    Equation.prototype.generate = function (count) {
        var _this = this;
        if (count === void 0) { count = 100000; }
        var _a = this.options, lftLimits = _a.lftLimits, operators = _a.operators;
        var res = [];
        while (res.length <= count) {
            var lgt = Equation.getRandomNumber(lftLimits);
            var operator = Operator.add;
            var item = this.generateEquationItem(lgt, operator);
            res.push(item);
        }
        return res.reduce(function (pre, item) {
            var flag = _this.alreadyHavedEquationItem(pre, item);
            if (flag) {
                pre.push(item);
            }
            return pre;
        }, []);
    };
    Equation.prototype.alreadyHavedEquationItem = function (res, item) {
        return (res.findIndex(function (f) {
            return f.lft === item.lft &&
                f.rgt === item.rgt &&
                f.operator === item.operator;
        }) === -1);
    };
    Equation.prototype.generateEquationItem = function (lft, operator) {
        debugger;
        var rightLimit = this.getReallyRgtLimit(lft, operator);
        var rgt = Equation.getRandomNumber(rightLimit);
        var result = Equation.getResult(lft, rgt, operator);
        return {
            lft: lft,
            rgt: rgt,
            result: result,
            operator: operator,
        };
    };
    Equation.getRandomNumber = function (limit) {
        var max = limit.max, min = limit.min;
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    Equation.getResult = function (lft, rgt, operator) {
        switch (operator) {
            case Operator.add:
                return lft + rgt;
            case Operator.minus:
                return lft - rgt;
            case Operator.multiply:
                return lft * rgt;
            case Operator.division:
                return lft / rgt;
        }
    };
    Equation.prototype.getReallyRgtLimit = function (lft, operator) {
        var _a = this.options, rgtLimits = _a.rgtLimits, rstLimits = _a.rstLimits;
        var res = { min: 0, max: 0 };
        if (operator === Operator.add) {
            res.max = Math.min(rgtLimits.max, rstLimits.max - lft);
            res.min = Math.max(rstLimits.min - lft, rgtLimits.min);
            if (res.max < res.min) {
                res.max = 0;
                res.min = 0;
            }
        }
        return res;
    };
    return Equation;
}());
var calc = new Equation({
    formulaCount: 2,
    lftLimits: { max: 100, min: 1 },
    rgtLimits: { max: 100, min: 1 },
    rstLimits: { max: 200, min: 1 },
    operators: [Operator.division],
});
var res = calc.generate();
console.log(res);
