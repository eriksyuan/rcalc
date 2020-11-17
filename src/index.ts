// 2.数字规则、符号规则到算式基础规则校验，当前归纳有：算式得数大于0；减号左边数字大于右边；除号右边不能为0且为整数

enum Operator {
  'add' = 1,
  'minus',
  'multiply',
  'division',
}

interface Formula {
  lft: number
  rgt: number
  result: number
  index?: number
  operator: Operator
}
type limitType = { min: number; max: number }

interface EquationOption {
  formulaCount: number
  lftLimits: limitType
  rgtLimits: limitType
  rstLimits: limitType
  operators: Operator[]
  count?: number
}

function shuffle<T>(arr: T[]): T[] {
  let i = arr.length
  while (i) {
    let j = Math.floor(Math.random() * i--)
    ;[arr[j], arr[i]] = [arr[i], arr[j]]
  }
  return arr
}

class Equation {
  options: EquationOption

  static MAX_LOOP_COUNT = 1000000

  constructor(options: EquationOption) {
    this.options = options
    this.options.operators = Array.from(new Set(options.operators))
    console.log(this.options.operators)
  }

  //按范围的顺序循环生成算式
  loopGenerate() {
    const {
      lftLimits,
      rgtLimits,
      rstLimits,
      operators,
      count = 200,
    } = this.options
    const res = []
    for (let i = 0; i < operators.length; i++) {
      const operator = operators[i]
      let l = lftLimits.min
      while (l <= lftLimits.max) {
        let r = rgtLimits.min
        while (r <= rgtLimits.max) {
          
          const result = this.getResult(l, r, operator)
          // 得数为整数 得数在设置的得数范围内 得数大于0
          if (
            result <= rstLimits.max &&
            result >= rstLimits.min &&
            result % 1 === 0 &&
            result > 0
          ) {
            const item = {
              lft: l,
              rgt: r,
              result,
              operator: operator,
            }
            res.push(item)
          }
          r++
        }
        l++
      }
    }
    return res
  }
  //逐个随机生成算式
  randomGenerate(): Formula[] {
    const { count = 200 } = this.options
    const res: Formula[] = []
    while (res.length <= count) {
      const operator = this.getRandomOperator()
      const item = this.generateEquationItem(operator)
      res.push(item)
    }
    return res.reduce((pre, item) => {
      // 算式去重
      const flag = this.alreadyHavedEquationItem(pre, item)
      if (flag) {
        pre.push(item)
      }
      return pre
    }, [] as Formula[])
  }

  generate() {
    const { lftLimits, rstLimits } = this.options
    const m = (lftLimits.max - lftLimits.min) * (rstLimits.max - rstLimits.min)
    // 当循环次数超过最大循环次数时，采用随机生成算式的方式，否则循环生成算式
    if (m > Equation.MAX_LOOP_COUNT) {
      return this.randomGenerate()
    } else {
      return this.loopGenerate()
    }
  }
  // 是否有相同的算式
  alreadyHavedEquationItem(res: Formula[], item: Formula) {
    return (
      res.findIndex(
        (f) =>
          f.lft === item.lft &&
          f.rgt === item.rgt &&
          f.operator === item.operator
      ) === -1
    )
  }
  //随机生成单个算式
  generateEquationItem(operator: Operator): Formula {
    let lft = this.getRandomNumber(this.options.lftLimits)
    let rightLimit
    while (!rightLimit) {
      lft = this.getRandomNumber(this.options.lftLimits)
      rightLimit = this.getReallyRgtLimit(lft, operator)
    }
    const rgt = this.getRandomNumber(rightLimit)
    const result = this.getResult(lft, rgt, operator)
    return {
      lft,
      rgt,
      result,
      operator,
    }
  }

  getRandomNumber(limit: limitType): number {
    const { max, min } = limit
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

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
  getReallyRgtLimit(lft: number, operator: Operator): limitType | null {
    const { rgtLimits, rstLimits } = this.options
    const res: limitType = { min: 0, max: 0 }
    if (operator === Operator.add) {
      res.max = Math.min(rgtLimits.max, rstLimits.max - lft)
      res.min = Math.max(rstLimits.min - lft, rgtLimits.min)
    } else if (operator === Operator.minus) {
      res.min = Math.max(lft - rstLimits.max, rgtLimits.min)
      res.max = Math.min(lft - rstLimits.min, rgtLimits.max)
    }
    if (res.max < res.min) {
      return null
    }
    return res
  }

  getRandomOperator(): Operator {
    const { operators } = this.options
    const index = this.getRandomNumber({ max: operators.length - 1, min: 0 })
    return operators[index]
  }
}

const calc = new Equation({
  formulaCount: 2,
  lftLimits: { max: 10, min: 0 },
  rgtLimits: { max: 9, min: 0 },
  rstLimits: { max: 6, min: 6 },
  operators: [Operator.multiply],
  count: 2000,
})

const res = calc.generate()

console.log(res, res.length)
