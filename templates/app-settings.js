AppSettings = {
  // @if NODE_ENV == 'DEVELOPMENT'
  'baseApiUrl': 'http://192.168.0.102:5000',
  'debug': true
  // @endif
  // @if NODE_ENV == 'PRODUCTION'
  'baseApiUrl': 'http://tasteat.site'
  // @endif
}
