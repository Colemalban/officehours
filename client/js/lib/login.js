const socket = io({secure: true});
const client = feathers()
.configure(feathers.hooks())
.configure(feathers.socketio(socket))
.configure(feathers.authentication({
  cookie: 'feathers-jwt',
}));
const users = client.service('/users');
client.authenticate()
.then(response => {
  console.info("authenticated successfully");
  client.set('jwt', response.accessToken)
  return client.passport.verifyJWT(response.accessToken);
})
.then(payload => {
  console.info("verified JWT");
  window.location.href = '/';
})
.catch(error => {
  console.log("not authenticated, as expected", error);
});

$(function() {
  if (window.location.search.substring(1) === "invalid") {
    $("#unauthorized-alert").show();
  }
})
