'use strict';

// 2.数字规则、符号规则到算式基础规则校验，当前归纳有：算式得数大于0；减号左边数字大于右边；除号右边不能为0且为整数
var Operator;
(function (Operator) {
    Operator["add"] = "+";
    Operator["minus"] = "-";
    Operator["multiply"] = "x";
    Operator["division"] = "\u00F7";
})(Operator || (Operator = {}));
//运算项
var Decimal;
(function (Decimal) {
    Decimal[Decimal["tweoDecimal"] = 0.01] = "tweoDecimal";
    Decimal[Decimal["oneDecimal"] = 0.1] = "oneDecimal";
    Decimal[Decimal["int"] = 1] = "int";
    Decimal[Decimal["ten"] = 10] = "ten";
})(Decimal || (Decimal = {}));
var Retreat;
(function (Retreat) {
    Retreat[Retreat["none"] = 0] = "none";
    Retreat[Retreat["true"] = 1] = "true";
    Retreat[Retreat["false"] = 2] = "false";
})(Retreat || (Retreat = {}));
var Carry;
(function (Carry) {
    Carry[Carry["none"] = 0] = "none";
    Carry[Carry["true"] = 1] = "true";
    Carry[Carry["false"] = 2] = "false";
})(Carry || (Carry = {}));
//数组中随机取一项
function sample(arr) {
    var index = Math.floor(Math.random() * arr.length);
    return arr[index];
}
function unique(arr) {
    return Array.from(new Set(arr));
}
function isRetreat(item, retreat) {
    if (retreat === void 0) { retreat = Retreat.none; }
    if (retreat === Retreat.none ||
        item.operator === Operator.add ||
        item.operator === Operator.multiply) {
        return true;
    }
    else if (item.operator === Operator.minus) {
        // 减法
        return retreat === Retreat.true
            ? item.lft % 10 < item.rgt % 10
            : item.lft % 10 >= item.rgt % 10;
    }
    else {
        // 除法
        var l = Math.floor(item.lft / Math.pow(10, Number(item.lft.toString().length) - 1));
        return retreat === Retreat.true ? l / item.rgt < 1 : l / item.rgt >= 1;
    }
}
function isCarry(item, carry) {
    if (carry === void 0) { carry = Carry.none; }
    debugger;
    if (carry === Carry.none ||
        item.operator === Operator.minus ||
        item.operator === Operator.division) {
        return true;
    }
    else if (item.operator === Operator.add) {
        // 加法运算
        return carry === Carry.true
            ? (item.lft % 10) + (item.rgt % 10) > 10
            : (item.lft % 10) + (item.rgt % 10) <= 10;
    }
    else {
        // 乘法运算
        return carry === Carry.true
            ? (item.lft % 10) * (item.rgt % 10) >= 10
            : (item.lft % 10) * (item.rgt % 10) < 10;
    }
}
var Equation = /** @class */ (function () {
    function Equation(options) {
        this.options = options;
        this.operatorList = new Map();
        this.setOperatorList();
    }
    Equation.prototype.belToFormaute = function (l, operator) {
        var _a = this.options, retreat = _a.retreat, carry = _a.carry;
        var res = [];
        debugger;
        var limit = this.getmisIntLimit(this.getOperatorOption(operator).rgtLimits);
        var r = limit.min;
        while (r <= limit.max) {
            //
            var result = this.getResult(l, r, operator);
            //当运算向大于2个时，前面的算式的reslut同时也是后面算式的lft
            // 得数为整数 得数在设置的得数范围内 得数大于0
            var item = this.getReallItem({
                lft: l,
                rgt: r,
                result: result,
                operator: operator,
            });
            if (
            // result <= rstLimits.max &&
            // result >= rstLimits.min &&
            result % 1 === 0 &&
                result > 0 &&
                isRetreat(item, retreat) &&
                isCarry(item, carry)) {
                res.push([item]);
            }
            r++;
        }
        return res;
    };
    Equation.prototype.getReallItem = function (item) {
        var operator = item.operator, lft = item.lft, rgt = item.rgt;
        debugger;
        var lftDecimal = this.getOperatorOption(operator).lftLimits.decimal || 1;
        var rgtDecimal = this.getOperatorOption(operator).rgtLimits.decimal || 1;
        var ratio = Math.max(lftDecimal, rgtDecimal) / Math.min(lftDecimal, rgtDecimal);
        var left = lftDecimal >= rgtDecimal ? lft * ratio : lft;
        var right = rgtDecimal > lftDecimal ? rgt * ratio : rgt;
        var result = this.getResult(left, right, operator);
        var rute = 1 / Math.min(lftDecimal, rgtDecimal);
        var rato = operator === Operator.add || operator === Operator.minus
            ? rute
            : operator === Operator.multiply
                ? rute * rute
                : 1;
        return {
            lft: lft / (1 / lftDecimal),
            rgt: rgt / (1 / rgtDecimal),
            // rgt: rgt * rgtDecimal,
            result: result / rato,
            operator: operator,
        };
    };
    Equation.prototype.getUnifyDecimal = function (operator) {
        var lftLimits = this.getOperatorOption(operator).lftLimits;
        var rgtLimits = this.getOperatorOption(operator).rgtLimits;
        var LDecimal = lftLimits.decimal || 1;
        var RDecimal = rgtLimits.decimal || 1;
        var decimal = Math.min(LDecimal, RDecimal) < 1
            ? Math.min(LDecimal, RDecimal)
            : Math.max(LDecimal, RDecimal);
        return decimal;
    };
    //小数和整十整百转换为整数
    Equation.prototype.getmisIntLimit = function (limit) {
        var _a = limit.decimal, decimal = _a === void 0 ? 1 : _a, max = limit.max, min = limit.min;
        return {
            max: Math.floor(max / decimal) || 1,
            min: Math.floor(min / decimal) || 1,
            decimal: decimal,
        };
    };
    Equation.prototype.getOperatorOption = function (operator) {
        var _a, _b, _c, _d;
        switch (operator) {
            case Operator.add:
                return (_a = this.options.addOption) !== null && _a !== void 0 ? _a : Equation.DefaultOperatorOption;
            case Operator.minus:
                return (_b = this.options.minusOption) !== null && _b !== void 0 ? _b : Equation.DefaultOperatorOption;
            case Operator.multiply:
                return (_c = this.options.multiplyOption) !== null && _c !== void 0 ? _c : Equation.DefaultOperatorOption;
            case Operator.division:
                return (_d = this.options.divisionOption) !== null && _d !== void 0 ? _d : Equation.DefaultOperatorOption;
            default:
                return Equation.DefaultOperatorOption;
        }
    };
    //按范围的顺序循环生成算式
    // loopGenerate() {
    //   const { operators, count = 200, formulaCount } = this.options
    //   const that = this
    //   let res: Formula[][] = []
    //   for (let i = 0; i < operators[0].length; i++) {
    //     const operator = operators[0][i]
    //     const limit = this.getmisIntLimit(
    //       this.getOperatorOption(operator).lftLimits
    //     )
    //     let l = limit.min
    //     while (l <= limit.max) {
    //       res = res.concat(this.belToFormaute(l, operator))
    //       l++
    //     }
    //   }
    //   if (formulaCount > 2) {
    //     let time = 0
    //     while (time < formulaCount - 2) {
    //       res.forEach((f) => {
    //         combin(f, res, time + 1)
    //       })
    //       time++
    //     }
    //   }
    //   function combin(item: Formula[], res: Formula[][], index: number) {
    //     const lft = item[item.length - 1].result
    //     const { operators } = that.options
    //     // 不重复的运算项
    //     let opts = operators[index]
    //     for (let i = 0; i < opts.length; i++) {
    //       const opt = opts[i]
    //       that.belToFormaute(lft, opt).forEach((f) => {
    //         res.push([...item, f[0]])
    //       })
    //     }
    //   }
    //   const resultarr = shuffle(res).filter((r) => {
    //     const calcResult = r[r.length - 1].result
    //     // const inResultLimit =
    //     //   calcResult >= rstLimits.min && calcResult <= rstLimits.max
    //     return r.length === formulaCount - 1
    //   })
    //   if (resultarr.length > count) {
    //     resultarr.length = count
    //   }
    //   return resultarr
    // }
    Equation.prototype.generate = function () {
        // return this.loopGenerate()
    };
    //获取随机数
    Equation.prototype.getRandomNumber = function (limit) {
        var max = limit.max, min = limit.min;
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    //获取计算结果
    Equation.prototype.getResult = function (lft, rgt, operator) {
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
    //随机获取单个运算符的列表
    Equation.prototype.getRandomOperatorList = function (operator) {
        var _a = this.getOperatorOption(operator), rgtLimits = _a.rgtLimits, lftLimits = _a.lftLimits, rstLimits = _a.rstLimits;
        var arr = [];
        for (var i = 0; i < Equation.MAX_ARRAY_COUNT; i++) {
            var r = this.getRandomNumber(rgtLimits);
            var result = this.getRandomNumber(rstLimits);
            var l = this.getLeftFromResultAndRight(r, result, operator);
            if (l % 1 === 0 && l > 0) {
                arr.push([l, operator, r, '=', result]);
            }
        }
        return arr.reduce(function (pre, cur) {
            if (pre.findIndex(function (p) { return p[0] === cur[0] && p[2] === cur[2] && p[4] === cur[4]; }) === -1) {
                pre.push(cur);
            }
            return pre;
        }, []);
        // return arr
    };
    // 去重
    // similarity(arr: Operator[][]): Operator[][] {
    //   return arr
    //     .map((l) => l.join(','))
    //     .reduce((pre: string[], cur) => {
    //       if (!pre.includes(cur)) {
    //         pre.push(cur)
    //       }
    //       return pre
    //     }, [])
    //     .map((l) => l.split(',').map((l) => Number(l)))
    // }
    //循环获取单个运算符的列表
    Equation.prototype.getLoopOperatorList = function (operator) {
        var _a = this.getOperatorOption(operator), rgtLimits = _a.rgtLimits, lftLimits = _a.lftLimits, rstLimits = _a.rstLimits;
        var arr = [];
        var l = lftLimits.min;
        while (l <= lftLimits.max) {
            var r = rgtLimits.min;
            while (r <= rgtLimits.max) {
                var result = this.getResult(l, r, operator);
                if (result % 1 === 0 &&
                    result > 0 &&
                    rstLimits &&
                    result <= (rstLimits === null || rstLimits === void 0 ? void 0 : rstLimits.max) &&
                    result >= (rstLimits === null || rstLimits === void 0 ? void 0 : rstLimits.min)) {
                    arr.push([l, operator, r, '=', result]);
                }
                else if (!rstLimits && result % 1 === 0 && result > 0) {
                    arr.push([l, operator, r, '=', result]);
                }
                r++;
            }
            l++;
        }
        return arr;
    };
    Equation.prototype.getReallyLeftLimits = function (opt) {
        var operators = this.options.operators;
    };
    //获取所有的运算符类型
    Equation.prototype.getAllOperators = function () {
        var operators = this.options.operators;
        return operators.reduce(function (pre, cur) {
            cur.forEach(function (opt) {
                if (!pre.includes(opt)) {
                    pre.push(opt);
                }
            });
            return pre;
        }, []);
    };
    //获取运算符。对应的所有满足条件的单个运算符的算式列表
    Equation.prototype.setOperatorList = function () {
        var _this = this;
        var operators = this.getAllOperators();
        operators.forEach(function (opt) {
            // const { rgtLimits, lftLimits, rstLimits } = this.getOperatorOption(opt)
            _this.operatorList.set(opt, _this.getRandomOperatorList(opt));
            // if (
            //   (rgtLimits.max - rgtLimits.min) * (lftLimits.max - lftLimits.min) <=
            //   Equation.MAX_ARRAY_COUNT
            // ) {
            //   this.operatorList.set(opt, this.getLoopOperatorList(opt))
            // } else {
            //   this.operatorList.set(opt, this.getRandomOperatorList(opt))
            // }
        });
    };
    Equation.prototype.generate2 = function () {
        var that = this;
        var _a = this.options, operators = _a.operators, _b = _a.count, count = _b === void 0 ? 200 : _b;
        function recursion(pre, time) {
            if (time === void 0) { time = 1; }
            if (time < operators.length) {
                var optt = sample(operators[operators.length - time - 1]);
                var result_1 = pre[0];
                var f = that.getFormulaForResultAndOperator(result_1, optt);
                if (f && f.length) {
                    pre.splice.apply(pre, __spreadArrays([0, 1], f.slice(0, f.length - 2)));
                    time++;
                    recursion(pre, time);
                }
            }
        }
        var result = [];
        for (var i = 0; i < count * 5; i++) {
            var opt = sample(operators[operators.length - 1]);
            var r = this.getRandomNumber(this.getOperatorOption(opt).rstLimits);
            var pre = sample(this.operatorList.get(opt) || []);
            recursion(pre);
            var lftLimits = this.getOperatorOption(pre[1]).lftLimits;
            var inLeftLimits = pre[0] <= lftLimits.max && pre[0] >= lftLimits.min;
            if (pre.length === 5 + 2 * (operators.length - 1) && inLeftLimits) {
                result.push(pre.join(''));
            }
        }
        var res = unique(result);
        if (res.length > count) {
            res.length = count;
        }
        return res;
    };
    Equation.prototype.getLeftFromResultAndRight = function (right, result, operator) {
        switch (operator) {
            case Operator.add:
                return result - right;
            case Operator.minus:
                return result + right;
            case Operator.division:
                return result * right;
            case Operator.multiply:
                return result / right;
            default:
                return right;
        }
    };
    Equation.prototype.getFormulaForResultAndOperator = function (result, opt) {
        var arr = this.operatorList.get(opt) || [];
        return sample(arr.filter(function (l) { return l[l.length - 1] === result; }));
    };
    Equation.prototype.getLength = function () {
        var _this = this;
        var operators = this.options.operators;
        return operators.reduce(function (pre, opts) {
            var num = 0;
            opts.forEach(function (operator) {
                var lftLimit = _this.getmisIntLimit(_this.getOperatorOption(operator).lftLimits);
                var rgtLimit = _this.getmisIntLimit(_this.getOperatorOption(operator).rgtLimits);
                num +=
                    (lftLimit.max - lftLimit.min + 1) * (rgtLimit.max - rgtLimit.min + 1);
            });
            return pre > 0 ? num * pre : num;
        }, 0);
    };
    // static MAX_LOOP_COUNT = 1000000000000
    Equation.MAX_ARRAY_COUNT = 10000;
    Equation.DefaultOperatorOption = {
        lftLimits: { max: 100, min: 1, decimal: Decimal.int },
        rgtLimits: { max: 100, min: 1, decimal: Decimal.int },
        rstLimits: { max: 10000, min: 1, decimal: Decimal.int },
    };
    return Equation;
}());
//@todo 加法的进位  //各个位数的相加都小于10
//@todo 减法的退位
//@todo 乘法的进位
//@todo 除法的退位
//@todo 运算向大于2时固定运算符的顺序
//@todo 整百整十的运算项
//@todo 运算想范围过大时  如何生成算式，避免内存爆栈
//@todo 运算向中间有0和末尾有0 如何限制  如502 503 560
//@todo 小数的运算 （乘法和除法）
var options = {
    count: 1000,
    addOption: {
        //加法的配置项
        lftLimits: { max: 9, min: 1, decimal: Decimal.int },
        rgtLimits: { max: 9, min: 1, decimal: Decimal.int },
        rstLimits: { max: 27, min: 1 },
    },
    multiplyOption: {
        lftLimits: { max: 9, min: 2, decimal: Decimal.int },
        rgtLimits: { max: 9, min: 2, decimal: Decimal.int },
        rstLimits: { max: 81, min: 0 },
    },
    minusOption: {
        lftLimits: { max: 10, min: 1, decimal: Decimal.int },
        rgtLimits: { max: 10, min: 1, decimal: Decimal.int },
        // rstLimits:{max:5,min:0}
        rstLimits: { max: 27, min: 1 },
    },
    divisionOption: {
        lftLimits: { max: 10, min: 1, decimal: Decimal.int },
        rgtLimits: { max: 10, min: 1, decimal: Decimal.int },
        rstLimits: { max: 27, min: 1 },
    },
    operators: [[Operator.add], [Operator.add]],
};
var calc = new Equation(options);
var res = calc.generate2();
console.log(res, res.length);
