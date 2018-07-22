import { asyncRouterMap, constantRouterMap } from '@/router'

/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.indexOf(role) >= 0)
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap
 * @param roles
 */
function filterAsyncRouter(asyncRouterMap, roles) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (hasPermission(roles, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, roles)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

function hasModule(router, source) {
  let hasModule = false
  router.children.forEach(function(child) {
    if (child.name === source.module) {
      hasModule = true
    }
  })
  // console.log('hasModule is :?', hasModule)
  return hasModule
}

// function hasSource(children, source) {
//   let hasSource = false
//   children.forEach(function(child) {
//     if (child.name === source.ip) {
//       hasSource = true
//     }
//   })
//   return hasSource
// }

function generateModule(asyncRouterMap, sources) {
  console.log(sources)
  console.log('generateModule:?', sources.length)
  // 请求资源
  asyncRouterMap.forEach(function(router, i) {
    if (router.path === '/monitorsource') {
      router.children.splice(1, router.children.length)
      sources.forEach(function(source) {
        // 如果不含有模块，先添加模块
        if (!hasModule(router, source)) {
          const newModule = {
            path: '/monitorsource/' + source.module,
            name: source.module,
            component: () => import('@/views/monitorsource/console'),
            meta: { title: source.module, icon: 'tab' },
            children: []
          }
          router.children.push(newModule)
        }
        // 添加到对应的模块
        router.children.forEach(function(child, i) {
          if (child.name === source.module) {
            const newRouter = {
              path: source.alias + '_' + i,
              name: source.alias + '_' + i,
              component: () => import('@/views/monitorsource/console'),
              meta: { title: source.alias, icon: 'tab', src: source.url, fontSize: 'font-size: 10px' }
            }
            console.log('new Router is :', newRouter)
            child.children.push(newRouter)
          }
        })
      })
    }
  })
  return asyncRouterMap
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
      console.log('state.routers is :', state.routers)
    }
  },
  actions: {
    GenerateRoutes({ commit }, data) {
      console.log('GenerateRoutes start!!!!!!!!!!!!!!!!!!!!')
      return new Promise(resolve => {
        const { roles, sources } = data
        let accessedRouters
        // asyncRouterMap = generateModule(asyncRouterMap, sources)
        if (roles.indexOf('admin') >= 0) {
          accessedRouters = generateModule(asyncRouterMap, sources)
        } else {
          accessedRouters = filterAsyncRouter(generateModule(asyncRouterMap, sources), roles)
        }
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    }
  }
}

export default permission
