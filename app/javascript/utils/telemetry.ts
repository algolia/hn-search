// A set of helpers and functions to help
// us monitor search performance on HN.
// With real world telemetry information we are able to
// experiment, monitor and tweak both our servers and
// the JavaScript client to deliver the fastest experience possible
// If you are interested in the project, feel free to reach out to
const generateUserToken = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const APPLICATION_ID = "UJ5WYC0L7X";
const SESSION_ID = generateUserToken();

const supportsSendBeacon = (): boolean =>
  navigator && typeof navigator.sendBeacon === "function";
const supportsConnection = (): boolean =>
  typeof (navigator as any).connection === "object";
const supportsConnectionListener = (): boolean =>
  typeof (navigator as any).connection.addEventListener === "function";

const registerNetworkConnectionChangeHandler = () => {
  if (supportsConnection() && supportsConnectionListener()) {
    (navigator as any).connection.addEventListener(
      "change",
      (window as any).reportConnection
    );
  }
};

const supportsPerformance = (): boolean =>
  typeof window.performance !== "undefined" &&
  typeof window.performance.getEntriesByType === "function";

const isAlgoliaEngineQuery = (input: string): boolean => {
  if (typeof input !== "string") return false;
  return /\.algolia\.net\/1/g.test(input);
};

const reportedQueries = [];
const getAlgoliaQueries = () => {
  if (!supportsPerformance()) return [];
  const resources = window.performance.getEntriesByType("resource");

  if (!resources.length) return [];

  return resources.filter(
    resource =>
      (resource as any).initiatorType === "xmlhttprequest" &&
      isAlgoliaEngineQuery(resource.name) &&
      reportedQueries.indexOf(resource) === -1
  );
};

const reportData = (data, endpoint) => {
  const url = "https://telemetry.algolia.com/1/" + endpoint;

  if (supportsSendBeacon()) {
    navigator.sendBeacon(
      url,
      JSON.stringify({ ...data, application_id: APPLICATION_ID })
    );
  } else {
    ((window as any).$ as any).ajax({
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

  allQueries.forEach((entry: any, _index, array) => {
    const telemetryData = {
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

    reportData(telemetryData, "measure");
    reportedQueries.push(entry);
  });
};

export const reportConnection = () => {
  if (!supportsConnection()) return;

  const connectionData = {
    timestamp: Date.now(),
    session_id: SESSION_ID,
    downlink: (navigator as any).connection.downlink,
    downlink_max: (navigator as any).connection.downlinkMax,
    effective_type: (navigator as any).connection.effectiveType,
    rtt: (navigator as any).connection.rtt,
    save_data: (navigator as any).connection.saveData,
    type: (navigator as any).connection.type
  };
  reportData(connectionData, "connection");
};

export const reportTimeout = (data: any, requestOptions) => {
  const timeoutData = {
    timestamp: Date.now(),
    timeout_session_id: SESSION_ID,
    host_node: data.hostIndexes.read,
    timeout_multiplier: data.timeoutMultiplier,
    connect_timeout: requestOptions.timeouts.connect,
    complete_timeout: requestOptions.timeouts.complete
  };

  reportData(timeoutData, "timeout");
};

window.addEventListener("load", function() {
  reportConnection();
  registerNetworkConnectionChangeHandler();
});

(window as any).reportTimeout = reportTimeout;
