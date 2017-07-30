module.exports = function mapClients(wsClients) {
  clientsArray = Array.from(wsClients);
  return clientsArray.map(function(client) {
    return {id: client._id};
  });
}
