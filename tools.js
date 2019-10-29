module.exports = {
    startup: function() {
        const figlet = require("figlet");
        console.log('\033[2J');
        figlet('SPACEBOT', function(err, data) {
        if (err) {
            console.log('Something went wrong...', err);
        } else {
            console.log(data);
        }
        });   
    },
    d_console: function (msg, c) {
        var prepend = '';
        switch(c) {
          case 'y':
            prepend = '\x1b[33m';
          break;
          case 'c':
            prepend = '\x1b[36m';
          break;
          case 'g':
            prepend = '\x1b[32m';
          break;
          case 'r':
            prepend = '\x1b[31m';
          break;
          case 'm':
            prepend = '\x1b[35m';
          break;
          default:
            prepend = '\x1b[37m';
          break;
        }
        console.log (prepend, "[" + new Date().toLocaleString() + "] > " + msg); //Debugging
    },
    getSubTier: function (subPlan) {
        if (subPlan == 1000) {
            return "Tier 1";
        } else if (subPlan == 2000) {
            return "Tier 2";
        } else if (subPlan == 3000) {
            return "Tier 3";
        } else if (subPlan == "Prime") {
            return "Prime";
        } else {
            return "Unknown";
        }
    }
};
