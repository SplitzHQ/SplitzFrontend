import { SplitzBackendApi } from './openapi/apis/SplitzBackendApi'
import { Configuration } from './openapi/runtime'

const basePath = 'http://localhost:5119'

const config = new Configuration({
  basePath: basePath,

  apiKey: async () => {
    let accessToken = localStorage.getItem('accessToken')
    const accessTokenExpiration = localStorage.getItem('accessTokenExpiration')
    const backendApi = new SplitzBackendApi(new Configuration({ basePath: basePath }))

    if (accessTokenExpiration && parseInt(accessTokenExpiration) < Date.now()) {
      // access token expired, refresh it
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
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
          accessToken = accessTokenResponse.accessToken
        }
      }
    }

    if (!accessToken) {
      if (import.meta.env.MODE === 'development') {
        // only run in dev mode
        // login with a test user
        // this is a temporary solution, should be removed in production
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
          accessToken = accessTokenResponse.accessToken
        }
      } else {
        // TODO: redirect to login page
      }
    }

    return 'Bearer ' + accessToken
  }
})

export default config
