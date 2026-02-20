// Web worker: fetch and parse GeoJSON files off the main thread.
// Receives: { key, file }
// Sends back: { key, data } or { key, error }
self.onmessage = function(e) {
    var key = e.data.key;
    var file = e.data.file;
    fetch(file)
        .then(function(r) { return r.json(); })
        .then(function(data) {
            self.postMessage({ key: key, data: data });
        })
        .catch(function(err) {
            self.postMessage({ key: key, error: err.message || 'fetch failed' });
        });
};
