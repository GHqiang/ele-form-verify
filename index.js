
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
 *    pattern: string     正则表达式
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
  var isRequired = obj.isRequired || false // 默认不必填
  var tipType = obj.tipType || 0 // 默认请输入
  var tipText = obj.tipText
  var failText = obj.failText
  var tigMethod = obj.tigMethod || 0 // 默认失焦校验
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
    idNumber: { // 身份正则
      // reg: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
      reg: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
    },
    passwords: { // 6-16位字母、数字及符号组合的密码正则
      reg: /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[`~!@#$%^&*()\\[\]{}<>,.?/";:'_+=| \-\\])[0-9a-zA-Z`~!@#$%^&*()\\[\]{}<>,.?/";:'_+=| \-\\]{6,16}$/
    },
    contactNumber: { // 支持固话和手机号
      reg: /^((0\d{2,3}-?\d{7,8})|(1[3465789]\d{9}))$/
    },
    phone: { // 仅支持手机号
      reg: /^1[3456789]\d{9}$/
    },
    email: { // 仅支持邮箱
      reg: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/
    },
    pwd: { // 6-10位字母数字特殊字符组成的密码
      reg: /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{6,10}$/
    },
    numInterval: { // 0-99999999之间的数字,最多精确到小数点后两位
      reg: /^([1-9]\d{0,7})(\.\d{1,2})?$|^0[.]([1-9]\d{0,1}|[0-9][1-9])$/
    }
  }
  // 非空检验
  const checkEmpty = (rule, value, callback) => {
    if (!value) {
      return value === 0 ? callback() : callback(new Error(`${tipTypes[tipType]}${tipText}`))
    } else if (typeof value === 'string' && !value.trim()) {
      return callback(new Error('不可全部输入空格'))
    } else {
      callback()
    }
  }
  // 正则key校验
  const checkReg = (rule, value, callback) => { // 不是必填的正则校验，如果是必填的直接会在checkEmpty触发提示
    if (!value || regs[regKey].reg.test(value)) {
      callback()
    } else {
      return callback(new Error(`${failText || tipTypes[tipType] + '符合格式的' + tipText}`))
    }
  }
  // 正则表达式校验
  const checkPattern = (rule, value, callback) => {
    if (!value || pattern.test(value)) {
      callback()
    } else {
      return callback(new Error(`${failText || tipTypes[tipType] + '符合格式的' + tipText}`))
    }
  }
  // 数字区间校验
  const checkNumInterval = (rule, value, callback) => {
    if (!value || (numInterval[0] <= value && value <= numInterval[1])) {
      callback()
    } else {
      return callback(new Error(`${failText || tipTypes[tipType] + numInterval[0] + '-' + numInterval[1] + '的数字'}`))
    }
  }
  // 日期区间校验
  const checkDateInterval = (rule, value, callback) => { // 此处的日期格式须一致 -或者\连接
    if (!value || (dateInterval[0] <= value && value <= dateInterval[1])) {
      callback()
    } else {
      return callback(new Error(`${tipTypes[tipType] + numInterval[0] + '-' + numInterval[1] + '的日期'}`))
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
    } else { // 此处默认数字，确认密码或者其它特殊提示用failText
      return callback(new Error(`${failText || tipTypes[tipType] + arr[compareType] + targetVal + '的数字'}`))
    }
  }
  // 特殊类校验
  const checkSpecial = {
    key1: (rule, value, callback) => {
      var maxNum
      if (special.settleCycle === '0') { // 日结(多少个工作日)
        maxNum = 999
      } else if (special.settleCycle === '1') { // 周结(每周周几)
        maxNum = 7
      } else { // 月结(每月几号)
        maxNum = 28
      }
      if (!value || (/^[0-9]*[1-9][0-9]*$/.test(value) && Number(value) >= 1 && Number(value) <= maxNum)) {
        callback()
      } else {
        callback(new Error(`${failText || tipTypes[tipType] + '小于等于' + maxNum + '的数字'}`))
      }
    }
  }
  var verifyTypes = {
    isRequired: [isRequired, checkEmpty],
    regKey: [regKey, checkReg],
    pattern: [pattern, checkPattern],
    numInterval: [numInterval, checkNumInterval],
    dateInterval: [dateInterval, checkDateInterval],
    compare: [compare, checkCompare],
    special: [special, special && checkSpecial[special.key]]
  }
  for (const key in verifyTypes) {
    if (verifyTypes[key][0]) {
      rules.push({
        required: isRequired,
        trigger: tigMethods[tigMethod],
        validator: verifyTypes[key][1]
      })
    }
  }
  return rules
}
module.exports = ruleVerify
