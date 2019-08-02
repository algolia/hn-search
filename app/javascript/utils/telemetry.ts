// A set of helpers and functions to help
// us monitor search performance on HN.
// With real world telemetry information we are able to
// experiment, monitor and tweak both our servers and
// the JavaScript client to deliver the fastest experience possible
// If you are interested in the project, feel free to reach out to

const SESSION_ID = generateSessionID();
const generateSessionID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const supportsSendBeacon = () => {
  return navigator && typeof navigator.sendBeacon === "function";
};

const supportsConnection = () => {
  return typeof navigator.connection === "object";
};

const supportsPerformance = () => {
  return (
    typeof window.performance !== "undefined" &&
    typeof window.performance.getEntriesByType === "function"
  );
};

const protectInfinity = metric => {
  if (typeof metric === "undefined") return null;
  return metric === Infinity ? -1 : metric;
};

const isAlgoliaEngineQuery = input => {
  if (typeof input !== "string") return false;
  return /\.algolia\.net\/1/g.test(input);
};

const reportedQueries = [];
const getAlgoliaQueries = () => {
  const resources = window.performance.getEntriesByType("resource");

  if (!resources.length) {
    return [];
  }

  return resources.filter(resource => {
    return (
      resource.initiatorType === "xmlhttprequest" &&
      isAlgoliaEngineQuery(resource.name) &&
      reportedQueries.indexOf(resource) === -1
    );
  });
};

const reportData = (data, endpoint) => {
  const url = "https://telemetry.algolia.com/1/" + endpoint;

  if (supportsSendBeacon()) {
    navigator.sendBeacon(url, JSON.stringify(data));
  } else {
    $.ajax({
      contentType: "application/json",
      type: "POST",
      url: url,
      data: JSON.stringify(data)
    });
  }
};

export const reportTelemetry = query => {
  if (!supportsPerformance()) return;
  const allQueries = getAlgoliaQueries();

  allQueries.forEach(function(entry, index, array) {
    const data = {
      timestamp: Date.now(),
      telemetry_session_id: SESSION_ID,
      connect_end: entry.connectEnd,
      connect_start: entry.connectStart,
      decoded_body_size: entry.decodedBodySize,
      domain_lookup_end: entry.domainLookupEnd,
      domain_lookup_start: entry.domainLookupStart,
      encoded_body_size: entry.encodedBodySize,
      fetch_start: entry.fetchStart,
      initiator_type: entry.initiatorType,
      next_hop_protocol: entry.nextHopProtocol,
      redirect_end: entry.redirectEnd,
      redirect_start: entry.redirectStart,
      request_start: entry.requestStart,
      response_end: entry.responseEnd,
      response_start: entry.responseStart,
      secure_connection_start: entry.secureConnectionStart,
      start_time: entry.startTime,
      transfer_size: entry.transferSize,
      worker_start: entry.workerStart,
      engine_processing_time:
        array.length === 1 ? query.processingTimeMS : null,
      hits_per_page: array.length === 1 ? query.hitsPerPage : null,
      hits: array.length === 1 ? query.hits.length : null,
      targeted_server: entry.name.match(/(.*)\:\/\/(.*?)\//)[2]
    };

    reportData(data, "measure");
    reportedQueries.push(entry);
  });
};

export const reportConnection = () => {
  if (!supportsConnection()) return;

  const data = {
    timestamp: Date.now(),
    session_id: SESSION_ID,
    downlink: navigator.connection.downlink,
    downlink_max: navigator.connection.downlinkMax,
    effective_type: navigator.connection.effectiveType,
    rtt: navigator.connection.rtt,
    save_data: navigator.connection.saveData,
    type: navigator.connection.type
  };
  reportData(data, "connection");
};

export const reportTimeout = (data, requestOptions) => {
  const data = {
    timestamp: Date.now(),
    timeout_session_id: SESSION_ID,
    host_node: data.hostIndexes.read,
    timeout_multiplier: data.timeoutMultiplier,
    connect_timeout: requestOptions.timeouts.connect,
    complete_timeout: requestOptions.timeouts.complete
  };

  reportData(data, "timeout");
};

window.addEventListener("load", function() {
  window.reportConnection();
  if (
    supportsConnection() &&
    typeof navigator.connection.addEventListener === "function"
  ) {
    navigator.connection.addEventListener("change", window.reportConnection);
  }
});

window.reportTelemetry = reportTelemetry;
window.reportConnection = reportConnection;
window.reportTimeout = reportTimeout;
