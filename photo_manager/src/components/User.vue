<script lang="ts" setup>
import multiavatar from '@multiavatar/multiavatar'

import type { UpdateUserInfo } from '@/types/user'
import type { FormInstance, FormRules } from 'element-plus'

import { useUserStore } from '@/store'
import router from '@/utils/router'
import { updateUserInfo } from '@/utils/user'

// const props = defineProps({
//   avatarUrl: String,
//   email: String,
// })

const dialogVisible = ref(false)
function handleClose(formEl: FormInstance | undefined) {
  if (!formEl) {
    ElMessageBox.alert('请填写完整信息')
  }
  resetForm(formEl)
  dialogVisible.value = false
}

const ruleFormRef = ref<FormInstance>()

const ruleForm = reactive({
  password: '',
  checkPass: '',
  email: '',
  imageUrl: '',
})

function validatePass(_: any, value: any, callback: any) {
  if (value === '') {
    callback(new Error('Please input the password'))
  }
  else {
    if (ruleForm.checkPass !== '') {
      if (!ruleFormRef.value)
        return
      ruleFormRef.value.validateField('checkPass')
    }
    callback()
  }
}
function validatePass2(_: any, value: any, callback: any) {
  if (value === '') {
    callback(new Error('Please input the password again'))
  }
  else if (value !== ruleForm.password) {
    callback(new Error('Two inputs don\'t match!'))
  }
  else {
    callback()
  }
}

const rules = reactive<FormRules<typeof ruleForm>>({
  password: [{ validator: validatePass, trigger: 'blur' }],
  checkPass: [{ validator: validatePass2, trigger: 'blur' }],
  email: [{ required: true, message: 'Please input email', trigger: 'blur' }],
  imageUrl: [{ required: true, message: 'Please upload avatar', trigger: 'blur' }],
})

function submitForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  formEl.validate(async (valid) => {
    if (valid) {
      const { clearToken } = useUserStore()
      const submitData: UpdateUserInfo = {}
      Object.keys(ruleForm).forEach((key) => {
        if (ruleForm[key as keyof typeof ruleForm] !== '' && key !== 'checkPass') {
          submitData[key as keyof UpdateUserInfo] = ruleForm[key as keyof typeof ruleForm]
        }
      })
      // console.log('submitData', submitData)
      await updateUserInfo(submitData)
      router.replace('/login')
      clearToken()
      // console.log('submit')
    }
    else {
      // console.log('error submit!')
    }
  })
  dialogVisible.value = false
}

function resetForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  formEl.resetFields()
  // 同时清空上次输入的数据
  Object.assign(ruleForm, {
    password: '',
    checkPass: '',
    email: '',
    imageUrl: '',
  })
}
// function handleEditUserInfo() {
//   isEdit.value = true
//   // 收集修改信息，调用接口上传
// }

const avatarUrl = computed(() => {
  return multiavatar(ruleForm.imageUrl || 'orangelckc')
})
function handleLogout() {
  const userStore = useUserStore()
  userStore.clearToken()
  router.replace('/login')
}
</script>

<template>
  <div class="mt-2">
    <el-dropdown placement="bottom">
      <div>
        <div class="w-10 h-10" v-html="avatarUrl" />
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>
            <el-button text @click="dialogVisible = true">
              编辑
            </el-button>
          </el-dropdown-item>
          <el-dropdown-item>
            <el-button text @click="handleLogout()">
              退出登录
            </el-button>
          </el-dropdown-item>
          <el-dropdown-item>
            <el-button text>
              设置
            </el-button>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dialog
      v-model="dialogVisible"
      title="编辑用户信息"
      width="500"
    >
      <el-form
        ref="ruleFormRef"
        style="max-width: 400px;"
        status-icon
        :model="ruleForm"
        :rules="rules"
        label-width="auto"
      >
        <el-form-item label="密码" props="password">
          <el-input v-model="ruleForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="再次确认密码" props="checkPass">
          <el-input v-model="ruleForm.checkPass" type="password" autocomplete="off" show-password />
        </el-form-item>
        <el-form-item label="邮箱" props="email">
          <el-input v-model="ruleForm.email" />
        </el-form-item>
        <el-form-item label="头像" class=" h-full w-full" props="imageUrl">
          <div class="demo-image__preview w-24 h-24 mb-4 ml-4" alt="avatar" v-html="avatarUrl" />
          <el-input
            v-model="ruleForm.imageUrl"
            placeholder="请输入随机字符生成头像"
            class="w-full"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="danger" @click="handleClose(ruleFormRef)">
            取消修改
          </el-button>
          <el-button type="primary" @click="submitForm(ruleFormRef)">
            确认修改
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
