import request from '@/utils/request'

export function getRepo(query) {
  return request({
    url: '/gitcode/repo',
    method: 'get',
    params: query
  })
}

export function createRepo(data) {
  return request({
    url: '/gitcode/repo',
    method: 'post',
    data
  })
}

export function deleteRepo(data) {
  return request({
    url: '/gitcode/repo/' + data,
    method: 'delete'
  })
}

export function repoCodeInit(data) {
  console.log(data)
  return request({
    url: '/gitcode/treeInit/' + data,
    method: 'get'
  })
}

export function getRepoTree(data) {
  return request({
    url: '/gitcode/tree/' + data,
    method: 'get'
  })
}
