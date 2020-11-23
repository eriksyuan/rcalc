// 2.数字规则、符号规则到算式基础规则校验，当前归纳有：算式得数大于0；减号左边数字大于右边；除号右边不能为0且为整数

enum Operator {
  'add' = '+', //加
  'minus' = '-', //减
  'multiply' = 'x', //乘
  'division' = '÷', //除
}

interface Formula {
  lft: number //运算项左边的值
  rgt: number //运算项右边的值
  result: number //运算的结果
  index?: number //运算项的索引
  operator: Operator //运算方式
}
//运算项
enum Decimal {
  tweoDecimal = 0.01, //两位小数
  oneDecimal = 0.1, //一位小数
  int = 1, //整数
  ten = 10, //整十
}

type limitType = { min: number; max: number; decimal?: Decimal }

enum Retreat {
  none, //不限制
  true, //退位
  false, //不退位
}

enum Carry {
  none, //不限制
  true, //进位
  false, //不进位
}

interface OperatorOption {
  lftLimits: limitType //左边运算项的范围
  rgtLimits: limitType //右边运算项的范围
  rstLimits: limitType //结果的范围
}
interface EquationOption {
  formulaCount?: number //运算项的个数
  retreat?: Retreat
  carry?: Carry
  operators: Operator[][] //运算符
  addOption?: OperatorOption
  minusOption?: OperatorOption
  multiplyOption?: OperatorOption
  divisionOption?: OperatorOption
  count?: number //限制的导出数量
}

function shuffle<T>(arr: T[]): T[] {
  let i = arr.length
  while (i) {
    let j = Math.floor(Math.random() * i--)
    ;[arr[j], arr[i]] = [arr[i], arr[j]]
  }
  return arr
}
//数组中随机取一项
function sample<T>(arr: T[]): T {
  const index = Math.floor(Math.random() * arr.length)
  return arr[index]
}

function unique<T>(arr: T[]) {
  return Array.from(new Set(arr))
}

function isRetreat(item: Formula, retreat = Retreat.none): boolean {
  if (
    retreat === Retreat.none ||
    item.operator === Operator.add ||
    item.operator === Operator.multiply
  ) {
    return true
  } else if (item.operator === Operator.minus) {
    // 减法
    return retreat === Retreat.true
      ? item.lft % 10 < item.rgt % 10
      : item.lft % 10 >= item.rgt % 10
  } else {
    // 除法
    const l = Math.floor(
      item.lft / Math.pow(10, Number(item.lft.toString().length) - 1)
    )
    return retreat === Retreat.true ? l / item.rgt < 1 : l / item.rgt >= 1
  }
}

function isCarry(item: Formula, carry = Carry.none) {
  debugger
  if (
    carry === Carry.none ||
    item.operator === Operator.minus ||
    item.operator === Operator.division
  ) {
    return true
  } else if (item.operator === Operator.add) {
    // 加法运算
    return carry === Carry.true
      ? (item.lft % 10) + (item.rgt % 10) > 10
      : (item.lft % 10) + (item.rgt % 10) <= 10
  } else {
    // 乘法运算
    return carry === Carry.true
      ? (item.lft % 10) * (item.rgt % 10) >= 10
      : (item.lft % 10) * (item.rgt % 10) < 10
  }
}

class Equation {
  options: EquationOption
  operatorList: Map<Operator, number[][]>
  // static MAX_LOOP_COUNT = 1000000000000
  static MAX_ARRAY_COUNT = 10000
  static DefaultOperatorOption: OperatorOption = {
    lftLimits: { max: 100, min: 1, decimal: Decimal.int },
    rgtLimits: { max: 100, min: 1, decimal: Decimal.int },
    rstLimits: { max: 10000, min: 1, decimal: Decimal.int },
  }

  constructor(options: EquationOption) {
    this.options = options
    this.operatorList = new Map()
    this.setOperatorList()
  }

  belToFormaute(l: number, operator: Operator) {
    const { retreat, carry } = this.options
    const res = []
    debugger
    const limit = this.getmisIntLimit(
      this.getOperatorOption(operator).rgtLimits
    )
    let r = limit.min

    while (r <= limit.max) {
      //
      const result = this.getResult(l, r, operator)
      //当运算向大于2个时，前面的算式的reslut同时也是后面算式的lft
      // 得数为整数 得数在设置的得数范围内 得数大于0
      const item = this.getReallItem({
        lft: l,
        rgt: r,
        result,
        operator: operator,
      })
      if (
        // result <= rstLimits.max &&
        // result >= rstLimits.min &&
        result % 1 === 0 &&
        result > 0 &&
        isRetreat(item, retreat) &&
        isCarry(item, carry)
      ) {
        res.push([item])
      }
      r++
    }
    return res
  }

  getReallItem(item: Formula): Formula {
    const { operator, lft, rgt } = item
    debugger
    const lftDecimal = this.getOperatorOption(operator).lftLimits.decimal || 1
    const rgtDecimal = this.getOperatorOption(operator).rgtLimits.decimal || 1
    const ratio =
      Math.max(lftDecimal, rgtDecimal) / Math.min(lftDecimal, rgtDecimal)
    const left = lftDecimal >= rgtDecimal ? lft * ratio : lft
    const right = rgtDecimal > lftDecimal ? rgt * ratio : rgt
    let result = this.getResult(left, right, operator)
    const rute = 1 / Math.min(lftDecimal, rgtDecimal)
    let rato: number =
      operator === Operator.add || operator === Operator.minus
        ? rute
        : operator === Operator.multiply
        ? rute * rute
        : 1

    return {
      lft: lft / (1 / lftDecimal),

      rgt: rgt / (1 / rgtDecimal),
      // rgt: rgt * rgtDecimal,
      result: result / rato,
      operator,
    }
  }

  getUnifyDecimal(operator: Operator) {
    const lftLimits = this.getOperatorOption(operator).lftLimits
    const rgtLimits = this.getOperatorOption(operator).rgtLimits
    const LDecimal = lftLimits.decimal || 1
    const RDecimal = rgtLimits.decimal || 1
    const decimal =
      Math.min(LDecimal, RDecimal) < 1
        ? Math.min(LDecimal, RDecimal)
        : Math.max(LDecimal, RDecimal)
    return decimal
  }

  //小数和整十整百转换为整数
  getmisIntLimit(limit: limitType): limitType {
    const { decimal = 1, max, min } = limit
    return {
      max: Math.floor(max / decimal) || 1,
      min: Math.floor(min / decimal) || 1,
      decimal,
    }
  }

  getOperatorOption(operator: Operator): OperatorOption {
    switch (operator) {
      case Operator.add:
        return this.options.addOption ?? Equation.DefaultOperatorOption
      case Operator.minus:
        return this.options.minusOption ?? Equation.DefaultOperatorOption
      case Operator.multiply:
        return this.options.multiplyOption ?? Equation.DefaultOperatorOption
      case Operator.division:
        return this.options.divisionOption ?? Equation.DefaultOperatorOption
      default:
        return Equation.DefaultOperatorOption
    }
  }

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

  generate() {
    // return this.loopGenerate()
  }
  //获取随机数
  getRandomNumber(limit: limitType): number {
    const { max, min } = limit
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  //获取计算结果
  getResult(lft: number, rgt: number, operator: Operator): number {
    switch (operator) {
      case Operator.add:
        return lft + rgt
      case Operator.minus:
        return lft - rgt
      case Operator.multiply:
        return lft * rgt
      case Operator.division:
        return lft / rgt
    }
  }
  //随机获取单个运算符的列表
  getRandomOperatorList(operator: Operator) {
    const { rgtLimits, lftLimits, rstLimits } = this.getOperatorOption(operator)
    const arr: any[] = []
    for (let i = 0; i < Equation.MAX_ARRAY_COUNT; i++) {
      let r = this.getRandomNumber(rgtLimits)
      const result = this.getRandomNumber(rstLimits)
      const l = this.getLeftFromResultAndRight(r, result, operator)
      if (l % 1 === 0 && l > 0) {
        arr.push([l, operator, r, '=', result])
      }
    }
    return arr.reduce<any[]>((pre, cur) => {
      if (
        pre.findIndex(
          (p) => p[0] === cur[0] && p[2] === cur[2] && p[4] === cur[4]
        ) === -1
      ) {
        pre.push(cur)
      }
      return pre
    }, [])
    // return arr
  }
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
  getLoopOperatorList(operator: Operator) {
    const { rgtLimits, lftLimits, rstLimits } = this.getOperatorOption(operator)
    const arr: any[] = []
    let l = lftLimits.min
    while (l <= lftLimits.max) {
      let r = rgtLimits.min
      while (r <= rgtLimits.max) {
        const result = this.getResult(l, r, operator)
        if (
          result % 1 === 0 &&
          result > 0 &&
          rstLimits &&
          result <= rstLimits?.max &&
          result >= rstLimits?.min
        ) {
          arr.push([l, operator, r, '=', result])
        } else if (!rstLimits && result % 1 === 0 && result > 0) {
          arr.push([l, operator, r, '=', result])
        }
        r++
      }
      l++
    }
    return arr
  }

  getReallyLeftLimits(opt: Operator) {
    const { operators } = this.options
  }

  //获取所有的运算符类型
  getAllOperators(): Operator[] {
    const { operators } = this.options
    return operators.reduce<Operator[]>((pre, cur) => {
      cur.forEach((opt) => {
        if (!pre.includes(opt)) {
          pre.push(opt)
        }
      })
      return pre
    }, [])
  }
  //获取运算符。对应的所有满足条件的单个运算符的算式列表
  setOperatorList(): void {
    const operators = this.getAllOperators()
    operators.forEach((opt) => {
      // const { rgtLimits, lftLimits, rstLimits } = this.getOperatorOption(opt)
      this.operatorList.set(opt, this.getRandomOperatorList(opt))
      // if (
      //   (rgtLimits.max - rgtLimits.min) * (lftLimits.max - lftLimits.min) <=
      //   Equation.MAX_ARRAY_COUNT
      // ) {
      //   this.operatorList.set(opt, this.getLoopOperatorList(opt))
      // } else {
      //   this.operatorList.set(opt, this.getRandomOperatorList(opt))
      // }
    })
  }

  generate2() {
    const that = this
    const { operators, count = 200 } = this.options
    function recursion(pre: any[], time = 1) {
      if (time < operators.length) {
        const optt = sample(operators[operators.length - time - 1])
        const result = pre[0]
        const f = that.getFormulaForResultAndOperator(result, optt)
        if (f && f.length) {
          pre.splice(0, 1, ...f.slice(0, f.length - 2))
          time++
          recursion(pre, time)
        }
      }
    }
    const result = []
    for (let i = 0; i < count * 5; i++) {
      const opt = sample(operators[operators.length - 1])
      const r = this.getRandomNumber(this.getOperatorOption(opt).rstLimits)
      const pre = sample(this.operatorList.get(opt) || [])
      recursion(pre)
      const { lftLimits } = this.getOperatorOption(
        (pre[1] as unknown) as Operator
      )
      const inLeftLimits = pre[0] <= lftLimits.max && pre[0] >= lftLimits.min
      if (pre.length === 5 + 2 * (operators.length - 1) && inLeftLimits) {
        result.push(pre.join(''))
      }
    }
    let res = unique(result)
    if (res.length > count) {
      res.length = count
    }
    return res
  }
  getLeftFromResultAndRight(right: number, result: number, operator: Operator) {
    switch (operator) {
      case Operator.add:
        return result - right
      case Operator.minus:
        return result + right
      case Operator.division:
        return result * right
      case Operator.multiply:
        return result / right
      default:
        return right
        break
    }
  }

  getFormulaForResultAndOperator(result: number, opt: Operator) {
    const arr = this.operatorList.get(opt) || []
    return sample(arr.filter((l) => l[l.length - 1] === result))
  }

  getLength() {
    const { operators } = this.options
    return operators.reduce((pre, opts) => {
      let num = 0
      opts.forEach((operator) => {
        const lftLimit = this.getmisIntLimit(
          this.getOperatorOption(operator).lftLimits
        )
        const rgtLimit = this.getmisIntLimit(
          this.getOperatorOption(operator).rgtLimits
        )
        num +=
          (lftLimit.max - lftLimit.min + 1) * (rgtLimit.max - rgtLimit.min + 1)
      })
      return pre > 0 ? num * pre : num
    }, 0)
  }
}

//@todo 加法的进位  //各个位数的相加都小于10
//@todo 减法的退位
//@todo 乘法的进位
//@todo 除法的退位
//@todo 运算向大于2时固定运算符的顺序
//@todo 整百整十的运算项
//@todo 运算想范围过大时  如何生成算式，避免内存爆栈
//@todo 运算向中间有0和末尾有0 如何限制  如502 503 560
//@todo 小数的运算 （乘法和除法）

const options: EquationOption = {
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
  operators: [ [Operator.add],[Operator.add]],
}

const calc = new Equation(options)

const res = calc.generate2()

console.log(res, res.length)
