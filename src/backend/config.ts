import { SplitzBackendApi } from './openapi/apis/SplitzBackendApi'
import { Configuration } from './openapi/runtime'

const config = new Configuration({
  basePath: 'http://localhost:5119',
  apiKey: async () => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const accessTokenExpiration = localStorage.getItem('accessTokenExpiration')

    if (accessTokenExpiration && parseInt(accessTokenExpiration) < Date.now()) {
      // access token expired, refresh it
      const backendApi = new SplitzBackendApi()
      const accessTokenResponse = await backendApi.accountRefreshPost({
        refreshRequest: {
          refreshToken: refreshToken
        }
      })
      if (accessTokenResponse.accessToken && accessTokenResponse.refreshToken) {
        localStorage.setItem('accessToken', accessTokenResponse.accessToken)
        localStorage.setItem('refreshToken', accessTokenResponse.refreshToken)
        localStorage.setItem(
          'accessTokenExpiration',
          new Date(Date.now() + 1000 * accessTokenResponse.expiresIn).getTime().toString()
        )
      }
    }

    if (!accessToken) {
      if (import.meta.env.MODE === 'development') {
        // only run in dev mode
        // login with a test user
        // this is a temporary solution, should be removed in production
        const backendApi = new SplitzBackendApi()
        const accessTokenResponse = await backendApi.accountLoginPost({
          loginRequest: {
            email: '1@a.com',
            password: '1@a.com1@a.com'
          }
        })
        if (accessTokenResponse.accessToken && accessTokenResponse.refreshToken) {
          localStorage.setItem('accessToken', accessTokenResponse.accessToken)
          localStorage.setItem('refreshToken', accessTokenResponse.refreshToken)
          localStorage.setItem(
            'accessTokenExpiration',
            new Date(Date.now() + 1000 * accessTokenResponse.expiresIn).getTime().toString()
          )
        }
      } else {
        // TODO: redirect to login page
      }
    }

    return 'Bearer ' + accessToken
  }
})

export default config
