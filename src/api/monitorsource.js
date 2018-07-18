import request from '@/utils/request'

export function getSource(query) {
  return request({
    url: '/moduleSource',
    method: 'get',
    params: query
  })
}

export function createSource(data) {
  return request({
    url: '/moduleSource',
    method: 'post',
    data
  })
}

export function deleteSource(data) {
  return request({
    url: '/moduleSource/' + data,
    method: 'delete'
  })
}
