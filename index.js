
/**
 * @method 规则校验方法
 * @param {object} <bar/>
 * 例:
 * {
 *    isRequired: boolean 是否必填
 *    tipType: number     提示类型   0-请输入 1-请选择 2-请上传
 *    tipText: string     非空提示文本
 *    failText: string    校验失败提示文本
 *    tigMethod: number   检验触发方式 0-'blur' 1-'change' 2-['blur','change']
 *    regKey: string      正则key
 *    numInterval: array  数字区间
 *    dateInterval: array 日期区间
 *    compare: object 比较判断(确认密码、必须小/等/大于某个值)
 *    例：{targetVal:any,compareType:number} compareType: 0-< 1-= 2-> 3<= 4>=
 *    special:{key:string,val:any} // 特殊类校验
 * }
 * @returns {array}
 */
// 对象方式传参方便后面维护和扩展
const ruleVerify = (obj) => {
  var isRequired = obj.isRequired || false
  var tipType = obj.tipType || 0
  var tipText = obj.tipText
  var failText = obj.failText
  var tigMethod = obj.tigMethod || 0
  var pattern = obj.pattern // 正则表达式
  var regKey = obj.regKey
  var numInterval = obj.numInterval
  var dateInterval = obj.dateInterval
  var compare = obj.compare
  var special = obj.special
  var rules = []
  var tipTypes = ['请输入', '请选择', '请上传']
  var tigMethods = ['blur', 'change', ['blur', 'change']]
  var regs = {
    idNumber: {
      reg: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
      tip: '请输入正确的身份证号码' // 像这种的tip就可以去掉
    },
    passwords: {
      reg: /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[`~!@#$%^&*()\[\]{}<>,.?/";:'_+=| \-\\])[0-9a-zA-Z`~!@#$%^&*()\[\]{}<>,.?/";:'_+=| \-\\]{6,16}$/,
      tip: '请输入由6-16位字母、数字及符号组合的密码'
    },
    contactNumber: { // 支持固话和手机号
      reg: /^((0\d{2,3}-?\d{7,8})|(1[3465789]\d{9}))$/,
      tip: '请输入正确的手机号或固话'
    },
    phone: { // 仅支持手机号
      reg: /^1[3456789]\d{9}$/,
      tip: '请输入正确的手机号'// 像这种的tip就可以去掉
    },
    email: { // 仅支持邮箱
      reg: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/
    },
    pwd: { // 6-10位字母数字特殊字符组成的密码
      reg: /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{6,10}$/
    }
  }
  // 非空检验
  const checkEmpty = (rule, value, callback) => {
    if (!value) {
      return callback(new Error(`${tipTypes[tipType]}${tipText}`))
    } else if (typeof value === 'string' && !(value.trim())) {
      return callback(new Error('不可全部输入空格'))
    } else {
      callback()
    }
  }
  // 正则校验
  const checkReg = (rule, value, callback) => {
    if (!value || regs[regKey].reg.test(value)) {
      callback()
    } else {
      return callback(new Error(`${failText || regs[regKey].tip || tipTypes[tipType] + '符合格式的' + tipText}`))
    }
  }
  const checkPattern = (rule, value, callback) => {
    if (isRequired) {
      if (pattern.test(value)) {
        callback()
      } else {
        return callback(new Error(`${failText || tipTypes[tipType] + '符合格式的' + tipText}`))
      }
    } else {
      if (!value || pattern.test(value)) {
        callback()
      } else {
        console.log('正则表达式校验不过')
        return callback(new Error(`${failText || tipTypes[tipType] + '符合格式的' + tipText}`))
      }
    }
  }
  // 数字区间校验
  const checkNumInterval = (rule, value, callback) => {
    if (!value || (numInterval[0] <= value && value <= numInterval[1])) {
      callback()
    } else {
      return callback(new Error(`${tipTypes[tipType] + numInterval[0] + '-' + numInterval[1] + '数字'}`))
    }
  }
  // 日期区间校验
  const checkDateInterval = (rule, value, callback) => {
    if (!value || (dateInterval[0] <= value && value <= dateInterval[1])) {
      callback()
    } else {
      return callback(new Error(`${tipTypes[tipType] + numInterval[0] + '-' + numInterval[1] + '日期'}`))
    }
  }
  // 比较校验
  const checkCompare = (rule, value, callback) => {
    var targetVal = compare.targetVal; var compareType = compare.compareType
    const obj = {
      0: value < targetVal,
      1: value === targetVal,
      2: value > targetVal,
      3: value <= targetVal,
      4: value >= targetVal
    }
    const arr = ['小于', '等于', '大于', '小于等于', '大于等于']
    if (!value || obj[compareType]) {
      callback()
    } else {
      return callback(new Error(`${failText || tipTypes[tipType] + arr[compareType] + '数字'}`))
    }
  }
  // 特殊类校验
  const checkSpecial = {
    key1: (rule, value, callback) => {
      var maxNum
      if (special.settleCycle === '0') {
        maxNum = 999
      } else if (special.settleCycle === '1') {
        maxNum = 7
      } else {
        maxNum = 28
      }
      if (!value || (/^[0-9]*[1-9][0-9]*$/.test(value) && Number(value) >= 1 && Number(value) <= maxNum)) {
        callback()
      } else {
        callback(new Error(`${failText || tipTypes[tipType] + '小于等于' + maxNum + '的数字'}`))
      }
    }
  }
  // 统一返回validator对应函数
  const backValidator = () => {
    if (regKey) { return checkReg }
    if (pattern) { return checkPattern }
    if (numInterval) { return checkNumInterval }
    if (dateInterval) { return checkDateInterval }
    if (compare) { return checkCompare }
    if (special) { return checkSpecial[special.key] }
  }
  if (isRequired) {
    rules.push({
      required: true,
      trigger: tigMethods[tigMethod],
      validator: checkEmpty
    })
  }
  if (regKey || numInterval || dateInterval || compare || special || pattern) {
    rules.push({
      trigger: tigMethods[tigMethod],
      validator: backValidator()
    })
  }
  // console.log(rules)
  return rules
}
module.exports = ruleVerify
