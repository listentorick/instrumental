//require('./express_server').startServer("test", 10001, null);
var record = require('./record');

//configureInstrumental()
//sys.p(startInstrumental);

//instrumental.configureInstrumental

record.start(__dirname, 10001, null, "127.0.0.1", 27017);