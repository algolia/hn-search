module Api
  module V1
    class SearchController < ActionController::API

      def perform
        params.delete :action
        params.delete :controller
        params.delete :format
        forwarded_ip = (request.env['HTTP_X_FORWARDED_FOR'] || request.remote_ip).split(',').first.strip
        render json: client.get("/1/indexes/#{Item.index_name}", params.to_param, forwarded_ip), root: false
      rescue Algolia::AlgoliaProtocolError => e
        render json: JSON.parse(client.body), status: e.code
      end

      protected
      def client
        Thread.current[:algolia_client] ||= Client.new(ENV['ALGOLIASEARCH_APPLICATION_ID'], ENV['ALGOLIASEARCH_API_KEY'], ENV['ALGOLIASEARCH_API_KEY_RO'])
      end

    end

    class Client

      def initialize(application_id, api_key, forwarded_api_key)
        @cluster = 2.upto(3).map { |i| "#{application_id}-#{i}" } # application_id-1 is dedicated to build
        @client = Curl::Easy.new do |s|
          s.headers[Algolia::Protocol::HEADER_API_KEY]           = api_key
          s.headers[Algolia::Protocol::HEADER_APP_ID]            = application_id
          s.headers[Algolia::Protocol::HEADER_FORWARDED_API_KEY] = forwarded_api_key
          s.headers["Content-Type"]                              = "application/json; charset=utf-8"
          s.headers["User-Agent"]                                = "Algolia for Ruby (hnsearch)"
        end
      end

      def get(action, params, forwarded_ip)
        request :GET, "#{action}#{'?' if !params.blank?}#{params}", forwarded_ip
      end

      def post(action, params, forwarded_ip)
        request :POST, action, forwarded_ip, params.to_json
      end

      def put(action, params, forwarded_ip)
        request :PUT, action, forwarded_ip, params.to_json
      end

      def delete(action, forwarded_ip)
        request :DELETE, action, forwarded_ip
      end

      def body
        @client.body_str
      end

      private

      # Perform an HTTP request for the given uri and method
      # with common basic response handling. Will raise a
      # Algolia::AlgoliaProtocolError if the response has an error status code,
      # and will return the parsed JSON body on success, if there is one.
      def request(method, uri, forwarded_ip, data = nil)
        @client.headers[Algolia::Protocol::HEADER_FORWARDED_IP] = forwarded_ip
        @cluster.each do |c|
          begin
            @client.url = "https://#{c}.algolia.io" + uri
            case method
            when :GET
              @client.http_get
            when :POST
              @client.post_body = data
              @client.http_post
            when :PUT
              @client.put(data)
            when :DELETE
              @client.http_delete
            end
            if @client.response_code >= 400 || @client.response_code < 200
              raise Algolia::AlgoliaProtocolError.new(@client.response_code, "#{method} #{@client.url}: #{@client.body_str}")
            end
            return JSON.parse(@client.body_str)          
          rescue Algolia::AlgoliaProtocolError => e
            if e.code != Algolia::Protocol::ERROR_TIMEOUT and e.code != Algolia::Protocol::ERROR_UNAVAILABLE 
              raise
            end
          rescue Curl::Err::CurlError => e
          end
        end
        raise Algolia::AlgoliaProtocolError.new(0, "Cannot reach any hosts")
      end

    end
  end
end
