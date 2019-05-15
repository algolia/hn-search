module Api
  module V1
    class SearchController < BaseController
      def perform
        render_json_request(:post, "/1/indexes/#{Item.index_name}/query", params)
      end

      def by_date
        render_json_request(:post, "/1/indexes/#{Item.index_name}_sort_date/query", params)
      end
    end
  end
end
