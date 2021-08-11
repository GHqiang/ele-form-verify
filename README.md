> 统一的elementUI表单验证方式实现
# Install
```js
$ npm install --save ele-form-verify
```
## Use

1、main.js引入并全局挂载到Vue.prototype
```js
import ruleVerify from 'ele-form-verify'

Vue.prototype.ruleVerify = ruleVerify
```

2、部分使用场景如下，具体可参考相关配置项参数
```js
<el-form-item label="业务类型" prop="bizType" :rules="ruleVerify({ isRequired:true, tipType:1, tigMethod:2, tipText:'业务类型' })">
  <el-select v-model="formData.bizType" placeholder="请选择业务类型" clearable style="width: 100%;">
    <el-option v-for="(item,inx) in busTypeList" :key="inx" :label="item.dictLabel" :value="item.dictValue"></el-option>
  </el-select>
</el-form-item>
<el-form-item label="银行流水号" prop="bankTradeNo" :rules="ruleVerify({ pattern:/^[0-9a-zA-Z]+$/,  tipText:'银行流水号' })">
  <el-input v-model.trim="formData.bankTradeNo" maxlength="20" clearable placeholder="请输入银行流水号" />
</el-form-item>