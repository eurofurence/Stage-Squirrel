module.exports = {
    // Handle Times
    getTimeSQLtoJS: function (timeString) {
        // Split timestamp into [ Y, M, D, h, m, s ]
        var t = timeString.split(/[- :]/);

        // Apply each element to the Date function
        var d = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));

        return d;
    },

    getTimeJStoSQL: function (timeString) {
        // Your default date object
        var starttime = new Date();
        // Get the iso time (GMT 0 == UTC 0)
        var isotime = new Date((new Date(timeString)).toISOString() );
        // getTime() is the unix time value, in milliseconds.
        // getTimezoneOffset() is UTC time and local time in minutes.
        // 60000 = 60*1000 converts getTimezoneOffset() from minutes to milliseconds.
        var fixedtime = new Date(isotime.getTime()-(starttime.getTimezoneOffset()*60000));
        // toISOString() is always 24 characters long: YYYY-MM-DDTHH:mm:ss.sssZ.
        // .slice(0, 19) removes the last 5 chars, ".sssZ",which is (UTC offset).
        // .replace('T', ' ') removes the pad between the date and time.
        var formatedMysqlString = fixedtime.toISOString().slice(0, 19).replace('T', ' ');
        return formatedMysqlString;
    },

    // generate uniqueCode
    generateCode: function (codeLength) {
        var allowed = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        var code = "";
        for (var i = 0; i < codeLength; i++) {
            code += allowed[parseInt(Math.random() * allowed.length)];
        }
        return code;
    }
}
