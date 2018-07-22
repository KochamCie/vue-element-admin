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

export function publishSource(data) {
  return request({
    url: '/moduleSource/' + data + '/publish',
    method: 'put'
  })
}

export function updateSource(id, data) {
  return request({
    url: '/moduleSource/' + id,
    method: 'put',
    data
  })
}
