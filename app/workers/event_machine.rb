# Adapted from original source at https://github.com/AF83/em-eventsource
module EventMachine
  # EventSource
  # dev.w3.org/html5/eventsource/
  class EventSource
    # Get API url
    attr_reader :url
    # Get ready state
    attr_reader :ready_state
    # Get current retry value (in seconds)
    attr_reader :retry
    # Override retry value (in seconds)
    attr_writer :retry
    # Get value of last event id
    attr_reader :last_event_id
    # Get the inactivity timeout
    attr_reader :inactivity_timeout
    # Set the inactivity timeout
    attr_writer :inactivity_timeout
    # Ready state
    # The connection has not yet been established, or it was closed and the user agent is reconnecting.
    CONNECTING = 0
    # The user agent has an open connection and is dispatching events as it receives them.
    OPEN       = 1
    # The connection is not open, and the user agent is not trying to reconnect. Either there was a fatal error or the close() method was invoked.
    CLOSED     = 2

    # Create a new stream
    #
    # url - the url as string
    # query - the query string as hash
    # headers - the headers for the request as hash
    def initialize(url, query={}, headers={})
      @url = url
      @query = query
      @headers = headers
      @ready_state = CLOSED

      @last_event_id = nil
      @retry = 3 # seconds
      @inactivity_timeout = 60 # seconds

      @opens = []
      @errors = []
      @messages = []
      @on = {}
      @middlewares = []
    end

    # Add open event handler
    #
    # Returns nothing
    def open(&block)
      @opens << block
    end

    # Add a specific event handler
    #
    # name - name of event
    #
    # Returns nothing
    def on(name, &block)
      @on[name] ||= []
      @on[name] << block
    end

    # Add message event handler
    #
    # Returns nothing
    def message(&block)
      @messages << block
    end

    # Add error event handler
    #
    # Returns nothing
    def error(&block)
      @errors << block
    end

    # Add a middleware
    #
    # *args - the middleware class
    #
    # Returns nothing
    def use(*args, &block)
      @middlewares << (args << block)
    end

    # Start subscription
    #
    # Returns nothing
    def start
      @ready_state = CONNECTING
      listen
    end

    # Cancel subscription
    #
    # Returns nothing
    def close
      @ready_state = CLOSED
      @conn.close('requested') if @conn
    end

    protected

    def listen
      @conn, @req = prepare_request
      @req.headers(&method(:handle_headers))
      @req.errback(&method(:handle_reconnect))
      #@req.callback(&method(:handle_reconnect))
      buffer = ""
      @req.stream do |chunk|
        buffer += chunk
        # TODO: manage \r, \r\n, \n
        while index = buffer.index("\n\n")
          stream = buffer.slice!(0..index)
          handle_stream(stream)
        end
      end
    end

    def handle_reconnect(*args)
      return if @ready_state == CLOSED
      @ready_state = CONNECTING
      @errors.each { |error| error.call("Connection lost. Reconnecting.") }
      EM.add_timer(@retry) do
        listen
      end
    end

    def handle_headers(headers)
      if headers.status == 307
        new_url = headers['LOCATION']
        close
        @url = new_url
        start
        return
      elsif headers.status != 200
        close
        @errors.each { |error| error.call("Unexpected response status #{headers.status}") }
        return
      end
      if /^text\/event-stream/.match headers['CONTENT_TYPE']
        @ready_state = OPEN
        @opens.each { |open| open.call }
      else
        close
        @errors.each { |error| error.call("The content-type '#{headers['CONTENT_TYPE']}' is not text/event-stream") }
      end
    end

    def handle_stream(stream)
      data = ""
      name = nil
      stream.split("\n").each do |part|
        /^data:(.+)$/.match(part) do |m|
          data += m[1].strip
          data += "\n"
        end
        /^id:(.+)$/.match(part) do |m|
          @last_event_id = m[1].strip
        end
        /^event:(.+)$/.match(part) do |m|
          name = m[1].strip
        end
        /^retry:(.+)$/.match(part) do |m|
          if m[1].strip! =~ /^[0-9]+$/
            @retry = m[1].to_i
          end
        end
      end
      return if data.empty?
      data.chomp!("\n")
      if name.nil?
        @messages.each { |message| message.call(data) }
      else
        @on[name].each { |message| message.call(data) } if not @on[name].nil?
      end
    end

    def prepare_request
      conn = EM::HttpRequest.new(@url, :inactivity_timeout => @inactivity_timeout)
      @middlewares.each { |middleware|
        block = middleware.pop
        conn.use *middleware, &block
      }
      headers = @headers.merge({'Cache-Control' => 'no-cache', 'Accept' => 'text/event-stream'})
      headers.merge!({'Last-Event-Id' => @last_event_id }) if not @last_event_id.nil?
      [conn, conn.get({ :query => @query,
                        :head  => headers})]
    end
  end
end
