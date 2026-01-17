import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Amplify } from 'aws-amplify'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Amplify設定（デプロイ後に環境変数から設定）
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID || '',
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || ''
    }
  }
}

if (amplifyConfig.Auth.Cognito.userPoolId) {
  Amplify.configure(amplifyConfig)
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
