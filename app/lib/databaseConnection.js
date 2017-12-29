var mysql = require('mysql');

// connection handler
var connection;
var handleDisconnect = function(config) {
    // Recreate the connection, since the old one cannot be reused.
    connection = mysql.createConnection(config);
    connection.connect(function(err) {
        // The server is either down or restarting (takes a while sometimes).
        if(err) {
            console.log('error when connecting to db:', err);
            // We introduce a delay before attempting to reconnect,
            // to avoid a hot loop, and to allow our node script to
            // process asynchronous requests in the meantime.
            // If you're also serving http, display a 503 error.
            setTimeout(function() { handleDisconnect(config); }, 2000);
        }
    });
    connection.on('error', function(err) {
        console.log('db error', err);
        // Connection to the MySQL server is usually
        // lost due to either server restart, or a
        // connnection idle timeout (the wait_timeout
        // server variable configures this)
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect(config);
        } else {
            throw err;
        }
    });
}

module.exports = function (config) {
    handleDisconnect(config);
    return connection;
};
