module.exports.format = function (msgs) {
    return Object.fromEntries(
	Object.entries(msgs).map(([id, msg]) => {
	    return [id, msg.defaultMessage || ''];
	})
    );
};

module.exports.compile = function (msgs) {
    const results = {};
    
    for (const [id, msg] of Object.entries(msgs)) {
	results[id] = msg.definition;
    }
    
    return results;
};
